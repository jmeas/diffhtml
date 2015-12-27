window.mocha.setup('bdd');
window.onload = function() {
  // window.mocha.checkLeaks();
  window.mocha.globals([
    'stub', 'spy', 'expect', 'sandbox', 'mock', 'assert',
    'useFakeTimers', 'useFakeXMLHttpRequest', 'useFakeServer',
    'TransitionStateError'
  ]);
  window.mocha.run();
};
