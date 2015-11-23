define(function(require) {
  'use strict';

  var uuid = require('../../../../lib/util/uuid');

  describe('uuid', function() {
    it('exists', function() {
      assert.ok(uuid);
    });

    it('can generate a string uuid', function() {
      assert.equal(typeof uuid(), 'string');
    });

    it('generates random values', function() {
      var uuid1 = uuid();
      var uuid2 = uuid();
      var uuid3 = uuid();

      assert.ok(uuid1 !== uuid2 !== uuid3);
    });
  });
});
