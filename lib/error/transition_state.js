define(function(require, exports, module) {
  'use strict';

  var inherits = require('../util/inherits');
  var missingStackTrace = 'Browser doesn\'t support error stack traces.';

  /**
   * Identifies an error with transitions.
   */
  function TransitionStateError(message) {
    Error.call(this, message);

    this.message = message;
    this.stack = this.stack || missingStackTrace;
  }

  // Extends the Error constructor.
  inherits(TransitionStateError, Error);

  module.exports = TransitionStateError;
});
