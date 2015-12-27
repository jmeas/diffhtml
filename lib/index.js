import { patchNode, releaseNode, registerNode } from './node/patch';
import { transitionStates } from './transitions';
import { components } from './element/custom';

import { TransitionStateError, DOMException } from './errors';

// Store a reference to the real `registerElement` method if it exists.
var realRegisterElement = document.registerElement;

const diff = {
  // Export the custom Error constructors so that instanceof checks can be made
  // by those publicly consuming this library.
  TransitionStateError,
  DOMException,

  /**
   * Used to diff the outerHTML contents of the passed element with the markup
   * contents.  Very useful for applying a global diff on the
   * `document.documentElement`.
   *
   * @param element
   * @param markup=''
   * @param options={}
   */
  outerHTML(element, markup='', options={}) {
    options.inner = false;
    patchNode(element, markup, options);
  },

  /**
   * Used to diff the innerHTML contents of the passed element with the markup
   * contents.  This is useful with libraries like Backbone that render Views
   * into element container.
   *
   * @param element
   * @param markup=''
   * @param options={}
   */
   innerHTML(element, markup='', options={}) {
    options.inner = true;
    patchNode(element, markup, options);
  },

  /**
   * Used to diff two elements.  The `inner` Boolean property can be specified in
   * the options to set innerHTML\outerHTML behavior.  By default it is
   * outerHTML.
   *
   * @param element
   * @param newElement
   * @param options={}
   */
  element(element, newElement, options={}) {
    patchNode(element, newElement, options);
  },

  /**
   * Releases the worker and memory allocated to this element. Useful for
   * cleaning up components when removed in tests and applications.
   *
   * @param element
   */
  release(element) {
    releaseNode(element);
  },

  /**
   * Register's a constructor with an element to provide lifecycle events.
   *
   * @param tagName
   * @param constructor
   */
   registerElement(tagName, constructor) {
    // Upgrade simple objects to inherit from HTMLElement and be usable in a real
    // implementation.
    var normalizedConstructor = constructor.prototype ? constructor : null;

    if (!normalizedConstructor) {
      constructor.__proto__ = HTMLElement.prototype;
      normalizedConstructor = function() {};
      normalizedConstructor.prototype = constructor;
    }

    // If the native web component specification is loaded, use that instead.
    if (realRegisterElement) {
      return realRegisterElement.call(document, tagName, normalizedConstructor);
    }

    // If the element has already been registered, raise an error.
    if (tagName in components) {
      throw new DOMException(`
        Failed to execute 'registerElement' on 'Document': Registration failed
        for type '${tagName}'. A type with that name is already registered.
      `);
    }

    // Assign the custom element reference to the constructor.
    components[tagName] = normalizedConstructor;
  },

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
  addTransitionState(state, callback) {
    if (!state) {
      throw new TransitionStateError('Missing transition state name');
    }

    if (!callback) {
      throw new TransitionStateError('Missing transition state callback');
    }

    // Not a valid state name.
    if (Object.keys(transitionStates).indexOf(state) === -1) {
      throw new TransitionStateError('Invalid state name: ' + state);
    }

    transitionStates[state].push(callback);
  },

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
  removeTransitionState(state, callback) {
    if (!callback && state) {
      transitionStates[state].length = 0;
    }
    else if (state && callback) {
      // Not a valid state name.
      if (Object.keys(transitionStates).indexOf(state) === -1) {
        throw new TransitionStateError('Invalid state name ' + state);
      }

      let index = transitionStates[state].indexOf(callback);
      transitionStates[state].splice(index, 1);
    }
    else {
      for (let state in transitionStates) {
        transitionStates[state].length = 0;
      }
    }
  },

  /**
   * By calling this function your browser environment is enhanced globally. This
   * project would love to hit the standards track and allow all developers to
   * benefit from the performance gains of DOM diffing.
   */
  enableProllyfill() {
    // Exposes the `TransitionStateError` constructor globally so that developers
    // can instanceof check exception errors.
    // Object.defineProperty(window, 'TransitionStateError', {
    //   configurable: true,
    //
    //   value: TransitionStateError
    // });

    // Allows a developer to add transition state callbacks.
    Object.defineProperty(document, 'addTransitionState', {
      configurable: true,

      value(state, callback) {
        addTransitionState(state, callback);
      }
    });

    // Allows a developer to remove transition state callbacks.
    Object.defineProperty(document, 'removeTransitionState', {
      configurable: true,

      value(state, callback) {
        removeTransitionState(state, callback);
      }
    });

    // Allows a developer to set the `innerHTML` of an element.
    Object.defineProperty(Element.prototype, 'diffInnerHTML', {
      configurable: true,

      set(newHTML) {
        diff.innerHTML(this, newHTML);
      }
    });

    // Allows a developer to set the `outerHTML` of an element.
    Object.defineProperty(Element.prototype, 'diffOuterHTML', {
      configurable: true,

      set(newHTML) {
        diff.outerHTML(this, newHTML);
      }
    });

    // Allows a developer to diff the current element with a new element.
    Object.defineProperty(Element.prototype, 'diffElement', {
      configurable: true,

      value(newElement, options) {
        element(this, newElement, options);
      }
    });

    // Releases the retained memory and worker instance.
    Object.defineProperty(Element.prototype, 'diffRelease', {
      configurable: true,

      value(newElement) {
        releaseNode(this);
      }
    });

    // Polyfill in the `registerElement` method if it doesn't already exist. This
    // requires patching `createElement` as well to ensure that the proper proto
    // chain exists.
    Object.defineProperty(document, 'registerElement', {
      configurable: true,

      value(tagName, component) {
        registerElement(tagName, component);
      }
    });

    // If HTMLElement is an object, rejigger it to work like a function so that
    // it can be extended. Specifically affects IE and Safari.
    if (typeof Element === 'object' || typeof HTMLElement === 'object') {
      // Fall back to the Element constructor if the HTMLElement does not exist.
      let realHTMLElement = HTMLElement || Element;

      // If there is no `__proto__` available, add one to the prototype.
      if (!realHTMLElement.__proto__) {
        let copy = {
          set: function(val) {
            val = Object.keys(val).length ? val : Object.getPrototypeOf(val);
            for (let key in val) {
              if (val.hasOwnProperty(key)) {
                this[key] = val[key];
              }
            }
          }
        };

        Object.defineProperty(realHTMLElement, '__proto__', copy);
        Object.defineProperty(realHTMLElement.prototype, '__proto__', copy);
      }

      HTMLElement = function() {};
      HTMLElement.prototype = Object.create(realHTMLElement.prototype);
      HTMLElement.__proto__ = realHTMLElement;

      // Ensure that the global Element matches the HTMLElement.
      Element = HTMLElement;
    }

    /**
     * Will automatically activate any components found in the page automatically
     * after calling `enableProllyfill`. This is useful to simulate a real-world
     * usage of Custom Elements.
     */
    let activateComponents = function() {
      var documentElement = document.documentElement;

      // After the initial render, clean up the resources, no point in lingering.
      documentElement.addEventListener('renderComplete', function render() {
        // Release resources allocated to the element.
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
    if (document.readyState === 'complete') { activateComponents(); }
  }
};

export default diff;
