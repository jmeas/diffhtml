define(function(require) {
  'use strict';

  var DOMException = require('../../../../lib/error/dom_exception');

  describe('DOMException', function() {
    it('correctly attaches the message and stack properties', function() {
      var error = new DOMException('Test');

      assert.equal(error.message, 'Uncaught DOMException: Test');
      assert.ok(error.stack);
    });
  });
});
