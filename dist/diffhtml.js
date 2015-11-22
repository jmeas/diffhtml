(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.diff = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
 * Store all custom elements in this object.
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.upgrade = upgrade;
var components = {};

exports.components = components;
var empty = function empty() {};

/**
 * Ensures the element instance matches the CustomElement's prototype.
 *
 * @param tagName
 * @param element
 * @return {Boolean} successfully upgraded
 */

function upgrade(tagName, element) {
  var CustomElement = components[tagName] || empty;

  // No need to upgrade if already a subclass.
  if (element instanceof CustomElement) {
    return false;
  }

  // Copy the prototype into the Element.
  if (CustomElement !== empty) {
    element.__proto__ = Object.create(CustomElement.prototype);
  }

  // Custom elements have a createdCallback method that should be called.
  if (CustomElement.prototype.createdCallback) {
    CustomElement.prototype.createdCallback.call(element);
  }

  return true;
}

;

},{}],2:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = get;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nodeMake = _dereq_('../node/make');

var _nodeMake2 = _interopRequireDefault(_nodeMake);

var _elementMake = _dereq_('../element/make');

var _elementMake2 = _interopRequireDefault(_elementMake);

/**
 * Takes in an element reference and resolve it to a uuid and DOM node.
 *
 * @param ref - Element descriptor
 * @return {Object} containing the uuid and DOM node.
 */

function get(ref) {
  var uuid = ref.element || ref;
  var element = _nodeMake2['default'].nodes[uuid] || (0, _elementMake2['default'])(ref);

  return { element: element, uuid: uuid };
}

module.exports = exports['default'];

},{"../element/make":3,"../node/make":6}],3:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = make;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _svg = _dereq_('../svg');

var svg = _interopRequireWildcard(_svg);

var _nodeMake = _dereq_('../node/make');

var _nodeMake2 = _interopRequireDefault(_nodeMake);

var _custom = _dereq_('./custom');

var empty = { prototype: {} };

/**
 * Takes in a virtual descriptor and creates an HTML element. Set's the element
 * into the cache.
 *
 * @param descriptor
 * @return {Element}
 */

function make(descriptor) {
  var element = null;
  var isSvg = false;
  // Get the custom element constructor for a given element.
  var CustomElement = _custom.components[descriptor.nodeName] || empty;

  if (descriptor.nodeName === '#text') {
    element = document.createTextNode(descriptor.nodeValue);
  } else {
    if (svg.elements.indexOf(descriptor.nodeName) > -1) {
      isSvg = true;
      element = document.createElementNS(svg.namespace, descriptor.nodeName);
    } else {
      element = document.createElement(descriptor.nodeName);
    }

    if (descriptor.attributes && descriptor.attributes.length) {
      for (var i = 0; i < descriptor.attributes.length; i++) {
        var attribute = descriptor.attributes[i];
        element.setAttribute(attribute.name, attribute.value);
      }
    }

    if (descriptor.childNodes && descriptor.childNodes.length) {
      for (var i = 0; i < descriptor.childNodes.length; i++) {
        element.appendChild(make(descriptor.childNodes[i]));
      }
    }
  }

  // Always set the node's value.
  if (descriptor.nodeValue) {
    element.textContent = descriptor.nodeValue;
  }

  // Upgrade the element after creating it.
  (0, _custom.upgrade)(descriptor.nodeName, element);

  // Custom elements have a createdCallback method that should be called.
  if (CustomElement.prototype.createdCallback) {
    CustomElement.prototype.createdCallback.call(element);
  }

  // Add to the nodes cache using the designated uuid as the lookup key.
  _nodeMake2['default'].nodes[descriptor.element] = element;

  return element;
}

module.exports = exports['default'];

},{"../node/make":6,"../svg":11,"./custom":1}],4:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var missingStackTrace = 'Browser doesn\'t support error stack traces.';

/**
 * Identifies an error with transitions.
 */

var TransitionStateError = (function (_Error) {
  _inherits(TransitionStateError, _Error);

  function TransitionStateError(message) {
    _classCallCheck(this, TransitionStateError);

    var error = _get(Object.getPrototypeOf(TransitionStateError.prototype), 'constructor', this).call(this);

    this.message = message;
    this.stack = error.stack || missingStackTrace;
  }

  /**
   * Identifies an error with registering an element.
   */
  return TransitionStateError;
})(Error);

exports.TransitionStateError = TransitionStateError;

var DOMException = (function (_Error2) {
  _inherits(DOMException, _Error2);

  function DOMException(message) {
    _classCallCheck(this, DOMException);

    var error = _get(Object.getPrototypeOf(DOMException.prototype), 'constructor', this).call(this);

    this.message = 'Uncaught DOMException: ' + message;
    this.stack = error.stack || missingStackTrace;
  }

  return DOMException;
})(Error);

exports.DOMException = DOMException;

},{}],5:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.outerHTML = outerHTML;
exports.innerHTML = innerHTML;
exports.element = element;
exports.release = release;
exports.registerElement = registerElement;
exports.addTransitionState = addTransitionState;
exports.removeTransitionState = removeTransitionState;
exports.enableProllyfill = enableProllyfill;

var _nodePatch = _dereq_('./node/patch');

var _transitions = _dereq_('./transitions');

var _elementCustom = _dereq_('./element/custom');

// We export the TransitionStateError constructor so that instanceof checks can
// be made by those publicly consuming this library.

var _errors = _dereq_('./errors');

Object.defineProperty(exports, 'TransitionStateError', {
  enumerable: true,
  get: function get() {
    return _errors.TransitionStateError;
  }
});

var realRegisterElement = document.registerElement;
var empty = {};

/**
 * Used to diff the outerHTML contents of the passed element with the markup
 * contents.  Very useful for applying a global diff on the
 * `document.documentElement`.
 *
 * @param element
 * @param markup=''
 * @param options={}
 */

function outerHTML(element) {
  var markup = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  options.inner = false;
  (0, _nodePatch.patchNode)(element, markup, options);
}

/**
 * Used to diff the innerHTML contents of the passed element with the markup
 * contents.  This is useful with libraries like Backbone that render Views
 * into element container.
 *
 * @param element
 * @param markup=''
 * @param options={}
 */

function innerHTML(element) {
  var markup = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  options.inner = true;
  (0, _nodePatch.patchNode)(element, markup, options);
}

/**
 * Used to diff two elements.  The `inner` Boolean property can be specified in
 * the options to set innerHTML\outerHTML behavior.  By default it is
 * outerHTML.
 *
 * @param element
 * @param newElement
 * @param options={}
 */

function element(element, newElement) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  (0, _nodePatch.patchNode)(element, newElement, options);
}

/**
 * Releases the worker and memory allocated to this element. Useful for
 * components to clean up when removed.
 *
 * @param element
 */

function release(element) {
  (0, _nodePatch.releaseNode)(element);
}

/**
 * Register's a constructor with an element to provide lifecycle events.
 *
 * @param tagName
 * @param constructor
 */

function registerElement(tagName, constructor) {
  // Upgrade simple objects to inherit from HTMLElement and be usable in a real
  // implementation.
  var normalizedConstructor = constructor.prototype ? constructor : null;

  if (!normalizedConstructor) {
    constructor.__proto__ = HTMLElement.prototype;
    normalizedConstructor = function () {};
    normalizedConstructor.prototype = constructor;
  }

  // If the native web component specification is loaded, use that instead.
  if (realRegisterElement) {
    return realRegisterElement.call(document, tagName, normalizedConstructor);
  }

  // If the element has already been registered, raise an error.
  if (tagName in _elementCustom.components) {
    throw new DOMException('\n      Failed to execute \'registerElement\' on \'Document\': Registration failed\n      for type \'' + tagName + '\'. A type with that name is already registered.\n    ');
  }

  // Assign the custom element reference to the constructor.
  _elementCustom.components[tagName] = normalizedConstructor;
}

/**
 * Adds a global transition listener.  With many elements this could be an
 * expensive operation, so try to limit the amount of listeners added if you're
 * concerned about performance.
 *
 * Since the callback triggers with various elements, most of which you
 * probably don't care about, you'll want to filter.  A good way of filtering
 * is to use the DOM `matches` method.  It's fairly well supported
 * (http://caniuse.com/#feat=matchesselector) and may suit many projects.  If
 * you need backwards compatibility, consider using jQuery's `is`.
 *
 * You can do fun, highly specific, filters:
 *
 * addTransitionState('attached', function(element) {
 *   // Fade in the main container after it's added.
 *   if (element.matches('body main.container')) {
 *     $(element).stop(true, true).fadeIn();
 *   }
 * });
 *
 * @param state - String name that matches what's available in the
 * documentation above.
 * @param callback - Function to receive the matching elements.
 */

function addTransitionState(state, callback) {
  if (!state) {
    throw new _errors.TransitionStateError('Missing transition state name');
  }

  if (!callback) {
    throw new _errors.TransitionStateError('Missing transition state callback');
  }

  // Not a valid state name.
  if (Object.keys(_transitions.transitionStates).indexOf(state) === -1) {
    throw new _errors.TransitionStateError('Invalid state name: ' + state);
  }

  _transitions.transitionStates[state].push(callback);
}

/**
 * Removes a global transition listener.
 *
 * When invoked with no arguments, this method will remove all transition
 * callbacks.  When invoked with the name argument it will remove all
 * transition state callbacks matching the name, and so on for the callback.
 *
 * @param state - String name that matches what's available in the
 * documentation above.
 * @param callback - Function to receive the matching elements.
 */

function removeTransitionState(state, callback) {
  if (!callback && state) {
    _transitions.transitionStates[state].length = 0;
  } else if (state && callback) {
    // Not a valid state name.
    if (Object.keys(_transitions.transitionStates).indexOf(state) === -1) {
      throw new _errors.TransitionStateError('Invalid state name ' + state);
    }

    var index = _transitions.transitionStates[state].indexOf(callback);
    _transitions.transitionStates[state].splice(index, 1);
  } else {
    for (var _state in _transitions.transitionStates) {
      _transitions.transitionStates[_state].length = 0;
    }
  }
}

/**
 * By calling this function your browser environment is enhanced globally. This
 * project would love to hit the standards track and allow all developers to
 * benefit from the performance gains of DOM diffing.
 */

function enableProllyfill() {
  // Exposes the `TransitionStateError` constructor globally so that developers
  // can instanceof check exception errors.
  Object.defineProperty(window, 'TransitionStateError', {
    configurable: true,

    value: _errors.TransitionStateError
  });

  // Allows a developer to add transition state callbacks.
  Object.defineProperty(document, 'addTransitionState', {
    configurable: true,

    value: function value(state, callback) {
      addTransitionState(state, callback);
    }
  });

  // Allows a developer to remove transition state callbacks.
  Object.defineProperty(document, 'removeTransitionState', {
    configurable: true,

    value: function value(state, callback) {
      removeTransitionState(state, callback);
    }
  });

  // Allows a developer to set the `innerHTML` of an element.
  Object.defineProperty(Element.prototype, 'diffInnerHTML', {
    configurable: true,

    set: function set(newHTML) {
      innerHTML(this, newHTML);
    }
  });

  // Allows a developer to set the `outerHTML` of an element.
  Object.defineProperty(Element.prototype, 'diffOuterHTML', {
    configurable: true,

    set: function set(newHTML) {
      outerHTML(this, newHTML);
    }
  });

  // Allows a developer to diff the current element with a new element.
  Object.defineProperty(Element.prototype, 'diffElement', {
    configurable: true,

    value: function value(newElement, options) {
      element(this, newElement, options);
    }
  });

  // Releases the retained memory and worker instance.
  Object.defineProperty(Element.prototype, 'diffRelease', {
    configurable: true,

    value: function value(newElement) {
      (0, _nodePatch.releaseNode)(this);
    }
  });

  // Polyfill in the `registerElement` method if it doesn't already exist. This
  // requires patching `createElement` as well to ensure that the proper proto
  // chain exists.
  Object.defineProperty(document, 'registerElement', {
    configurable: true,

    value: function value(tagName, component) {
      registerElement(tagName, component);
    }
  });

  // If HTMLElement is an object, rejigger it to work like a function so that
  // it can be extended. Specifically affects IE and Safari.
  if (typeof Element === 'object' || typeof HTMLElement === 'object') {
    // Fall back to the Element constructor if the HTMLElement does not exist.
    var realHTMLElement = HTMLElement || Element;

    // If there is no `__proto__` available, add one to the prototype.
    if (!realHTMLElement.__proto__) {
      var copy = {
        set: function set(val) {
          val = Object.keys(val).length ? val : Object.getPrototypeOf(val);
          for (var key in val) {
            if (val.hasOwnProperty(key)) {
              this[key] = val[key];
            }
          }
        }
      };

      Object.defineProperty(realHTMLElement, '__proto__', copy);
      Object.defineProperty(realHTMLElement.prototype, '__proto__', copy);
    }

    HTMLElement = function () {};
    HTMLElement.prototype = Object.create(realHTMLElement.prototype);
    HTMLElement.__proto__ = realHTMLElement;

    // Ensure that the global Element matches the HTMLElement.
    Element = HTMLElement;
  }

  var activateComponents = function activateComponents() {
    var documentElement = document.documentElement;

    // After the initial render, clean up the resources, no point in lingering.
    documentElement.addEventListener('renderComplete', function render() {
      // Release resources to the element.
      documentElement.diffRelease(documentElement);

      // Remove this event listener.
      documentElement.removeEventListener('renderComplete', render);
    });

    // Diff the entire document on activation of the prollyfill.
    documentElement.diffOuterHTML = documentElement.outerHTML;

    // Remove the load event listener, since it's complete.
    window.removeEventListener('load', activateComponents);
  };

  // This section will automatically parse out your entire page to ensure all
  // custom elements are hooked into.
  window.addEventListener('load', activateComponents);

  // If the document has already loaded, immediately activate the components.
  if (document.readyState === 'complete') {
    activateComponents();
  }
}

},{"./element/custom":1,"./errors":4,"./node/patch":7,"./transitions":12}],6:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = make;

var _utilPools = _dereq_('../util/pools');

var _utilMemory = _dereq_('../util/memory');

var _elementCustom = _dereq_('../element/custom');

var pools = _utilPools.pools;
var protectElement = _utilMemory.protectElement;
var unprotectElement = _utilMemory.unprotectElement;
var empty = {};

// Cache created nodes inside this object.
make.nodes = {};

/**
 * Converts a live node into a virtual node.
 *
 * @param node
 * @return
 */

function make(node, protect) {
  var nodeType = node.nodeType;
  var nodeValue = node.nodeValue;

  if (!nodeType || nodeType === 2 || nodeType === 4 || nodeType === 8) {
    return false;
  }

  if (nodeType === 3 && !nodeValue.trim()) {
    return false;
  }

  // Virtual representation of a node, containing only the data we wish to
  // diff and patch.
  var entry = pools.elementObject.get();

  // Add to internal lookup.
  make.nodes[entry.element] = node;

  entry.nodeName = node.nodeName.toLowerCase();
  entry.nodeValue = nodeValue;
  entry.childNodes.length = 0;
  entry.attributes.length = 0;

  if (protect) {
    protectElement(entry);
  }

  // Collect attributes.
  var attributes = node.attributes;

  // If the element has no attributes, skip over.
  if (attributes) {
    var attributesLength = attributes.length;

    if (attributesLength) {
      for (var i = 0; i < attributesLength; i++) {
        var attr = pools.attributeObject.get();

        if (protect) {
          pools.attributeObject.protect(attr);
        }

        attr.name = attributes[i].name;
        attr.value = attributes[i].value;

        entry.attributes[entry.attributes.length] = attr;
      }
    }
  }

  // Collect childNodes.
  var childNodes = node.childNodes;
  var childNodesLength = node.childNodes.length;

  // If the element has child nodes, convert them all to virtual nodes.
  if (node.nodeType !== 3 && childNodes) {
    for (var i = 0; i < childNodesLength; i++) {
      var newNode = make(childNodes[i], protect);

      if (newNode) {
        entry.childNodes[entry.childNodes.length] = newNode;
      }
    }
  }

  // TODO Rename this to first-run, because we're calling the attach callback
  // and protecting now.
  if (protect) {
    if (_elementCustom.components[entry.nodeName]) {
      // Reset the prototype chain for this element. Upgrade will return `true`
      // if the element was upgraded for the first time. This is useful so we
      // don't end up in a loop when working with the same element.
      if ((0, _elementCustom.upgrade)(entry.nodeName, node)) {
        // If the Node is in the DOM, trigger attached callback.
        if (node.parentNode && node.attachedCallback) {
          node.attachedCallback();
        }
      }
    }
  }

  return entry;
}

module.exports = exports['default'];

},{"../element/custom":1,"../util/memory":14,"../util/pools":16}],7:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.releaseNode = releaseNode;
exports.patchNode = patchNode;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _customEvent = _dereq_('custom-event');

var _customEvent2 = _interopRequireDefault(_customEvent);

var _workerCreate = _dereq_('../worker/create');

var _utilMemory = _dereq_('../util/memory');

var _utilPools = _dereq_('../util/pools');

var _utilParser = _dereq_('../util/parser');

var _patchesProcess = _dereq_('../patches/process');

var _patchesProcess2 = _interopRequireDefault(_patchesProcess);

var _make = _dereq_('./make');

var _make2 = _interopRequireDefault(_make);

var _elementMake = _dereq_('../element/make');

var _elementMake2 = _interopRequireDefault(_elementMake);

var _sync = _dereq_('./sync');

var _sync2 = _interopRequireDefault(_sync);

var _tree = _dereq_('./tree');

/**
 * Release's the allocated objects and recycles internal memory.
 *
 * @param element
 */

function releaseNode(element) {
  var elementMeta = _tree.TreeCache.get(element) || {};

  // If there is a worker associated with this element, then kill it.
  if (elementMeta.worker) {
    elementMeta.worker.terminate();
  }

  // If there was a tree set up, recycle the memory allocated for it.
  if (elementMeta.oldTree) {
    (0, _utilMemory.unprotectElement)(elementMeta.oldTree);
    (0, _utilMemory.cleanMemory)();
  }

  // Remove this element's meta object from the cache.
  _tree.TreeCache['delete'](element);
}

/**
 * When the worker completes, clean up memory and schedule the next render if
 * necessary.
 *
 * @param element
 * @param elementMeta
 * @return {Function}
 */
function completeWorkerRender(element, elementMeta) {
  return function (ev) {
    var nodes = ev.data.nodes;

    // Add new elements.
    if (nodes.additions.length) {
      nodes.additions.map(_utilMemory.protectElement).map(function (descriptor) {
        // Inject into the `oldTree` so it's cleaned up correctly.
        elementMeta.oldTree.childNodes.push(descriptor);
        return descriptor;
      }).forEach(_elementMake2['default']);
    }

    var completeRender = function completeRender() {
      // Remove unused elements.
      if (nodes.removals.length) {
        nodes.removals.map(function (uuid) {
          return _utilPools.pools.elementObject._uuid[uuid];
        }).forEach(_utilMemory.unprotectElement);
      }

      // Reset internal caches for quicker lookups in the futures.
      elementMeta._innerHTML = element.innerHTML;
      elementMeta._outerHTML = element.outerHTML;
      elementMeta._textContent = element.textContent;

      // Recycle all unprotected allocations.
      (0, _utilMemory.cleanMemory)();

      elementMeta.hasWorkerRendered = true;
      elementMeta.isRendering = false;

      // This is designed to handle use cases where renders are being hammered
      // or when transitions are used with Promises.
      if (elementMeta.renderBuffer) {
        var nextRender = elementMeta.renderBuffer;

        // Reset the buffer.
        elementMeta.renderBuffer = undefined;

        // Noticing some weird performance implications with this concept.
        patchNode(element, nextRender.newHTML, nextRender.options);
      }
      // Dispatch an event on the element once rendering has completed.
      else {
          element.dispatchEvent(new _customEvent2['default']('renderComplete'));
        }
    };

    // Wait until all promises have resolved, before finishing up the patch
    // cycle.
    // Process the data immediately and wait until all transition callbacks
    // have completed.
    var processPromise = (0, _patchesProcess2['default'])(element, ev.data.patches);

    // Operate synchronously unless opted into a Promise-chain.
    if (processPromise) {
      processPromise.then(completeRender);
    } else {
      completeRender();
    }
  };
}

/**
 * Patches an element's DOM to match that of the passed markup.
 *
 * @param element
 * @param newHTML
 */

function patchNode(element, newHTML, options) {
  // Ensure that the document disable worker is always picked up.
  if (typeof options.enableWorker !== 'boolean') {
    options.enableWorker = document.ENABLE_WORKER;
  }

  var elementMeta = _tree.TreeCache.get(element) || {};

  if (elementMeta.isRendering) {
    // Add this new render into the buffer queue.
    elementMeta.renderBuffer = { newHTML: newHTML, options: options };
    return;
  }

  // Always ensure the most up-to-date meta object is stored.
  _tree.TreeCache.set(element, elementMeta);

  var nextRender = function nextRender() {
    if (elementMeta.renderBuffer) {
      var _nextRender = elementMeta.renderBuffer;
      elementMeta.renderBuffer = undefined;

      // Noticing some weird performance implications with this concept.
      patchNode(element, _nextRender.newHTML, _nextRender.options);
    }
  };

  // If the operation is `innerHTML`, but the contents haven't changed, abort.
  var differentInnerHTML = options.inner && element.innerHTML === newHTML;
  // If the operation is `outerHTML`, but the contents haven't changed, abort.
  var differentOuterHTML = !options.inner && element.outerHTML === newHTML;

  // Start with worker being a falsy value.
  var worker = null;

  // If we can use a worker and the user wants one, try and create it.
  if (options.enableWorker && _workerCreate.hasWorker) {
    // Create a worker for this element.
    worker = elementMeta.worker = elementMeta.worker || (0, _workerCreate.create)();
  }

  // And ensure that an `oldTree` exists, otherwise this is the first render
  // potentially.
  if ((differentInnerHTML || differentOuterHTML) && elementMeta.oldTree) {
    nextRender();
    return;
  }

  if (
  // If the operation is `innerHTML`, and the current element's contents have
  // changed since the last render loop, recalculate the tree.
  options.inner && elementMeta._innerHTML !== element.innerHTML ||

  // If the operation is `outerHTML`, and the current element's contents have
  // changed since the last render loop, recalculate the tree.
  !options.inner && elementMeta._outerHTML !== element.outerHTML ||

  // If the text content ever changes, recalculate the tree.
  elementMeta._textContent !== element.textContent) {
    if (elementMeta.oldTree) {
      (0, _utilMemory.unprotectElement)(elementMeta.oldTree);
      (0, _utilMemory.cleanMemory)();
    }

    elementMeta.oldTree = (0, _make2['default'])(element, true);
    elementMeta.updateOldTree = true;
  }

  // Will want to ensure that the first render went through, the worker can
  // take a bit to startup and we want to show changes as soon as possible.
  if (options.enableWorker && _workerCreate.hasWorker && worker) {
    // Set a render lock as to not flood the worker.
    elementMeta.isRendering = true;

    // Attach all properties here to transport.
    var transferObject = {};

    // This should only occur once, or whenever the markup changes externally
    // to diffHTML.
    if (!elementMeta.hasWorkerRendered || elementMeta.updateOldTree) {
      transferObject.oldTree = elementMeta.oldTree;
      elementMeta.updateOldTree = false;
    }

    // Attach the parent element's uuid.
    transferObject.uuid = elementMeta.oldTree.element;

    if (typeof newHTML !== 'string') {
      transferObject.newTree = (0, _make2['default'])(newHTML);

      // Transfer this buffer to the worker, which will take over and process the
      // markup.
      worker.postMessage(transferObject);

      // Wait for the worker to finish processing and then apply the patchset.
      worker.onmessage = completeWorkerRender(element, elementMeta);

      return;
    }

    // Let the browser copy the HTML into the worker, converting to a
    // transferable object is too expensive.
    transferObject.newHTML = newHTML;

    // Add properties to send to worker.
    transferObject.isInner = options.inner;

    // Transfer this buffer to the worker, which will take over and process the
    // markup.
    worker.postMessage(transferObject);

    // Wait for the worker to finish processing and then apply the patchset.
    worker.onmessage = completeWorkerRender(element, elementMeta);
  } else {
    var processPromise;

    (function () {
      // We're rendering in the UI thread.
      elementMeta.isRendering = true;

      var patches = [];
      var newTree = null;

      if (typeof newHTML === 'string') {
        newTree = (0, _utilParser.parseHTML)(newHTML, options.inner);
      } else {
        newTree = (0, _make2['default'])(newHTML);
      }

      if (options.inner) {
        var childNodes = newTree;

        newTree = {
          childNodes: childNodes,

          attributes: elementMeta.oldTree.attributes,
          element: elementMeta.oldTree.element,
          nodeName: elementMeta.oldTree.nodeName,
          nodeValue: elementMeta.oldTree.nodeValue
        };
      }

      var oldTreeName = elementMeta.oldTree.nodeName || '';
      var newNodeName = newTree && newTree.nodeName;

      // If the element node types match, try and compare them.
      if (oldTreeName === newNodeName) {
        // Synchronize the tree.
        _sync2['default'].call(patches, elementMeta.oldTree, newTree);
      }
      // Otherwise replace the top level elements.
      else if (newHTML) {
          patches[patches.length] = {
            __do__: 0,
            old: elementMeta.oldTree,
            'new': newTree
          };

          (0, _utilMemory.unprotectElement)(elementMeta.oldTree);

          elementMeta.oldTree = newTree;
        }

      var completeRender = function completeRender() {
        // Mark that this element has initially rendered and is done rendering.
        elementMeta.isRendering = false;

        // Set the innerHTML.
        elementMeta._innerHTML = element.innerHTML;
        elementMeta._outerHTML = element.outerHTML;
        elementMeta._textContent = element.textContent;

        (0, _utilMemory.cleanMemory)();

        // Clean out the patches array.
        patches.length = 0;

        // Dispatch an event on the element once rendering has completed.
        element.dispatchEvent(new _customEvent2['default']('renderComplete'));

        // TODO Update this comment and/or refactor to use the same as the Worker.
        nextRender();
      };

      // Process the data immediately and wait until all transition callbacks
      // have completed.
      try {
        processPromise = (0, _patchesProcess2['default'])(element, patches);
      } catch (ex) {
        console.log(ex);
      }

      // Operate synchronously unless opted into a Promise-chain.
      if (processPromise) {
        processPromise.then(completeRender);
      } else {
        completeRender();
      }
    })();
  }
}

},{"../element/make":3,"../patches/process":10,"../util/memory":14,"../util/parser":15,"../util/pools":16,"../worker/create":18,"./make":6,"./sync":8,"./tree":9,"custom-event":20}],8:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = sync;

var _utilPools = _dereq_('../util/pools');

var _utilMemory = _dereq_('../util/memory');

var pools = _utilPools.pools;
var protectElement = _utilMemory.protectElement;
var unprotectElement = _utilMemory.unprotectElement;

var slice = Array.prototype.slice;

/**
 * Synchronizes changes from the newTree into the oldTree.
 *
 * @param oldTree
 * @param newTree
 */

function sync(oldTree, newTree) {
  var patches = this;
  var oldChildNodes = oldTree.childNodes;
  var oldChildNodesLength = oldChildNodes ? oldChildNodes.length : 0;
  var oldElement = oldTree.element;
  var textElements = ['script', 'style', 'textarea', '#text'];

  if (!newTree) {
    var removed = oldChildNodes.splice(0, oldChildNodesLength);

    patches[patches.length] = { __do__: -1, element: oldElement };

    for (var i = 0; i < removed.length; i++) {
      // Used by the Worker to track elements removed.
      if (patches.removals) {
        patches.removals.push(removed[i].element);
      }

      unprotectElement(removed[i]);
    }

    return;
  }

  var nodeValue = newTree.nodeValue;
  var childNodes = newTree.childNodes;
  var childNodesLength = childNodes ? childNodes.length : 0;
  var newElement = newTree.element;

  // If the element we're replacing is totally different from the previous
  // replace the entire element, don't bother investigating children.
  if (oldTree.nodeName !== newTree.nodeName) {
    return;
  }

  // Replace text node values if they are different.
  if (textElements.indexOf(newTree.nodeName) > -1) {
    // Text changed.
    if (oldTree.nodeValue !== nodeValue) {
      oldTree.nodeValue = nodeValue;

      patches[patches.length] = {
        __do__: 3,
        element: oldElement,
        value: nodeValue
      };
    }

    return;
  }

  // Most common additive elements.
  if (childNodesLength > oldChildNodesLength) {
    // Store elements in a DocumentFragment to increase performance and be
    // generally simplier to work with.
    var fragment = [];

    for (var i = oldChildNodesLength; i < childNodesLength; i++) {
      // Used by the Worker to track elements added.
      if (patches.additions) {
        patches.additions.push(childNodes[i]);
      }

      protectElement(childNodes[i]);

      // Internally add to the tree.
      oldChildNodes[oldChildNodes.length] = childNodes[i];

      // Add to the document fragment.
      fragment[fragment.length] = childNodes[i];
    }

    // Assign the fragment to the patches to be injected.
    patches[patches.length] = {
      __do__: 1,
      element: oldElement,
      fragment: fragment
    };
  }

  // Replace elements if they are different.
  for (var i = 0; i < childNodesLength; i++) {
    if (oldChildNodes[i].nodeName !== childNodes[i].nodeName) {
      // Add to the patches.
      patches[patches.length] = {
        __do__: 1,
        old: oldChildNodes[i],
        'new': childNodes[i]
      };

      // Used by the Worker to track elements removed.
      if (patches.removals) {
        patches.removals.push(oldChildNodes[i].element);
      }

      // Used by the Worker to track elements added.
      if (patches.additions) {
        patches.additions.push(childNodes[i]);
      }

      unprotectElement(oldChildNodes[i]);
      protectElement(childNodes[i]);

      // Replace the internal tree's point of view of this element.
      oldChildNodes[i] = childNodes[i];
    }
  }

  // Remove these elements.
  if (oldChildNodesLength > childNodesLength) {
    // Elements to remove.
    var toRemove = slice.call(oldChildNodes, childNodesLength, oldChildNodesLength);

    for (var i = 0; i < toRemove.length; i++) {
      // Remove the element, this happens before the splice so that we still
      // have access to the element.
      patches[patches.length] = { __do__: 1, old: toRemove[i].element };
    }

    var removed = oldChildNodes.splice(childNodesLength, oldChildNodesLength - childNodesLength);

    for (var i = 0; i < removed.length; i++) {
      // Used by the Worker to track elements removed.
      if (patches.removals) {
        patches.removals.push(removed[i].element);
      }

      unprotectElement(removed[i]);
    }
  }

  // Synchronize attributes
  var attributes = newTree.attributes;

  if (attributes) {
    var oldLength = oldTree.attributes.length;
    var newLength = attributes.length;

    // Start with the most common, additive.
    if (newLength > oldLength) {
      var toAdd = slice.call(attributes, oldLength);

      for (var i = 0; i < toAdd.length; i++) {
        var change = {
          __do__: 2,
          element: oldElement,
          name: toAdd[i].name,
          value: toAdd[i].value
        };

        var attr = pools.attributeObject.get();
        attr.name = toAdd[i].name;
        attr.value = toAdd[i].value;

        pools.attributeObject.protect(attr);

        // Push the change object into into the virtual tree.
        oldTree.attributes[oldTree.attributes.length] = attr;

        // Add the change to the series of patches.
        patches[patches.length] = change;
      }
    }

    // Check for removals.
    if (oldLength > newLength) {
      var toRemove = slice.call(oldTree.attributes, newLength);

      for (var i = 0; i < toRemove.length; i++) {
        var change = {
          __do__: 2,
          element: oldElement,
          name: toRemove[i].name,
          value: undefined
        };

        // Remove the attribute from the virtual node.
        var removed = oldTree.attributes.splice(i, 1);

        for (var _i = 0; _i < removed.length; _i++) {
          pools.attributeObject.unprotect(removed[_i]);
        }

        // Add the change to the series of patches.
        patches[patches.length] = change;
      }
    }

    // Check for modifications.
    var toModify = attributes;

    for (var i = 0; i < toModify.length; i++) {
      var oldAttrValue = oldTree.attributes[i] && oldTree.attributes[i].value;
      var newAttrValue = attributes[i] && attributes[i].value;

      // Only push in a change if the attribute or value changes.
      if (oldAttrValue !== newAttrValue) {
        var change = {
          __do__: 2,
          element: oldElement,
          name: toModify[i].name,
          value: toModify[i].value
        };

        // Replace the attribute in the virtual node.
        var attr = oldTree.attributes[i];
        attr.name = toModify[i].name;
        attr.value = toModify[i].value;

        // Add the change to the series of patches.
        patches[patches.length] = change;
      }
    }
  }

  // Sync each current node.
  for (var i = 0; i < oldChildNodes.length; i++) {
    if (oldChildNodes[i].element !== childNodes[i].element) {
      sync.call(patches, oldTree.childNodes[i], childNodes[i]);
    }
  }
}

module.exports = exports['default'];

},{"../util/memory":14,"../util/pools":16}],9:[function(_dereq_,module,exports){
// Cache prebuilt trees and lookup by element.
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var TreeCache = new WeakMap();
exports.TreeCache = TreeCache;

},{}],10:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = process;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _transitions = _dereq_('../transitions');

var _utilPools = _dereq_('../util/pools');

var _utilDecode = _dereq_('../util/decode');

var _utilDecode2 = _interopRequireDefault(_utilDecode);

var _elementGet = _dereq_('../element/get');

var _elementGet2 = _interopRequireDefault(_elementGet);

var _elementCustom = _dereq_('../element/custom');

var _nodeMake = _dereq_('../node/make');

var _nodeMake2 = _interopRequireDefault(_nodeMake);

var forEach = Array.prototype.forEach;
var empty = { prototype: {} };

/**
 * Processes an Array of patches.
 *
 * @param element - Element to process patchsets on.
 * @param e - Object that contains patches.
 */

function process(element, patches) {
  var states = _transitions.transitionStates;
  var promises = [];
  var addPromises = promises.push.apply.bind(promises.push, promises);

  // Trigger the attached transition state for this element and all childNodes.
  var attachedTransitionAndTitle = function attachedTransitionAndTitle(el) {
    var element = (0, _elementGet2['default'])(el).element;

    if (el.nodeName === '#text' || el.nodeName === 'text') {
      // Trigger all the text changed values.
      if (states && states.textChanged && states.textChanged.length) {
        addPromises(states.textChanged.map(function (callback) {
          return callback(element.parentNode || element, null, el.nodeValue);
        }));
      }
    }
    // Added state for transitions API.
    else if (states && states.attached && states.attached.length) {
        addPromises(states.attached.map(callCallback, element));
      }

    // Call all `childNodes` attached callbacks as well.
    el.childNodes.forEach(attachedTransitionAndTitle);

    titleCallback(el);
  };

  var callCallback = function callCallback(callback) {
    return callback(this);
  };

  var attachedCallback = function attachedCallback(elementDescriptor) {
    var el = (0, _elementGet2['default'])(elementDescriptor).element;
    var fragment = this.fragment;
    var customElement = _elementCustom.components[elementDescriptor.nodeName] || empty;

    if (customElement.prototype.attachedCallback) {
      customElement.prototype.attachedCallback.call(el);
    }

    if (el.nodeName === '#text') {
      el.textContent = (0, _utilDecode2['default'])(el.textContent);
    }

    if (elementDescriptor.childNodes) {
      elementDescriptor.childNodes.forEach(attachedCallback, {
        fragment: false
      });
    }

    if (fragment) {
      fragment.appendChild(el);
    }
  };

  var titleCallback = function titleCallback(elementDescriptor) {
    var el = (0, _elementGet2['default'])(elementDescriptor).element;

    // Ensure the title is set correctly.
    if (el.tagName === 'title') {
      el.ownerDocument.title = el.childNodes[0].nodeValue;
    }
  };

  // Loop through all the patches and apply them.

  var _loop = function (i) {
    var patch = patches[i];
    var newDescriptor = undefined,
        oldDescriptor = undefined,
        elementDescriptor = undefined;
    var element = patch['new'];

    if (patch.element) {
      elementDescriptor = patch.element;

      var result = (0, _elementGet2['default'])(patch.element);
      patch.element = result.element;
    }

    if (patch.old) {
      oldDescriptor = patch.old;

      var result = (0, _elementGet2['default'])(patch.old);
      if (result.element.nodeName.toLowerCase() !== oldDescriptor.nodeName && typeof oldDescriptor !== 'string') {
        console.log('Something fucky is going on', oldDescriptor);
      }
      patch.old = result.element;
    }

    if (patch['new']) {
      newDescriptor = patch['new'];

      var result = (0, _elementGet2['default'])(patch['new']);
      patch['new'] = result.element;
    }

    if (element && element.nodeName === '#text') {
      patch['new'].textContent = (0, _utilDecode2['default'])(element.nodeValue);
    }

    // Replace the entire Node.
    if (patch.__do__ === 0) {
      patch.old.parentNode.replaceChild(patch['new'], patch.old);

      var oldCustomElement = _elementCustom.components[oldDescriptor.nodeName] || empty;
      var newCustomElement = _elementCustom.components[newDescriptor.nodeName] || empty;

      if (oldCustomElement.prototype.detachedCallback) {
        oldCustomElement.prototype.detachedCallback.call(patch.old);
      }

      if (newCustomElement.prototype.attachedCallback) {
        newCustomElement.prototype.attachedCallback.call(patch['new']);
      }
    }

    // Node manip.
    else if (patch.__do__ === 1) {
        // Add.
        if (patch.element && patch.fragment && !patch.old) {
          var fragment = document.createDocumentFragment();

          patch.fragment.forEach(attachedCallback, { fragment: fragment });
          patch.element.appendChild(fragment);

          forEach.call(patch.fragment, attachedTransitionAndTitle);
        }

        // Remove.
        else if (patch.old && !patch['new']) {
            if (!patch.old.parentNode) {
              throw new Error('Can\'t remove without parent, is this the ' + 'document root?');
            }

            // Ensure the title is emptied.
            if (patch.old.tagName === 'title') {
              patch.old.ownerDocument.title = '';
            }

            var customElement = _elementCustom.components[oldDescriptor.nodeName] || empty;

            if (customElement.prototype.detachedCallback) {
              customElement.prototype.detachedCallback.call(patch.old);
            }

            patch.old.parentNode.removeChild(patch.old);

            if (states && states.detached && states.detached.length) {
              addPromises(states.detached.map(callCallback, patch.old));
            }

            _nodeMake2['default'].nodes[oldDescriptor.element] = undefined;
          }

          // Replace.
          else if (patch.old && patch['new']) {
              if (!patch.old.parentNode) {
                throw new Error('Can\'t replace without parent, is this the ' + 'document root?');
              }

              // Append the element first, before doing the replacement.
              patch.old.parentNode.insertBefore(patch['new'], patch.old.nextSibling);

              // Removed state for transitions API.
              if (states && states.detached && states.detached.length) {
                addPromises(states.detached.map(callCallback, patch.old));
              }

              // Replaced state for transitions API.
              if (states && states.replaced && states.replaced.length) {
                addPromises(states.replaced.map(function (callback) {
                  return callback(patch.old, patch['new']);
                }));
              }

              // Ensure the title is set correctly.
              if (patch['new'].tagName === 'title') {
                patch.old.ownerDocument.title = patch['new'].childNodes[0].nodeValue;
              }

              patch.old.parentNode.replaceChild(patch['new'], patch.old);

              var oldCustomElement = _elementCustom.components[oldDescriptor.nodeName] || empty;
              var newCustomElement = _elementCustom.components[newDescriptor.nodeName] || empty;

              if (oldCustomElement.prototype.detachedCallback) {
                oldCustomElement.prototype.detachedCallback.call(patch.old);
              }

              if (newCustomElement.prototype.attachedCallback) {
                newCustomElement.prototype.attachedCallback.call(patch['new']);
              }

              // Added state for transitions API.
              if (states && states.attached && states.attached.length) {
                attachedTransitionAndTitle(newDescriptor);
              }

              _nodeMake2['default'].nodes[oldDescriptor.element] = undefined;
            }
      }

      // Attribute manipulation.
      else if (patch.__do__ === 2) {
          (function () {
            var oldValue = patch.element.getAttribute(patch.name);

            // Changes the attribute on the element.
            var augmentAttribute = function augmentAttribute() {
              // Remove.
              if (!patch.value) {
                patch.element.removeAttribute(patch.name);
              }
              // Change.
              else {
                  patch.element.setAttribute(patch.name, patch.value);
                }
            };

            // Trigger all the attribute changed values.
            if (states && states.attributeChanged && states.attributeChanged.length) {
              addPromises(states.attributeChanged.map(function (callback) {
                var promise = callback(patch.element, patch.name, oldValue, patch.value);

                if (promise) {
                  promise.then(augmentAttribute);
                } else {
                  augmentAttribute();
                }

                return promise;
              }));
            } else {
              augmentAttribute();
            }

            // Trigger custom element attributeChanged events.
            var customElement = _elementCustom.components[elementDescriptor.nodeName] || empty;

            if (customElement.attributeChangedCallback) {
              customElement.prototype.attributeChangedCallback.call(patch.old, patch.name, oldValue, patch.value);
            }
          })();
        }

        // Text node manipulation.
        else if (patch.__do__ === 3) {
            (function () {
              var originalValue = patch.element.textContent;

              // Changes the text.
              var augmentText = function augmentText() {
                patch.element.textContent = (0, _utilDecode2['default'])(patch.value);
              };

              // Trigger all the text changed values.
              if (states && states.textChanged && states.textChanged.length) {
                addPromises(states.textChanged.map(function (callback) {
                  var promise = callback(patch.element.parentNode || patch.element, originalValue, patch.value);

                  if (promise) {
                    promise.then(augmentText);
                  } else {
                    augmentText();
                  }

                  return promise;
                }));
              } else {
                patch.element.textContent = (0, _utilDecode2['default'])(patch.value);
              }
            })();
          }
  };

  for (var i = 0; i < patches.length; i++) {
    _loop(i);
  }

  var activePromises = promises.filter(Boolean);

  // Wait until all transition promises have resolved.
  if (activePromises.length) {
    return Promise.all(promises.filter(Boolean));
  }
}

module.exports = exports['default'];

},{"../element/custom":1,"../element/get":2,"../node/make":6,"../transitions":12,"../util/decode":13,"../util/pools":16}],11:[function(_dereq_,module,exports){
// List of SVG elements.
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var elements = ['altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor', 'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile', 'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line', 'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'script', 'set', 'stop', 'style', 'svg', 'switch', 'symbol', 'text', 'textPath', 'title', 'tref', 'tspan', 'use', 'view', 'vkern'];

exports.elements = elements;
// Namespace.
var namespace = 'http://www.w3.org/2000/svg';
exports.namespace = namespace;

},{}],12:[function(_dereq_,module,exports){
/**
 * Contains arrays to store transition callbacks.
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var transitionStates = {};

exports.transitionStates = transitionStates;
/**
 * For when elements come into the DOM. The callback triggers immediately after
 * the element enters the DOM. It is called with the element as the only
 * argument.
 */
transitionStates.attached = [];

/**
 * For when elements are removed from the DOM. The callback triggers just
 * before the element leaves the DOM. It is called with the element as the only
 * argument.
 */
transitionStates.detached = [];

/*
 * For when elements are replaced in the DOM. The callback triggers after the
 * new element enters the DOM, and before the old element leaves. It is called
 * with old and new elements as arguments, in that order.
 */
transitionStates.replaced = [];

/*
 * Triggered when an element's attribute has changed. The callback triggers
 * after the attribute has changed in the DOM. It is called with the element,
 * the attribute name, old value, and current value.
 */
transitionStates.attributeChanged = [];

/*
 * Triggered when an element's `textContent` chnages. The callback triggers
 * after the textContent has changed in the DOM. It is called with the element,
 * the old value, and current value.
 */
transitionStates.textChanged = [];

},{}],13:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var element = document.createElement('div');

/**
 * Decode's HTML entities.
 *
 * @see http://stackoverflow.com/a/13091266
 * @param stringing
 * @return unescaped decoded HTML
 */
function decodeEntities(string) {
  element.innerHTML = string;
  return element.textContent;
}

exports['default'] = decodeEntities;
module.exports = exports['default'];

},{}],14:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.protectElement = protectElement;
exports.unprotectElement = unprotectElement;
exports.cleanMemory = cleanMemory;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilPools = _dereq_('../util/pools');

var _nodeMake = _dereq_('../node/make');

var _nodeMake2 = _interopRequireDefault(_nodeMake);

var pools = _utilPools.pools;
var makeNode = _nodeMake2['default'];

/**
 * Ensures that an element is not recycled during a render cycle.
 *
 * @param element
 * @return element
 */

function protectElement(element) {
  pools.elementObject.protect(element);

  element.childNodes.forEach(protectElement);
  element.attributes.forEach(pools.attributeObject.protect, pools.attributeObject);

  return element;
}

/**
 * Allows an element to be recycled during a render cycle.
 *
 * @param element
 * @return
 */

function unprotectElement(element) {
  element.childNodes.forEach(unprotectElement);
  element.attributes.forEach(pools.attributeObject.unprotect, pools.attributeObject);

  pools.elementObject.unprotect(element);

  return element;
}

/**
 * Recycles all unprotected allocations.
 */

function cleanMemory() {
  // Free all memory after each iteration.
  pools.attributeObject.freeAll();
  pools.elementObject.freeAll();

  // Empty out the `make.nodes` if on main thread.
  if (typeof makeNode !== 'undefined') {
    for (var uuid in makeNode.nodes) {
      // If this is not a protected uuid, remove it.
      if (!pools.elementObject._uuid[uuid]) {
        delete makeNode.nodes[uuid];
      }
    }
  }
}

},{"../node/make":6,"../util/pools":16}],15:[function(_dereq_,module,exports){
// Code based off of:
// https://github.com/ashi009/node-fast-html-parser

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.parseHTML = parseHTML;
exports.makeParser = makeParser;

var _pools2 = _dereq_('./pools');

var pools = _pools2.pools;
var parser = makeParser();

/**
 * parseHTML
 *
 * @param newHTML
 * @return
 */

function parseHTML(newHTML, isInner) {
  var documentElement = parser.parse(newHTML);
  var nodes = documentElement.childNodes;

  return isInner ? nodes : nodes[0];
}

/**
 * makeParser
 *
 * @return
 */

function makeParser() {
  var kMarkupPattern = /<!--[^]*?(?=-->)-->|<(\/?)([a-z\-][a-z0-9\-]*)\s*([^>]*?)(\/?)>/ig;

  var kAttributePattern = /\b(id|class)\s*(=\s*("([^"]+)"|'([^']+)'|(\S+)))?/ig;

  var reAttrPattern = /\b([a-z][a-z0-9\-]*)\s*(=\s*("([^"]+)"|'([^']+)'|(\S+)))?/ig;

  var kBlockElements = {
    div: true,
    p: true,
    li: true,
    td: true,
    section: true,
    br: true
  };

  var kSelfClosingElements = {
    meta: true,
    img: true,
    link: true,
    input: true,
    area: true,
    br: true,
    hr: true
  };

  var kElementsClosedByOpening = {
    li: {
      li: true
    },

    p: {
      p: true, div: true
    },

    td: {
      td: true, th: true
    },

    th: {
      td: true, th: true
    }
  };

  var kElementsClosedByClosing = {
    li: {
      ul: true, ol: true
    },

    a: {
      div: true
    },

    b: {
      div: true
    },

    i: {
      div: true
    },

    p: {
      div: true
    },

    td: {
      tr: true, table: true
    },

    th: {
      tr: true, table: true
    }
  };

  var kBlockTextElements = {
    script: true,
    noscript: true,
    style: true,
    pre: true
  };

  /**
   * TextNode to contain a text element in DOM tree.
   * @param {string} value [description]
   */
  function TextNode(value) {
    var instance = pools.elementObject.get();

    instance.nodeName = '#text';
    instance.nodeValue = value;
    instance.nodeType = 3;
    instance.childNodes.length = 0;
    instance.attributes.length = 0;

    return instance;
  }

  /**
   * HTMLElement, which contains a set of children.
   *
   * Note: this is a minimalist implementation, no complete tree structure
   * provided (no parentNode, nextSibling, previousSibling etc).
   *
   * @param {string} name     nodeName
   * @param {Object} keyAttrs id and class attribute
   * @param {Object} rawAttrs attributes in string
   */
  function HTMLElement(name, keyAttrs, rawAttrs) {
    var instance = pools.elementObject.get();

    instance.nodeName = name;
    instance.nodeValue = '';
    instance.nodeType = 1;
    instance.childNodes.length = 0;
    instance.attributes.length = 0;

    if (rawAttrs) {
      for (var match = undefined; match = reAttrPattern.exec(rawAttrs);) {
        var attr = pools.attributeObject.get();

        attr.name = match[1];
        attr.value = match[5] || match[4] || match[1];

        // Look for empty attributes.
        if (match[6] === '""') {
          attr.value = '';
        }

        instance.attributes[instance.attributes.length] = attr;
      }
    }

    return instance;
  }

  /**
   * Parses HTML and returns a root element
   */
  var htmlParser = {
    /**
     * Parse a chuck of HTML source.
     * @param  {string} data      html
     * @return {HTMLElement}      root element
     */
    parse: function parse(data, options) {
      var rootObject = {};
      var root = HTMLElement(null, rootObject);
      var currentParent = root;
      var stack = [root];
      var lastTextPos = -1;

      options = options || {};

      if (data.indexOf('<') === -1 && data) {
        currentParent.childNodes[currentParent.childNodes.length] = TextNode(data);

        return root;
      }

      for (var match = undefined, text = undefined; match = kMarkupPattern.exec(data);) {
        if (lastTextPos > -1) {
          if (lastTextPos + match[0].length < kMarkupPattern.lastIndex) {
            // if has content
            text = data.slice(lastTextPos, kMarkupPattern.lastIndex - match[0].length);

            if (text.trim()) {
              currentParent.childNodes[currentParent.childNodes.length] = TextNode(text);
            }
          }
        }

        lastTextPos = kMarkupPattern.lastIndex;

        // This is a comment.
        if (match[0][1] === '!') {
          continue;
        }

        if (options.lowerCaseTagName) {
          match[2] = match[2].toLowerCase();
        }

        if (!match[1]) {
          // not </ tags
          var attrs = {};

          for (var attMatch = undefined; attMatch = kAttributePattern.exec(match[3]);) {
            attrs[attMatch[1]] = attMatch[3] || attMatch[4] || attMatch[5];
          }

          if (!match[4] && kElementsClosedByOpening[currentParent.nodeName]) {
            if (kElementsClosedByOpening[currentParent.nodeName][match[2]]) {
              stack.pop();
              currentParent = stack[stack.length - 1];
            }
          }

          currentParent = currentParent.childNodes[currentParent.childNodes.push(HTMLElement(match[2], attrs, match[3])) - 1];

          stack.push(currentParent);

          if (kBlockTextElements[match[2]]) {
            // a little test to find next </script> or </style> ...
            var closeMarkup = '</' + match[2] + '>';
            var index = data.indexOf(closeMarkup, kMarkupPattern.lastIndex);

            if (options[match[2]]) {
              if (index == -1) {
                // there is no matching ending for the text element.
                text = data.slice(kMarkupPattern.lastIndex);
              } else {
                text = data.slice(kMarkupPattern.lastIndex, index);
              }

              if (text.length > 0) {
                currentParent.childNodes[currentParent.childNodes.length] = TextNode(text);
              }
            }
            if (index == -1) {
              lastTextPos = kMarkupPattern.lastIndex = data.length + 1;
            } else {
              currentParent.nodeValue = data.slice(kMarkupPattern.lastIndex, index);
              lastTextPos = kMarkupPattern.lastIndex = index + closeMarkup.length;
              match[1] = true;
            }
          }
        }
        if (match[1] || match[4] || kSelfClosingElements[match[2]]) {
          // </ or /> or <br> etc.
          while (currentParent) {
            if (currentParent.nodeName == match[2]) {
              stack.pop();
              currentParent = stack[stack.length - 1];

              break;
            } else {
              // Trying to close current tag, and move on
              if (kElementsClosedByClosing[currentParent.nodeName]) {
                if (kElementsClosedByClosing[currentParent.nodeName][match[2]]) {
                  stack.pop();
                  currentParent = stack[stack.length - 1];

                  continue;
                }
              }

              // Use aggressive strategy to handle unmatching markups.
              break;
            }
          }
        }
      }

      return root;
    }
  };

  return htmlParser;
}

;

},{"./pools":16}],16:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.createPool = createPool;
exports.initializePools = initializePools;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _uuid2 = _dereq_('./uuid');

var _uuid3 = _interopRequireDefault(_uuid2);

var uuid = _uuid3['default'];
var pools = {};
exports.pools = pools;
var count = 10000;

exports.count = count;
/**
 * Creates a pool to query new or reused values from.
 *
 * @param name
 * @param opts
 * @return {Object} pool
 */

function createPool(name, opts) {
  var size = opts.size;
  var fill = opts.fill;

  var _free = [];
  var allocated = [];
  var _protect = [];

  // Prime the cache with n objects.
  for (var i = 0; i < size; i++) {
    _free[i] = fill();
  }

  return {
    _free: _free,
    _allocated: allocated,
    _protected: _protect,
    _uuid: {},

    get: function get() {
      var obj = null;
      var freeLength = _free.length;
      var minusOne = freeLength - 1;

      if (freeLength) {
        obj = _free[minusOne];
        _free.length = minusOne;
      } else {
        obj = fill();
      }

      allocated.push(obj);

      return obj;
    },

    protect: function protect(value) {
      var idx = allocated.indexOf(value);

      // Move the value out of allocated, since we need to protect this from
      // being free'd accidentally.
      _protect.push(idx === -1 ? value : allocated.splice(idx, 1)[0]);

      // If we're protecting an element object, push the uuid into a lookup
      // table.
      if (name === 'elementObject') {
        this._uuid[value.element] = value;
      }
    },

    unprotect: function unprotect(value) {
      var idx = _protect.indexOf(value);

      if (idx !== -1) {
        var obj = _protect.splice(idx, 1)[0];
        if (obj) {
          allocated.push(obj);
        }

        if (name === 'elementObject') {
          delete this._uuid[value.element];
        }
      }
    },

    freeAll: function freeAll() {
      var allocatedLength = allocated.length;
      var freeLength = _free.length;

      _free.push.apply(_free, allocated.slice(0, size - freeLength));
      allocated.length = 0;
    },

    free: function free(value) {
      var idx = allocated.indexOf(value);

      // Already freed.
      if (idx === -1) {
        return;
      }

      // Only put back into the free queue if we're under the size.
      if (_free.length < size) {
        _free.push(value);
      }

      allocated.splice(idx, 1);
    }
  };
}

function initializePools(COUNT) {
  pools.attributeObject = createPool('attributeObject', {
    size: COUNT,

    fill: function fill() {
      return { name: '', value: '' };
    }
  });

  pools.elementObject = createPool('elementObject', {
    size: COUNT,

    fill: function fill() {
      return {
        element: uuid(),
        childNodes: [],
        attributes: []
      };
    }
  });
}

// Create 10k items of each type.
initializePools(count);

},{"./uuid":17}],17:[function(_dereq_,module,exports){
/**
 * Generates a uuid.
 *
 * @see http://stackoverflow.com/a/2117523/282175
 * @return {string} uuid
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = uuid;

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}

module.exports = exports['default'];

},{}],18:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.create = create;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilUuid = _dereq_('../util/uuid');

var _utilUuid2 = _interopRequireDefault(_utilUuid);

var _utilPools = _dereq_('../util/pools');

var _utilParser = _dereq_('../util/parser');

var _utilMemory = _dereq_('../util/memory');

var _nodeSync = _dereq_('../node/sync');

var _nodeSync2 = _interopRequireDefault(_nodeSync);

var _source = _dereq_('./source');

var _source2 = _interopRequireDefault(_source);

// Tests if the browser has support for the `Worker` API.
var hasWorker = typeof Worker === 'function';

exports.hasWorker = hasWorker;
/**
 * Creates a new Web Worker per element that will be diffed. Allows multiple
 * concurrent diffing operations to occur simultaneously, leveraging the
 * multi-core nature of desktop and mobile devices.
 *
 * Attach any functions that could be used by the Worker inside the Blob below.
 * All functions are named so they can be accessed globally. Since we're
 * directly injecting the methods into an Array and then calling `join` the
 * `toString` method will be invoked on each function and will inject a valid
 * representation of the function's source. This comes at a cost since Babel
 * rewrites variable names when you `import` a module. This is why you'll see
 * underscored properties being imported and then reassigned to non-underscored
 * names in modules that are reused here.
 *
 * @return {Object} A Worker instance.
 */

function create() {
  var workerBlob = null;
  var worker = null;

  // Set up a WebWorker if available.
  if (hasWorker) {
    // Construct the worker reusing code already organized into modules.  Keep
    // this code ES5 since we do not get time to pre-process it as ES6.
    workerBlob = new Blob([[
    // Reusable Array methods.
    'var slice = Array.prototype.slice;',

    // Add a namespace to attach pool methods to.
    'var pools = {};', 'var nodes = 0;',

    // Adds in a global `uuid` function.
    _utilUuid2['default'],

    // Add the ability to protect elements from free'd memory.
    _utilMemory.protectElement, _utilMemory.unprotectElement, _utilMemory.cleanMemory,

    // Add in pool manipulation methods.
    _utilPools.createPool, _utilPools.initializePools, 'initializePools(' + _utilPools.count + ');',

    // Add in Node manipulation.
    'var syncNode = ' + _nodeSync2['default'],

    // Add in the ability to parseHTML.
    _utilParser.parseHTML, 'var makeParser = ' + _utilParser.makeParser, 'var parser = makeParser();',

    // Add in the worker source.
    _source2['default'],

    // Metaprogramming up this worker call.
    'startup(self);'].join('\n')], { type: 'application/javascript' });

    // Construct the worker and start it up.
    try {
      worker = new Worker(URL.createObjectURL(workerBlob));
    } catch (ex) {
      if (console && console.info) {
        console.info('Failed to create diffhtml worker', ex);
      }

      // If we cannot create a Worker, then disable trying again, all work
      // will happen on the main UI thread.
      exports.hasWorker = hasWorker = false;
    }
  }

  return worker;
}

},{"../node/sync":8,"../util/memory":14,"../util/parser":15,"../util/pools":16,"../util/uuid":17,"./source":19}],19:[function(_dereq_,module,exports){
'use strict';

// These are globally defined to avoid issues with JSHint thinking that we're
// referencing unknown identifiers.
Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = startup;
var parseHTML;
var syncNode;
var pools;

/**
 * This is the Web Worker source code. All globals here are defined in the
 * worker/create module. This allows code sharing and less duplication since
 * most of the logic is identical to the UI thread.
 *
 * @param worker - A worker instance
 */

function startup(worker) {
  var patches = [];
  var oldTree = null;

  // Create arrays to hold element additions and removals.
  patches.additions = [];
  patches.removals = [];

  /**
   * Triggered whenever a `postMessage` call is made on the Worker instance
   * from the UI thread. Signals that some work needs to occur. Will post back
   * to the main thread with patch and node transform results.
   *
   * @param e - The normalized event object.
   */
  worker.onmessage = function (e) {
    var data = e.data;
    var isInner = data.isInner;
    var newTree = null;

    // Always unprotect allocations before the start of a render cycle.
    if (oldTree) {
      unprotectElement(oldTree);
    }

    // If an `oldTree` was provided by the UI thread, use that in place of the
    // current `oldTree`.
    if (data.oldTree) {
      oldTree = data.oldTree;
    }

    // If the `newTree` was provided to the worker, use that instead of trying
    // to create one from HTML source.
    if (data.newTree) {
      newTree = data.newTree;
    }

    // If no `newTree` was provided, we'll have to try and create one from the
    // HTML source provided.
    else if (typeof data.newHTML === 'string') {
        // Calculate a new tree.
        newTree = parseHTML(data.newHTML, isInner);

        // If the operation is for `innerHTML` then we'll retain the previous
        // tree's attributes, nodeName, and nodeValue, and only adjust the
        // childNodes.
        if (isInner) {
          var childNodes = newTree;

          newTree = {
            childNodes: childNodes,
            attributes: oldTree.attributes,
            element: oldTree.element,
            nodeName: oldTree.nodeName,
            nodeValue: oldTree.nodeValue
          };
        }
      }

    // Synchronize the old virtual tree with the new virtual tree.  This will
    // produce a series of patches that will be executed to update the DOM.
    syncNode.call(patches, oldTree, newTree);

    // Protect the current `oldTree` so that no Nodes will be accidentally
    // recycled in the
    protectElement(oldTree);

    // Send the patches back to the userland.
    worker.postMessage({
      // Node operational changes, additions and removals.
      nodes: {
        additions: patches.additions,
        removals: patches.removals
      },

      // All the patches to apply to the DOM.
      patches: patches
    });

    // Recycle allocated objects back into the pool.
    cleanMemory();

    // Wipe out the patches in memory.
    patches.length = 0;
    patches.additions.length = 0;
    patches.removals.length = 0;
  };
}

module.exports = exports['default'];

},{}],20:[function(_dereq_,module,exports){
(function (global){

var NativeCustomEvent = global.CustomEvent;

function useNative () {
  try {
    var p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
    return  'cat' === p.type && 'bar' === p.detail.foo;
  } catch (e) {
  }
  return false;
}

/**
 * Cross-browser `CustomEvent` constructor.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent.CustomEvent
 *
 * @public
 */

module.exports = useNative() ? NativeCustomEvent :

// IE >= 9
'function' === typeof document.createEvent ? function CustomEvent (type, params) {
  var e = document.createEvent('CustomEvent');
  if (params) {
    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
  } else {
    e.initCustomEvent(type, false, false, void 0);
  }
  return e;
} :

// IE <= 8
function CustomEvent (type, params) {
  var e = document.createEventObject();
  e.type = type;
  if (params) {
    e.bubbles = Boolean(params.bubbles);
    e.cancelable = Boolean(params.cancelable);
    e.detail = params.detail;
  } else {
    e.bubbles = false;
    e.cancelable = false;
    e.detail = void 0;
  }
  return e;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[5])(5)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvdGJyYW55ZW4vZ2l0L2RpZmZodG1sL2xpYi9lbGVtZW50L2N1c3RvbS5qcyIsIi9ob21lL3RicmFueWVuL2dpdC9kaWZmaHRtbC9saWIvZWxlbWVudC9nZXQuanMiLCIvaG9tZS90YnJhbnllbi9naXQvZGlmZmh0bWwvbGliL2VsZW1lbnQvbWFrZS5qcyIsIi9ob21lL3RicmFueWVuL2dpdC9kaWZmaHRtbC9saWIvZXJyb3JzLmpzIiwiL2hvbWUvdGJyYW55ZW4vZ2l0L2RpZmZodG1sL2xpYi9pbmRleC5qcyIsIi9ob21lL3RicmFueWVuL2dpdC9kaWZmaHRtbC9saWIvbm9kZS9tYWtlLmpzIiwiL2hvbWUvdGJyYW55ZW4vZ2l0L2RpZmZodG1sL2xpYi9ub2RlL3BhdGNoLmpzIiwiL2hvbWUvdGJyYW55ZW4vZ2l0L2RpZmZodG1sL2xpYi9ub2RlL3N5bmMuanMiLCIvaG9tZS90YnJhbnllbi9naXQvZGlmZmh0bWwvbGliL25vZGUvdHJlZS5qcyIsIi9ob21lL3RicmFueWVuL2dpdC9kaWZmaHRtbC9saWIvcGF0Y2hlcy9wcm9jZXNzLmpzIiwiL2hvbWUvdGJyYW55ZW4vZ2l0L2RpZmZodG1sL2xpYi9zdmcuanMiLCIvaG9tZS90YnJhbnllbi9naXQvZGlmZmh0bWwvbGliL3RyYW5zaXRpb25zLmpzIiwiL2hvbWUvdGJyYW55ZW4vZ2l0L2RpZmZodG1sL2xpYi91dGlsL2RlY29kZS5qcyIsIi9ob21lL3RicmFueWVuL2dpdC9kaWZmaHRtbC9saWIvdXRpbC9tZW1vcnkuanMiLCIvaG9tZS90YnJhbnllbi9naXQvZGlmZmh0bWwvbGliL3V0aWwvcGFyc2VyLmpzIiwiL2hvbWUvdGJyYW55ZW4vZ2l0L2RpZmZodG1sL2xpYi91dGlsL3Bvb2xzLmpzIiwiL2hvbWUvdGJyYW55ZW4vZ2l0L2RpZmZodG1sL2xpYi91dGlsL3V1aWQuanMiLCIvaG9tZS90YnJhbnllbi9naXQvZGlmZmh0bWwvbGliL3dvcmtlci9jcmVhdGUuanMiLCIvaG9tZS90YnJhbnllbi9naXQvZGlmZmh0bWwvbGliL3dvcmtlci9zb3VyY2UuanMiLCJub2RlX21vZHVsZXMvY3VzdG9tLWV2ZW50L2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7O0FDR08sSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDOzs7QUFFM0IsSUFBSSxLQUFLLEdBQUcsU0FBUixLQUFLLEdBQWMsRUFBRSxDQUFDOzs7Ozs7Ozs7O0FBU25CLFNBQVMsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUU7QUFDeEMsTUFBSSxhQUFhLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssQ0FBQzs7O0FBR2pELE1BQUksT0FBTyxZQUFZLGFBQWEsRUFBRTtBQUNwQyxXQUFPLEtBQUssQ0FBQztHQUNkOzs7QUFHRCxNQUFJLGFBQWEsS0FBSyxLQUFLLEVBQUU7QUFDM0IsV0FBTyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztHQUM1RDs7O0FBR0QsTUFBSSxhQUFhLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRTtBQUMzQyxpQkFBYSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQ3ZEOztBQUVELFNBQU8sSUFBSSxDQUFDO0NBQ2I7O0FBQUEsQ0FBQzs7Ozs7Ozs7cUJDeEJzQixHQUFHOzs7O3dCQVROLGNBQWM7Ozs7MkJBQ1gsaUJBQWlCOzs7Ozs7Ozs7OztBQVExQixTQUFTLEdBQUcsQ0FBQyxHQUFHLEVBQUU7QUFDL0IsTUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUM7QUFDOUIsTUFBSSxPQUFPLEdBQUcsc0JBQVMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFZLEdB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIFN0b3JlIGFsbCBjdXN0b20gZWxlbWVudHMgaW4gdGhpcyBvYmplY3QuXG4gKi9cbmV4cG9ydCB2YXIgY29tcG9uZW50cyA9IHt9O1xuXG52YXIgZW1wdHkgPSBmdW5jdGlvbigpIHt9O1xuXG4vKipcbiAqIEVuc3VyZXMgdGhlIGVsZW1lbnQgaW5zdGFuY2UgbWF0Y2hlcyB0aGUgQ3VzdG9tRWxlbWVudCdzIHByb3RvdHlwZS5cbiAqXG4gKiBAcGFyYW0gdGFnTmFtZVxuICogQHBhcmFtIGVsZW1lbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59IHN1Y2Nlc3NmdWxseSB1cGdyYWRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBncmFkZSh0YWdOYW1lLCBlbGVtZW50KSB7XG4gIHZhciBDdXN0b21FbGVtZW50ID0gY29tcG9uZW50c1t0YWdOYW1lXSB8fCBlbXB0eTtcblxuICAvLyBObyBuZWVkIHRvIHVwZ3JhZGUgaWYgYWxyZWFkeSBhIHN1YmNsYXNzLlxuICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEN1c3RvbUVsZW1lbnQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBDb3B5IHRoZSBwcm90b3R5cGUgaW50byB0aGUgRWxlbWVudC5cbiAgaWYgKEN1c3RvbUVsZW1lbnQgIT09IGVtcHR5KSB7XG4gICAgZWxlbWVudC5fX3Byb3RvX18gPSBPYmplY3QuY3JlYXRlKEN1c3RvbUVsZW1lbnQucHJvdG90eXBlKTtcbiAgfVxuXG4gIC8vIEN1c3RvbSBlbGVtZW50cyBoYXZlIGEgY3JlYXRlZENhbGxiYWNrIG1ldGhvZCB0aGF0IHNob3VsZCBiZSBjYWxsZWQuXG4gIGlmIChDdXN0b21FbGVtZW50LnByb3RvdHlwZS5jcmVhdGVkQ2FsbGJhY2spIHtcbiAgICBDdXN0b21FbGVtZW50LnByb3RvdHlwZS5jcmVhdGVkQ2FsbGJhY2suY2FsbChlbGVtZW50KTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcbiIsImltcG9ydCBtYWtlTm9kZSBmcm9tICcuLi9ub2RlL21ha2UnO1xuaW1wb3J0IG1ha2VFbGVtZW50IGZyb20gJy4uL2VsZW1lbnQvbWFrZSc7XG5cbi8qKlxuICogVGFrZXMgaW4gYW4gZWxlbWVudCByZWZlcmVuY2UgYW5kIHJlc29sdmUgaXQgdG8gYSB1dWlkIGFuZCBET00gbm9kZS5cbiAqXG4gKiBAcGFyYW0gcmVmIC0gRWxlbWVudCBkZXNjcmlwdG9yXG4gKiBAcmV0dXJuIHtPYmplY3R9IGNvbnRhaW5pbmcgdGhlIHV1aWQgYW5kIERPTSBub2RlLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXQocmVmKSB7XG4gIGxldCB1dWlkID0gcmVmLmVsZW1lbnQgfHwgcmVmO1xuICBsZXQgZWxlbWVudCA9IG1ha2VOb2RlLm5vZGVzW3V1aWRdIHx8IG1ha2VFbGVtZW50KHJlZik7XG5cbiAgcmV0dXJuIHsgZWxlbWVudCwgdXVpZCB9O1xufVxuIiwiaW1wb3J0ICogYXMgc3ZnIGZyb20gJy4uL3N2Zyc7XG5pbXBvcnQgbWFrZU5vZGUgZnJvbSAnLi4vbm9kZS9tYWtlJztcbmltcG9ydCB7IGNvbXBvbmVudHMsIHVwZ3JhZGUgfSBmcm9tICcuL2N1c3RvbSc7XG5cbnZhciBlbXB0eSA9IHsgcHJvdG90eXBlOiB7fSB9O1xuXG4vKipcbiAqIFRha2VzIGluIGEgdmlydHVhbCBkZXNjcmlwdG9yIGFuZCBjcmVhdGVzIGFuIEhUTUwgZWxlbWVudC4gU2V0J3MgdGhlIGVsZW1lbnRcbiAqIGludG8gdGhlIGNhY2hlLlxuICpcbiAqIEBwYXJhbSBkZXNjcmlwdG9yXG4gKiBAcmV0dXJuIHtFbGVtZW50fVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtYWtlKGRlc2NyaXB0b3IpIHtcbiAgdmFyIGVsZW1lbnQgPSBudWxsO1xuICB2YXIgaXNTdmcgPSBmYWxzZTtcbiAgLy8gR2V0IHRoZSBjdXN0b20gZWxlbWVudCBjb25zdHJ1Y3RvciBmb3IgYSBnaXZlbiBlbGVtZW50LlxuICB2YXIgQ3VzdG9tRWxlbWVudCA9IGNvbXBvbmVudHNbZGVzY3JpcHRvci5ub2RlTmFtZV0gfHwgZW1wdHk7XG5cbiAgaWYgKGRlc2NyaXB0b3Iubm9kZU5hbWUgPT09ICcjdGV4dCcpIHtcbiAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGVzY3JpcHRvci5ub2RlVmFsdWUpO1xuICB9XG4gIGVsc2Uge1xuICAgIGlmIChzdmcuZWxlbWVudHMuaW5kZXhPZihkZXNjcmlwdG9yLm5vZGVOYW1lKSA+IC0xKSB7XG4gICAgICBpc1N2ZyA9IHRydWU7XG4gICAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHN2Zy5uYW1lc3BhY2UsIGRlc2NyaXB0b3Iubm9kZU5hbWUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGRlc2NyaXB0b3Iubm9kZU5hbWUpO1xuICAgIH1cblxuICAgIGlmIChkZXNjcmlwdG9yLmF0dHJpYnV0ZXMgJiYgZGVzY3JpcHRvci5hdHRyaWJ1dGVzLmxlbmd0aCkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZXNjcmlwdG9yLmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IGF0dHJpYnV0ZSA9IGRlc2NyaXB0b3IuYXR0cmlidXRlc1tpXTtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlLm5hbWUsIGF0dHJpYnV0ZS52YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGRlc2NyaXB0b3IuY2hpbGROb2RlcyAmJiBkZXNjcmlwdG9yLmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRlc2NyaXB0b3IuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKG1ha2UoZGVzY3JpcHRvci5jaGlsZE5vZGVzW2ldKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQWx3YXlzIHNldCB0aGUgbm9kZSdzIHZhbHVlLlxuICBpZiAoZGVzY3JpcHRvci5ub2RlVmFsdWUpIHtcbiAgICBlbGVtZW50LnRleHRDb250ZW50ID0gZGVzY3JpcHRvci5ub2RlVmFsdWU7XG4gIH1cblxuICAvLyBVcGdyYWRlIHRoZSBlbGVtZW50IGFmdGVyIGNyZWF0aW5nIGl0LlxuICB1cGdyYWRlKGRlc2NyaXB0b3Iubm9kZU5hbWUsIGVsZW1lbnQpO1xuXG4gIC8vIEN1c3RvbSBlbGVtZW50cyBoYXZlIGEgY3JlYXRlZENhbGxiYWNrIG1ldGhvZCB0aGF0IHNob3VsZCBiZSBjYWxsZWQuXG4gIGlmIChDdXN0b21FbGVtZW50LnByb3RvdHlwZS5jcmVhdGVkQ2FsbGJhY2spIHtcbiAgICBDdXN0b21FbGVtZW50LnByb3RvdHlwZS5jcmVhdGVkQ2FsbGJhY2suY2FsbChlbGVtZW50KTtcbiAgfVxuXG4gIC8vIEFkZCB0byB0aGUgbm9kZXMgY2FjaGUgdXNpbmcgdGhlIGRlc2lnbmF0ZWQgdXVpZCBhcyB0aGUgbG9va3VwIGtleS5cbiAgbWFrZU5vZGUubm9kZXNbZGVzY3JpcHRvci5lbGVtZW50XSA9IGVsZW1lbnQ7XG5cbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG4iLCJ2YXIgbWlzc2luZ1N0YWNrVHJhY2UgPSAnQnJvd3NlciBkb2VzblxcJ3Qgc3VwcG9ydCBlcnJvciBzdGFjayB0cmFjZXMuJztcblxuLyoqXG4gKiBJZGVudGlmaWVzIGFuIGVycm9yIHdpdGggdHJhbnNpdGlvbnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUcmFuc2l0aW9uU3RhdGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSkge1xuICAgIGxldCBlcnJvciA9IHN1cGVyKCk7XG5cbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIHRoaXMuc3RhY2sgPSBlcnJvci5zdGFjayB8fCBtaXNzaW5nU3RhY2tUcmFjZTtcbiAgfVxufVxuXG4vKipcbiAqIElkZW50aWZpZXMgYW4gZXJyb3Igd2l0aCByZWdpc3RlcmluZyBhbiBlbGVtZW50LlxuICovXG5leHBvcnQgY2xhc3MgRE9NRXhjZXB0aW9uIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlKSB7XG4gICAgbGV0IGVycm9yID0gc3VwZXIoKTtcblxuICAgIHRoaXMubWVzc2FnZSA9ICdVbmNhdWdodCBET01FeGNlcHRpb246ICcgKyBtZXNzYWdlO1xuICAgIHRoaXMuc3RhY2sgPSBlcnJvci5zdGFjayB8fCBtaXNzaW5nU3RhY2tUcmFjZTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgcGF0Y2hOb2RlLCByZWxlYXNlTm9kZSwgcmVnaXN0ZXJOb2RlIH0gZnJvbSAnLi9ub2RlL3BhdGNoJztcbmltcG9ydCB7IHRyYW5zaXRpb25TdGF0ZXMgfSBmcm9tICcuL3RyYW5zaXRpb25zJztcbmltcG9ydCB7IGNvbXBvbmVudHMgfSBmcm9tICcuL2VsZW1lbnQvY3VzdG9tJztcblxuLy8gV2UgZXhwb3J0IHRoZSBUcmFuc2l0aW9uU3RhdGVFcnJvciBjb25zdHJ1Y3RvciBzbyB0aGF0IGluc3RhbmNlb2YgY2hlY2tzIGNhblxuLy8gYmUgbWFkZSBieSB0aG9zZSBwdWJsaWNseSBjb25zdW1pbmcgdGhpcyBsaWJyYXJ5LlxuaW1wb3J0IHsgVHJhbnNpdGlvblN0YXRlRXJyb3IgfSBmcm9tICcuL2Vycm9ycyc7XG5leHBvcnQgeyBUcmFuc2l0aW9uU3RhdGVFcnJvciB9IGZyb20gJy4vZXJyb3JzJztcblxudmFyIHJlYWxSZWdpc3RlckVsZW1lbnQgPSBkb2N1bWVudC5yZWdpc3RlckVsZW1lbnQ7XG52YXIgZW1wdHkgPSB7fTtcblxuLyoqXG4gKiBVc2VkIHRvIGRpZmYgdGhlIG91dGVySFRNTCBjb250ZW50cyBvZiB0aGUgcGFzc2VkIGVsZW1lbnQgd2l0aCB0aGUgbWFya3VwXG4gKiBjb250ZW50cy4gIFZlcnkgdXNlZnVsIGZvciBhcHBseWluZyBhIGdsb2JhbCBkaWZmIG9uIHRoZVxuICogYGRvY3VtZW50LmRvY3VtZW50RWxlbWVudGAuXG4gKlxuICogQHBhcmFtIGVsZW1lbnRcbiAqIEBwYXJhbSBtYXJrdXA9JydcbiAqIEBwYXJhbSBvcHRpb25zPXt9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvdXRlckhUTUwoZWxlbWVudCwgbWFya3VwPScnLCBvcHRpb25zPXt9KSB7XG4gIG9wdGlvbnMuaW5uZXIgPSBmYWxzZTtcbiAgcGF0Y2hOb2RlKGVsZW1lbnQsIG1hcmt1cCwgb3B0aW9ucyk7XG59XG5cbi8qKlxuICogVXNlZCB0byBkaWZmIHRoZSBpbm5lckhUTUwgY29udGVudHMgb2YgdGhlIHBhc3NlZCBlbGVtZW50IHdpdGggdGhlIG1hcmt1cFxuICogY29udGVudHMuICBUaGlzIGlzIHVzZWZ1bCB3aXRoIGxpYnJhcmllcyBsaWtlIEJhY2tib25lIHRoYXQgcmVuZGVyIFZpZXdzXG4gKiBpbnRvIGVsZW1lbnQgY29udGFpbmVyLlxuICpcbiAqIEBwYXJhbSBlbGVtZW50XG4gKiBAcGFyYW0gbWFya3VwPScnXG4gKiBAcGFyYW0gb3B0aW9ucz17fVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5uZXJIVE1MKGVsZW1lbnQsIG1hcmt1cD0nJywgb3B0aW9ucz17fSkge1xuICBvcHRpb25zLmlubmVyID0gdHJ1ZTtcbiAgcGF0Y2hOb2RlKGVsZW1lbnQsIG1hcmt1cCwgb3B0aW9ucyk7XG59XG5cbi8qKlxuICogVXNlZCB0byBkaWZmIHR3byBlbGVtZW50cy4gIFRoZSBgaW5uZXJgIEJvb2xlYW4gcHJvcGVydHkgY2FuIGJlIHNwZWNpZmllZCBpblxuICogdGhlIG9wdGlvbnMgdG8gc2V0IGlubmVySFRNTFxcb3V0ZXJIVE1MIGJlaGF2aW9yLiAgQnkgZGVmYXVsdCBpdCBpc1xuICogb3V0ZXJIVE1MLlxuICpcbiAqIEBwYXJhbSBlbGVtZW50XG4gKiBAcGFyYW0gbmV3RWxlbWVudFxuICogQHBhcmFtIG9wdGlvbnM9e31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVsZW1lbnQoZWxlbWVudCwgbmV3RWxlbWVudCwgb3B0aW9ucz17fSkge1xuICBwYXRjaE5vZGUoZWxlbWVudCwgbmV3RWxlbWVudCwgb3B0aW9ucyk7XG59XG5cbi8qKlxuICogUmVsZWFzZXMgdGhlIHdvcmtlciBhbmQgbWVtb3J5IGFsbG9jYXRlZCB0byB0aGlzIGVsZW1lbnQuIFVzZWZ1bCBmb3JcbiAqIGNvbXBvbmVudHMgdG8gY2xlYW4gdXAgd2hlbiByZW1vdmVkLlxuICpcbiAqIEBwYXJhbSBlbGVtZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWxlYXNlKGVsZW1lbnQpIHtcbiAgcmVsZWFzZU5vZGUoZWxlbWVudCk7XG59XG5cbi8qKlxuICogUmVnaXN0ZXIncyBhIGNvbnN0cnVjdG9yIHdpdGggYW4gZWxlbWVudCB0byBwcm92aWRlIGxpZmVjeWNsZSBldmVudHMuXG4gKlxuICogQHBhcmFtIHRhZ05hbWVcbiAqIEBwYXJhbSBjb25zdHJ1Y3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJFbGVtZW50KHRhZ05hbWUsIGNvbnN0cnVjdG9yKSB7XG4gIC8vIFVwZ3JhZGUgc2ltcGxlIG9iamVjdHMgdG8gaW5oZXJpdCBmcm9tIEhUTUxFbGVtZW50IGFuZCBiZSB1c2FibGUgaW4gYSByZWFsXG4gIC8vIGltcGxlbWVudGF0aW9uLlxuICB2YXIgbm9ybWFsaXplZENvbnN0cnVjdG9yID0gY29uc3RydWN0b3IucHJvdG90eXBlID8gY29uc3RydWN0b3IgOiBudWxsO1xuXG4gIGlmICghbm9ybWFsaXplZENvbnN0cnVjdG9yKSB7XG4gICAgY29uc3RydWN0b3IuX19wcm90b19fID0gSFRNTEVsZW1lbnQucHJvdG90eXBlO1xuICAgIG5vcm1hbGl6ZWRDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uKCkge307XG4gICAgbm9ybWFsaXplZENvbnN0cnVjdG9yLnByb3RvdHlwZSA9IGNvbnN0cnVjdG9yO1xuICB9XG5cbiAgLy8gSWYgdGhlIG5hdGl2ZSB3ZWIgY29tcG9uZW50IHNwZWNpZmljYXRpb24gaXMgbG9hZGVkLCB1c2UgdGhhdCBpbnN0ZWFkLlxuICBpZiAocmVhbFJlZ2lzdGVyRWxlbWVudCkge1xuICAgIHJldHVybiByZWFsUmVnaXN0ZXJFbGVtZW50LmNhbGwoZG9jdW1lbnQsIHRhZ05hbWUsIG5vcm1hbGl6ZWRDb25zdHJ1Y3Rvcik7XG4gIH1cblxuICAvLyBJZiB0aGUgZWxlbWVudCBoYXMgYWxyZWFkeSBiZWVuIHJlZ2lzdGVyZWQsIHJhaXNlIGFuIGVycm9yLlxuICBpZiAodGFnTmFtZSBpbiBjb21wb25lbnRzKSB7XG4gICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbihgXG4gICAgICBGYWlsZWQgdG8gZXhlY3V0ZSAncmVnaXN0ZXJFbGVtZW50JyBvbiAnRG9jdW1lbnQnOiBSZWdpc3RyYXRpb24gZmFpbGVkXG4gICAgICBmb3IgdHlwZSAnJHt0YWdOYW1lfScuIEEgdHlwZSB3aXRoIHRoYXQgbmFtZSBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQuXG4gICAgYCk7XG4gIH1cblxuICAvLyBBc3NpZ24gdGhlIGN1c3RvbSBlbGVtZW50IHJlZmVyZW5jZSB0byB0aGUgY29uc3RydWN0b3IuXG4gIGNvbXBvbmVudHNbdGFnTmFtZV0gPSBub3JtYWxpemVkQ29uc3RydWN0b3I7XG59XG5cbi8qKlxuICogQWRkcyBhIGdsb2JhbCB0cmFuc2l0aW9uIGxpc3RlbmVyLiAgV2l0aCBtYW55IGVsZW1lbnRzIHRoaXMgY291bGQgYmUgYW5cbiAqIGV4cGVuc2l2ZSBvcGVyYXRpb24sIHNvIHRyeSB0byBsaW1pdCB0aGUgYW1vdW50IG9mIGxpc3RlbmVycyBhZGRlZCBpZiB5b3UncmVcbiAqIGNvbmNlcm5lZCBhYm91dCBwZXJmb3JtYW5jZS5cbiAqXG4gKiBTaW5jZSB0aGUgY2FsbGJhY2sgdHJpZ2dlcnMgd2l0aCB2YXJpb3VzIGVsZW1lbnRzLCBtb3N0IG9mIHdoaWNoIHlvdVxuICogcHJvYmFibHkgZG9uJ3QgY2FyZSBhYm91dCwgeW91J2xsIHdhbnQgdG8gZmlsdGVyLiAgQSBnb29kIHdheSBvZiBmaWx0ZXJpbmdcbiAqIGlzIHRvIHVzZSB0aGUgRE9NIGBtYXRjaGVzYCBtZXRob2QuICBJdCdzIGZhaXJseSB3ZWxsIHN1cHBvcnRlZFxuICogKGh0dHA6Ly9jYW5pdXNlLmNvbS8jZmVhdD1tYXRjaGVzc2VsZWN0b3IpIGFuZCBtYXkgc3VpdCBtYW55IHByb2plY3RzLiAgSWZcbiAqIHlvdSBuZWVkIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LCBjb25zaWRlciB1c2luZyBqUXVlcnkncyBgaXNgLlxuICpcbiAqIFlvdSBjYW4gZG8gZnVuLCBoaWdobHkgc3BlY2lmaWMsIGZpbHRlcnM6XG4gKlxuICogYWRkVHJhbnNpdGlvblN0YXRlKCdhdHRhY2hlZCcsIGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAqICAgLy8gRmFkZSBpbiB0aGUgbWFpbiBjb250YWluZXIgYWZ0ZXIgaXQncyBhZGRlZC5cbiAqICAgaWYgKGVsZW1lbnQubWF0Y2hlcygnYm9keSBtYWluLmNvbnRhaW5lcicpKSB7XG4gKiAgICAgJChlbGVtZW50KS5zdG9wKHRydWUsIHRydWUpLmZhZGVJbigpO1xuICogICB9XG4gKiB9KTtcbiAqXG4gKiBAcGFyYW0gc3RhdGUgLSBTdHJpbmcgbmFtZSB0aGF0IG1hdGNoZXMgd2hhdCdzIGF2YWlsYWJsZSBpbiB0aGVcbiAqIGRvY3VtZW50YXRpb24gYWJvdmUuXG4gKiBAcGFyYW0gY2FsbGJhY2sgLSBGdW5jdGlvbiB0byByZWNlaXZlIHRoZSBtYXRjaGluZyBlbGVtZW50cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFRyYW5zaXRpb25TdGF0ZShzdGF0ZSwgY2FsbGJhY2spIHtcbiAgaWYgKCFzdGF0ZSkge1xuICAgIHRocm93IG5ldyBUcmFuc2l0aW9uU3RhdGVFcnJvcignTWlzc2luZyB0cmFuc2l0aW9uIHN0YXRlIG5hbWUnKTtcbiAgfVxuXG4gIGlmICghY2FsbGJhY2spIHtcbiAgICB0aHJvdyBuZXcgVHJhbnNpdGlvblN0YXRlRXJyb3IoJ01pc3NpbmcgdHJhbnNpdGlvbiBzdGF0ZSBjYWxsYmFjaycpO1xuICB9XG5cbiAgLy8gTm90IGEgdmFsaWQgc3RhdGUgbmFtZS5cbiAgaWYgKE9iamVjdC5rZXlzKHRyYW5zaXRpb25TdGF0ZXMpLmluZGV4T2Yoc3RhdGUpID09PSAtMSkge1xuICAgIHRocm93IG5ldyBUcmFuc2l0aW9uU3RhdGVFcnJvcignSW52YWxpZCBzdGF0ZSBuYW1lOiAnICsgc3RhdGUpO1xuICB9XG5cbiAgdHJhbnNpdGlvblN0YXRlc1tzdGF0ZV0ucHVzaChjYWxsYmFjayk7XG59XG5cbi8qKlxuICogUmVtb3ZlcyBhIGdsb2JhbCB0cmFuc2l0aW9uIGxpc3RlbmVyLlxuICpcbiAqIFdoZW4gaW52b2tlZCB3aXRoIG5vIGFyZ3VtZW50cywgdGhpcyBtZXRob2Qgd2lsbCByZW1vdmUgYWxsIHRyYW5zaXRpb25cbiAqIGNhbGxiYWNrcy4gIFdoZW4gaW52b2tlZCB3aXRoIHRoZSBuYW1lIGFyZ3VtZW50IGl0IHdpbGwgcmVtb3ZlIGFsbFxuICogdHJhbnNpdGlvbiBzdGF0ZSBjYWxsYmFja3MgbWF0Y2hpbmcgdGhlIG5hbWUsIGFuZCBzbyBvbiBmb3IgdGhlIGNhbGxiYWNrLlxuICpcbiAqIEBwYXJhbSBzdGF0ZSAtIFN0cmluZyBuYW1lIHRoYXQgbWF0Y2hlcyB3aGF0J3MgYXZhaWxhYmxlIGluIHRoZVxuICogZG9jdW1lbnRhdGlvbiBhYm92ZS5cbiAqIEBwYXJhbSBjYWxsYmFjayAtIEZ1bmN0aW9uIHRvIHJlY2VpdmUgdGhlIG1hdGNoaW5nIGVsZW1lbnRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlVHJhbnNpdGlvblN0YXRlKHN0YXRlLCBjYWxsYmFjaykge1xuICBpZiAoIWNhbGxiYWNrICYmIHN0YXRlKSB7XG4gICAgdHJhbnNpdGlvblN0YXRlc1tzdGF0ZV0ubGVuZ3RoID0gMDtcbiAgfVxuICBlbHNlIGlmIChzdGF0ZSAmJiBjYWxsYmFjaykge1xuICAgIC8vIE5vdCBhIHZhbGlkIHN0YXRlIG5hbWUuXG4gICAgaWYgKE9iamVjdC5rZXlzKHRyYW5zaXRpb25TdGF0ZXMpLmluZGV4T2Yoc3RhdGUpID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IFRyYW5zaXRpb25TdGF0ZUVycm9yKCdJbnZhbGlkIHN0YXRlIG5hbWUgJyArIHN0YXRlKTtcbiAgICB9XG5cbiAgICBsZXQgaW5kZXggPSB0cmFuc2l0aW9uU3RhdGVzW3N0YXRlXS5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICB0cmFuc2l0aW9uU3RhdGVzW3N0YXRlXS5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG4gIGVsc2Uge1xuICAgIGZvciAobGV0IHN0YXRlIGluIHRyYW5zaXRpb25TdGF0ZXMpIHtcbiAgICAgIHRyYW5zaXRpb25TdGF0ZXNbc3RhdGVdLmxlbmd0aCA9IDA7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQnkgY2FsbGluZyB0aGlzIGZ1bmN0aW9uIHlvdXIgYnJvd3NlciBlbnZpcm9ubWVudCBpcyBlbmhhbmNlZCBnbG9iYWxseS4gVGhpc1xuICogcHJvamVjdCB3b3VsZCBsb3ZlIHRvIGhpdCB0aGUgc3RhbmRhcmRzIHRyYWNrIGFuZCBhbGxvdyBhbGwgZGV2ZWxvcGVycyB0b1xuICogYmVuZWZpdCBmcm9tIHRoZSBwZXJmb3JtYW5jZSBnYWlucyBvZiBET00gZGlmZmluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuYWJsZVByb2xseWZpbGwoKSB7XG4gIC8vIEV4cG9zZXMgdGhlIGBUcmFuc2l0aW9uU3RhdGVFcnJvcmAgY29uc3RydWN0b3IgZ2xvYmFsbHkgc28gdGhhdCBkZXZlbG9wZXJzXG4gIC8vIGNhbiBpbnN0YW5jZW9mIGNoZWNrIGV4Y2VwdGlvbiBlcnJvcnMuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3csICdUcmFuc2l0aW9uU3RhdGVFcnJvcicsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG5cbiAgICB2YWx1ZTogVHJhbnNpdGlvblN0YXRlRXJyb3JcbiAgfSk7XG5cbiAgLy8gQWxsb3dzIGEgZGV2ZWxvcGVyIHRvIGFkZCB0cmFuc2l0aW9uIHN0YXRlIGNhbGxiYWNrcy5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGRvY3VtZW50LCAnYWRkVHJhbnNpdGlvblN0YXRlJywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcblxuICAgIHZhbHVlKHN0YXRlLCBjYWxsYmFjaykge1xuICAgICAgYWRkVHJhbnNpdGlvblN0YXRlKHN0YXRlLCBjYWxsYmFjayk7XG4gICAgfVxuICB9KTtcblxuICAvLyBBbGxvd3MgYSBkZXZlbG9wZXIgdG8gcmVtb3ZlIHRyYW5zaXRpb24gc3RhdGUgY2FsbGJhY2tzLlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZG9jdW1lbnQsICdyZW1vdmVUcmFuc2l0aW9uU3RhdGUnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuXG4gICAgdmFsdWUoc3RhdGUsIGNhbGxiYWNrKSB7XG4gICAgICByZW1vdmVUcmFuc2l0aW9uU3RhdGUoc3RhdGUsIGNhbGxiYWNrKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEFsbG93cyBhIGRldmVsb3BlciB0byBzZXQgdGhlIGBpbm5lckhUTUxgIG9mIGFuIGVsZW1lbnQuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFbGVtZW50LnByb3RvdHlwZSwgJ2RpZmZJbm5lckhUTUwnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuXG4gICAgc2V0KG5ld0hUTUwpIHtcbiAgICAgIGlubmVySFRNTCh0aGlzLCBuZXdIVE1MKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEFsbG93cyBhIGRldmVsb3BlciB0byBzZXQgdGhlIGBvdXRlckhUTUxgIG9mIGFuIGVsZW1lbnQuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFbGVtZW50LnByb3RvdHlwZSwgJ2RpZmZPdXRlckhUTUwnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuXG4gICAgc2V0KG5ld0hUTUwpIHtcbiAgICAgIG91dGVySFRNTCh0aGlzLCBuZXdIVE1MKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEFsbG93cyBhIGRldmVsb3BlciB0byBkaWZmIHRoZSBjdXJyZW50IGVsZW1lbnQgd2l0aCBhIG5ldyBlbGVtZW50LlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRWxlbWVudC5wcm90b3R5cGUsICdkaWZmRWxlbWVudCcsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG5cbiAgICB2YWx1ZShuZXdFbGVtZW50LCBvcHRpb25zKSB7XG4gICAgICBlbGVtZW50KHRoaXMsIG5ld0VsZW1lbnQsIG9wdGlvbnMpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gUmVsZWFzZXMgdGhlIHJldGFpbmVkIG1lbW9yeSBhbmQgd29ya2VyIGluc3RhbmNlLlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRWxlbWVudC5wcm90b3R5cGUsICdkaWZmUmVsZWFzZScsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG5cbiAgICB2YWx1ZShuZXdFbGVtZW50KSB7XG4gICAgICByZWxlYXNlTm9kZSh0aGlzKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIFBvbHlmaWxsIGluIHRoZSBgcmVnaXN0ZXJFbGVtZW50YCBtZXRob2QgaWYgaXQgZG9lc24ndCBhbHJlYWR5IGV4aXN0LiBUaGlzXG4gIC8vIHJlcXVpcmVzIHBhdGNoaW5nIGBjcmVhdGVFbGVtZW50YCBhcyB3ZWxsIHRvIGVuc3VyZSB0aGF0IHRoZSBwcm9wZXIgcHJvdG9cbiAgLy8gY2hhaW4gZXhpc3RzLlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZG9jdW1lbnQsICdyZWdpc3RlckVsZW1lbnQnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuXG4gICAgdmFsdWUodGFnTmFtZSwgY29tcG9uZW50KSB7XG4gICAgICByZWdpc3RlckVsZW1lbnQodGFnTmFtZSwgY29tcG9uZW50KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIElmIEhUTUxFbGVtZW50IGlzIGFuIG9iamVjdCwgcmVqaWdnZXIgaXQgdG8gd29yayBsaWtlIGEgZnVuY3Rpb24gc28gdGhhdFxuICAvLyBpdCBjYW4gYmUgZXh0ZW5kZWQuIFNwZWNpZmljYWxseSBhZmZlY3RzIElFIGFuZCBTYWZhcmkuXG4gIGlmICh0eXBlb2YgRWxlbWVudCA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIEhUTUxFbGVtZW50ID09PSAnb2JqZWN0Jykge1xuICAgIC8vIEZhbGwgYmFjayB0byB0aGUgRWxlbWVudCBjb25zdHJ1Y3RvciBpZiB0aGUgSFRNTEVsZW1lbnQgZG9lcyBub3QgZXhpc3QuXG4gICAgbGV0IHJlYWxIVE1MRWxlbWVudCA9IEhUTUxFbGVtZW50IHx8IEVsZW1lbnQ7XG5cbiAgICAvLyBJZiB0aGVyZSBpcyBubyBgX19wcm90b19fYCBhdmFpbGFibGUsIGFkZCBvbmUgdG8gdGhlIHByb3RvdHlwZS5cbiAgICBpZiAoIXJlYWxIVE1MRWxlbWVudC5fX3Byb3RvX18pIHtcbiAgICAgIGxldCBjb3B5ID0ge1xuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgIHZhbCA9IE9iamVjdC5rZXlzKHZhbCkubGVuZ3RoID8gdmFsIDogT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCk7XG4gICAgICAgICAgZm9yIChsZXQga2V5IGluIHZhbCkge1xuICAgICAgICAgICAgaWYgKHZhbC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgIHRoaXNba2V5XSA9IHZhbFtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlYWxIVE1MRWxlbWVudCwgJ19fcHJvdG9fXycsIGNvcHkpO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlYWxIVE1MRWxlbWVudC5wcm90b3R5cGUsICdfX3Byb3RvX18nLCBjb3B5KTtcbiAgICB9XG5cbiAgICBIVE1MRWxlbWVudCA9IGZ1bmN0aW9uKCkge307XG4gICAgSFRNTEVsZW1lbnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShyZWFsSFRNTEVsZW1lbnQucHJvdG90eXBlKTtcbiAgICBIVE1MRWxlbWVudC5fX3Byb3RvX18gPSByZWFsSFRNTEVsZW1lbnQ7XG5cbiAgICAvLyBFbnN1cmUgdGhhdCB0aGUgZ2xvYmFsIEVsZW1lbnQgbWF0Y2hlcyB0aGUgSFRNTEVsZW1lbnQuXG4gICAgRWxlbWVudCA9IEhUTUxFbGVtZW50O1xuICB9XG5cbiAgbGV0IGFjdGl2YXRlQ29tcG9uZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkb2N1bWVudEVsZW1lbnQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cbiAgICAvLyBBZnRlciB0aGUgaW5pdGlhbCByZW5kZXIsIGNsZWFuIHVwIHRoZSByZXNvdXJjZXMsIG5vIHBvaW50IGluIGxpbmdlcmluZy5cbiAgICBkb2N1bWVudEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncmVuZGVyQ29tcGxldGUnLCBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAvLyBSZWxlYXNlIHJlc291cmNlcyB0byB0aGUgZWxlbWVudC5cbiAgICAgIGRvY3VtZW50RWxlbWVudC5kaWZmUmVsZWFzZShkb2N1bWVudEVsZW1lbnQpO1xuXG4gICAgICAvLyBSZW1vdmUgdGhpcyBldmVudCBsaXN0ZW5lci5cbiAgICAgIGRvY3VtZW50RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdyZW5kZXJDb21wbGV0ZScsIHJlbmRlcik7XG4gICAgfSk7XG5cbiAgICAvLyBEaWZmIHRoZSBlbnRpcmUgZG9jdW1lbnQgb24gYWN0aXZhdGlvbiBvZiB0aGUgcHJvbGx5ZmlsbC5cbiAgICBkb2N1bWVudEVsZW1lbnQuZGlmZk91dGVySFRNTCA9IGRvY3VtZW50RWxlbWVudC5vdXRlckhUTUw7XG5cbiAgICAvLyBSZW1vdmUgdGhlIGxvYWQgZXZlbnQgbGlzdGVuZXIsIHNpbmNlIGl0J3MgY29tcGxldGUuXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBhY3RpdmF0ZUNvbXBvbmVudHMpO1xuICB9O1xuXG4gIC8vIFRoaXMgc2VjdGlvbiB3aWxsIGF1dG9tYXRpY2FsbHkgcGFyc2Ugb3V0IHlvdXIgZW50aXJlIHBhZ2UgdG8gZW5zdXJlIGFsbFxuICAvLyBjdXN0b20gZWxlbWVudHMgYXJlIGhvb2tlZCBpbnRvLlxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGFjdGl2YXRlQ29tcG9uZW50cyk7XG5cbiAgLy8gSWYgdGhlIGRvY3VtZW50IGhhcyBhbHJlYWR5IGxvYWRlZCwgaW1tZWRpYXRlbHkgYWN0aXZhdGUgdGhlIGNvbXBvbmVudHMuXG4gIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7IGFjdGl2YXRlQ29tcG9uZW50cygpOyB9XG59XG4iLCJpbXBvcnQgeyBwb29scyBhcyBfcG9vbHMgfSBmcm9tICcuLi91dGlsL3Bvb2xzJztcbmltcG9ydCB7XG4gIHByb3RlY3RFbGVtZW50IGFzIF9wcm90ZWN0RWxlbWVudCxcbiAgdW5wcm90ZWN0RWxlbWVudCBhcyBfdW5wcm90ZWN0RWxlbWVudFxufSBmcm9tICcuLi91dGlsL21lbW9yeSc7XG5pbXBvcnQgeyBjb21wb25lbnRzLCB1cGdyYWRlIH0gZnJvbSAnLi4vZWxlbWVudC9jdXN0b20nO1xuXG52YXIgcG9vbHMgPSBfcG9vbHM7XG52YXIgcHJvdGVjdEVsZW1lbnQgPSBfcHJvdGVjdEVsZW1lbnQ7XG52YXIgdW5wcm90ZWN0RWxlbWVudCA9IF91bnByb3RlY3RFbGVtZW50O1xudmFyIGVtcHR5ID0ge307XG5cbi8vIENhY2hlIGNyZWF0ZWQgbm9kZXMgaW5zaWRlIHRoaXMgb2JqZWN0LlxubWFrZS5ub2RlcyA9IHt9O1xuXG4vKipcbiAqIENvbnZlcnRzIGEgbGl2ZSBub2RlIGludG8gYSB2aXJ0dWFsIG5vZGUuXG4gKlxuICogQHBhcmFtIG5vZGVcbiAqIEByZXR1cm5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWFrZShub2RlLCBwcm90ZWN0KSB7XG4gIGxldCBub2RlVHlwZSA9IG5vZGUubm9kZVR5cGU7XG4gIGxldCBub2RlVmFsdWUgPSBub2RlLm5vZGVWYWx1ZTtcblxuICBpZiAoIW5vZGVUeXBlIHx8IG5vZGVUeXBlID09PSAyIHx8IG5vZGVUeXBlID09PSA0IHx8IG5vZGVUeXBlID09PSA4KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKG5vZGVUeXBlID09PSAzICYmICFub2RlVmFsdWUudHJpbSgpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gVmlydHVhbCByZXByZXNlbnRhdGlvbiBvZiBhIG5vZGUsIGNvbnRhaW5pbmcgb25seSB0aGUgZGF0YSB3ZSB3aXNoIHRvXG4gIC8vIGRpZmYgYW5kIHBhdGNoLlxuICBsZXQgZW50cnkgPSBwb29scy5lbGVtZW50T2JqZWN0LmdldCgpO1xuXG4gIC8vIEFkZCB0byBpbnRlcm5hbCBsb29rdXAuXG4gIG1ha2Uubm9kZXNbZW50cnkuZWxlbWVudF0gPSBub2RlO1xuXG4gIGVudHJ5Lm5vZGVOYW1lID0gbm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICBlbnRyeS5ub2RlVmFsdWUgPSBub2RlVmFsdWU7XG4gIGVudHJ5LmNoaWxkTm9kZXMubGVuZ3RoID0gMDtcbiAgZW50cnkuYXR0cmlidXRlcy5sZW5ndGggPSAwO1xuXG4gIGlmIChwcm90ZWN0KSB7XG4gICAgcHJvdGVjdEVsZW1lbnQoZW50cnkpO1xuICB9XG5cbiAgLy8gQ29sbGVjdCBhdHRyaWJ1dGVzLlxuICBsZXQgYXR0cmlidXRlcyA9IG5vZGUuYXR0cmlidXRlcztcblxuICAvLyBJZiB0aGUgZWxlbWVudCBoYXMgbm8gYXR0cmlidXRlcywgc2tpcCBvdmVyLlxuICBpZiAoYXR0cmlidXRlcykge1xuICAgIGxldCBhdHRyaWJ1dGVzTGVuZ3RoID0gYXR0cmlidXRlcy5sZW5ndGg7XG5cbiAgICBpZiAoYXR0cmlidXRlc0xlbmd0aCkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhdHRyaWJ1dGVzTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IGF0dHIgPSBwb29scy5hdHRyaWJ1dGVPYmplY3QuZ2V0KCk7XG5cbiAgICAgICAgaWYgKHByb3RlY3QpIHtcbiAgICAgICAgICBwb29scy5hdHRyaWJ1dGVPYmplY3QucHJvdGVjdChhdHRyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF0dHIubmFtZSA9IGF0dHJpYnV0ZXNbaV0ubmFtZTtcbiAgICAgICAgYXR0ci52YWx1ZSA9IGF0dHJpYnV0ZXNbaV0udmFsdWU7XG5cbiAgICAgICAgZW50cnkuYXR0cmlidXRlc1tlbnRyeS5hdHRyaWJ1dGVzLmxlbmd0aF0gPSBhdHRyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIENvbGxlY3QgY2hpbGROb2Rlcy5cbiAgbGV0IGNoaWxkTm9kZXMgPSBub2RlLmNoaWxkTm9kZXM7XG4gIGxldCBjaGlsZE5vZGVzTGVuZ3RoID0gbm9kZS5jaGlsZE5vZGVzLmxlbmd0aDtcblxuICAvLyBJZiB0aGUgZWxlbWVudCBoYXMgY2hpbGQgbm9kZXMsIGNvbnZlcnQgdGhlbSBhbGwgdG8gdmlydHVhbCBub2Rlcy5cbiAgaWYgKG5vZGUubm9kZVR5cGUgIT09IDMgJiYgY2hpbGROb2Rlcykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGROb2Rlc0xlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgbmV3Tm9kZSA9IG1ha2UoY2hpbGROb2Rlc1tpXSwgcHJvdGVjdCk7XG5cbiAgICAgIGlmIChuZXdOb2RlKSB7XG4gICAgICAgIGVudHJ5LmNoaWxkTm9kZXNbZW50cnkuY2hpbGROb2Rlcy5sZW5ndGhdID0gbmV3Tm9kZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBUT0RPIFJlbmFtZSB0aGlzIHRvIGZpcnN0LXJ1biwgYmVjYXVzZSB3ZSdyZSBjYWxsaW5nIHRoZSBhdHRhY2ggY2FsbGJhY2tcbiAgLy8gYW5kIHByb3RlY3Rpbmcgbm93LlxuICBpZiAocHJvdGVjdCkge1xuICAgIGlmIChjb21wb25lbnRzW2VudHJ5Lm5vZGVOYW1lXSkge1xuICAgICAgLy8gUmVzZXQgdGhlIHByb3RvdHlwZSBjaGFpbiBmb3IgdGhpcyBlbGVtZW50LiBVcGdyYWRlIHdpbGwgcmV0dXJuIGB0cnVlYFxuICAgICAgLy8gaWYgdGhlIGVsZW1lbnQgd2FzIHVwZ3JhZGVkIGZvciB0aGUgZmlyc3QgdGltZS4gVGhpcyBpcyB1c2VmdWwgc28gd2VcbiAgICAgIC8vIGRvbid0IGVuZCB1cCBpbiBhIGxvb3Agd2hlbiB3b3JraW5nIHdpdGggdGhlIHNhbWUgZWxlbWVudC5cbiAgICAgIGlmICh1cGdyYWRlKGVudHJ5Lm5vZGVOYW1lLCBub2RlKSkge1xuICAgICAgICAvLyBJZiB0aGUgTm9kZSBpcyBpbiB0aGUgRE9NLCB0cmlnZ2VyIGF0dGFjaGVkIGNhbGxiYWNrLlxuICAgICAgICBpZiAobm9kZS5wYXJlbnROb2RlICYmIG5vZGUuYXR0YWNoZWRDYWxsYmFjaykge1xuICAgICAgICAgIG5vZGUuYXR0YWNoZWRDYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVudHJ5O1xufVxuIiwiaW1wb3J0IEN1c3RvbUV2ZW50IGZyb20gJ2N1c3RvbS1ldmVudCc7XG5pbXBvcnQgeyBjcmVhdGUgYXMgY3JlYXRlV29ya2VyLCBoYXNXb3JrZXIgfSBmcm9tICcuLi93b3JrZXIvY3JlYXRlJztcbmltcG9ydCB7IGNsZWFuTWVtb3J5LCBwcm90ZWN0RWxlbWVudCwgdW5wcm90ZWN0RWxlbWVudCB9IGZyb20gJy4uL3V0aWwvbWVtb3J5JztcbmltcG9ydCB7IHBvb2xzIH0gZnJvbSAnLi4vdXRpbC9wb29scyc7XG5pbXBvcnQgeyBwYXJzZUhUTUwgfSBmcm9tICcuLi91dGlsL3BhcnNlcic7XG5pbXBvcnQgcHJvY2Vzc1BhdGNoZXMgZnJvbSAnLi4vcGF0Y2hlcy9wcm9jZXNzJztcbmltcG9ydCBtYWtlTm9kZSBmcm9tICcuL21ha2UnO1xuaW1wb3J0IG1ha2VFbGVtZW50IGZyb20gJy4uL2VsZW1lbnQvbWFrZSc7XG5pbXBvcnQgc3luY05vZGUgZnJvbSAnLi9zeW5jJztcbmltcG9ydCB7IFRyZWVDYWNoZSB9IGZyb20gJy4vdHJlZSc7XG5cbi8qKlxuICogUmVsZWFzZSdzIHRoZSBhbGxvY2F0ZWQgb2JqZWN0cyBhbmQgcmVjeWNsZXMgaW50ZXJuYWwgbWVtb3J5LlxuICpcbiAqIEBwYXJhbSBlbGVtZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWxlYXNlTm9kZShlbGVtZW50KSB7XG4gIGxldCBlbGVtZW50TWV0YSA9IFRyZWVDYWNoZS5nZXQoZWxlbWVudCkgfHwge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgYSB3b3JrZXIgYXNzb2NpYXRlZCB3aXRoIHRoaXMgZWxlbWVudCwgdGhlbiBraWxsIGl0LlxuICBpZiAoZWxlbWVudE1ldGEud29ya2VyKSB7XG4gICAgZWxlbWVudE1ldGEud29ya2VyLnRlcm1pbmF0ZSgpO1xuICB9XG5cbiAgLy8gSWYgdGhlcmUgd2FzIGEgdHJlZSBzZXQgdXAsIHJlY3ljbGUgdGhlIG1lbW9yeSBhbGxvY2F0ZWQgZm9yIGl0LlxuICBpZiAoZWxlbWVudE1ldGEub2xkVHJlZSkge1xuICAgIHVucHJvdGVjdEVsZW1lbnQoZWxlbWVudE1ldGEub2xkVHJlZSk7XG4gICAgY2xlYW5NZW1vcnkoKTtcbiAgfVxuXG4gIC8vIFJlbW92ZSB0aGlzIGVsZW1lbnQncyBtZXRhIG9iamVjdCBmcm9tIHRoZSBjYWNoZS5cbiAgVHJlZUNhY2hlLmRlbGV0ZShlbGVtZW50KTtcbn1cblxuLyoqXG4gKiBXaGVuIHRoZSB3b3JrZXIgY29tcGxldGVzLCBjbGVhbiB1cCBtZW1vcnkgYW5kIHNjaGVkdWxlIHRoZSBuZXh0IHJlbmRlciBpZlxuICogbmVjZXNzYXJ5LlxuICpcbiAqIEBwYXJhbSBlbGVtZW50XG4gKiBAcGFyYW0gZWxlbWVudE1ldGFcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5mdW5jdGlvbiBjb21wbGV0ZVdvcmtlclJlbmRlcihlbGVtZW50LCBlbGVtZW50TWV0YSkge1xuICByZXR1cm4gZnVuY3Rpb24oZXYpIHtcbiAgICB2YXIgbm9kZXMgPSBldi5kYXRhLm5vZGVzO1xuXG4gICAgLy8gQWRkIG5ldyBlbGVtZW50cy5cbiAgICBpZiAobm9kZXMuYWRkaXRpb25zLmxlbmd0aCkge1xuICAgICAgbm9kZXMuYWRkaXRpb25zLm1hcChwcm90ZWN0RWxlbWVudCkubWFwKGRlc2NyaXB0b3IgPT4ge1xuICAgICAgICAvLyBJbmplY3QgaW50byB0aGUgYG9sZFRyZWVgIHNvIGl0J3MgY2xlYW5lZCB1cCBjb3JyZWN0bHkuXG4gICAgICAgIGVsZW1lbnRNZXRhLm9sZFRyZWUuY2hpbGROb2Rlcy5wdXNoKGRlc2NyaXB0b3IpO1xuICAgICAgICByZXR1cm4gZGVzY3JpcHRvcjtcbiAgICAgIH0pLmZvckVhY2gobWFrZUVsZW1lbnQpO1xuICAgIH1cblxuICAgIGxldCBjb21wbGV0ZVJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gUmVtb3ZlIHVudXNlZCBlbGVtZW50cy5cbiAgICAgIGlmIChub2Rlcy5yZW1vdmFscy5sZW5ndGgpIHtcbiAgICAgICAgbm9kZXMucmVtb3ZhbHMubWFwKHV1aWQgPT4gcG9vbHMuZWxlbWVudE9iamVjdC5fdXVpZFt1dWlkXSlcbiAgICAgICAgICAuZm9yRWFjaCh1bnByb3RlY3RFbGVtZW50KTtcbiAgICAgIH1cblxuICAgICAgLy8gUmVzZXQgaW50ZXJuYWwgY2FjaGVzIGZvciBxdWlja2VyIGxvb2t1cHMgaW4gdGhlIGZ1dHVyZXMuXG4gICAgICBlbGVtZW50TWV0YS5faW5uZXJIVE1MID0gZWxlbWVudC5pbm5lckhUTUw7XG4gICAgICBlbGVtZW50TWV0YS5fb3V0ZXJIVE1MID0gZWxlbWVudC5vdXRlckhUTUw7XG4gICAgICBlbGVtZW50TWV0YS5fdGV4dENvbnRlbnQgPSBlbGVtZW50LnRleHRDb250ZW50O1xuXG4gICAgICAvLyBSZWN5Y2xlIGFsbCB1bnByb3RlY3RlZCBhbGxvY2F0aW9ucy5cbiAgICAgIGNsZWFuTWVtb3J5KCk7XG5cbiAgICAgIGVsZW1lbnRNZXRhLmhhc1dvcmtlclJlbmRlcmVkID0gdHJ1ZTtcbiAgICAgIGVsZW1lbnRNZXRhLmlzUmVuZGVyaW5nID0gZmFsc2U7XG5cbiAgICAgIC8vIFRoaXMgaXMgZGVzaWduZWQgdG8gaGFuZGxlIHVzZSBjYXNlcyB3aGVyZSByZW5kZXJzIGFyZSBiZWluZyBoYW1tZXJlZFxuICAgICAgLy8gb3Igd2hlbiB0cmFuc2l0aW9ucyBhcmUgdXNlZCB3aXRoIFByb21pc2VzLlxuICAgICAgaWYgKGVsZW1lbnRNZXRhLnJlbmRlckJ1ZmZlcikge1xuICAgICAgICBsZXQgbmV4dFJlbmRlciA9IGVsZW1lbnRNZXRhLnJlbmRlckJ1ZmZlcjtcblxuICAgICAgICAvLyBSZXNldCB0aGUgYnVmZmVyLlxuICAgICAgICBlbGVtZW50TWV0YS5yZW5kZXJCdWZmZXIgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgLy8gTm90aWNpbmcgc29tZSB3ZWlyZCBwZXJmb3JtYW5jZSBpbXBsaWNhdGlvbnMgd2l0aCB0aGlzIGNvbmNlcHQuXG4gICAgICAgIHBhdGNoTm9kZShlbGVtZW50LCBuZXh0UmVuZGVyLm5ld0hUTUwsIG5leHRSZW5kZXIub3B0aW9ucyk7XG4gICAgICB9XG4gICAgICAvLyBEaXNwYXRjaCBhbiBldmVudCBvbiB0aGUgZWxlbWVudCBvbmNlIHJlbmRlcmluZyBoYXMgY29tcGxldGVkLlxuICAgICAgZWxzZSB7XG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ3JlbmRlckNvbXBsZXRlJykpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBXYWl0IHVudGlsIGFsbCBwcm9taXNlcyBoYXZlIHJlc29sdmVkLCBiZWZvcmUgZmluaXNoaW5nIHVwIHRoZSBwYXRjaFxuICAgIC8vIGN5Y2xlLlxuICAgIC8vIFByb2Nlc3MgdGhlIGRhdGEgaW1tZWRpYXRlbHkgYW5kIHdhaXQgdW50aWwgYWxsIHRyYW5zaXRpb24gY2FsbGJhY2tzXG4gICAgLy8gaGF2ZSBjb21wbGV0ZWQuXG4gICAgbGV0IHByb2Nlc3NQcm9taXNlID0gcHJvY2Vzc1BhdGNoZXMoZWxlbWVudCwgZXYuZGF0YS5wYXRjaGVzKTtcblxuICAgIC8vIE9wZXJhdGUgc3luY2hyb25vdXNseSB1bmxlc3Mgb3B0ZWQgaW50byBhIFByb21pc2UtY2hhaW4uXG4gICAgaWYgKHByb2Nlc3NQcm9taXNlKSB7IHByb2Nlc3NQcm9taXNlLnRoZW4oY29tcGxldGVSZW5kZXIpOyB9XG4gICAgZWxzZSB7IGNvbXBsZXRlUmVuZGVyKCk7IH1cbiAgfTtcbn1cblxuLyoqXG4gKiBQYXRjaGVzIGFuIGVsZW1lbnQncyBET00gdG8gbWF0Y2ggdGhhdCBvZiB0aGUgcGFzc2VkIG1hcmt1cC5cbiAqXG4gKiBAcGFyYW0gZWxlbWVudFxuICogQHBhcmFtIG5ld0hUTUxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhdGNoTm9kZShlbGVtZW50LCBuZXdIVE1MLCBvcHRpb25zKSB7XG4gIC8vIEVuc3VyZSB0aGF0IHRoZSBkb2N1bWVudCBkaXNhYmxlIHdvcmtlciBpcyBhbHdheXMgcGlja2VkIHVwLlxuICBpZiAodHlwZW9mIG9wdGlvbnMuZW5hYmxlV29ya2VyICE9PSAnYm9vbGVhbicpIHtcbiAgICBvcHRpb25zLmVuYWJsZVdvcmtlciA9IGRvY3VtZW50LkVOQUJMRV9XT1JLRVI7XG4gIH1cblxuICB2YXIgZWxlbWVudE1ldGEgPSBUcmVlQ2FjaGUuZ2V0KGVsZW1lbnQpIHx8IHt9O1xuXG4gIGlmIChlbGVtZW50TWV0YS5pc1JlbmRlcmluZykge1xuICAgIC8vIEFkZCB0aGlzIG5ldyByZW5kZXIgaW50byB0aGUgYnVmZmVyIHF1ZXVlLlxuICAgIGVsZW1lbnRNZXRhLnJlbmRlckJ1ZmZlciA9IHsgbmV3SFRNTCwgb3B0aW9ucyB9O1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEFsd2F5cyBlbnN1cmUgdGhlIG1vc3QgdXAtdG8tZGF0ZSBtZXRhIG9iamVjdCBpcyBzdG9yZWQuXG4gIFRyZWVDYWNoZS5zZXQoZWxlbWVudCwgZWxlbWVudE1ldGEpO1xuXG4gIHZhciBuZXh0UmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKGVsZW1lbnRNZXRhLnJlbmRlckJ1ZmZlcikge1xuICAgICAgbGV0IG5leHRSZW5kZXIgPSBlbGVtZW50TWV0YS5yZW5kZXJCdWZmZXI7XG4gICAgICBlbGVtZW50TWV0YS5yZW5kZXJCdWZmZXIgPSB1bmRlZmluZWQ7XG5cbiAgICAgIC8vIE5vdGljaW5nIHNvbWUgd2VpcmQgcGVyZm9ybWFuY2UgaW1wbGljYXRpb25zIHdpdGggdGhpcyBjb25jZXB0LlxuICAgICAgcGF0Y2hOb2RlKGVsZW1lbnQsIG5leHRSZW5kZXIubmV3SFRNTCwgbmV4dFJlbmRlci5vcHRpb25zKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gSWYgdGhlIG9wZXJhdGlvbiBpcyBgaW5uZXJIVE1MYCwgYnV0IHRoZSBjb250ZW50cyBoYXZlbid0IGNoYW5nZWQsIGFib3J0LlxuICB2YXIgZGlmZmVyZW50SW5uZXJIVE1MID0gb3B0aW9ucy5pbm5lciAmJiBlbGVtZW50LmlubmVySFRNTCA9PT0gbmV3SFRNTDtcbiAgLy8gSWYgdGhlIG9wZXJhdGlvbiBpcyBgb3V0ZXJIVE1MYCwgYnV0IHRoZSBjb250ZW50cyBoYXZlbid0IGNoYW5nZWQsIGFib3J0LlxuICB2YXIgZGlmZmVyZW50T3V0ZXJIVE1MID0gIW9wdGlvbnMuaW5uZXIgJiYgZWxlbWVudC5vdXRlckhUTUwgPT09IG5ld0hUTUw7XG5cbiAgLy8gU3RhcnQgd2l0aCB3b3JrZXIgYmVpbmcgYSBmYWxzeSB2YWx1ZS5cbiAgdmFyIHdvcmtlciA9IG51bGw7XG5cbiAgLy8gSWYgd2UgY2FuIHVzZSBhIHdvcmtlciBhbmQgdGhlIHVzZXIgd2FudHMgb25lLCB0cnkgYW5kIGNyZWF0ZSBpdC5cbiAgaWYgKG9wdGlvbnMuZW5hYmxlV29ya2VyICYmIGhhc1dvcmtlcikge1xuICAgIC8vIENyZWF0ZSBhIHdvcmtlciBmb3IgdGhpcyBlbGVtZW50LlxuICAgIHdvcmtlciA9IGVsZW1lbnRNZXRhLndvcmtlciA9IGVsZW1lbnRNZXRhLndvcmtlciB8fCBjcmVhdGVXb3JrZXIoKTtcbiAgfVxuXG4gIC8vIEFuZCBlbnN1cmUgdGhhdCBhbiBgb2xkVHJlZWAgZXhpc3RzLCBvdGhlcndpc2UgdGhpcyBpcyB0aGUgZmlyc3QgcmVuZGVyXG4gIC8vIHBvdGVudGlhbGx5LlxuICBpZiAoKGRpZmZlcmVudElubmVySFRNTCB8fCBkaWZmZXJlbnRPdXRlckhUTUwpICYmIGVsZW1lbnRNZXRhLm9sZFRyZWUpIHtcbiAgICBuZXh0UmVuZGVyKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKFxuICAgIC8vIElmIHRoZSBvcGVyYXRpb24gaXMgYGlubmVySFRNTGAsIGFuZCB0aGUgY3VycmVudCBlbGVtZW50J3MgY29udGVudHMgaGF2ZVxuICAgIC8vIGNoYW5nZWQgc2luY2UgdGhlIGxhc3QgcmVuZGVyIGxvb3AsIHJlY2FsY3VsYXRlIHRoZSB0cmVlLlxuICAgIChvcHRpb25zLmlubmVyICYmIGVsZW1lbnRNZXRhLl9pbm5lckhUTUwgIT09IGVsZW1lbnQuaW5uZXJIVE1MKSB8fFxuXG4gICAgLy8gSWYgdGhlIG9wZXJhdGlvbiBpcyBgb3V0ZXJIVE1MYCwgYW5kIHRoZSBjdXJyZW50IGVsZW1lbnQncyBjb250ZW50cyBoYXZlXG4gICAgLy8gY2hhbmdlZCBzaW5jZSB0aGUgbGFzdCByZW5kZXIgbG9vcCwgcmVjYWxjdWxhdGUgdGhlIHRyZWUuXG4gICAgKCFvcHRpb25zLmlubmVyICYmIGVsZW1lbnRNZXRhLl9vdXRlckhUTUwgIT09IGVsZW1lbnQub3V0ZXJIVE1MKSB8fFxuXG4gICAgLy8gSWYgdGhlIHRleHQgY29udGVudCBldmVyIGNoYW5nZXMsIHJlY2FsY3VsYXRlIHRoZSB0cmVlLlxuICAgIChlbGVtZW50TWV0YS5fdGV4dENvbnRlbnQgIT09IGVsZW1lbnQudGV4dENvbnRlbnQpXG4gICkge1xuICAgIGlmIChlbGVtZW50TWV0YS5vbGRUcmVlKSB7XG4gICAgICB1bnByb3RlY3RFbGVtZW50KGVsZW1lbnRNZXRhLm9sZFRyZWUpO1xuICAgICAgY2xlYW5NZW1vcnkoKTtcbiAgICB9XG5cbiAgICBlbGVtZW50TWV0YS5vbGRUcmVlID0gbWFrZU5vZGUoZWxlbWVudCwgdHJ1ZSk7XG4gICAgZWxlbWVudE1ldGEudXBkYXRlT2xkVHJlZSA9IHRydWU7XG4gIH1cblxuICAvLyBXaWxsIHdhbnQgdG8gZW5zdXJlIHRoYXQgdGhlIGZpcnN0IHJlbmRlciB3ZW50IHRocm91Z2gsIHRoZSB3b3JrZXIgY2FuXG4gIC8vIHRha2UgYSBiaXQgdG8gc3RhcnR1cCBhbmQgd2Ugd2FudCB0byBzaG93IGNoYW5nZXMgYXMgc29vbiBhcyBwb3NzaWJsZS5cbiAgaWYgKG9wdGlvbnMuZW5hYmxlV29ya2VyICYmIGhhc1dvcmtlciAmJiB3b3JrZXIpIHtcbiAgICAvLyBTZXQgYSByZW5kZXIgbG9jayBhcyB0byBub3QgZmxvb2QgdGhlIHdvcmtlci5cbiAgICBlbGVtZW50TWV0YS5pc1JlbmRlcmluZyA9IHRydWU7XG5cbiAgICAvLyBBdHRhY2ggYWxsIHByb3BlcnRpZXMgaGVyZSB0byB0cmFuc3BvcnQuXG4gICAgbGV0IHRyYW5zZmVyT2JqZWN0ID0ge307XG5cbiAgICAvLyBUaGlzIHNob3VsZCBvbmx5IG9jY3VyIG9uY2UsIG9yIHdoZW5ldmVyIHRoZSBtYXJrdXAgY2hhbmdlcyBleHRlcm5hbGx5XG4gICAgLy8gdG8gZGlmZkhUTUwuXG4gICAgaWYgKCFlbGVtZW50TWV0YS5oYXNXb3JrZXJSZW5kZXJlZCB8fCBlbGVtZW50TWV0YS51cGRhdGVPbGRUcmVlKSB7XG4gICAgICB0cmFuc2Zlck9iamVjdC5vbGRUcmVlID0gZWxlbWVudE1ldGEub2xkVHJlZTtcbiAgICAgIGVsZW1lbnRNZXRhLnVwZGF0ZU9sZFRyZWUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBBdHRhY2ggdGhlIHBhcmVudCBlbGVtZW50J3MgdXVpZC5cbiAgICB0cmFuc2Zlck9iamVjdC51dWlkID0gZWxlbWVudE1ldGEub2xkVHJlZS5lbGVtZW50O1xuXG4gICAgaWYgKHR5cGVvZiBuZXdIVE1MICE9PSAnc3RyaW5nJykge1xuICAgICAgdHJhbnNmZXJPYmplY3QubmV3VHJlZSA9IG1ha2VOb2RlKG5ld0hUTUwpO1xuXG4gICAgICAvLyBUcmFuc2ZlciB0aGlzIGJ1ZmZlciB0byB0aGUgd29ya2VyLCB3aGljaCB3aWxsIHRha2Ugb3ZlciBhbmQgcHJvY2VzcyB0aGVcbiAgICAgIC8vIG1hcmt1cC5cbiAgICAgIHdvcmtlci5wb3N0TWVzc2FnZSh0cmFuc2Zlck9iamVjdCk7XG5cbiAgICAgIC8vIFdhaXQgZm9yIHRoZSB3b3JrZXIgdG8gZmluaXNoIHByb2Nlc3NpbmcgYW5kIHRoZW4gYXBwbHkgdGhlIHBhdGNoc2V0LlxuICAgICAgd29ya2VyLm9ubWVzc2FnZSA9IGNvbXBsZXRlV29ya2VyUmVuZGVyKGVsZW1lbnQsIGVsZW1lbnRNZXRhKTtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIExldCB0aGUgYnJvd3NlciBjb3B5IHRoZSBIVE1MIGludG8gdGhlIHdvcmtlciwgY29udmVydGluZyB0byBhXG4gICAgLy8gdHJhbnNmZXJhYmxlIG9iamVjdCBpcyB0b28gZXhwZW5zaXZlLlxuICAgIHRyYW5zZmVyT2JqZWN0Lm5ld0hUTUwgPSBuZXdIVE1MO1xuXG4gICAgLy8gQWRkIHByb3BlcnRpZXMgdG8gc2VuZCB0byB3b3JrZXIuXG4gICAgdHJhbnNmZXJPYmplY3QuaXNJbm5lciA9IG9wdGlvbnMuaW5uZXI7XG5cbiAgICAvLyBUcmFuc2ZlciB0aGlzIGJ1ZmZlciB0byB0aGUgd29ya2VyLCB3aGljaCB3aWxsIHRha2Ugb3ZlciBhbmQgcHJvY2VzcyB0aGVcbiAgICAvLyBtYXJrdXAuXG4gICAgd29ya2VyLnBvc3RNZXNzYWdlKHRyYW5zZmVyT2JqZWN0KTtcblxuICAgIC8vIFdhaXQgZm9yIHRoZSB3b3JrZXIgdG8gZmluaXNoIHByb2Nlc3NpbmcgYW5kIHRoZW4gYXBwbHkgdGhlIHBhdGNoc2V0LlxuICAgIHdvcmtlci5vbm1lc3NhZ2UgPSBjb21wbGV0ZVdvcmtlclJlbmRlcihlbGVtZW50LCBlbGVtZW50TWV0YSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgLy8gV2UncmUgcmVuZGVyaW5nIGluIHRoZSBVSSB0aHJlYWQuXG4gICAgZWxlbWVudE1ldGEuaXNSZW5kZXJpbmcgPSB0cnVlO1xuXG4gICAgbGV0IHBhdGNoZXMgPSBbXTtcbiAgICBsZXQgbmV3VHJlZSA9IG51bGw7XG5cbiAgICBpZiAodHlwZW9mIG5ld0hUTUwgPT09ICdzdHJpbmcnKSB7XG4gICAgICBuZXdUcmVlID0gcGFyc2VIVE1MKG5ld0hUTUwsIG9wdGlvbnMuaW5uZXIpXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbmV3VHJlZSA9IG1ha2VOb2RlKG5ld0hUTUwpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmlubmVyKSB7XG4gICAgICBsZXQgY2hpbGROb2RlcyA9IG5ld1RyZWU7XG5cbiAgICAgIG5ld1RyZWUgPSB7XG4gICAgICAgIGNoaWxkTm9kZXMsXG5cbiAgICAgICAgYXR0cmlidXRlczogZWxlbWVudE1ldGEub2xkVHJlZS5hdHRyaWJ1dGVzLFxuICAgICAgICBlbGVtZW50OiBlbGVtZW50TWV0YS5vbGRUcmVlLmVsZW1lbnQsXG4gICAgICAgIG5vZGVOYW1lOiBlbGVtZW50TWV0YS5vbGRUcmVlLm5vZGVOYW1lLFxuICAgICAgICBub2RlVmFsdWU6IGVsZW1lbnRNZXRhLm9sZFRyZWUubm9kZVZhbHVlXG4gICAgICB9O1xuICAgIH1cblxuICAgIGxldCBvbGRUcmVlTmFtZSA9IGVsZW1lbnRNZXRhLm9sZFRyZWUubm9kZU5hbWUgfHwgJyc7XG4gICAgbGV0IG5ld05vZGVOYW1lID0gbmV3VHJlZSAmJiBuZXdUcmVlLm5vZGVOYW1lO1xuXG4gICAgLy8gSWYgdGhlIGVsZW1lbnQgbm9kZSB0eXBlcyBtYXRjaCwgdHJ5IGFuZCBjb21wYXJlIHRoZW0uXG4gICAgaWYgKG9sZFRyZWVOYW1lID09PSBuZXdOb2RlTmFtZSkge1xuICAgICAgLy8gU3luY2hyb25pemUgdGhlIHRyZWUuXG4gICAgICBzeW5jTm9kZS5jYWxsKHBhdGNoZXMsIGVsZW1lbnRNZXRhLm9sZFRyZWUsIG5ld1RyZWUpO1xuICAgIH1cbiAgICAvLyBPdGhlcndpc2UgcmVwbGFjZSB0aGUgdG9wIGxldmVsIGVsZW1lbnRzLlxuICAgIGVsc2UgaWYgKG5ld0hUTUwpIHtcbiAgICAgIHBhdGNoZXNbcGF0Y2hlcy5sZW5ndGhdID0ge1xuICAgICAgICBfX2RvX186IDAsXG4gICAgICAgIG9sZDogZWxlbWVudE1ldGEub2xkVHJlZSxcbiAgICAgICAgbmV3OiBuZXdUcmVlXG4gICAgICB9O1xuXG4gICAgICB1bnByb3RlY3RFbGVtZW50KGVsZW1lbnRNZXRhLm9sZFRyZWUpO1xuXG4gICAgICBlbGVtZW50TWV0YS5vbGRUcmVlID0gbmV3VHJlZTtcbiAgICB9XG5cbiAgICBsZXQgY29tcGxldGVSZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIE1hcmsgdGhhdCB0aGlzIGVsZW1lbnQgaGFzIGluaXRpYWxseSByZW5kZXJlZCBhbmQgaXMgZG9uZSByZW5kZXJpbmcuXG4gICAgICBlbGVtZW50TWV0YS5pc1JlbmRlcmluZyA9IGZhbHNlO1xuXG4gICAgICAvLyBTZXQgdGhlIGlubmVySFRNTC5cbiAgICAgIGVsZW1lbnRNZXRhLl9pbm5lckhUTUwgPSBlbGVtZW50LmlubmVySFRNTDtcbiAgICAgIGVsZW1lbnRNZXRhLl9vdXRlckhUTUwgPSBlbGVtZW50Lm91dGVySFRNTDtcbiAgICAgIGVsZW1lbnRNZXRhLl90ZXh0Q29udGVudCA9IGVsZW1lbnQudGV4dENvbnRlbnQ7XG5cbiAgICAgIGNsZWFuTWVtb3J5KCk7XG5cbiAgICAgIC8vIENsZWFuIG91dCB0aGUgcGF0Y2hlcyBhcnJheS5cbiAgICAgIHBhdGNoZXMubGVuZ3RoID0gMDtcblxuICAgICAgLy8gRGlzcGF0Y2ggYW4gZXZlbnQgb24gdGhlIGVsZW1lbnQgb25jZSByZW5kZXJpbmcgaGFzIGNvbXBsZXRlZC5cbiAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ3JlbmRlckNvbXBsZXRlJykpO1xuXG4gICAgICAvLyBUT0RPIFVwZGF0ZSB0aGlzIGNvbW1lbnQgYW5kL29yIHJlZmFjdG9yIHRvIHVzZSB0aGUgc2FtZSBhcyB0aGUgV29ya2VyLlxuICAgICAgbmV4dFJlbmRlcigpO1xuICAgIH07XG5cbiAgICAvLyBQcm9jZXNzIHRoZSBkYXRhIGltbWVkaWF0ZWx5IGFuZCB3YWl0IHVudGlsIGFsbCB0cmFuc2l0aW9uIGNhbGxiYWNrc1xuICAgIC8vIGhhdmUgY29tcGxldGVkLlxuICAgIHRyeSB7XG4gICAgICB2YXIgcHJvY2Vzc1Byb21pc2UgPSBwcm9jZXNzUGF0Y2hlcyhlbGVtZW50LCBwYXRjaGVzKTtcbiAgICB9IGNhdGNoIChleCkgeyBjb25zb2xlLmxvZyhleCk7IH1cblxuICAgIC8vIE9wZXJhdGUgc3luY2hyb25vdXNseSB1bmxlc3Mgb3B0ZWQgaW50byBhIFByb21pc2UtY2hhaW4uXG4gICAgaWYgKHByb2Nlc3NQcm9taXNlKSB7IHByb2Nlc3NQcm9taXNlLnRoZW4oY29tcGxldGVSZW5kZXIpOyB9XG4gICAgZWxzZSB7IGNvbXBsZXRlUmVuZGVyKCk7IH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgcG9vbHMgYXMgX3Bvb2xzIH0gZnJvbSAnLi4vdXRpbC9wb29scyc7XG5pbXBvcnQge1xuICBwcm90ZWN0RWxlbWVudCBhcyBfcHJvdGVjdEVsZW1lbnQsXG4gIHVucHJvdGVjdEVsZW1lbnQgYXMgX3VucHJvdGVjdEVsZW1lbnRcbn0gZnJvbSAnLi4vdXRpbC9tZW1vcnknO1xuXG52YXIgcG9vbHMgPSBfcG9vbHM7XG52YXIgcHJvdGVjdEVsZW1lbnQgPSBfcHJvdGVjdEVsZW1lbnQ7XG52YXIgdW5wcm90ZWN0RWxlbWVudCA9IF91bnByb3RlY3RFbGVtZW50O1xuXG5jb25zdCBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcblxuLyoqXG4gKiBTeW5jaHJvbml6ZXMgY2hhbmdlcyBmcm9tIHRoZSBuZXdUcmVlIGludG8gdGhlIG9sZFRyZWUuXG4gKlxuICogQHBhcmFtIG9sZFRyZWVcbiAqIEBwYXJhbSBuZXdUcmVlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHN5bmMob2xkVHJlZSwgbmV3VHJlZSkge1xuICBsZXQgcGF0Y2hlcyA9IHRoaXM7XG4gIGxldCBvbGRDaGlsZE5vZGVzID0gb2xkVHJlZS5jaGlsZE5vZGVzO1xuICBsZXQgb2xkQ2hpbGROb2Rlc0xlbmd0aCA9IG9sZENoaWxkTm9kZXMgPyBvbGRDaGlsZE5vZGVzLmxlbmd0aCA6IDA7XG4gIGxldCBvbGRFbGVtZW50ID0gb2xkVHJlZS5lbGVtZW50O1xuICBsZXQgdGV4dEVsZW1lbnRzID0gWydzY3JpcHQnLCAnc3R5bGUnLCAndGV4dGFyZWEnLCAnI3RleHQnXTtcblxuICBpZiAoIW5ld1RyZWUpIHtcbiAgICBsZXQgcmVtb3ZlZCA9IG9sZENoaWxkTm9kZXMuc3BsaWNlKDAsIG9sZENoaWxkTm9kZXNMZW5ndGgpO1xuXG4gICAgcGF0Y2hlc1twYXRjaGVzLmxlbmd0aF0gPSB7IF9fZG9fXzogLTEsIGVsZW1lbnQ6IG9sZEVsZW1lbnQgfTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVtb3ZlZC5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gVXNlZCBieSB0aGUgV29ya2VyIHRvIHRyYWNrIGVsZW1lbnRzIHJlbW92ZWQuXG4gICAgICBpZiAocGF0Y2hlcy5yZW1vdmFscykgeyBwYXRjaGVzLnJlbW92YWxzLnB1c2gocmVtb3ZlZFtpXS5lbGVtZW50KTsgfVxuXG4gICAgICB1bnByb3RlY3RFbGVtZW50KHJlbW92ZWRbaV0pO1xuICAgIH1cblxuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCBub2RlVmFsdWUgPSBuZXdUcmVlLm5vZGVWYWx1ZTtcbiAgbGV0IGNoaWxkTm9kZXMgPSBuZXdUcmVlLmNoaWxkTm9kZXM7XG4gIGxldCBjaGlsZE5vZGVzTGVuZ3RoID0gY2hpbGROb2RlcyA/IGNoaWxkTm9kZXMubGVuZ3RoIDogMDtcbiAgbGV0IG5ld0VsZW1lbnQgPSBuZXdUcmVlLmVsZW1lbnQ7XG5cbiAgLy8gSWYgdGhlIGVsZW1lbnQgd2UncmUgcmVwbGFjaW5nIGlzIHRvdGFsbHkgZGlmZmVyZW50IGZyb20gdGhlIHByZXZpb3VzXG4gIC8vIHJlcGxhY2UgdGhlIGVudGlyZSBlbGVtZW50LCBkb24ndCBib3RoZXIgaW52ZXN0aWdhdGluZyBjaGlsZHJlbi5cbiAgaWYgKG9sZFRyZWUubm9kZU5hbWUgIT09IG5ld1RyZWUubm9kZU5hbWUpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBSZXBsYWNlIHRleHQgbm9kZSB2YWx1ZXMgaWYgdGhleSBhcmUgZGlmZmVyZW50LlxuICBpZiAodGV4dEVsZW1lbnRzLmluZGV4T2YobmV3VHJlZS5ub2RlTmFtZSkgPiAtMSkge1xuICAgIC8vIFRleHQgY2hhbmdlZC5cbiAgICBpZiAob2xkVHJlZS5ub2RlVmFsdWUgIT09IG5vZGVWYWx1ZSkge1xuICAgICAgb2xkVHJlZS5ub2RlVmFsdWUgPSBub2RlVmFsdWU7XG5cbiAgICAgIHBhdGNoZXNbcGF0Y2hlcy5sZW5ndGhdID0ge1xuICAgICAgICBfX2RvX186IDMsXG4gICAgICAgIGVsZW1lbnQ6IG9sZEVsZW1lbnQsXG4gICAgICAgIHZhbHVlOiBub2RlVmFsdWVcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gTW9zdCBjb21tb24gYWRkaXRpdmUgZWxlbWVudHMuXG4gIGlmIChjaGlsZE5vZGVzTGVuZ3RoID4gb2xkQ2hpbGROb2Rlc0xlbmd0aCkge1xuICAgIC8vIFN0b3JlIGVsZW1lbnRzIGluIGEgRG9jdW1lbnRGcmFnbWVudCB0byBpbmNyZWFzZSBwZXJmb3JtYW5jZSBhbmQgYmVcbiAgICAvLyBnZW5lcmFsbHkgc2ltcGxpZXIgdG8gd29yayB3aXRoLlxuICAgIGxldCBmcmFnbWVudCA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IG9sZENoaWxkTm9kZXNMZW5ndGg7IGkgPCBjaGlsZE5vZGVzTGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIFVzZWQgYnkgdGhlIFdvcmtlciB0byB0cmFjayBlbGVtZW50cyBhZGRlZC5cbiAgICAgIGlmIChwYXRjaGVzLmFkZGl0aW9ucykgeyBwYXRjaGVzLmFkZGl0aW9ucy5wdXNoKGNoaWxkTm9kZXNbaV0pOyB9XG5cbiAgICAgIHByb3RlY3RFbGVtZW50KGNoaWxkTm9kZXNbaV0pO1xuXG4gICAgICAvLyBJbnRlcm5hbGx5IGFkZCB0byB0aGUgdHJlZS5cbiAgICAgIG9sZENoaWxkTm9kZXNbb2xkQ2hpbGROb2Rlcy5sZW5ndGhdID0gY2hpbGROb2Rlc1tpXTtcblxuICAgICAgLy8gQWRkIHRvIHRoZSBkb2N1bWVudCBmcmFnbWVudC5cbiAgICAgIGZyYWdtZW50W2ZyYWdtZW50Lmxlbmd0aF0gPSBjaGlsZE5vZGVzW2ldO1xuICAgIH1cblxuICAgIC8vIEFzc2lnbiB0aGUgZnJhZ21lbnQgdG8gdGhlIHBhdGNoZXMgdG8gYmUgaW5qZWN0ZWQuXG4gICAgcGF0Y2hlc1twYXRjaGVzLmxlbmd0aF0gPSB7XG4gICAgICBfX2RvX186IDEsXG4gICAgICBlbGVtZW50OiBvbGRFbGVtZW50LFxuICAgICAgZnJhZ21lbnQ6IGZyYWdtZW50XG4gICAgfTtcbiAgfVxuXG4gIC8vIFJlcGxhY2UgZWxlbWVudHMgaWYgdGhleSBhcmUgZGlmZmVyZW50LlxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkTm9kZXNMZW5ndGg7IGkrKykge1xuICAgIGlmIChvbGRDaGlsZE5vZGVzW2ldLm5vZGVOYW1lICE9PSBjaGlsZE5vZGVzW2ldLm5vZGVOYW1lKSB7XG4gICAgICAvLyBBZGQgdG8gdGhlIHBhdGNoZXMuXG4gICAgICBwYXRjaGVzW3BhdGNoZXMubGVuZ3RoXSA9IHtcbiAgICAgICAgX19kb19fOiAxLFxuICAgICAgICBvbGQ6IG9sZENoaWxkTm9kZXNbaV0sXG4gICAgICAgIG5ldzogY2hpbGROb2Rlc1tpXVxuICAgICAgfTtcblxuICAgICAgLy8gVXNlZCBieSB0aGUgV29ya2VyIHRvIHRyYWNrIGVsZW1lbnRzIHJlbW92ZWQuXG4gICAgICBpZiAocGF0Y2hlcy5yZW1vdmFscykge1xuICAgICAgICBwYXRjaGVzLnJlbW92YWxzLnB1c2gob2xkQ2hpbGROb2Rlc1tpXS5lbGVtZW50KTtcbiAgICAgIH1cblxuICAgICAgLy8gVXNlZCBieSB0aGUgV29ya2VyIHRvIHRyYWNrIGVsZW1lbnRzIGFkZGVkLlxuICAgICAgaWYgKHBhdGNoZXMuYWRkaXRpb25zKSB7IHBhdGNoZXMuYWRkaXRpb25zLnB1c2goY2hpbGROb2Rlc1tpXSk7IH1cblxuICAgICAgdW5wcm90ZWN0RWxlbWVudChvbGRDaGlsZE5vZGVzW2ldKTtcbiAgICAgIHByb3RlY3RFbGVtZW50KGNoaWxkTm9kZXNbaV0pO1xuXG4gICAgICAvLyBSZXBsYWNlIHRoZSBpbnRlcm5hbCB0cmVlJ3MgcG9pbnQgb2YgdmlldyBvZiB0aGlzIGVsZW1lbnQuXG4gICAgICBvbGRDaGlsZE5vZGVzW2ldID0gY2hpbGROb2Rlc1tpXTtcbiAgICB9XG4gIH1cblxuICAvLyBSZW1vdmUgdGhlc2UgZWxlbWVudHMuXG4gIGlmIChvbGRDaGlsZE5vZGVzTGVuZ3RoID4gY2hpbGROb2Rlc0xlbmd0aCkge1xuICAgIC8vIEVsZW1lbnRzIHRvIHJlbW92ZS5cbiAgICBsZXQgdG9SZW1vdmUgPSBzbGljZS5jYWxsKG9sZENoaWxkTm9kZXMsIGNoaWxkTm9kZXNMZW5ndGgsXG4gICAgICBvbGRDaGlsZE5vZGVzTGVuZ3RoKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG9SZW1vdmUubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIFJlbW92ZSB0aGUgZWxlbWVudCwgdGhpcyBoYXBwZW5zIGJlZm9yZSB0aGUgc3BsaWNlIHNvIHRoYXQgd2Ugc3RpbGxcbiAgICAgIC8vIGhhdmUgYWNjZXNzIHRvIHRoZSBlbGVtZW50LlxuICAgICAgcGF0Y2hlc1twYXRjaGVzLmxlbmd0aF0gPSB7IF9fZG9fXzogMSwgb2xkOiB0b1JlbW92ZVtpXS5lbGVtZW50IH07XG4gICAgfVxuXG4gICAgbGV0IHJlbW92ZWQgPSBvbGRDaGlsZE5vZGVzLnNwbGljZShjaGlsZE5vZGVzTGVuZ3RoLFxuICAgICAgb2xkQ2hpbGROb2Rlc0xlbmd0aCAtIGNoaWxkTm9kZXNMZW5ndGgpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZW1vdmVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBVc2VkIGJ5IHRoZSBXb3JrZXIgdG8gdHJhY2sgZWxlbWVudHMgcmVtb3ZlZC5cbiAgICAgIGlmIChwYXRjaGVzLnJlbW92YWxzKSB7IHBhdGNoZXMucmVtb3ZhbHMucHVzaChyZW1vdmVkW2ldLmVsZW1lbnQpOyB9XG5cbiAgICAgIHVucHJvdGVjdEVsZW1lbnQocmVtb3ZlZFtpXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gU3luY2hyb25pemUgYXR0cmlidXRlc1xuICBsZXQgYXR0cmlidXRlcyA9IG5ld1RyZWUuYXR0cmlidXRlcztcblxuICBpZiAoYXR0cmlidXRlcykge1xuICAgIGxldCBvbGRMZW5ndGggPSBvbGRUcmVlLmF0dHJpYnV0ZXMubGVuZ3RoO1xuICAgIGxldCBuZXdMZW5ndGggPSBhdHRyaWJ1dGVzLmxlbmd0aDtcblxuICAgIC8vIFN0YXJ0IHdpdGggdGhlIG1vc3QgY29tbW9uLCBhZGRpdGl2ZS5cbiAgICBpZiAobmV3TGVuZ3RoID4gb2xkTGVuZ3RoKSB7XG4gICAgICBsZXQgdG9BZGQgPSBzbGljZS5jYWxsKGF0dHJpYnV0ZXMsIG9sZExlbmd0aCk7XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG9BZGQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IGNoYW5nZSA9IHtcbiAgICAgICAgICBfX2RvX186IDIsXG4gICAgICAgICAgZWxlbWVudDogb2xkRWxlbWVudCxcbiAgICAgICAgICBuYW1lOiB0b0FkZFtpXS5uYW1lLFxuICAgICAgICAgIHZhbHVlOiB0b0FkZFtpXS52YWx1ZSxcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgYXR0ciA9IHBvb2xzLmF0dHJpYnV0ZU9iamVjdC5nZXQoKTtcbiAgICAgICAgYXR0ci5uYW1lID0gdG9BZGRbaV0ubmFtZTtcbiAgICAgICAgYXR0ci52YWx1ZSA9IHRvQWRkW2ldLnZhbHVlO1xuXG4gICAgICAgIHBvb2xzLmF0dHJpYnV0ZU9iamVjdC5wcm90ZWN0KGF0dHIpO1xuXG4gICAgICAgIC8vIFB1c2ggdGhlIGNoYW5nZSBvYmplY3QgaW50byBpbnRvIHRoZSB2aXJ0dWFsIHRyZWUuXG4gICAgICAgIG9sZFRyZWUuYXR0cmlidXRlc1tvbGRUcmVlLmF0dHJpYnV0ZXMubGVuZ3RoXSA9IGF0dHI7XG5cbiAgICAgICAgLy8gQWRkIHRoZSBjaGFuZ2UgdG8gdGhlIHNlcmllcyBvZiBwYXRjaGVzLlxuICAgICAgICBwYXRjaGVzW3BhdGNoZXMubGVuZ3RoXSA9IGNoYW5nZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgcmVtb3ZhbHMuXG4gICAgaWYgKG9sZExlbmd0aCA+IG5ld0xlbmd0aCkge1xuICAgICAgbGV0IHRvUmVtb3ZlID0gc2xpY2UuY2FsbChvbGRUcmVlLmF0dHJpYnV0ZXMsIG5ld0xlbmd0aCk7XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG9SZW1vdmUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IGNoYW5nZSA9IHtcbiAgICAgICAgICBfX2RvX186IDIsXG4gICAgICAgICAgZWxlbWVudDogb2xkRWxlbWVudCxcbiAgICAgICAgICBuYW1lOiB0b1JlbW92ZVtpXS5uYW1lLFxuICAgICAgICAgIHZhbHVlOiB1bmRlZmluZWQsXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBhdHRyaWJ1dGUgZnJvbSB0aGUgdmlydHVhbCBub2RlLlxuICAgICAgICBsZXQgcmVtb3ZlZCA9IG9sZFRyZWUuYXR0cmlidXRlcy5zcGxpY2UoaSwgMSk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZW1vdmVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgcG9vbHMuYXR0cmlidXRlT2JqZWN0LnVucHJvdGVjdChyZW1vdmVkW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCB0aGUgY2hhbmdlIHRvIHRoZSBzZXJpZXMgb2YgcGF0Y2hlcy5cbiAgICAgICAgcGF0Y2hlc1twYXRjaGVzLmxlbmd0aF0gPSBjaGFuZ2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIG1vZGlmaWNhdGlvbnMuXG4gICAgbGV0IHRvTW9kaWZ5ID0gYXR0cmlidXRlcztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG9Nb2RpZnkubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBvbGRBdHRyVmFsdWUgPSBvbGRUcmVlLmF0dHJpYnV0ZXNbaV0gJiYgb2xkVHJlZS5hdHRyaWJ1dGVzW2ldLnZhbHVlO1xuICAgICAgbGV0IG5ld0F0dHJWYWx1ZSA9IGF0dHJpYnV0ZXNbaV0gJiYgYXR0cmlidXRlc1tpXS52YWx1ZTtcblxuICAgICAgLy8gT25seSBwdXNoIGluIGEgY2hhbmdlIGlmIHRoZSBhdHRyaWJ1dGUgb3IgdmFsdWUgY2hhbmdlcy5cbiAgICAgIGlmIChvbGRBdHRyVmFsdWUgIT09IG5ld0F0dHJWYWx1ZSkge1xuICAgICAgICBsZXQgY2hhbmdlID0ge1xuICAgICAgICAgIF9fZG9fXzogMixcbiAgICAgICAgICBlbGVtZW50OiBvbGRFbGVtZW50LFxuICAgICAgICAgIG5hbWU6IHRvTW9kaWZ5W2ldLm5hbWUsXG4gICAgICAgICAgdmFsdWU6IHRvTW9kaWZ5W2ldLnZhbHVlLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFJlcGxhY2UgdGhlIGF0dHJpYnV0ZSBpbiB0aGUgdmlydHVhbCBub2RlLlxuICAgICAgICBsZXQgYXR0ciA9IG9sZFRyZWUuYXR0cmlidXRlc1tpXTtcbiAgICAgICAgYXR0ci5uYW1lID0gdG9Nb2RpZnlbaV0ubmFtZTtcbiAgICAgICAgYXR0ci52YWx1ZSA9IHRvTW9kaWZ5W2ldLnZhbHVlO1xuXG4gICAgICAgIC8vIEFkZCB0aGUgY2hhbmdlIHRvIHRoZSBzZXJpZXMgb2YgcGF0Y2hlcy5cbiAgICAgICAgcGF0Y2hlc1twYXRjaGVzLmxlbmd0aF0gPSBjaGFuZ2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gU3luYyBlYWNoIGN1cnJlbnQgbm9kZS5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBvbGRDaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKG9sZENoaWxkTm9kZXNbaV0uZWxlbWVudCAhPT0gY2hpbGROb2Rlc1tpXS5lbGVtZW50KSB7XG4gICAgICBzeW5jLmNhbGwocGF0Y2hlcywgb2xkVHJlZS5jaGlsZE5vZGVzW2ldLCBjaGlsZE5vZGVzW2ldKTtcbiAgICB9XG4gIH1cbn1cbiIsIi8vIENhY2hlIHByZWJ1aWx0IHRyZWVzIGFuZCBsb29rdXAgYnkgZWxlbWVudC5cbmV4cG9ydCBjb25zdCBUcmVlQ2FjaGUgPSBuZXcgV2Vha01hcCgpO1xuIiwiaW1wb3J0IHsgdHJhbnNpdGlvblN0YXRlcyB9IGZyb20gJy4uL3RyYW5zaXRpb25zJztcbmltcG9ydCB7IHBvb2xzIH0gZnJvbSAnLi4vdXRpbC9wb29scyc7XG5pbXBvcnQgZGVjb2RlRW50aXRpZXMgZnJvbSAnLi4vdXRpbC9kZWNvZGUnO1xuaW1wb3J0IGdldEVsZW1lbnQgZnJvbSAnLi4vZWxlbWVudC9nZXQnO1xuaW1wb3J0IHsgY29tcG9uZW50cyB9IGZyb20gJy4uL2VsZW1lbnQvY3VzdG9tJztcbmltcG9ydCBtYWtlTm9kZSBmcm9tICcuLi9ub2RlL21ha2UnO1xuXG52YXIgZm9yRWFjaCA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoO1xudmFyIGVtcHR5ID0geyBwcm90b3R5cGU6IHt9IH07XG5cbi8qKlxuICogUHJvY2Vzc2VzIGFuIEFycmF5IG9mIHBhdGNoZXMuXG4gKlxuICogQHBhcmFtIGVsZW1lbnQgLSBFbGVtZW50IHRvIHByb2Nlc3MgcGF0Y2hzZXRzIG9uLlxuICogQHBhcmFtIGUgLSBPYmplY3QgdGhhdCBjb250YWlucyBwYXRjaGVzLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwcm9jZXNzKGVsZW1lbnQsIHBhdGNoZXMpIHtcbiAgdmFyIHN0YXRlcyA9IHRyYW5zaXRpb25TdGF0ZXM7XG4gIHZhciBwcm9taXNlcyA9IFtdO1xuICB2YXIgYWRkUHJvbWlzZXMgPSBwcm9taXNlcy5wdXNoLmFwcGx5LmJpbmQocHJvbWlzZXMucHVzaCwgcHJvbWlzZXMpO1xuXG4gIC8vIFRyaWdnZXIgdGhlIGF0dGFjaGVkIHRyYW5zaXRpb24gc3RhdGUgZm9yIHRoaXMgZWxlbWVudCBhbmQgYWxsIGNoaWxkTm9kZXMuXG4gIHZhciBhdHRhY2hlZFRyYW5zaXRpb25BbmRUaXRsZSA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgdmFyIGVsZW1lbnQgPSBnZXRFbGVtZW50KGVsKS5lbGVtZW50O1xuXG4gICAgaWYgKGVsLm5vZGVOYW1lID09PSAnI3RleHQnIHx8IGVsLm5vZGVOYW1lID09PSAndGV4dCcpIHtcbiAgICAgIC8vIFRyaWdnZXIgYWxsIHRoZSB0ZXh0IGNoYW5nZWQgdmFsdWVzLlxuICAgICAgaWYgKHN0YXRlcyAmJiBzdGF0ZXMudGV4dENoYW5nZWQgJiYgc3RhdGVzLnRleHRDaGFuZ2VkLmxlbmd0aCkge1xuICAgICAgICBhZGRQcm9taXNlcyhzdGF0ZXMudGV4dENoYW5nZWQubWFwKGNhbGxiYWNrID0+IHtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZWxlbWVudC5wYXJlbnROb2RlIHx8IGVsZW1lbnQsIG51bGwsIGVsLm5vZGVWYWx1ZSk7XG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gQWRkZWQgc3RhdGUgZm9yIHRyYW5zaXRpb25zIEFQSS5cbiAgICBlbHNlIGlmIChzdGF0ZXMgJiYgc3RhdGVzLmF0dGFjaGVkICYmIHN0YXRlcy5hdHRhY2hlZC5sZW5ndGgpIHtcbiAgICAgIGFkZFByb21pc2VzKHN0YXRlcy5hdHRhY2hlZC5tYXAoY2FsbENhbGxiYWNrLCBlbGVtZW50KSk7XG4gICAgfVxuXG4gICAgLy8gQ2FsbCBhbGwgYGNoaWxkTm9kZXNgIGF0dGFjaGVkIGNhbGxiYWNrcyBhcyB3ZWxsLlxuICAgIGVsLmNoaWxkTm9kZXMuZm9yRWFjaChhdHRhY2hlZFRyYW5zaXRpb25BbmRUaXRsZSk7XG5cbiAgICB0aXRsZUNhbGxiYWNrKGVsKTtcbiAgfTtcblxuICB2YXIgY2FsbENhbGxiYWNrID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICByZXR1cm4gY2FsbGJhY2sodGhpcyk7XG4gIH07XG5cbiAgdmFyIGF0dGFjaGVkQ2FsbGJhY2sgPSBmdW5jdGlvbihlbGVtZW50RGVzY3JpcHRvcikge1xuICAgIGxldCBlbCA9IGdldEVsZW1lbnQoZWxlbWVudERlc2NyaXB0b3IpLmVsZW1lbnQ7XG4gICAgbGV0IGZyYWdtZW50ID0gdGhpcy5mcmFnbWVudDtcbiAgICBsZXQgY3VzdG9tRWxlbWVudCA9IGNvbXBvbmVudHNbZWxlbWVudERlc2NyaXB0b3Iubm9kZU5hbWVdIHx8IGVtcHR5O1xuXG4gICAgaWYgKGN1c3RvbUVsZW1lbnQucHJvdG90eXBlLmF0dGFjaGVkQ2FsbGJhY2spIHtcbiAgICAgIGN1c3RvbUVsZW1lbnQucHJvdG90eXBlLmF0dGFjaGVkQ2FsbGJhY2suY2FsbChlbCk7XG4gICAgfVxuXG4gICAgaWYgKGVsLm5vZGVOYW1lID09PSAnI3RleHQnKSB7XG4gICAgICBlbC50ZXh0Q29udGVudCA9IGRlY29kZUVudGl0aWVzKGVsLnRleHRDb250ZW50KTtcbiAgICB9XG5cbiAgICBpZiAoZWxlbWVudERlc2NyaXB0b3IuY2hpbGROb2Rlcykge1xuICAgICAgZWxlbWVudERlc2NyaXB0b3IuY2hpbGROb2Rlcy5mb3JFYWNoKGF0dGFjaGVkQ2FsbGJhY2ssIHtcbiAgICAgICAgZnJhZ21lbnQ6IGZhbHNlXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoZnJhZ21lbnQpIHtcbiAgICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGVsKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIHRpdGxlQ2FsbGJhY2sgPSBmdW5jdGlvbihlbGVtZW50RGVzY3JpcHRvcikge1xuICAgIGxldCBlbCA9IGdldEVsZW1lbnQoZWxlbWVudERlc2NyaXB0b3IpLmVsZW1lbnQ7XG5cbiAgICAvLyBFbnN1cmUgdGhlIHRpdGxlIGlzIHNldCBjb3JyZWN0bHkuXG4gICAgaWYgKGVsLnRhZ05hbWUgPT09ICd0aXRsZScpIHtcbiAgICAgIGVsLm93bmVyRG9jdW1lbnQudGl0bGUgPSBlbC5jaGlsZE5vZGVzWzBdLm5vZGVWYWx1ZTtcbiAgICB9XG4gIH07XG5cbiAgLy8gTG9vcCB0aHJvdWdoIGFsbCB0aGUgcGF0Y2hlcyBhbmQgYXBwbHkgdGhlbS5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IHBhdGNoID0gcGF0Y2hlc1tpXTtcbiAgICBsZXQgbmV3RGVzY3JpcHRvciwgb2xkRGVzY3JpcHRvciwgZWxlbWVudERlc2NyaXB0b3I7XG4gICAgbGV0IGVsZW1lbnQgPSBwYXRjaC5uZXc7XG5cbiAgICBpZiAocGF0Y2guZWxlbWVudCkge1xuICAgICAgZWxlbWVudERlc2NyaXB0b3IgPSBwYXRjaC5lbGVtZW50O1xuXG4gICAgICBsZXQgcmVzdWx0ID0gZ2V0RWxlbWVudChwYXRjaC5lbGVtZW50KTtcbiAgICAgIHBhdGNoLmVsZW1lbnQgPSByZXN1bHQuZWxlbWVudDtcbiAgICB9XG5cbiAgICBpZiAocGF0Y2gub2xkKSB7XG4gICAgICBvbGREZXNjcmlwdG9yID0gcGF0Y2gub2xkO1xuXG4gICAgICBsZXQgcmVzdWx0ID0gZ2V0RWxlbWVudChwYXRjaC5vbGQpO1xuICAgICAgaWYgKHJlc3VsdC5lbGVtZW50Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgIT09IG9sZERlc2NyaXB0b3Iubm9kZU5hbWUgJiYgdHlwZW9mIG9sZERlc2NyaXB0b3IgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTb21ldGhpbmcgZnVja3kgaXMgZ29pbmcgb24nLCBvbGREZXNjcmlwdG9yKTtcbiAgICAgIH1cbiAgICAgIHBhdGNoLm9sZCA9IHJlc3VsdC5lbGVtZW50O1xuICAgIH1cblxuICAgIGlmIChwYXRjaC5uZXcpIHtcbiAgICAgIG5ld0Rlc2NyaXB0b3IgPSBwYXRjaC5uZXc7XG5cbiAgICAgIGxldCByZXN1bHQgPSBnZXRFbGVtZW50KHBhdGNoLm5ldyk7XG4gICAgICBwYXRjaC5uZXcgPSByZXN1bHQuZWxlbWVudDtcbiAgICB9XG5cbiAgICBpZiAoZWxlbWVudCAmJiBlbGVtZW50Lm5vZGVOYW1lID09PSAnI3RleHQnKSB7XG4gICAgICBwYXRjaC5uZXcudGV4dENvbnRlbnQgPSBkZWNvZGVFbnRpdGllcyhlbGVtZW50Lm5vZGVWYWx1ZSk7XG4gICAgfVxuXG4gICAgLy8gUmVwbGFjZSB0aGUgZW50aXJlIE5vZGUuXG4gICAgaWYgKHBhdGNoLl9fZG9fXyA9PT0gMCkge1xuICAgICAgcGF0Y2gub2xkLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHBhdGNoLm5ldywgcGF0Y2gub2xkKTtcblxuICAgICAgbGV0IG9sZEN1c3RvbUVsZW1lbnQgPSBjb21wb25lbnRzW29sZERlc2NyaXB0b3Iubm9kZU5hbWVdIHx8IGVtcHR5O1xuICAgICAgbGV0IG5ld0N1c3RvbUVsZW1lbnQgPSBjb21wb25lbnRzW25ld0Rlc2NyaXB0b3Iubm9kZU5hbWVdIHx8IGVtcHR5O1xuXG4gICAgICBpZiAob2xkQ3VzdG9tRWxlbWVudC5wcm90b3R5cGUuZGV0YWNoZWRDYWxsYmFjaykge1xuICAgICAgICBvbGRDdXN0b21FbGVtZW50LnByb3RvdHlwZS5kZXRhY2hlZENhbGxiYWNrLmNhbGwocGF0Y2gub2xkKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG5ld0N1c3RvbUVsZW1lbnQucHJvdG90eXBlLmF0dGFjaGVkQ2FsbGJhY2spIHtcbiAgICAgICAgbmV3Q3VzdG9tRWxlbWVudC5wcm90b3R5cGUuYXR0YWNoZWRDYWxsYmFjay5jYWxsKHBhdGNoLm5ldyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTm9kZSBtYW5pcC5cbiAgICBlbHNlIGlmIChwYXRjaC5fX2RvX18gPT09IDEpIHtcbiAgICAgIC8vIEFkZC5cbiAgICAgIGlmIChwYXRjaC5lbGVtZW50ICYmIHBhdGNoLmZyYWdtZW50ICYmICFwYXRjaC5vbGQpIHtcbiAgICAgICAgbGV0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuXG4gICAgICAgIHBhdGNoLmZyYWdtZW50LmZvckVhY2goYXR0YWNoZWRDYWxsYmFjaywgeyBmcmFnbWVudCB9KTtcbiAgICAgICAgcGF0Y2guZWxlbWVudC5hcHBlbmRDaGlsZChmcmFnbWVudCk7XG5cbiAgICAgICAgZm9yRWFjaC5jYWxsKHBhdGNoLmZyYWdtZW50LCBhdHRhY2hlZFRyYW5zaXRpb25BbmRUaXRsZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFJlbW92ZS5cbiAgICAgIGVsc2UgaWYgKHBhdGNoLm9sZCAmJiAhcGF0Y2gubmV3KSB7XG4gICAgICAgIGlmICghcGF0Y2gub2xkLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhblxcJ3QgcmVtb3ZlIHdpdGhvdXQgcGFyZW50LCBpcyB0aGlzIHRoZSAnICtcbiAgICAgICAgICAgICdkb2N1bWVudCByb290PycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRW5zdXJlIHRoZSB0aXRsZSBpcyBlbXB0aWVkLlxuICAgICAgICBpZiAocGF0Y2gub2xkLnRhZ05hbWUgPT09ICd0aXRsZScpIHtcbiAgICAgICAgICBwYXRjaC5vbGQub3duZXJEb2N1bWVudC50aXRsZSA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGN1c3RvbUVsZW1lbnQgPSBjb21wb25lbnRzW29sZERlc2NyaXB0b3Iubm9kZU5hbWVdIHx8IGVtcHR5O1xuXG4gICAgICAgIGlmIChjdXN0b21FbGVtZW50LnByb3RvdHlwZS5kZXRhY2hlZENhbGxiYWNrKSB7XG4gICAgICAgICAgY3VzdG9tRWxlbWVudC5wcm90b3R5cGUuZGV0YWNoZWRDYWxsYmFjay5jYWxsKHBhdGNoLm9sZCk7XG4gICAgICAgIH1cblxuICAgICAgICBwYXRjaC5vbGQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChwYXRjaC5vbGQpO1xuXG4gICAgICAgIGlmIChzdGF0ZXMgJiYgc3RhdGVzLmRldGFjaGVkICYmIHN0YXRlcy5kZXRhY2hlZC5sZW5ndGgpIHtcbiAgICAgICAgICBhZGRQcm9taXNlcyhzdGF0ZXMuZGV0YWNoZWQubWFwKGNhbGxDYWxsYmFjaywgcGF0Y2gub2xkKSk7XG4gICAgICAgIH1cblxuICAgICAgICBtYWtlTm9kZS5ub2Rlc1tvbGREZXNjcmlwdG9yLmVsZW1lbnRdID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICAvLyBSZXBsYWNlLlxuICAgICAgZWxzZSBpZiAocGF0Y2gub2xkICYmIHBhdGNoLm5ldykge1xuICAgICAgICBpZiAoIXBhdGNoLm9sZC5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5cXCd0IHJlcGxhY2Ugd2l0aG91dCBwYXJlbnQsIGlzIHRoaXMgdGhlICcgK1xuICAgICAgICAgICAgJ2RvY3VtZW50IHJvb3Q/Jyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBcHBlbmQgdGhlIGVsZW1lbnQgZmlyc3QsIGJlZm9yZSBkb2luZyB0aGUgcmVwbGFjZW1lbnQuXG4gICAgICAgIHBhdGNoLm9sZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShwYXRjaC5uZXcsIHBhdGNoLm9sZC5uZXh0U2libGluZyk7XG5cbiAgICAgICAgLy8gUmVtb3ZlZCBzdGF0ZSBmb3IgdHJhbnNpdGlvbnMgQVBJLlxuICAgICAgICBpZiAoc3RhdGVzICYmIHN0YXRlcy5kZXRhY2hlZCAmJiBzdGF0ZXMuZGV0YWNoZWQubGVuZ3RoKSB7XG4gICAgICAgICAgYWRkUHJvbWlzZXMoc3RhdGVzLmRldGFjaGVkLm1hcChjYWxsQ2FsbGJhY2ssIHBhdGNoLm9sZCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVwbGFjZWQgc3RhdGUgZm9yIHRyYW5zaXRpb25zIEFQSS5cbiAgICAgICAgaWYgKHN0YXRlcyAmJiBzdGF0ZXMucmVwbGFjZWQgJiYgc3RhdGVzLnJlcGxhY2VkLmxlbmd0aCkge1xuICAgICAgICAgIGFkZFByb21pc2VzKHN0YXRlcy5yZXBsYWNlZC5tYXAoY2FsbGJhY2sgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHBhdGNoLm9sZCwgcGF0Y2gubmV3KTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFbnN1cmUgdGhlIHRpdGxlIGlzIHNldCBjb3JyZWN0bHkuXG4gICAgICAgIGlmIChwYXRjaC5uZXcudGFnTmFtZSA9PT0gJ3RpdGxlJykge1xuICAgICAgICAgIHBhdGNoLm9sZC5vd25lckRvY3VtZW50LnRpdGxlID0gcGF0Y2gubmV3LmNoaWxkTm9kZXNbMF0ubm9kZVZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcGF0Y2gub2xkLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHBhdGNoLm5ldywgcGF0Y2gub2xkKTtcblxuICAgICAgICBsZXQgb2xkQ3VzdG9tRWxlbWVudCA9IGNvbXBvbmVudHNbb2xkRGVzY3JpcHRvci5ub2RlTmFtZV0gfHwgZW1wdHk7XG4gICAgICAgIGxldCBuZXdDdXN0b21FbGVtZW50ID0gY29tcG9uZW50c1tuZXdEZXNjcmlwdG9yLm5vZGVOYW1lXSB8fCBlbXB0eTtcblxuICAgICAgICBpZiAob2xkQ3VzdG9tRWxlbWVudC5wcm90b3R5cGUuZGV0YWNoZWRDYWxsYmFjaykge1xuICAgICAgICAgIG9sZEN1c3RvbUVsZW1lbnQucHJvdG90eXBlLmRldGFjaGVkQ2FsbGJhY2suY2FsbChwYXRjaC5vbGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5ld0N1c3RvbUVsZW1lbnQucHJvdG90eXBlLmF0dGFjaGVkQ2FsbGJhY2spIHtcbiAgICAgICAgICBuZXdDdXN0b21FbGVtZW50LnByb3RvdHlwZS5hdHRhY2hlZENhbGxiYWNrLmNhbGwocGF0Y2gubmV3KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZGVkIHN0YXRlIGZvciB0cmFuc2l0aW9ucyBBUEkuXG4gICAgICAgIGlmIChzdGF0ZXMgJiYgc3RhdGVzLmF0dGFjaGVkICYmIHN0YXRlcy5hdHRhY2hlZC5sZW5ndGgpIHtcbiAgICAgICAgICBhdHRhY2hlZFRyYW5zaXRpb25BbmRUaXRsZShuZXdEZXNjcmlwdG9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG1ha2VOb2RlLm5vZGVzW29sZERlc2NyaXB0b3IuZWxlbWVudF0gPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQXR0cmlidXRlIG1hbmlwdWxhdGlvbi5cbiAgICBlbHNlIGlmIChwYXRjaC5fX2RvX18gPT09IDIpIHtcbiAgICAgIGxldCBvbGRWYWx1ZSA9IHBhdGNoLmVsZW1lbnQuZ2V0QXR0cmlidXRlKHBhdGNoLm5hbWUpO1xuXG4gICAgICAvLyBDaGFuZ2VzIHRoZSBhdHRyaWJ1dGUgb24gdGhlIGVsZW1lbnQuXG4gICAgICBsZXQgYXVnbWVudEF0dHJpYnV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBSZW1vdmUuXG4gICAgICAgIGlmICghcGF0Y2gudmFsdWUpIHsgcGF0Y2guZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUocGF0Y2gubmFtZSk7IH1cbiAgICAgICAgLy8gQ2hhbmdlLlxuICAgICAgICBlbHNlIHsgcGF0Y2guZWxlbWVudC5zZXRBdHRyaWJ1dGUocGF0Y2gubmFtZSwgcGF0Y2gudmFsdWUpOyB9XG4gICAgICB9O1xuXG4gICAgICAvLyBUcmlnZ2VyIGFsbCB0aGUgYXR0cmlidXRlIGNoYW5nZWQgdmFsdWVzLlxuICAgICAgaWYgKHN0YXRlcyAmJiBzdGF0ZXMuYXR0cmlidXRlQ2hhbmdlZCAmJiBzdGF0ZXMuYXR0cmlidXRlQ2hhbmdlZC5sZW5ndGgpIHtcbiAgICAgICAgYWRkUHJvbWlzZXMoc3RhdGVzLmF0dHJpYnV0ZUNoYW5nZWQubWFwKGNhbGxiYWNrID0+IHtcbiAgICAgICAgICB2YXIgcHJvbWlzZSA9IGNhbGxiYWNrKHBhdGNoLmVsZW1lbnQsIHBhdGNoLm5hbWUsIG9sZFZhbHVlLFxuICAgICAgICAgICAgcGF0Y2gudmFsdWUpO1xuXG4gICAgICAgICAgaWYgKHByb21pc2UpIHsgcHJvbWlzZS50aGVuKGF1Z21lbnRBdHRyaWJ1dGUpOyB9XG4gICAgICAgICAgZWxzZSB7IGF1Z21lbnRBdHRyaWJ1dGUoKTsgfVxuXG4gICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBhdWdtZW50QXR0cmlidXRlKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFRyaWdnZXIgY3VzdG9tIGVsZW1lbnQgYXR0cmlidXRlQ2hhbmdlZCBldmVudHMuXG4gICAgICBsZXQgY3VzdG9tRWxlbWVudCA9IGNvbXBvbmVudHNbZWxlbWVudERlc2NyaXB0b3Iubm9kZU5hbWVdIHx8IGVtcHR5O1xuXG4gICAgICBpZiAoY3VzdG9tRWxlbWVudC5hdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2spIHtcbiAgICAgICAgY3VzdG9tRWxlbWVudC5wcm90b3R5cGUuYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrLmNhbGwocGF0Y2gub2xkLFxuICAgICAgICAgIHBhdGNoLm5hbWUsIG9sZFZhbHVlLCBwYXRjaC52YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVGV4dCBub2RlIG1hbmlwdWxhdGlvbi5cbiAgICBlbHNlIGlmIChwYXRjaC5fX2RvX18gPT09IDMpIHtcbiAgICAgIGxldCBvcmlnaW5hbFZhbHVlID0gcGF0Y2guZWxlbWVudC50ZXh0Q29udGVudDtcblxuICAgICAgLy8gQ2hhbmdlcyB0aGUgdGV4dC5cbiAgICAgIGxldCBhdWdtZW50VGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBwYXRjaC5lbGVtZW50LnRleHRDb250ZW50ID0gZGVjb2RlRW50aXRpZXMocGF0Y2gudmFsdWUpO1xuICAgICAgfTtcblxuICAgICAgLy8gVHJpZ2dlciBhbGwgdGhlIHRleHQgY2hhbmdlZCB2YWx1ZXMuXG4gICAgICBpZiAoc3RhdGVzICYmIHN0YXRlcy50ZXh0Q2hhbmdlZCAmJiBzdGF0ZXMudGV4dENoYW5nZWQubGVuZ3RoKSB7XG4gICAgICAgIGFkZFByb21pc2VzKHN0YXRlcy50ZXh0Q2hhbmdlZC5tYXAoY2FsbGJhY2sgPT4ge1xuICAgICAgICAgIHZhciBwcm9taXNlID0gY2FsbGJhY2socGF0Y2guZWxlbWVudC5wYXJlbnROb2RlIHx8IHBhdGNoLmVsZW1lbnQsXG4gICAgICAgICAgICBvcmlnaW5hbFZhbHVlLCBwYXRjaC52YWx1ZSk7XG5cbiAgICAgICAgICBpZiAocHJvbWlzZSkgeyBwcm9taXNlLnRoZW4oYXVnbWVudFRleHQpOyB9XG4gICAgICAgICAgZWxzZSB7IGF1Z21lbnRUZXh0KCk7IH1cblxuICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcGF0Y2guZWxlbWVudC50ZXh0Q29udGVudCA9IGRlY29kZUVudGl0aWVzKHBhdGNoLnZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB2YXIgYWN0aXZlUHJvbWlzZXMgPSBwcm9taXNlcy5maWx0ZXIoQm9vbGVhbik7XG5cbiAgLy8gV2FpdCB1bnRpbCBhbGwgdHJhbnNpdGlvbiBwcm9taXNlcyBoYXZlIHJlc29sdmVkLlxuICBpZiAoYWN0aXZlUHJvbWlzZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzLmZpbHRlcihCb29sZWFuKSk7XG4gIH1cbn1cbiIsIi8vIExpc3Qgb2YgU1ZHIGVsZW1lbnRzLlxuZXhwb3J0IGxldCBlbGVtZW50cyA9IFtcbiAgJ2FsdEdseXBoJyxcbiAgJ2FsdEdseXBoRGVmJyxcbiAgJ2FsdEdseXBoSXRlbScsXG4gICdhbmltYXRlJyxcbiAgJ2FuaW1hdGVDb2xvcicsXG4gICdhbmltYXRlTW90aW9uJyxcbiAgJ2FuaW1hdGVUcmFuc2Zvcm0nLFxuICAnY2lyY2xlJyxcbiAgJ2NsaXBQYXRoJyxcbiAgJ2NvbG9yLXByb2ZpbGUnLFxuICAnY3Vyc29yJyxcbiAgJ2RlZnMnLFxuICAnZGVzYycsXG4gICdlbGxpcHNlJyxcbiAgJ2ZlQmxlbmQnLFxuICAnZmVDb2xvck1hdHJpeCcsXG4gICdmZUNvbXBvbmVudFRyYW5zZmVyJyxcbiAgJ2ZlQ29tcG9zaXRlJyxcbiAgJ2ZlQ29udm9sdmVNYXRyaXgnLFxuICAnZmVEaWZmdXNlTGlnaHRpbmcnLFxuICAnZmVEaXNwbGFjZW1lbnRNYXAnLFxuICAnZmVEaXN0YW50TGlnaHQnLFxuICAnZmVGbG9vZCcsXG4gICdmZUZ1bmNBJyxcbiAgJ2ZlRnVuY0InLFxuICAnZmVGdW5jRycsXG4gICdmZUZ1bmNSJyxcbiAgJ2ZlR2F1c3NpYW5CbHVyJyxcbiAgJ2ZlSW1hZ2UnLFxuICAnZmVNZXJnZScsXG4gICdmZU1lcmdlTm9kZScsXG4gICdmZU1vcnBob2xvZ3knLFxuICAnZmVPZmZzZXQnLFxuICAnZmVQb2ludExpZ2h0JyxcbiAgJ2ZlU3BlY3VsYXJMaWdodGluZycsXG4gICdmZVNwb3RMaWdodCcsXG4gICdmZVRpbGUnLFxuICAnZmVUdXJidWxlbmNlJyxcbiAgJ2ZpbHRlcicsXG4gICdmb250JyxcbiAgJ2ZvbnQtZmFjZScsXG4gICdmb250LWZhY2UtZm9ybWF0JyxcbiAgJ2ZvbnQtZmFjZS1uYW1lJyxcbiAgJ2ZvbnQtZmFjZS1zcmMnLFxuICAnZm9udC1mYWNlLXVyaScsXG4gICdmb3JlaWduT2JqZWN0JyxcbiAgJ2cnLFxuICAnZ2x5cGgnLFxuICAnZ2x5cGhSZWYnLFxuICAnaGtlcm4nLFxuICAnaW1hZ2UnLFxuICAnbGluZScsXG4gICdsaW5lYXJHcmFkaWVudCcsXG4gICdtYXJrZXInLFxuICAnbWFzaycsXG4gICdtZXRhZGF0YScsXG4gICdtaXNzaW5nLWdseXBoJyxcbiAgJ21wYXRoJyxcbiAgJ3BhdGgnLFxuICAncGF0dGVybicsXG4gICdwb2x5Z29uJyxcbiAgJ3BvbHlsaW5lJyxcbiAgJ3JhZGlhbEdyYWRpZW50JyxcbiAgJ3JlY3QnLFxuICAnc2NyaXB0JyxcbiAgJ3NldCcsXG4gICdzdG9wJyxcbiAgJ3N0eWxlJyxcbiAgJ3N2ZycsXG4gICdzd2l0Y2gnLFxuICAnc3ltYm9sJyxcbiAgJ3RleHQnLFxuICAndGV4dFBhdGgnLFxuICAndGl0bGUnLFxuICAndHJlZicsXG4gICd0c3BhbicsXG4gICd1c2UnLFxuICAndmlldycsXG4gICd2a2VybicsXG5dO1xuXG4vLyBOYW1lc3BhY2UuXG5leHBvcnQgbGV0IG5hbWVzcGFjZSA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG4iLCIvKipcbiAqIENvbnRhaW5zIGFycmF5cyB0byBzdG9yZSB0cmFuc2l0aW9uIGNhbGxiYWNrcy5cbiAqL1xuZXhwb3J0IGxldCB0cmFuc2l0aW9uU3RhdGVzID0ge307XG5cbi8qKlxuICogRm9yIHdoZW4gZWxlbWVudHMgY29tZSBpbnRvIHRoZSBET00uIFRoZSBjYWxsYmFjayB0cmlnZ2VycyBpbW1lZGlhdGVseSBhZnRlclxuICogdGhlIGVsZW1lbnQgZW50ZXJzIHRoZSBET00uIEl0IGlzIGNhbGxlZCB3aXRoIHRoZSBlbGVtZW50IGFzIHRoZSBvbmx5XG4gKiBhcmd1bWVudC5cbiAqL1xudHJhbnNpdGlvblN0YXRlcy5hdHRhY2hlZCA9IFtdO1xuXG4vKipcbiAqIEZvciB3aGVuIGVsZW1lbnRzIGFyZSByZW1vdmVkIGZyb20gdGhlIERPTS4gVGhlIGNhbGxiYWNrIHRyaWdnZXJzIGp1c3RcbiAqIGJlZm9yZSB0aGUgZWxlbWVudCBsZWF2ZXMgdGhlIERPTS4gSXQgaXMgY2FsbGVkIHdpdGggdGhlIGVsZW1lbnQgYXMgdGhlIG9ubHlcbiAqIGFyZ3VtZW50LlxuICovXG50cmFuc2l0aW9uU3RhdGVzLmRldGFjaGVkID0gW107XG5cbi8qXG4gKiBGb3Igd2hlbiBlbGVtZW50cyBhcmUgcmVwbGFjZWQgaW4gdGhlIERPTS4gVGhlIGNhbGxiYWNrIHRyaWdnZXJzIGFmdGVyIHRoZVxuICogbmV3IGVsZW1lbnQgZW50ZXJzIHRoZSBET00sIGFuZCBiZWZvcmUgdGhlIG9sZCBlbGVtZW50IGxlYXZlcy4gSXQgaXMgY2FsbGVkXG4gKiB3aXRoIG9sZCBhbmQgbmV3IGVsZW1lbnRzIGFzIGFyZ3VtZW50cywgaW4gdGhhdCBvcmRlci5cbiAqL1xudHJhbnNpdGlvblN0YXRlcy5yZXBsYWNlZCA9IFtdO1xuXG4vKlxuICogVHJpZ2dlcmVkIHdoZW4gYW4gZWxlbWVudCdzIGF0dHJpYnV0ZSBoYXMgY2hhbmdlZC4gVGhlIGNhbGxiYWNrIHRyaWdnZXJzXG4gKiBhZnRlciB0aGUgYXR0cmlidXRlIGhhcyBjaGFuZ2VkIGluIHRoZSBET00uIEl0IGlzIGNhbGxlZCB3aXRoIHRoZSBlbGVtZW50LFxuICogdGhlIGF0dHJpYnV0ZSBuYW1lLCBvbGQgdmFsdWUsIGFuZCBjdXJyZW50IHZhbHVlLlxuICovXG50cmFuc2l0aW9uU3RhdGVzLmF0dHJpYnV0ZUNoYW5nZWQgPSBbXTtcblxuLypcbiAqIFRyaWdnZXJlZCB3aGVuIGFuIGVsZW1lbnQncyBgdGV4dENvbnRlbnRgIGNobmFnZXMuIFRoZSBjYWxsYmFjayB0cmlnZ2Vyc1xuICogYWZ0ZXIgdGhlIHRleHRDb250ZW50IGhhcyBjaGFuZ2VkIGluIHRoZSBET00uIEl0IGlzIGNhbGxlZCB3aXRoIHRoZSBlbGVtZW50LFxuICogdGhlIG9sZCB2YWx1ZSwgYW5kIGN1cnJlbnQgdmFsdWUuXG4gKi9cbnRyYW5zaXRpb25TdGF0ZXMudGV4dENoYW5nZWQgPSBbXTtcbiIsImxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbi8qKlxuICogRGVjb2RlJ3MgSFRNTCBlbnRpdGllcy5cbiAqXG4gKiBAc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzEzMDkxMjY2XG4gKiBAcGFyYW0gc3RyaW5naW5nXG4gKiBAcmV0dXJuIHVuZXNjYXBlZCBkZWNvZGVkIEhUTUxcbiAqL1xuZnVuY3Rpb24gZGVjb2RlRW50aXRpZXMoc3RyaW5nKSB7XG4gIGVsZW1lbnQuaW5uZXJIVE1MID0gc3RyaW5nO1xuICByZXR1cm4gZWxlbWVudC50ZXh0Q29udGVudDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZGVjb2RlRW50aXRpZXM7XG4iLCJpbXBvcnQgeyBwb29scyBhcyBfcG9vbHMgfSBmcm9tICcuLi91dGlsL3Bvb2xzJztcbmltcG9ydCBfbWFrZU5vZGUgZnJvbSAnLi4vbm9kZS9tYWtlJztcblxudmFyIHBvb2xzID0gX3Bvb2xzO1xudmFyIG1ha2VOb2RlID0gX21ha2VOb2RlO1xuXG4vKipcbiAqIEVuc3VyZXMgdGhhdCBhbiBlbGVtZW50IGlzIG5vdCByZWN5Y2xlZCBkdXJpbmcgYSByZW5kZXIgY3ljbGUuXG4gKlxuICogQHBhcmFtIGVsZW1lbnRcbiAqIEByZXR1cm4gZWxlbWVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdGVjdEVsZW1lbnQoZWxlbWVudCkge1xuICBwb29scy5lbGVtZW50T2JqZWN0LnByb3RlY3QoZWxlbWVudCk7XG5cbiAgZWxlbWVudC5jaGlsZE5vZGVzLmZvckVhY2gocHJvdGVjdEVsZW1lbnQpO1xuICBlbGVtZW50LmF0dHJpYnV0ZXMuZm9yRWFjaChwb29scy5hdHRyaWJ1dGVPYmplY3QucHJvdGVjdCxcbiAgICBwb29scy5hdHRyaWJ1dGVPYmplY3QpO1xuXG4gIHJldHVybiBlbGVtZW50O1xufVxuXG4vKipcbiAqIEFsbG93cyBhbiBlbGVtZW50IHRvIGJlIHJlY3ljbGVkIGR1cmluZyBhIHJlbmRlciBjeWNsZS5cbiAqXG4gKiBAcGFyYW0gZWxlbWVudFxuICogQHJldHVyblxuICovXG5leHBvcnQgZnVuY3Rpb24gdW5wcm90ZWN0RWxlbWVudChlbGVtZW50KSB7XG4gIGVsZW1lbnQuY2hpbGROb2Rlcy5mb3JFYWNoKHVucHJvdGVjdEVsZW1lbnQpO1xuICBlbGVtZW50LmF0dHJpYnV0ZXMuZm9yRWFjaChwb29scy5hdHRyaWJ1dGVPYmplY3QudW5wcm90ZWN0LFxuICAgIHBvb2xzLmF0dHJpYnV0ZU9iamVjdCk7XG5cbiAgcG9vbHMuZWxlbWVudE9iamVjdC51bnByb3RlY3QoZWxlbWVudCk7XG5cbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5cbi8qKlxuICogUmVjeWNsZXMgYWxsIHVucHJvdGVjdGVkIGFsbG9jYXRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYW5NZW1vcnkoKSB7XG4gIC8vIEZyZWUgYWxsIG1lbW9yeSBhZnRlciBlYWNoIGl0ZXJhdGlvbi5cbiAgcG9vbHMuYXR0cmlidXRlT2JqZWN0LmZyZWVBbGwoKTtcbiAgcG9vbHMuZWxlbWVudE9iamVjdC5mcmVlQWxsKCk7XG5cbiAgLy8gRW1wdHkgb3V0IHRoZSBgbWFrZS5ub2Rlc2AgaWYgb24gbWFpbiB0aHJlYWQuXG4gIGlmICh0eXBlb2YgbWFrZU5vZGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZm9yIChsZXQgdXVpZCBpbiBtYWtlTm9kZS5ub2Rlcykge1xuICAgICAgLy8gSWYgdGhpcyBpcyBub3QgYSBwcm90ZWN0ZWQgdXVpZCwgcmVtb3ZlIGl0LlxuICAgICAgaWYgKCFwb29scy5lbGVtZW50T2JqZWN0Ll91dWlkW3V1aWRdKSB7XG4gICAgICAgIGRlbGV0ZSBtYWtlTm9kZS5ub2Rlc1t1dWlkXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsIi8vIENvZGUgYmFzZWQgb2ZmIG9mOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2FzaGkwMDkvbm9kZS1mYXN0LWh0bWwtcGFyc2VyXG5cbmltcG9ydCB7IHBvb2xzIGFzIF9wb29scyB9IGZyb20gJy4vcG9vbHMnO1xuXG52YXIgcG9vbHMgPSBfcG9vbHM7XG52YXIgcGFyc2VyID0gbWFrZVBhcnNlcigpO1xuXG4vKipcbiAqIHBhcnNlSFRNTFxuICpcbiAqIEBwYXJhbSBuZXdIVE1MXG4gKiBAcmV0dXJuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUhUTUwobmV3SFRNTCwgaXNJbm5lcikge1xuICBsZXQgZG9jdW1lbnRFbGVtZW50ID0gcGFyc2VyLnBhcnNlKG5ld0hUTUwpO1xuICBsZXQgbm9kZXMgPSBkb2N1bWVudEVsZW1lbnQuY2hpbGROb2RlcztcblxuICByZXR1cm4gaXNJbm5lciA/IG5vZGVzIDogbm9kZXNbMF07XG59XG5cbi8qKlxuICogbWFrZVBhcnNlclxuICpcbiAqIEByZXR1cm5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1ha2VQYXJzZXIoKSB7XG4gIGxldCBrTWFya3VwUGF0dGVybiA9XG4gICAgLzwhLS1bXl0qPyg/PS0tPiktLT58PChcXC8/KShbYS16XFwtXVthLXowLTlcXC1dKilcXHMqKFtePl0qPykoXFwvPyk+L2lnO1xuXG4gIGxldCBrQXR0cmlidXRlUGF0dGVybiA9IC9cXGIoaWR8Y2xhc3MpXFxzKig9XFxzKihcIihbXlwiXSspXCJ8JyhbXiddKyknfChcXFMrKSkpPy9pZztcblxuICBsZXQgcmVBdHRyUGF0dGVybiA9XG4gICAgL1xcYihbYS16XVthLXowLTlcXC1dKilcXHMqKD1cXHMqKFwiKFteXCJdKylcInwnKFteJ10rKSd8KFxcUyspKSk/L2lnO1xuXG4gIGxldCBrQmxvY2tFbGVtZW50cyA9IHtcbiAgICBkaXY6IHRydWUsXG4gICAgcDogdHJ1ZSxcbiAgICBsaTogdHJ1ZSxcbiAgICB0ZDogdHJ1ZSxcbiAgICBzZWN0aW9uOiB0cnVlLFxuICAgIGJyOiB0cnVlXG4gIH07XG5cbiAgbGV0IGtTZWxmQ2xvc2luZ0VsZW1lbnRzID0ge1xuICAgIG1ldGE6IHRydWUsXG4gICAgaW1nOiB0cnVlLFxuICAgIGxpbms6IHRydWUsXG4gICAgaW5wdXQ6IHRydWUsXG4gICAgYXJlYTogdHJ1ZSxcbiAgICBicjogdHJ1ZSxcbiAgICBocjogdHJ1ZVxuICB9O1xuXG4gIGxldCBrRWxlbWVudHNDbG9zZWRCeU9wZW5pbmcgPSB7XG4gICAgbGk6IHtcbiAgICAgIGxpOiB0cnVlXG4gICAgfSxcblxuICAgIHA6IHtcbiAgICAgIHA6IHRydWUsIGRpdjogdHJ1ZVxuICAgIH0sXG5cbiAgICB0ZDoge1xuICAgICAgdGQ6IHRydWUsIHRoOiB0cnVlXG4gICAgfSxcblxuICAgIHRoOiB7XG4gICAgICB0ZDogdHJ1ZSwgdGg6IHRydWVcbiAgICB9XG4gIH07XG5cbiAgbGV0IGtFbGVtZW50c0Nsb3NlZEJ5Q2xvc2luZyA9IHtcbiAgICBsaToge1xuICAgICAgdWw6IHRydWUsIG9sOiB0cnVlXG4gICAgfSxcblxuICAgIGE6IHtcbiAgICAgIGRpdjogdHJ1ZVxuICAgIH0sXG5cbiAgICBiOiB7XG4gICAgICBkaXY6IHRydWVcbiAgICB9LFxuXG4gICAgaToge1xuICAgICAgZGl2OiB0cnVlXG4gICAgfSxcblxuICAgIHA6IHtcbiAgICAgIGRpdjogdHJ1ZVxuICAgIH0sXG5cbiAgICB0ZDoge1xuICAgICAgdHI6IHRydWUsIHRhYmxlOiB0cnVlXG4gICAgfSxcblxuICAgIHRoOiB7XG4gICAgICB0cjogdHJ1ZSwgdGFibGU6IHRydWVcbiAgICB9XG4gIH07XG5cbiAgbGV0IGtCbG9ja1RleHRFbGVtZW50cyA9IHtcbiAgICBzY3JpcHQ6IHRydWUsXG4gICAgbm9zY3JpcHQ6IHRydWUsXG4gICAgc3R5bGU6IHRydWUsXG4gICAgcHJlOiB0cnVlXG4gIH07XG5cbiAgLyoqXG4gICAqIFRleHROb2RlIHRvIGNvbnRhaW4gYSB0ZXh0IGVsZW1lbnQgaW4gRE9NIHRyZWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSBbZGVzY3JpcHRpb25dXG4gICAqL1xuICBmdW5jdGlvbiBUZXh0Tm9kZSh2YWx1ZSkge1xuICAgIGxldCBpbnN0YW5jZSA9IHBvb2xzLmVsZW1lbnRPYmplY3QuZ2V0KCk7XG5cbiAgICBpbnN0YW5jZS5ub2RlTmFtZSA9ICcjdGV4dCc7XG4gICAgaW5zdGFuY2Uubm9kZVZhbHVlID0gdmFsdWU7XG4gICAgaW5zdGFuY2Uubm9kZVR5cGUgPSAzO1xuICAgIGluc3RhbmNlLmNoaWxkTm9kZXMubGVuZ3RoID0gMDtcbiAgICBpbnN0YW5jZS5hdHRyaWJ1dGVzLmxlbmd0aCA9IDA7XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cblxuICAvKipcbiAgICogSFRNTEVsZW1lbnQsIHdoaWNoIGNvbnRhaW5zIGEgc2V0IG9mIGNoaWxkcmVuLlxuICAgKlxuICAgKiBOb3RlOiB0aGlzIGlzIGEgbWluaW1hbGlzdCBpbXBsZW1lbnRhdGlvbiwgbm8gY29tcGxldGUgdHJlZSBzdHJ1Y3R1cmVcbiAgICogcHJvdmlkZWQgKG5vIHBhcmVudE5vZGUsIG5leHRTaWJsaW5nLCBwcmV2aW91c1NpYmxpbmcgZXRjKS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgICAgIG5vZGVOYW1lXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBrZXlBdHRycyBpZCBhbmQgY2xhc3MgYXR0cmlidXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByYXdBdHRycyBhdHRyaWJ1dGVzIGluIHN0cmluZ1xuICAgKi9cbiAgZnVuY3Rpb24gSFRNTEVsZW1lbnQobmFtZSwga2V5QXR0cnMsIHJhd0F0dHJzKSB7XG4gICAgbGV0IGluc3RhbmNlID0gcG9vbHMuZWxlbWVudE9iamVjdC5nZXQoKTtcblxuICAgIGluc3RhbmNlLm5vZGVOYW1lID0gbmFtZTtcbiAgICBpbnN0YW5jZS5ub2RlVmFsdWUgPSAnJztcbiAgICBpbnN0YW5jZS5ub2RlVHlwZSA9IDE7XG4gICAgaW5zdGFuY2UuY2hpbGROb2Rlcy5sZW5ndGggPSAwO1xuICAgIGluc3RhbmNlLmF0dHJpYnV0ZXMubGVuZ3RoID0gMDtcblxuICAgIGlmIChyYXdBdHRycykge1xuICAgICAgZm9yIChsZXQgbWF0Y2g7IG1hdGNoID0gcmVBdHRyUGF0dGVybi5leGVjKHJhd0F0dHJzKTsgKSB7XG4gICAgICAgIGxldCBhdHRyID0gcG9vbHMuYXR0cmlidXRlT2JqZWN0LmdldCgpO1xuXG4gICAgICAgIGF0dHIubmFtZSA9IG1hdGNoWzFdO1xuICAgICAgICBhdHRyLnZhbHVlID0gbWF0Y2hbNV0gfHwgbWF0Y2hbNF0gfHwgbWF0Y2hbMV07XG5cbiAgICAgICAgLy8gTG9vayBmb3IgZW1wdHkgYXR0cmlidXRlcy5cbiAgICAgICAgaWYgKG1hdGNoWzZdID09PSAnXCJcIicpIHsgYXR0ci52YWx1ZSA9ICcnOyB9XG5cbiAgICAgICAgaW5zdGFuY2UuYXR0cmlidXRlc1tpbnN0YW5jZS5hdHRyaWJ1dGVzLmxlbmd0aF0gPSBhdHRyO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZXMgSFRNTCBhbmQgcmV0dXJucyBhIHJvb3QgZWxlbWVudFxuICAgKi9cbiAgbGV0IGh0bWxQYXJzZXIgPSB7XG4gICAgLyoqXG4gICAgICogUGFyc2UgYSBjaHVjayBvZiBIVE1MIHNvdXJjZS5cbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IGRhdGEgICAgICBodG1sXG4gICAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9ICAgICAgcm9vdCBlbGVtZW50XG4gICAgICovXG4gICAgcGFyc2U6IGZ1bmN0aW9uKGRhdGEsIG9wdGlvbnMpIHtcbiAgICAgIGxldCByb290T2JqZWN0ID0ge307XG4gICAgICBsZXQgcm9vdCA9IEhUTUxFbGVtZW50KG51bGwsIHJvb3RPYmplY3QpO1xuICAgICAgbGV0IGN1cnJlbnRQYXJlbnQgPSByb290O1xuICAgICAgbGV0IHN0YWNrID0gW3Jvb3RdO1xuICAgICAgbGV0IGxhc3RUZXh0UG9zID0gLTE7XG5cbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICBpZiAoZGF0YS5pbmRleE9mKCc8JykgPT09IC0xICYmIGRhdGEpIHtcbiAgICAgICAgY3VycmVudFBhcmVudC5jaGlsZE5vZGVzW2N1cnJlbnRQYXJlbnQuY2hpbGROb2Rlcy5sZW5ndGhdID0gVGV4dE5vZGUoZGF0YSk7XG5cbiAgICAgICAgcmV0dXJuIHJvb3Q7XG4gICAgICB9XG5cbiAgICAgIGZvciAobGV0IG1hdGNoLCB0ZXh0OyBtYXRjaCA9IGtNYXJrdXBQYXR0ZXJuLmV4ZWMoZGF0YSk7ICkge1xuICAgICAgICBpZiAobGFzdFRleHRQb3MgPiAtMSkge1xuICAgICAgICAgIGlmIChsYXN0VGV4dFBvcyArIG1hdGNoWzBdLmxlbmd0aCA8IGtNYXJrdXBQYXR0ZXJuLmxhc3RJbmRleCkge1xuICAgICAgICAgICAgLy8gaWYgaGFzIGNvbnRlbnRcbiAgICAgICAgICAgIHRleHQgPSBkYXRhLnNsaWNlKGxhc3RUZXh0UG9zLCBrTWFya3VwUGF0dGVybi5sYXN0SW5kZXggLSBtYXRjaFswXS5sZW5ndGgpO1xuXG4gICAgICAgICAgICBpZiAodGV4dC50cmltKCkpIHtcbiAgICAgICAgICAgICAgY3VycmVudFBhcmVudC5jaGlsZE5vZGVzW2N1cnJlbnRQYXJlbnQuY2hpbGROb2Rlcy5sZW5ndGhdID0gVGV4dE5vZGUodGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGFzdFRleHRQb3MgPSBrTWFya3VwUGF0dGVybi5sYXN0SW5kZXg7XG5cbiAgICAgICAgLy8gVGhpcyBpcyBhIGNvbW1lbnQuXG4gICAgICAgIGlmIChtYXRjaFswXVsxXSA9PT0gJyEnKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucy5sb3dlckNhc2VUYWdOYW1lKSB7XG4gICAgICAgICAgbWF0Y2hbMl0gPSBtYXRjaFsyXS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFtYXRjaFsxXSkge1xuICAgICAgICAgIC8vIG5vdCA8LyB0YWdzXG4gICAgICAgICAgbGV0IGF0dHJzID0ge307XG5cbiAgICAgICAgICBmb3IgKGxldCBhdHRNYXRjaDsgYXR0TWF0Y2ggPSBrQXR0cmlidXRlUGF0dGVybi5leGVjKG1hdGNoWzNdKTsgKSB7XG4gICAgICAgICAgICBhdHRyc1thdHRNYXRjaFsxXV0gPSBhdHRNYXRjaFszXSB8fCBhdHRNYXRjaFs0XSB8fCBhdHRNYXRjaFs1XTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIW1hdGNoWzRdICYmIGtFbGVtZW50c0Nsb3NlZEJ5T3BlbmluZ1tjdXJyZW50UGFyZW50Lm5vZGVOYW1lXSkge1xuICAgICAgICAgICAgaWYgKGtFbGVtZW50c0Nsb3NlZEJ5T3BlbmluZ1tjdXJyZW50UGFyZW50Lm5vZGVOYW1lXVttYXRjaFsyXV0pIHtcbiAgICAgICAgICAgICAgc3RhY2sucG9wKCk7XG4gICAgICAgICAgICAgIGN1cnJlbnRQYXJlbnQgPSBzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjdXJyZW50UGFyZW50ID0gY3VycmVudFBhcmVudC5jaGlsZE5vZGVzW2N1cnJlbnRQYXJlbnQuY2hpbGROb2Rlcy5wdXNoKFxuICAgICAgICAgICAgICBIVE1MRWxlbWVudChtYXRjaFsyXSwgYXR0cnMsIG1hdGNoWzNdKSkgLSAxXTtcblxuICAgICAgICAgIHN0YWNrLnB1c2goY3VycmVudFBhcmVudCk7XG5cbiAgICAgICAgICBpZiAoa0Jsb2NrVGV4dEVsZW1lbnRzW21hdGNoWzJdXSkge1xuICAgICAgICAgICAgLy8gYSBsaXR0bGUgdGVzdCB0byBmaW5kIG5leHQgPC9zY3JpcHQ+IG9yIDwvc3R5bGU+IC4uLlxuICAgICAgICAgICAgbGV0IGNsb3NlTWFya3VwID0gJzwvJyArIG1hdGNoWzJdICsgJz4nO1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gZGF0YS5pbmRleE9mKGNsb3NlTWFya3VwLCBrTWFya3VwUGF0dGVybi5sYXN0SW5kZXgpO1xuXG4gICAgICAgICAgICBpZiAob3B0aW9uc1ttYXRjaFsyXV0pIHtcbiAgICAgICAgICAgICAgaWYgKGluZGV4ID09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhlcmUgaXMgbm8gbWF0Y2hpbmcgZW5kaW5nIGZvciB0aGUgdGV4dCBlbGVtZW50LlxuICAgICAgICAgICAgICAgIHRleHQgPSBkYXRhLnNsaWNlKGtNYXJrdXBQYXR0ZXJuLmxhc3RJbmRleCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGV4dCA9IGRhdGEuc2xpY2Uoa01hcmt1cFBhdHRlcm4ubGFzdEluZGV4LCBpbmRleCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAodGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFBhcmVudC5jaGlsZE5vZGVzW2N1cnJlbnRQYXJlbnQuY2hpbGROb2Rlcy5sZW5ndGhdID0gVGV4dE5vZGUodGV4dCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpbmRleCA9PSAtMSkge1xuICAgICAgICAgICAgICBsYXN0VGV4dFBvcyA9IGtNYXJrdXBQYXR0ZXJuLmxhc3RJbmRleCA9IGRhdGEubGVuZ3RoICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBjdXJyZW50UGFyZW50Lm5vZGVWYWx1ZSA9IGRhdGEuc2xpY2Uoa01hcmt1cFBhdHRlcm4ubGFzdEluZGV4LCBpbmRleCk7XG4gICAgICAgICAgICAgIGxhc3RUZXh0UG9zID0ga01hcmt1cFBhdHRlcm4ubGFzdEluZGV4ID0gaW5kZXggKyBjbG9zZU1hcmt1cC5sZW5ndGg7XG4gICAgICAgICAgICAgIG1hdGNoWzFdID0gdHJ1ZTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobWF0Y2hbMV0gfHwgbWF0Y2hbNF0gfHwga1NlbGZDbG9zaW5nRWxlbWVudHNbbWF0Y2hbMl1dKSB7XG4gICAgICAgICAgLy8gPC8gb3IgLz4gb3IgPGJyPiBldGMuXG4gICAgICAgICAgd2hpbGUgKGN1cnJlbnRQYXJlbnQpIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UGFyZW50Lm5vZGVOYW1lID09IG1hdGNoWzJdKSB7XG4gICAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgICBjdXJyZW50UGFyZW50ID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG5cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gVHJ5aW5nIHRvIGNsb3NlIGN1cnJlbnQgdGFnLCBhbmQgbW92ZSBvblxuICAgICAgICAgICAgICBpZiAoa0VsZW1lbnRzQ2xvc2VkQnlDbG9zaW5nW2N1cnJlbnRQYXJlbnQubm9kZU5hbWVdKSB7XG4gICAgICAgICAgICAgICAgaWYgKGtFbGVtZW50c0Nsb3NlZEJ5Q2xvc2luZ1tjdXJyZW50UGFyZW50Lm5vZGVOYW1lXVttYXRjaFsyXV0pIHtcbiAgICAgICAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgY3VycmVudFBhcmVudCA9IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBVc2UgYWdncmVzc2l2ZSBzdHJhdGVneSB0byBoYW5kbGUgdW5tYXRjaGluZyBtYXJrdXBzLlxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJvb3Q7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBodG1sUGFyc2VyO1xufTtcbiIsImltcG9ydCBfdXVpZCBmcm9tICcuL3V1aWQnO1xuXG5jb25zdCB1dWlkID0gX3V1aWQ7XG5leHBvcnQgdmFyIHBvb2xzID0ge307XG5leHBvcnQgdmFyIGNvdW50ID0gMTAwMDA7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHBvb2wgdG8gcXVlcnkgbmV3IG9yIHJldXNlZCB2YWx1ZXMgZnJvbS5cbiAqXG4gKiBAcGFyYW0gbmFtZVxuICogQHBhcmFtIG9wdHNcbiAqIEByZXR1cm4ge09iamVjdH0gcG9vbFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUG9vbChuYW1lLCBvcHRzKSB7XG4gIHZhciB7IHNpemUsIGZpbGwgfSA9IG9wdHM7XG4gIHZhciBmcmVlID0gW107XG4gIHZhciBhbGxvY2F0ZWQgPSBbXTtcbiAgdmFyIHByb3RlY3QgPSBbXTtcblxuICAvLyBQcmltZSB0aGUgY2FjaGUgd2l0aCBuIG9iamVjdHMuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgZnJlZVtpXSA9IGZpbGwoKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgX2ZyZWU6IGZyZWUsXG4gICAgX2FsbG9jYXRlZDogYWxsb2NhdGVkLFxuICAgIF9wcm90ZWN0ZWQ6IHByb3RlY3QsXG4gICAgX3V1aWQ6IHt9LFxuXG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIGxldCBvYmogPSBudWxsO1xuICAgICAgbGV0IGZyZWVMZW5ndGggPSBmcmVlLmxlbmd0aDtcbiAgICAgIGxldCBtaW51c09uZSA9IGZyZWVMZW5ndGggLSAxO1xuXG4gICAgICBpZiAoZnJlZUxlbmd0aCkge1xuICAgICAgICBvYmogPSBmcmVlW21pbnVzT25lXTtcbiAgICAgICAgZnJlZS5sZW5ndGggPSBtaW51c09uZTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBvYmogPSBmaWxsKCk7XG4gICAgICB9XG5cbiAgICAgIGFsbG9jYXRlZC5wdXNoKG9iaik7XG5cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcblxuICAgIHByb3RlY3Q6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBsZXQgaWR4ID0gYWxsb2NhdGVkLmluZGV4T2YodmFsdWUpO1xuXG4gICAgICAvLyBNb3ZlIHRoZSB2YWx1ZSBvdXQgb2YgYWxsb2NhdGVkLCBzaW5jZSB3ZSBuZWVkIHRvIHByb3RlY3QgdGhpcyBmcm9tXG4gICAgICAvLyBiZWluZyBmcmVlJ2QgYWNjaWRlbnRhbGx5LlxuICAgICAgcHJvdGVjdC5wdXNoKGlkeCA9PT0gLTEgPyB2YWx1ZSA6IGFsbG9jYXRlZC5zcGxpY2UoaWR4LCAxKVswXSk7XG5cbiAgICAgIC8vIElmIHdlJ3JlIHByb3RlY3RpbmcgYW4gZWxlbWVudCBvYmplY3QsIHB1c2ggdGhlIHV1aWQgaW50byBhIGxvb2t1cFxuICAgICAgLy8gdGFibGUuXG4gICAgICBpZiAobmFtZSA9PT0gJ2VsZW1lbnRPYmplY3QnKSB7XG4gICAgICAgIHRoaXMuX3V1aWRbdmFsdWUuZWxlbWVudF0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgdW5wcm90ZWN0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgbGV0IGlkeCA9IHByb3RlY3QuaW5kZXhPZih2YWx1ZSk7XG5cbiAgICAgIGlmIChpZHggIT09IC0xKSB7XG4gICAgICAgIGxldCBvYmogPSBwcm90ZWN0LnNwbGljZShpZHgsIDEpWzBdO1xuICAgICAgICBpZiAob2JqKSB7IGFsbG9jYXRlZC5wdXNoKG9iaik7IH1cblxuICAgICAgICBpZiAobmFtZSA9PT0gJ2VsZW1lbnRPYmplY3QnKSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuX3V1aWRbdmFsdWUuZWxlbWVudF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZnJlZUFsbDogZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgYWxsb2NhdGVkTGVuZ3RoID0gYWxsb2NhdGVkLmxlbmd0aDtcbiAgICAgIGxldCBmcmVlTGVuZ3RoID0gZnJlZS5sZW5ndGg7XG5cbiAgICAgIGZyZWUucHVzaC5hcHBseShmcmVlLCBhbGxvY2F0ZWQuc2xpY2UoMCwgc2l6ZSAtIGZyZWVMZW5ndGgpKTtcbiAgICAgIGFsbG9jYXRlZC5sZW5ndGggPSAwO1xuICAgIH0sXG5cbiAgICBmcmVlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgbGV0IGlkeCA9IGFsbG9jYXRlZC5pbmRleE9mKHZhbHVlKTtcblxuICAgICAgLy8gQWxyZWFkeSBmcmVlZC5cbiAgICAgIGlmIChpZHggPT09IC0xKSB7IHJldHVybjsgfVxuXG4gICAgICAvLyBPbmx5IHB1dCBiYWNrIGludG8gdGhlIGZyZWUgcXVldWUgaWYgd2UncmUgdW5kZXIgdGhlIHNpemUuXG4gICAgICBpZiAoZnJlZS5sZW5ndGggPCBzaXplKSB7XG4gICAgICAgIGZyZWUucHVzaCh2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGFsbG9jYXRlZC5zcGxpY2UoaWR4LCAxKTtcbiAgICB9XG4gIH07XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRpYWxpemVQb29scyhDT1VOVCkge1xuICBwb29scy5hdHRyaWJ1dGVPYmplY3QgPSBjcmVhdGVQb29sKCdhdHRyaWJ1dGVPYmplY3QnLCB7XG4gICAgc2l6ZTogQ09VTlQsXG5cbiAgICBmaWxsOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7IG5hbWU6ICcnLCB2YWx1ZTogJycgfTtcbiAgICB9XG4gIH0pO1xuXG4gIHBvb2xzLmVsZW1lbnRPYmplY3QgPSBjcmVhdGVQb29sKCdlbGVtZW50T2JqZWN0Jywge1xuICAgIHNpemU6IENPVU5ULFxuXG4gICAgZmlsbDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBlbGVtZW50OiB1dWlkKCksXG4gICAgICAgIGNoaWxkTm9kZXM6IFtdLFxuICAgICAgICBhdHRyaWJ1dGVzOiBbXVxuICAgICAgfTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBDcmVhdGUgMTBrIGl0ZW1zIG9mIGVhY2ggdHlwZS5cbmluaXRpYWxpemVQb29scyhjb3VudCk7XG4iLCIvKipcbiAqIEdlbmVyYXRlcyBhIHV1aWQuXG4gKlxuICogQHNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMTE3NTIzLzI4MjE3NVxuICogQHJldHVybiB7c3RyaW5nfSB1dWlkXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHV1aWQoKSB7XG4gIHJldHVybiAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uKGMpIHtcbiAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkqMTZ8MCwgdiA9IGMgPT0gJ3gnID8gciA6IChyJjB4M3wweDgpO1xuICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgfSk7XG59XG4iLCJpbXBvcnQgdXVpZCBmcm9tICcuLi91dGlsL3V1aWQnO1xuaW1wb3J0IHsgcG9vbHMsIGluaXRpYWxpemVQb29scywgY3JlYXRlUG9vbCB9IGZyb20gJy4uL3V0aWwvcG9vbHMnO1xuaW1wb3J0IHsgY291bnQgYXMgcG9vbENvdW50IH0gZnJvbSAnLi4vdXRpbC9wb29scyc7XG5pbXBvcnQgeyBwYXJzZUhUTUwsIG1ha2VQYXJzZXIgfSBmcm9tICcuLi91dGlsL3BhcnNlcic7XG5pbXBvcnQgeyBwcm90ZWN0RWxlbWVudCwgdW5wcm90ZWN0RWxlbWVudCwgY2xlYW5NZW1vcnkgfSBmcm9tICcuLi91dGlsL21lbW9yeSc7XG5pbXBvcnQgc3luY05vZGUgZnJvbSAnLi4vbm9kZS9zeW5jJztcbmltcG9ydCB3b3JrZXJTb3VyY2UgZnJvbSAnLi9zb3VyY2UnO1xuXG4vLyBUZXN0cyBpZiB0aGUgYnJvd3NlciBoYXMgc3VwcG9ydCBmb3IgdGhlIGBXb3JrZXJgIEFQSS5cbmV4cG9ydCB2YXIgaGFzV29ya2VyID0gdHlwZW9mIFdvcmtlciA9PT0gJ2Z1bmN0aW9uJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFdlYiBXb3JrZXIgcGVyIGVsZW1lbnQgdGhhdCB3aWxsIGJlIGRpZmZlZC4gQWxsb3dzIG11bHRpcGxlXG4gKiBjb25jdXJyZW50IGRpZmZpbmcgb3BlcmF0aW9ucyB0byBvY2N1ciBzaW11bHRhbmVvdXNseSwgbGV2ZXJhZ2luZyB0aGVcbiAqIG11bHRpLWNvcmUgbmF0dXJlIG9mIGRlc2t0b3AgYW5kIG1vYmlsZSBkZXZpY2VzLlxuICpcbiAqIEF0dGFjaCBhbnkgZnVuY3Rpb25zIHRoYXQgY291bGQgYmUgdXNlZCBieSB0aGUgV29ya2VyIGluc2lkZSB0aGUgQmxvYiBiZWxvdy5cbiAqIEFsbCBmdW5jdGlvbnMgYXJlIG5hbWVkIHNvIHRoZXkgY2FuIGJlIGFjY2Vzc2VkIGdsb2JhbGx5LiBTaW5jZSB3ZSdyZVxuICogZGlyZWN0bHkgaW5qZWN0aW5nIHRoZSBtZXRob2RzIGludG8gYW4gQXJyYXkgYW5kIHRoZW4gY2FsbGluZyBgam9pbmAgdGhlXG4gKiBgdG9TdHJpbmdgIG1ldGhvZCB3aWxsIGJlIGludm9rZWQgb24gZWFjaCBmdW5jdGlvbiBhbmQgd2lsbCBpbmplY3QgYSB2YWxpZFxuICogcmVwcmVzZW50YXRpb24gb2YgdGhlIGZ1bmN0aW9uJ3Mgc291cmNlLiBUaGlzIGNvbWVzIGF0IGEgY29zdCBzaW5jZSBCYWJlbFxuICogcmV3cml0ZXMgdmFyaWFibGUgbmFtZXMgd2hlbiB5b3UgYGltcG9ydGAgYSBtb2R1bGUuIFRoaXMgaXMgd2h5IHlvdSdsbCBzZWVcbiAqIHVuZGVyc2NvcmVkIHByb3BlcnRpZXMgYmVpbmcgaW1wb3J0ZWQgYW5kIHRoZW4gcmVhc3NpZ25lZCB0byBub24tdW5kZXJzY29yZWRcbiAqIG5hbWVzIGluIG1vZHVsZXMgdGhhdCBhcmUgcmV1c2VkIGhlcmUuXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBBIFdvcmtlciBpbnN0YW5jZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgbGV0IHdvcmtlckJsb2IgPSBudWxsO1xuICBsZXQgd29ya2VyID0gbnVsbDtcblxuICAvLyBTZXQgdXAgYSBXZWJXb3JrZXIgaWYgYXZhaWxhYmxlLlxuICBpZiAoaGFzV29ya2VyKSB7XG4gICAgLy8gQ29uc3RydWN0IHRoZSB3b3JrZXIgcmV1c2luZyBjb2RlIGFscmVhZHkgb3JnYW5pemVkIGludG8gbW9kdWxlcy4gIEtlZXBcbiAgICAvLyB0aGlzIGNvZGUgRVM1IHNpbmNlIHdlIGRvIG5vdCBnZXQgdGltZSB0byBwcmUtcHJvY2VzcyBpdCBhcyBFUzYuXG4gICAgd29ya2VyQmxvYiA9IG5ldyBCbG9iKFtcbiAgICAgIFtcbiAgICAgICAgLy8gUmV1c2FibGUgQXJyYXkgbWV0aG9kcy5cbiAgICAgICAgJ3ZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTsnLFxuXG4gICAgICAgIC8vIEFkZCBhIG5hbWVzcGFjZSB0byBhdHRhY2ggcG9vbCBtZXRob2RzIHRvLlxuICAgICAgICAndmFyIHBvb2xzID0ge307JyxcbiAgICAgICAgJ3ZhciBub2RlcyA9IDA7JyxcblxuICAgICAgICAvLyBBZGRzIGluIGEgZ2xvYmFsIGB1dWlkYCBmdW5jdGlvbi5cbiAgICAgICAgdXVpZCxcblxuICAgICAgICAvLyBBZGQgdGhlIGFiaWxpdHkgdG8gcHJvdGVjdCBlbGVtZW50cyBmcm9tIGZyZWUnZCBtZW1vcnkuXG4gICAgICAgIHByb3RlY3RFbGVtZW50LFxuICAgICAgICB1bnByb3RlY3RFbGVtZW50LFxuICAgICAgICBjbGVhbk1lbW9yeSxcblxuICAgICAgICAvLyBBZGQgaW4gcG9vbCBtYW5pcHVsYXRpb24gbWV0aG9kcy5cbiAgICAgICAgY3JlYXRlUG9vbCxcbiAgICAgICAgaW5pdGlhbGl6ZVBvb2xzLFxuICAgICAgICAnaW5pdGlhbGl6ZVBvb2xzKCcgKyBwb29sQ291bnQgKyAnKTsnLFxuXG4gICAgICAgIC8vIEFkZCBpbiBOb2RlIG1hbmlwdWxhdGlvbi5cbiAgICAgICAgJ3ZhciBzeW5jTm9kZSA9ICcgKyBzeW5jTm9kZSxcblxuICAgICAgICAvLyBBZGQgaW4gdGhlIGFiaWxpdHkgdG8gcGFyc2VIVE1MLlxuICAgICAgICBwYXJzZUhUTUwsXG5cbiAgICAgICAgJ3ZhciBtYWtlUGFyc2VyID0gJyArIG1ha2VQYXJzZXIsXG4gICAgICAgICd2YXIgcGFyc2VyID0gbWFrZVBhcnNlcigpOycsXG5cbiAgICAgICAgLy8gQWRkIGluIHRoZSB3b3JrZXIgc291cmNlLlxuICAgICAgICB3b3JrZXJTb3VyY2UsXG5cbiAgICAgICAgLy8gTWV0YXByb2dyYW1taW5nIHVwIHRoaXMgd29ya2VyIGNhbGwuXG4gICAgICAgICdzdGFydHVwKHNlbGYpOydcbiAgICAgIF0uam9pbignXFxuJylcbiAgICBdLCB7IHR5cGU6ICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0JyB9KTtcblxuICAgIC8vIENvbnN0cnVjdCB0aGUgd29ya2VyIGFuZCBzdGFydCBpdCB1cC5cbiAgICB0cnkge1xuICAgICAgd29ya2VyID0gbmV3IFdvcmtlcihVUkwuY3JlYXRlT2JqZWN0VVJMKHdvcmtlckJsb2IpKTtcbiAgICB9XG4gICAgY2F0Y2goZXgpIHtcbiAgICAgIGlmIChjb25zb2xlICYmIGNvbnNvbGUuaW5mbykge1xuICAgICAgICBjb25zb2xlLmluZm8oJ0ZhaWxlZCB0byBjcmVhdGUgZGlmZmh0bWwgd29ya2VyJywgZXgpO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB3ZSBjYW5ub3QgY3JlYXRlIGEgV29ya2VyLCB0aGVuIGRpc2FibGUgdHJ5aW5nIGFnYWluLCBhbGwgd29ya1xuICAgICAgLy8gd2lsbCBoYXBwZW4gb24gdGhlIG1haW4gVUkgdGhyZWFkLlxuICAgICAgaGFzV29ya2VyID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHdvcmtlcjtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gVGhlc2UgYXJlIGdsb2JhbGx5IGRlZmluZWQgdG8gYXZvaWQgaXNzdWVzIHdpdGggSlNIaW50IHRoaW5raW5nIHRoYXQgd2UncmVcbi8vIHJlZmVyZW5jaW5nIHVua25vd24gaWRlbnRpZmllcnMuXG52YXIgcGFyc2VIVE1MO1xudmFyIHN5bmNOb2RlO1xudmFyIHBvb2xzO1xuXG4vKipcbiAqIFRoaXMgaXMgdGhlIFdlYiBXb3JrZXIgc291cmNlIGNvZGUuIEFsbCBnbG9iYWxzIGhlcmUgYXJlIGRlZmluZWQgaW4gdGhlXG4gKiB3b3JrZXIvY3JlYXRlIG1vZHVsZS4gVGhpcyBhbGxvd3MgY29kZSBzaGFyaW5nIGFuZCBsZXNzIGR1cGxpY2F0aW9uIHNpbmNlXG4gKiBtb3N0IG9mIHRoZSBsb2dpYyBpcyBpZGVudGljYWwgdG8gdGhlIFVJIHRocmVhZC5cbiAqXG4gKiBAcGFyYW0gd29ya2VyIC0gQSB3b3JrZXIgaW5zdGFuY2VcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3RhcnR1cCh3b3JrZXIpIHtcbiAgdmFyIHBhdGNoZXMgPSBbXTtcbiAgdmFyIG9sZFRyZWUgPSBudWxsO1xuXG4gIC8vIENyZWF0ZSBhcnJheXMgdG8gaG9sZCBlbGVtZW50IGFkZGl0aW9ucyBhbmQgcmVtb3ZhbHMuXG4gIHBhdGNoZXMuYWRkaXRpb25zID0gW107XG4gIHBhdGNoZXMucmVtb3ZhbHMgPSBbXTtcblxuICAvKipcbiAgICogVHJpZ2dlcmVkIHdoZW5ldmVyIGEgYHBvc3RNZXNzYWdlYCBjYWxsIGlzIG1hZGUgb24gdGhlIFdvcmtlciBpbnN0YW5jZVxuICAgKiBmcm9tIHRoZSBVSSB0aHJlYWQuIFNpZ25hbHMgdGhhdCBzb21lIHdvcmsgbmVlZHMgdG8gb2NjdXIuIFdpbGwgcG9zdCBiYWNrXG4gICAqIHRvIHRoZSBtYWluIHRocmVhZCB3aXRoIHBhdGNoIGFuZCBub2RlIHRyYW5zZm9ybSByZXN1bHRzLlxuICAgKlxuICAgKiBAcGFyYW0gZSAtIFRoZSBub3JtYWxpemVkIGV2ZW50IG9iamVjdC5cbiAgICovXG4gIHdvcmtlci5vbm1lc3NhZ2UgPSBmdW5jdGlvbihlKSB7XG4gICAgdmFyIGRhdGEgPSBlLmRhdGE7XG4gICAgdmFyIGlzSW5uZXIgPSBkYXRhLmlzSW5uZXI7XG4gICAgdmFyIG5ld1RyZWUgPSBudWxsO1xuXG4gICAgLy8gQWx3YXlzIHVucHJvdGVjdCBhbGxvY2F0aW9ucyBiZWZvcmUgdGhlIHN0YXJ0IG9mIGEgcmVuZGVyIGN5Y2xlLlxuICAgIGlmIChvbGRUcmVlKSB7IHVucHJvdGVjdEVsZW1lbnQob2xkVHJlZSk7IH1cblxuICAgIC8vIElmIGFuIGBvbGRUcmVlYCB3YXMgcHJvdmlkZWQgYnkgdGhlIFVJIHRocmVhZCwgdXNlIHRoYXQgaW4gcGxhY2Ugb2YgdGhlXG4gICAgLy8gY3VycmVudCBgb2xkVHJlZWAuXG4gICAgaWYgKGRhdGEub2xkVHJlZSkgeyBvbGRUcmVlID0gZGF0YS5vbGRUcmVlOyB9XG5cbiAgICAvLyBJZiB0aGUgYG5ld1RyZWVgIHdhcyBwcm92aWRlZCB0byB0aGUgd29ya2VyLCB1c2UgdGhhdCBpbnN0ZWFkIG9mIHRyeWluZ1xuICAgIC8vIHRvIGNyZWF0ZSBvbmUgZnJvbSBIVE1MIHNvdXJjZS5cbiAgICBpZiAoZGF0YS5uZXdUcmVlKSB7IG5ld1RyZWUgPSBkYXRhLm5ld1RyZWU7IH1cblxuICAgIC8vIElmIG5vIGBuZXdUcmVlYCB3YXMgcHJvdmlkZWQsIHdlJ2xsIGhhdmUgdG8gdHJ5IGFuZCBjcmVhdGUgb25lIGZyb20gdGhlXG4gICAgLy8gSFRNTCBzb3VyY2UgcHJvdmlkZWQuXG4gICAgZWxzZSBpZiAodHlwZW9mIGRhdGEubmV3SFRNTCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIENhbGN1bGF0ZSBhIG5ldyB0cmVlLlxuICAgICAgbmV3VHJlZSA9IHBhcnNlSFRNTChkYXRhLm5ld0hUTUwsIGlzSW5uZXIpO1xuXG4gICAgICAvLyBJZiB0aGUgb3BlcmF0aW9uIGlzIGZvciBgaW5uZXJIVE1MYCB0aGVuIHdlJ2xsIHJldGFpbiB0aGUgcHJldmlvdXNcbiAgICAgIC8vIHRyZWUncyBhdHRyaWJ1dGVzLCBub2RlTmFtZSwgYW5kIG5vZGVWYWx1ZSwgYW5kIG9ubHkgYWRqdXN0IHRoZVxuICAgICAgLy8gY2hpbGROb2Rlcy5cbiAgICAgIGlmIChpc0lubmVyKSB7XG4gICAgICAgIHZhciBjaGlsZE5vZGVzID0gbmV3VHJlZTtcblxuICAgICAgICBuZXdUcmVlID0ge1xuICAgICAgICAgIGNoaWxkTm9kZXMsXG4gICAgICAgICAgYXR0cmlidXRlczogb2xkVHJlZS5hdHRyaWJ1dGVzLFxuICAgICAgICAgIGVsZW1lbnQ6IG9sZFRyZWUuZWxlbWVudCxcbiAgICAgICAgICBub2RlTmFtZTogb2xkVHJlZS5ub2RlTmFtZSxcbiAgICAgICAgICBub2RlVmFsdWU6IG9sZFRyZWUubm9kZVZhbHVlXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU3luY2hyb25pemUgdGhlIG9sZCB2aXJ0dWFsIHRyZWUgd2l0aCB0aGUgbmV3IHZpcnR1YWwgdHJlZS4gIFRoaXMgd2lsbFxuICAgIC8vIHByb2R1Y2UgYSBzZXJpZXMgb2YgcGF0Y2hlcyB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgdG8gdXBkYXRlIHRoZSBET00uXG4gICAgc3luY05vZGUuY2FsbChwYXRjaGVzLCBvbGRUcmVlLCBuZXdUcmVlKTtcblxuICAgIC8vIFByb3RlY3QgdGhlIGN1cnJlbnQgYG9sZFRyZWVgIHNvIHRoYXQgbm8gTm9kZXMgd2lsbCBiZSBhY2NpZGVudGFsbHlcbiAgICAvLyByZWN5Y2xlZCBpbiB0aGVcbiAgICBwcm90ZWN0RWxlbWVudChvbGRUcmVlKTtcblxuICAgIC8vIFNlbmQgdGhlIHBhdGNoZXMgYmFjayB0byB0aGUgdXNlcmxhbmQuXG4gICAgd29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICAgIC8vIE5vZGUgb3BlcmF0aW9uYWwgY2hhbmdlcywgYWRkaXRpb25zIGFuZCByZW1vdmFscy5cbiAgICAgIG5vZGVzOiB7XG4gICAgICAgIGFkZGl0aW9uczogcGF0Y2hlcy5hZGRpdGlvbnMsXG4gICAgICAgIHJlbW92YWxzOiBwYXRjaGVzLnJlbW92YWxzXG4gICAgICB9LFxuXG4gICAgICAvLyBBbGwgdGhlIHBhdGNoZXMgdG8gYXBwbHkgdG8gdGhlIERPTS5cbiAgICAgIHBhdGNoZXM6IHBhdGNoZXNcbiAgICB9KTtcblxuICAgIC8vIFJlY3ljbGUgYWxsb2NhdGVkIG9iamVjdHMgYmFjayBpbnRvIHRoZSBwb29sLlxuICAgIGNsZWFuTWVtb3J5KCk7XG5cbiAgICAvLyBXaXBlIG91dCB0aGUgcGF0Y2hlcyBpbiBtZW1vcnkuXG4gICAgcGF0Y2hlcy5sZW5ndGggPSAwO1xuICAgIHBhdGNoZXMuYWRkaXRpb25zLmxlbmd0aCA9IDA7XG4gICAgcGF0Y2hlcy5yZW1vdmFscy5sZW5ndGggPSAwO1xuICB9O1xufVxuIiwiXG52YXIgTmF0aXZlQ3VzdG9tRXZlbnQgPSBnbG9iYWwuQ3VzdG9tRXZlbnQ7XG5cbmZ1bmN0aW9uIHVzZU5hdGl2ZSAoKSB7XG4gIHRyeSB7XG4gICAgdmFyIHAgPSBuZXcgTmF0aXZlQ3VzdG9tRXZlbnQoJ2NhdCcsIHsgZGV0YWlsOiB7IGZvbzogJ2JhcicgfSB9KTtcbiAgICByZXR1cm4gICdjYXQnID09PSBwLnR5cGUgJiYgJ2JhcicgPT09IHAuZGV0YWlsLmZvbztcbiAgfSBjYXRjaCAoZSkge1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBDcm9zcy1icm93c2VyIGBDdXN0b21FdmVudGAgY29uc3RydWN0b3IuXG4gKlxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0N1c3RvbUV2ZW50LkN1c3RvbUV2ZW50XG4gKlxuICogQHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gdXNlTmF0aXZlKCkgPyBOYXRpdmVDdXN0b21FdmVudCA6XG5cbi8vIElFID49IDlcbidmdW5jdGlvbicgPT09IHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFdmVudCA/IGZ1bmN0aW9uIEN1c3RvbUV2ZW50ICh0eXBlLCBwYXJhbXMpIHtcbiAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcbiAgaWYgKHBhcmFtcykge1xuICAgIGUuaW5pdEN1c3RvbUV2ZW50KHR5cGUsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSwgcGFyYW1zLmRldGFpbCk7XG4gIH0gZWxzZSB7XG4gICAgZS5pbml0Q3VzdG9tRXZlbnQodHlwZSwgZmFsc2UsIGZhbHNlLCB2b2lkIDApO1xuICB9XG4gIHJldHVybiBlO1xufSA6XG5cbi8vIElFIDw9IDhcbmZ1bmN0aW9uIEN1c3RvbUV2ZW50ICh0eXBlLCBwYXJhbXMpIHtcbiAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCgpO1xuICBlLnR5cGUgPSB0eXBlO1xuICBpZiAocGFyYW1zKSB7XG4gICAgZS5idWJibGVzID0gQm9vbGVhbihwYXJhbXMuYnViYmxlcyk7XG4gICAgZS5jYW5jZWxhYmxlID0gQm9vbGVhbihwYXJhbXMuY2FuY2VsYWJsZSk7XG4gICAgZS5kZXRhaWwgPSBwYXJhbXMuZGV0YWlsO1xuICB9IGVsc2Uge1xuICAgIGUuYnViYmxlcyA9IGZhbHNlO1xuICAgIGUuY2FuY2VsYWJsZSA9IGZhbHNlO1xuICAgIGUuZGV0YWlsID0gdm9pZCAwO1xuICB9XG4gIHJldHVybiBlO1xufVxuIl19
