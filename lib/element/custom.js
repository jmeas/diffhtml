define(function(require, exports, module) {
  'use strict';

  var empty = function() {};

  /**
   * Store all custom elements in this object.
   */
  var components = {};

  exports.components = components;

  /**
   * Ensures the element instance matches the CustomElement's prototype.
   *
   * @param tagName
   * @param element
   * @return {Boolean} successfully upgraded
   */
  function upgrade(tagName, element) {
    var CustomElement = components[tagName] || empty;

    // No need to upgrade if already a subclass.
    if (element instanceof CustomElement) {
      return false;
    }

    // Copy the prototype into the Element.
    if (CustomElement !== empty) {
      element.__proto__ = Object.create(CustomElement.prototype);
    }

    // Custom elements have a createdCallback method that should be called.
    if (CustomElement.prototype.createdCallback) {
      CustomElement.prototype.createdCallback.call(element);
    }

    return true;
  }

  exports.upgrade = upgrade;
});
