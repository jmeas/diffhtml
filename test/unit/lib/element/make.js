define(function(require) {
  'use strict';

  var makeElement = require('../../../../lib/element/get');

  describe('makeElement', function() {
    it('can create an empty element', function() {
      var element = makeElement({
        element: 'some_uuid_0',
        nodeName: 'p'
      });

      assert.equal(element.childNodes.length, 0);
      assert.equal(element.attributes.length, 0);
      assert.equal(element.nodeName, 'P');
    });

    it('will return the same element if same element uuid is used', function() {
      var element = makeElement({
        element: 'some_uuid_0',
        nodeName: 'span'
      });

      assert.equal(element.childNodes.length, 0);
      assert.equal(element.attributes.length, 0);
      assert.equal(element.nodeName, 'P');
    });

    it('can set text content', function() {
      var element = makeElement({
        element: 'some_uuid_1',
        nodeName: 'p',
        nodeValue: 'hello'
      });

      assert.equal(element.nodeName, 'P');
      assert.equal(element.textContent, 'hello');
    });

    it('can create an element with children', function() {
      var element = makeElement({
        element: 'some_uuid_2',
        nodeName: 'div',
        childNodes: [{ nodeName: 'p', nodeValue: 'hello' }]
      });

      assert.equal(element.childNodes[0].nodeName, 'P');
      assert.equal(element.childNodes[0].textContent, 'hello');
    });

    it('can create an element with attributes', function() {
      var element = makeElement({
        element: 'some_uuid_3',
        nodeName: 'div',
        attributes: [{ name: 'class', value: 'some_Value' }]
      });

      assert.equal(element.getAttribute('class'), 'some_Value');
    });
  });
});
