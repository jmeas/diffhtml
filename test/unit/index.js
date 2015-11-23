define(function(require, exports, module) {
  'use strict';

  require('./lib/index');
  require('./lib/svg');
  require('./lib/transition_states');

  //require('./lib/element/custom');
  require('./lib/element/get');
  //require('./lib/element/make');

  require('./lib/error/dom_exception');
  require('./lib/error/transition_state');

  //require('./lib/node/index');
  //require('./lib/node/make');
  //require('./lib/node/patch');
  //require('./lib/node/sync');
  //require('./lib/node/tree');

  //require('./lib/patches/process');

  require('./lib/util/decode');
  require('./lib/util/inherits');
  //require('./lib/util/memory');
  //require('./lib/util/parser');
  //require('./lib/util/pools');
  require('./lib/util/uuid');

  //require('./lib/worker/create');
  //require('./lib/worker/source');
});
