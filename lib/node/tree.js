// Cache prebuilt trees and lookup by element.
define(function(require, exports, module) {
  'use strict';

  var TreeCache = new WeakMap();

  module.exports = TreeCache;
});
