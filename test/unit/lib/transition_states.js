define(function(require) {
  'use strict';

  var transitionStates = require('../../../lib/transition_states');

  describe('TransitionStates', function() {
    it('exports arrays to store callbacks in', function() {
      assert.ok(Array.isArray(transitionStates.attached));
      assert.ok(Array.isArray(transitionStates.detached));
      assert.ok(Array.isArray(transitionStates.replaced));
      assert.ok(Array.isArray(transitionStates.attributeChanged));
      assert.ok(Array.isArray(transitionStates.textChanged));
    });
  });
});
