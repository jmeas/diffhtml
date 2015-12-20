define(function(require) {
  'use strict';

  var getElement = require('../../../../lib/element/get');

  describe('getElement', function() {
    it('creates an element from descriptor on first access', function() {
      var retVal = getElement({
        uuid: 'some_uuid',
        nodeName: 'div',
        nodeValue: 'test'
      });

      assert.equal(retVal.uuid, 'some_uuid');
      assert.ok(retVal.element instanceof Element);
      assert.equal(retVal.element.textContent, 'test');
    });

    it('can get an existing element descriptor', function() {
      getElement({
        uuid: 'some_uuid',
        nodeName: 'div',
        nodeValue: 'test'
      });

      var retVal = getElement({ uuid: 'some_uuid' });

      assert.equal(retVal.uuid, 'some_uuid');
      assert.ok(retVal.element instanceof Element);
      assert.equal(retVal.element.textContent, 'test');
    });
  });
});
