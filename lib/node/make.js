define(function(require, exports, module) {
  'use strict';

  var poolsCache = require('../util/pools').cache;
  var protectElement = require('../util/memory').protectElement;
  var unprotectElement = require('../util/memory').unprotectElement;
  var components = require('../element/custom').components;
  var upgrade = require('../element/custom').upgrade;

  var empty = {};

  // Cache created nodes inside this object.
  make.nodes = {};

  /**
   * Converts a live node into a virtual node.
   *
   * @param node
   * @return
   */
  function make(node, protect) {
    var nodeType = node.nodeType;
    var nodeValue = node.nodeValue;

    if (!nodeType || nodeType === 2 || nodeType === 4 || nodeType === 8) {
      return false;
    }

    if (nodeType === 3 && !nodeValue.trim()) {
      return false;
    }

    // Virtual representation of a node, containing only the data we wish to
    // diff and patch.
    var entry = poolsCache.elementObject.get();

    // Add to internal lookup.
    make.nodes[entry.uuid] = node;

    entry.nodeName = node.nodeName.toLowerCase();
    entry.nodeValue = nodeValue;
    entry.childNodes.length = 0;
    entry.attributes.length = 0;

    if (protect) {
      protectElement(entry);
    }

    // Collect attributes.
    var attributes = node.attributes;

    // If the element has no attributes, skip over.
    if (attributes) {
      var attributesLength = attributes.length;

      if (attributesLength) {
        for (var i = 0; i < attributesLength; i++) {
          var attr = poolsCache.attributeObject.get();

          if (protect) {
            poolsCache.attributeObject.protect(attr);
          }

          attr.name = attributes[i].name;
          attr.value = attributes[i].value;

          entry.attributes[entry.attributes.length] = attr;
        }
      }
    }

    // Collect childNodes.
    var childNodes = node.childNodes;
    var childNodesLength = node.childNodes.length;

    // If the element has child nodes, convert them all to virtual nodes.
    if (node.nodeType !== 3 && childNodes) {
      for (var i = 0; i < childNodesLength; i++) {
        var newNode = make(childNodes[i], protect);

        if (newNode) {
          entry.childNodes[entry.childNodes.length] = newNode;
        }
      }
    }

    // TODO Rename this to first-run, because we're calling the attach callback
    // and protecting now.
    if (protect) {
      if (components[entry.nodeName]) {
        // Reset the prototype chain for this element. Upgrade will return `true`
        // if the element was upgraded for the first time. This is useful so we
        // don't end up in a loop when working with the same element.
        if (upgrade(entry.nodeName, node)) {
          // If the Node is in the DOM, trigger attached callback.
          if (node.parentNode && node.attachedCallback) {
            node.attachedCallback();
          }
        }
      }
    }

    return entry;
  }

  module.exports = make;
});
