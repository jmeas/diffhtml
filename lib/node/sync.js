define(function(require, exports, module) {
  'use strict';

  var poolsCache = require('../util/pools').cache;
  var protectElement = require('../util/memory').protectElement;
  var unprotectElement = require('../util/memory').unprotectElement;
  var makeNode = require('./make');

  var slice = Array.prototype.slice;

  /**
   * Synchronizes changes from the newTree into the oldTree.
   *
   * @param oldTree
   * @param newTree
   */
  function sync(patches, oldTree, newTree) {
    var oldChildNodes = oldTree.childNodes;
    var oldChildNodesLength = oldChildNodes ? oldChildNodes.length : 0;
    var oldElement = oldTree.uuid;
    var textElements = ['script', 'style', 'textarea', '#text'];

    if (!newTree) {
      var removed = oldChildNodes.splice(0, oldChildNodesLength);

      patches[patches.length] = { __do__: -1, element: oldElement };

      for (var i = 0; i < removed.length; i++) {
        // Used by the Worker to track elements removed.
        if (patches.removals) { patches.removals.push(removed[i].uuid); }

        unprotectElement(removed[i], makeNode);
      }

      return;
    }

    var nodeValue = newTree.nodeValue;
    var childNodes = newTree.childNodes;
    var childNodesLength = childNodes ? childNodes.length : 0;
    var newElement = newTree.uuid;

    // If the element we're replacing is totally different from the previous
    // replace the entire element, don't bother investigating children.
    if (oldTree.nodeName !== newTree.nodeName) {
      return;
    }

    // Replace text node values if they are different.
    if (textElements.indexOf(newTree.nodeName) > -1) {
      // Text changed.
      if (oldTree.nodeValue !== nodeValue) {
        oldTree.nodeValue = nodeValue;

        patches[patches.length] = {
          __do__: 3,
          element: oldElement,
          value: nodeValue
        };
      }

      return;
    }

    // Most common additive elements.
    if (childNodesLength > oldChildNodesLength) {
      // Store elements in a DocumentFragment to increase performance and be
      // generally simplier to work with.
      var fragment = [];

      for (var i = oldChildNodesLength; i < childNodesLength; i++) {
        // Used by the Worker to track elements added.
        if (patches.additions) { patches.additions.push(childNodes[i]); }

        protectElement(childNodes[i]);

        // Internally add to the tree.
        oldChildNodes[oldChildNodes.length] = childNodes[i];

        // Add to the document fragment.
        fragment[fragment.length] = childNodes[i];
      }

      // Assign the fragment to the patches to be injected.
      patches[patches.length] = {
        __do__: 1,
        element: oldElement,
        fragment: fragment
      };
    }

    // Replace elements if they are different.
    for (var i = 0; i < childNodesLength; i++) {
      if (oldChildNodes[i].nodeName !== childNodes[i].nodeName) {
        // Add to the patches.
        patches[patches.length] = {
          __do__: 1,
          old: oldChildNodes[i],
          new: childNodes[i]
        };

        // Used by the Worker to track elements removed.
        if (patches.removals) {
          patches.removals.push(oldChildNodes[i].uuid);
        }

        // Used by the Worker to track elements added.
        if (patches.additions) { patches.additions.push(childNodes[i]); }

        unprotectElement(oldChildNodes[i], makeNode);
        protectElement(childNodes[i]);

        // Replace the internal tree's point of view of this element.
        oldChildNodes[i] = childNodes[i];
      }
    }

    // Remove these elements.
    if (oldChildNodesLength > childNodesLength) {
      // Elements to remove.
      var toRemove = slice.call(oldChildNodes, childNodesLength,
        oldChildNodesLength);

      for (var i = 0; i < toRemove.length; i++) {
        // Remove the element, this happens before the splice so that we still
        // have access to the element.
        patches[patches.length] = { __do__: 1, old: toRemove[i].uuid };
      }

      var removed = oldChildNodes.splice(childNodesLength,
        oldChildNodesLength - childNodesLength);

      for (var i = 0; i < removed.length; i++) {
        // Used by the Worker to track elements removed.
        if (patches.removals) { patches.removals.push(removed[i].uuid); }

        unprotectElement(removed[i], makeNode);
      }
    }

    // Synchronize attributes
    var attributes = newTree.attributes;

    if (attributes) {
      var oldLength = oldTree.attributes.length;
      var newLength = attributes.length;

      // Start with the most common, additive.
      if (newLength > oldLength) {
        var toAdd = slice.call(attributes, oldLength);

        for (var i = 0; i < toAdd.length; i++) {
          var change = {
            __do__: 2,
            element: oldElement,
            name: toAdd[i].name,
            value: toAdd[i].value,
          };

          var attr = poolsCache.attributeObject.get();
          attr.name = toAdd[i].name;
          attr.value = toAdd[i].value;

          poolsCache.attributeObject.protect(attr);

          // Push the change object into into the virtual tree.
          oldTree.attributes[oldTree.attributes.length] = attr;

          // Add the change to the series of patches.
          patches[patches.length] = change;
        }
      }

      // Check for removals.
      if (oldLength > newLength) {
        var toRemove = slice.call(oldTree.attributes, newLength);

        for (var i = 0; i < toRemove.length; i++) {
          var change = {
            __do__: 2,
            element: oldElement,
            name: toRemove[i].name,
            value: undefined,
          };

          // Remove the attribute from the virtual node.
          var removed = oldTree.attributes.splice(i, 1);

          for (var i = 0; i < removed.length; i++) {
            poolsCache.attributeObject.unprotect(removed[i]);
          }

          // Add the change to the series of patches.
          patches[patches.length] = change;
        }
      }

      // Check for modifications.
      var toModify = attributes;

      for (var i = 0; i < toModify.length; i++) {
        var oldAttrValue = oldTree.attributes[i] && oldTree.attributes[i].value;
        var newAttrValue = attributes[i] && attributes[i].value;

        // Only push in a change if the attribute or value changes.
        if (oldAttrValue !== newAttrValue) {
          var change = {
            __do__: 2,
            element: oldElement,
            name: toModify[i].name,
            value: toModify[i].value,
          };

          // Replace the attribute in the virtual node.
          var attr = oldTree.attributes[i];
          attr.name = toModify[i].name;
          attr.value = toModify[i].value;

          // Add the change to the series of patches.
          patches[patches.length] = change;
        }
      }
    }

    // Sync each current node.
    for (var i = 0; i < oldChildNodes.length; i++) {
      if (oldChildNodes[i].uuid !== childNodes[i].uuid) {
        sync(patches, oldTree.childNodes[i], childNodes[i]);
      }
    }
  }

  module.exports = sync;
});
