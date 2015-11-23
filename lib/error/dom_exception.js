define(function(require, exports, module) {
  'use strict';

  var inherits = require('../util/inherits');
  var missingStackTrace = 'Browser doesn\'t support error stack traces.';

  /**
   * Identifies an error with registering an element.
   */
  function DOMException(message) {
    Error.call(this);

    this.message = 'Uncaught DOMException: ' + message;
    this.stack = this.stack || missingStackTrace;
  }

  // Extends the Error constructor.
  inherits(DOMException, Error);

  module.exports = DOMException;
});
