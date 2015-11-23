(function(window) {
  "use strict";

  // Tests to run.
  var tests = [
    'unit/index',
  ];

  // Prefer the BDD testing style.
  mocha.setup("bdd");

  // Modify the configuration to point to the correct source base.
  require.config({
    baseUrl: '.',
    //urlArgs: "bust=" + +new Date(),
    paths: {
      // Toggle the path to use a distribution or the source.
      '../../lib/index': window.useDist || '../../lib/index'
    },
    // Make it easier to `require("combyne")` in the browser REPL.
    map: {
      '*': {
        diffhtml: '../../lib/index'
      }
    }
  });

  // Load all tests and start Karma.
  require(tests, function() {
    if (window.mochaPhantomJS) { mochaPhantomJS.run(); }
    else { mocha.run(); }
  });
})(this);
