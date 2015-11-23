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
    var uuid = ref.uuid || ref;
    var element = makeNode.nodes[uuid] || makeElement(ref);

    return { element: element, uuid: uuid };
  }

  module.exports = get;
});
//define(function(require, exports, module) {
//  'use strict';
//
//  var makeNode = require('../node/make');
//  var makeElement = require('../element/make');
//
//  /**
//   * Takes in an element uuid and resolve it to a DOM node.
//   *
//   * @param uuid - Element uuid
//   * @return {Object} containing the uuid and DOM node.
//   */
//  function byUUID(uuid) {
//    return { element: makeNode.nodes[uuid], uuid: uuid };
//  }
//
//  exports.byUUID = byUUID;
//
//  /**
//   * Takes in an element reference and resolve it to a uuid and DOM node.
//   *
//   * @param ref
//   * @return
//   */
//  function byReference(ref) {
//    var uuid = ref.uuid;
//    var element = makeNode.nodes[uuid] || makeElement(ref);
//
//    return { element: element, uuid: uuid };
//  }
//
//  exports.byReference = byReference;
//});
