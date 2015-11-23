define(function(require, exports, module) {
  'use strict';

  var transitionStates = require('../transition_states');
  var decodeEntities = require('../util/decode');
  var getElement = require('../element/get');
  var components = require('../element/custom').components;
  var makeNode = require('../node/make');

  var forEach = Array.prototype.forEach;
  var empty = { prototype: {} };

  /**
   * Processes an Array of patches.
   *
   * @param element - Element to process patchsets on.
   * @param e - Object that contains patches.
   */
  function process(element, patches) {
    var states = transitionStates;
    var promises = [];
    var addPromises = promises.push.apply.bind(promises.push, promises);

    // Trigger the attached transition state for this element and all
    // childNodes.
    var attachedTransitionAndTitle = function(el) {
      var element = getElement(el).element;

      if (el.nodeName === '#text' || el.nodeName === 'text') {
        // Trigger all the text changed values.
        if (states && states.textChanged && states.textChanged.length) {
          addPromises(states.textChanged.map(function(callback) {
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

    var callCallback = function(callback) {
      return callback(this);
    };

    var attachedCallback = function(elementDescriptor) {
      var el = getElement(elementDescriptor).element;
      var fragment = this.fragment;
      var customElement = components[elementDescriptor.nodeName] || empty;

      if (customElement.prototype.attachedCallback) {
        customElement.prototype.attachedCallback.call(el);
      }

      if (el.nodeName === '#text') {
        el.textContent = decodeEntities(el.textContent);
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

    var titleCallback = function(elementDescriptor) {
      var el = getElement(elementDescriptor).element;

      // Ensure the title is set correctly.
      if (el.tagName === 'title') {
        el.ownerDocument.title = el.childNodes[0].nodeValue;
      }
    };

    // Loop through all the patches and apply them.
    for (var i = 0; i < patches.length; i++) {
      var patch = patches[i];
      var newDescriptor, oldDescriptor, elementDescriptor;
      var element = patch.new;

      if (patch.element) {
        elementDescriptor = patch.element;

        var result = getElement(patch.element);
        patch.element = result.element;
      }

      if (patch.old) {
        oldDescriptor = patch.old;

        var result = getElement(patch.old);
        patch.old = result.element;
      }

      if (patch.new) {
        newDescriptor = patch.new;

        var result = getElement(patch.new);
        patch.new = result.element;
      }

      if (element && element.nodeName === '#text') {
        patch.new.textContent = decodeEntities(element.nodeValue);
      }

      // Replace the entire Node.
      if (patch.__do__ === 0) {
        patch.old.parentNode.replaceChild(patch.new, patch.old);

        var oldCustomElement = components[oldDescriptor.nodeName] || empty;
        var newCustomElement = components[newDescriptor.nodeName] || empty;

        if (oldCustomElement.prototype.detachedCallback) {
          oldCustomElement.prototype.detachedCallback.call(patch.old);
        }

        if (newCustomElement.prototype.attachedCallback) {
          newCustomElement.prototype.attachedCallback.call(patch.new);
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
        else if (patch.old && !patch.new) {
          if (!patch.old.parentNode) {
            throw new Error('Can\'t remove without parent, is this the ' +
              'document root?');
          }

          // Ensure the title is emptied.
          if (patch.old.tagName === 'title') {
            patch.old.ownerDocument.title = '';
          }

          var customElement = components[oldDescriptor.nodeName] || empty;

          if (customElement.prototype.detachedCallback) {
            customElement.prototype.detachedCallback.call(patch.old);
          }

          patch.old.parentNode.removeChild(patch.old);

          if (states && states.detached && states.detached.length) {
            addPromises(states.detached.map(callCallback, patch.old));
          }

          makeNode.nodes[oldDescriptor.uuid] = undefined;
        }

        // Replace.
        else if (patch.old && patch.new) {
          if (!patch.old.parentNode) {
            throw new Error('Can\'t replace without parent, is this the ' +
              'document root?');
          }

          // Append the element first, before doing the replacement.
          patch.old.parentNode.insertBefore(patch.new, patch.old.nextSibling);

          // Removed state for transitions API.
          if (states && states.detached && states.detached.length) {
            addPromises(states.detached.map(callCallback, patch.old));
          }

          // Replaced state for transitions API.
          if (states && states.replaced && states.replaced.length) {
            addPromises(states.replaced.map(function(callback) {
              return callback(patch.old, patch.new);
            }));
          }

          // Ensure the title is set correctly.
          if (patch.new.tagName === 'title') {
            patch.old.ownerDocument.title = patch.new.childNodes[0].nodeValue;
          }

          patch.old.parentNode.replaceChild(patch.new, patch.old);

          var oldCustomElement = components[oldDescriptor.nodeName] || empty;
          var newCustomElement = components[newDescriptor.nodeName] || empty;

          if (oldCustomElement.prototype.detachedCallback) {
            oldCustomElement.prototype.detachedCallback.call(patch.old);
          }

          if (newCustomElement.prototype.attachedCallback) {
            newCustomElement.prototype.attachedCallback.call(patch.new);
          }

          // Added state for transitions API.
          if (states && states.attached && states.attached.length) {
            attachedTransitionAndTitle(newDescriptor);
          }

          makeNode.nodes[oldDescriptor.uuid] = undefined;
        }
      }

      // Attribute manipulation.
      else if (patch.__do__ === 2) {
        var oldValue = patch.element.getAttribute(patch.name);

        // Changes the attribute on the element.
        var augmentAttribute = function() {
          // Remove.
          if (!patch.value) { patch.element.removeAttribute(patch.name); }
          // Change.
          else { patch.element.setAttribute(patch.name, patch.value); }
        };

        // Trigger all the attribute changed values.
        if (states && states.attributeChanged && states.attributeChanged.length) {
          addPromises(states.attributeChanged.map(function(callback) {
            var promise = callback(patch.element, patch.name, oldValue,
              patch.value);

            if (promise) { promise.then(augmentAttribute); }
            else { augmentAttribute(); }

            return promise;
          }));
        }
        else {
          augmentAttribute();
        }

        // Trigger custom element attributeChanged events.
        var customElement = components[elementDescriptor.nodeName] || empty;

        if (customElement.attributeChangedCallback) {
          customElement.prototype.attributeChangedCallback.call(patch.old,
            patch.name, oldValue, patch.value);
        }
      }

      // Text node manipulation.
      else if (patch.__do__ === 3) {
        var originalValue = patch.element.textContent;

        // Changes the text.
        var augmentText = function() {
          patch.element.textContent = decodeEntities(patch.value);
        };

        // Trigger all the text changed values.
        if (states && states.textChanged && states.textChanged.length) {
          addPromises(states.textChanged.map(function(callback) {
            var promise = callback(patch.element.parentNode || patch.element,
              originalValue, patch.value);

            if (promise) { promise.then(augmentText); }
            else { augmentText(); }

            return promise;
          }));
        }
        else {
          augmentText();
        }
      }
    }

    var activePromises = promises.filter(Boolean);

    // Wait until all transition promises have resolved.
    if (activePromises.length) {
      return Promise.all(promises.filter(Boolean));
    }
  }

  module.exports = process;
});
