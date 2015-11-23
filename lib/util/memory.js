define(function(require, exports, module) {
  'use strict';

  var poolsCache = require('../util/pools').cache;

  /**
   * Ensures that an element is not recycled during a render cycle.
   *
   * @param element
   * @return element
   */
  function protectElement(element) {
    poolsCache.elementObject.protect(element);

    element.childNodes.forEach(protectElement);
    element.attributes.forEach(poolsCache.attributeObject.protect,
      poolsCache.attributeObject);

    return element;
  }

  exports.protectElement = protectElement;

  /**
   * Allows an element to be recycled during a render cycle.
   *
   * @param element
   * @return
   */
  function unprotectElement(element) {
    element.childNodes.forEach(unprotectElement);
    element.attributes.forEach(poolsCache.attributeObject.unprotect,
      poolsCache.attributeObject);

    poolsCache.elementObject.unprotect(element);

    return element;
  }

  exports.unprotectElement = unprotectElement;

  /**
   * Recycles all unprotected allocations.
   */
  function cleanMemory() {
    // Free all memory after each iteration.
    poolsCache.attributeObject.freeAll();
    poolsCache.elementObject.freeAll();
  }

  exports.cleanMemory = cleanMemory;
});
