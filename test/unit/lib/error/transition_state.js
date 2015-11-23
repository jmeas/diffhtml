define(function(require) {
  'use strict';

  var TransitionStateError = require('../../../../lib/error/transition_state');

  describe('TransitionStateError', function() {
    it('correctly attaches the message and stack properties', function() {
      var error = new TransitionStateError('Test');

      assert.equal(error.message, 'Test');
      assert.ok(error.stack);
    });
  });
});
