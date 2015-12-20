define(function(require, exports, module) {
  'use strict';

  var makeNode = require('../node/make');
  var makeElement = require('../element/make');

  /**
   * Takes in an element reference and resolve it to a uuid and DOM node.
   *
   * @param ref - Element descriptor
   * @return {Object} containing the uuid and DOM node.
   */
  function get(ref) {
    var uuid = typeof ref === 'string' ? ref : ref.uuid;
    var element = makeNode.nodes[uuid] || makeElement(ref);

    return { element: element, uuid: uuid };
  }

  module.exports = get;
});
