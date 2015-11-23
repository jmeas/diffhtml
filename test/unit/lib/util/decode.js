define(function(require) {
  'use strict';

  var decode = require('../../../../lib/util/decode');

  describe('decode', function() {
    it('exists', function() {
      assert.ok(decode);
    });

    it('can decode an HTML entity', function() {
      assert.equal(decode('&nbsp;'), ' ');
    });

    it('can decode an HTML5 entity', function() {
      assert.equal(decode('&gla;'), '⪥');
    });
  });
});
