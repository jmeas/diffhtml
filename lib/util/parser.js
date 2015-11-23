// Code based off of:
// https://github.com/ashi009/node-fast-html-parser
define(function(require, exports, module) {
  'use strict';

  var poolsCache = require('./pools').cache;
  var parser = makeParser();

  /**
   * parseHTML
   *
   * @param newHTML
   * @return
   */
  function parseHTML(newHTML, isInner) {
    var documentElement = parser.parse(newHTML);
    var nodes = documentElement.childNodes;

    return isInner ? nodes : nodes[0];
  }

  exports.parseHTML = parseHTML;

  /**
   * makeParser
   *
   * @return
   */
  function makeParser() {
    var kMarkupPattern =
      /<!--[^]*?(?=-->)-->|<(\/?)([a-z\-][a-z0-9\-]*)\s*([^>]*?)(\/?)>/ig;

    var kAttributePattern = /\b(id|class)\s*(=\s*("([^"]+)"|'([^']+)'|(\S+)))?/ig;

    var reAttrPattern =
      /\b([a-z][a-z0-9\-]*)\s*(=\s*("([^"]+)"|'([^']+)'|(\S+)))?/ig;

    var kBlockElements = {
      div: true,
      p: true,
      li: true,
      td: true,
      section: true,
      br: true
    };

    var kSelfClosingElements = {
      meta: true,
      img: true,
      link: true,
      input: true,
      area: true,
      br: true,
      hr: true
    };

    var kElementsClosedByOpening = {
      li: {
        li: true
      },

      p: {
        p: true, div: true
      },

      td: {
        td: true, th: true
      },

      th: {
        td: true, th: true
      }
    };

    var kElementsClosedByClosing = {
      li: {
        ul: true, ol: true
      },

      a: {
        div: true
      },

      b: {
        div: true
      },

      i: {
        div: true
      },

      p: {
        div: true
      },

      td: {
        tr: true, table: true
      },

      th: {
        tr: true, table: true
      }
    };

    var kBlockTextElements = {
      script: true,
      noscript: true,
      style: true,
      pre: true
    };

    /**
     * TextNode to contain a text element in DOM tree.
     * @param {string} value [description]
     */
    function TextNode(value) {
      var instance = poolsCache.elementObject.get();

      instance.nodeName = '#text';
      instance.nodeValue = value;
      instance.nodeType = 3;
      instance.childNodes.length = 0;
      instance.attributes.length = 0;

      return instance;
    }

    /**
     * HTMLElement, which contains a set of children.
     *
     * Note: this is a minimalist implementation, no compvare tree structure
     * provided (no parentNode, nextSibling, previousSibling etc).
     *
     * @param {string} name     nodeName
     * @param {Object} keyAttrs id and class attribute
     * @param {Object} rawAttrs attributes in string
     */
    function HTMLElement(name, keyAttrs, rawAttrs) {
      var instance = poolsCache.elementObject.get();

      instance.nodeName = name;
      instance.nodeValue = '';
      instance.nodeType = 1;
      instance.childNodes.length = 0;
      instance.attributes.length = 0;

      if (rawAttrs) {
        for (var match; match = reAttrPattern.exec(rawAttrs); ) {
          var attr = poolsCache.attributeObject.get();

          attr.name = match[1];
          attr.value = match[5] || match[4] || match[1];

          // Look for empty attributes.
          if (match[6] === '""') { attr.value = ''; }

          instance.attributes[instance.attributes.length] = attr;
        }
      }

      return instance;
    }

    /**
     * Parses HTML and returns a root element
     */
    var htmlParser = {
      /**
       * Parse a chuck of HTML source.
       * @param  {string} data      html
       * @return {HTMLElement}      root element
       */
      parse: function(data, options) {
        var rootObject = {};
        var root = HTMLElement(null, rootObject);
        var currentParent = root;
        var stack = [root];
        var lastTextPos = -1;

        options = options || {};

        if (data.indexOf('<') === -1 && data) {
          currentParent.childNodes[currentParent.childNodes.length] = TextNode(data);

          return root;
        }

        for (var match, text; match = kMarkupPattern.exec(data); ) {
          if (lastTextPos > -1) {
            if (lastTextPos + match[0].length < kMarkupPattern.lastIndex) {
              // if has content
              text = data.slice(lastTextPos, kMarkupPattern.lastIndex - match[0].length);

              if (text.trim()) {
                currentParent.childNodes[currentParent.childNodes.length] = TextNode(text);
              }
            }
          }

          lastTextPos = kMarkupPattern.lastIndex;

          // This is a comment.
          if (match[0][1] === '!') {
            continue;
          }

          if (options.lowerCaseTagName) {
            match[2] = match[2].toLowerCase();
          }

          if (!match[1]) {
            // not </ tags
            var attrs = {};

            for (var attMatch; attMatch = kAttributePattern.exec(match[3]); ) {
              attrs[attMatch[1]] = attMatch[3] || attMatch[4] || attMatch[5];
            }

            if (!match[4] && kElementsClosedByOpening[currentParent.nodeName]) {
              if (kElementsClosedByOpening[currentParent.nodeName][match[2]]) {
                stack.pop();
                currentParent = stack[stack.length - 1];
              }
            }

            currentParent = currentParent.childNodes[currentParent.childNodes.push(
                HTMLElement(match[2], attrs, match[3])) - 1];

            stack.push(currentParent);

            if (kBlockTextElements[match[2]]) {
              // a little test to find next </script> or </style> ...
              var closeMarkup = '</' + match[2] + '>';
              var index = data.indexOf(closeMarkup, kMarkupPattern.lastIndex);

              if (options[match[2]]) {
                if (index == -1) {
                  // there is no matching ending for the text element.
                  text = data.slice(kMarkupPattern.lastIndex);
                }
                else {
                  text = data.slice(kMarkupPattern.lastIndex, index);
                }

                if (text.length > 0) {
                  currentParent.childNodes[currentParent.childNodes.length] = TextNode(text);
                }
              }
              if (index == -1) {
                lastTextPos = kMarkupPattern.lastIndex = data.length + 1;
              }
              else {
                currentParent.nodeValue = data.slice(kMarkupPattern.lastIndex, index);
                lastTextPos = kMarkupPattern.lastIndex = index + closeMarkup.length;
                match[1] = true;

              }
            }
          }
          if (match[1] || match[4] || kSelfClosingElements[match[2]]) {
            // </ or /> or <br> etc.
            while (currentParent) {
              if (currentParent.nodeName == match[2]) {
                stack.pop();
                currentParent = stack[stack.length - 1];

                break;
              }
              else {
                // Trying to close current tag, and move on
                if (kElementsClosedByClosing[currentParent.nodeName]) {
                  if (kElementsClosedByClosing[currentParent.nodeName][match[2]]) {
                    stack.pop();
                    currentParent = stack[stack.length - 1];

                    continue;
                  }
                }

                // Use aggressive strategy to handle unmatching markups.
                break;
              }
            }
          }
        }

        return root;
      }
    };

    return htmlParser;
  }

  exports.makeParser = makeParser;
});
