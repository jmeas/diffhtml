define(function(require, exports, module) {
  'use strict';

  var element = document.createElement('div');

  /**
   * Decode's HTML entities.
   *
   * @see http://stackoverflow.com/a/13091266
   * @param stringing
   * @return unescaped decoded HTML
   */
  function decodeEntities(string) {
    element.innerHTML = string;
    return element.textContent;
  }

  module.exports = decodeEntities;
});
