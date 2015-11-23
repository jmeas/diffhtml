define(function(require, exports, module) {
  'use strict';

  /**
   * Extracted from the Babel project generated source code.
   *
   * @param subClass
   * @param superClass
   */
  function inherits(subClass, superClass) {
    var errorMesg = 'Super expression must either be null or a function, not ';

    if (typeof superClass !== 'function' && superClass !== null) {
      throw new TypeError(errorMesg + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });

    if (superClass && Object.setPrototypeOf) {
      Object.setPrototypeOf(subClass, superClass);
    }
    else if (superClass) {
      subClass.__proto__ = superClass;
    }
  }

  module.exports = inherits;
});
