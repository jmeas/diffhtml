import { transitionStates } from '../transitions';
import { pools } from '../util/pools';
import decodeEntities from '../util/decode';
import getElement from '../element/get';
import { components } from '../element/custom';
import makeNode from '../node/make';

var forEach = Array.prototype.forEach;
var empty = { prototype: {} };

/**
 * Processes an Array of patches.
 *
 * @param element - Element to process patchsets on.
 * @param e - Object that contains patches.
 */
export default function process(element, patches) {
  var states = transitionStates;
  var promises = [];
  var addPromises = promises.push.apply.bind(promises.push, promises);

  // Trigger the attached transition state for this element and all childNodes.
  var attachedTransitionAndTitle = function(el) {
    var element = getElement(el).element;

    if (el.nodeName === '#text' || el.nodeName === 'text') {
      // Trigger all the text changed values.
      if (states && states.textChanged && states.textChanged.length) {
        addPromises(states.textChanged.map(callback => {
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

  // Recursively searches an element for detach transitions and pushes into
  // an array that will then be added to the global promise array.
  let findAllDetachPromises = function(el, detachPromises) {
    if (el.nodeName === '#text' || el.nodeName === 'text') { return; }

    let promises = states.detached.map(callCallback, el).filter(Boolean);

    if (promises.length) {
      detachPromises.push.apply(detachPromises, promises);
    }

    forEach.call(el.childNodes, function(childEl) {
      findAllDetachPromises(childEl, detachPromises);
    });
  };

  var callCallback = function(callback) {
    return callback(this);
  };

  var attachedCallback = function(elementDescriptor) {
    let el = getElement(elementDescriptor).element;
    let fragment = this.fragment;
    let customElement = components[elementDescriptor.nodeName] || empty;

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
    let el = getElement(elementDescriptor).element;

    // Ensure the title is set correctly.
    if (el.tagName === 'title') {
      el.ownerDocument.title = el.childNodes[0].nodeValue;
    }
  };

  // Loop through all the patches and apply them.
  for (let i = 0; i < patches.length; i++) {
    let patch = patches[i];
    let newDescriptor, oldDescriptor, elementDescriptor;
    let element = patch.new;

    if (patch.element) {
      elementDescriptor = patch.element;

      let result = getElement(patch.element);
      patch.element = result.element;
    }

    if (patch.old) {
      oldDescriptor = patch.old;

      let result = getElement(patch.old);
      patch.old = result.element;
    }

    if (patch.new) {
      newDescriptor = patch.new;

      let result = getElement(patch.new);
      patch.new = result.element;
    }

    if (element && element.nodeName === '#text') {
      patch.new.textContent = decodeEntities(element.nodeValue);
    }

    // Replace the entire Node.
    if (patch.__do__ === 0) {
      patch.old.parentNode.replaceChild(patch.new, patch.old);

      let oldCustomElement = components[oldDescriptor.nodeName] || empty;
      let newCustomElement = components[newDescriptor.nodeName] || empty;

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
        let fragment = document.createDocumentFragment();

        patch.fragment.forEach(attachedCallback, { fragment });
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

        let customElement = components[oldDescriptor.nodeName] || empty;

        if (customElement.prototype.detachedCallback) {
          customElement.prototype.detachedCallback.call(patch.old);
        }

        if (states && states.detached && states.detached.length) {
          let promises = [];
          findAllDetachPromises(patch.old, promises);

          if (!promises.length) {
            patch.old.parentNode.removeChild(patch.old);
          }
          else {
            Promise.all(promises).then(function() {
              patch.old.parentNode.removeChild(patch.old);
            });
          }
        }
        else {
          patch.old.parentNode.removeChild(patch.old);
        }

        makeNode.nodes[oldDescriptor.element] = undefined;
      }

      // Replace.
      else if (patch.old && patch.new) {
        if (!patch.old.parentNode) {
          throw new Error('Can\'t replace without parent, is this the ' +
            'document root?');
        }

        // Append the element first, before doing the replacement.
        patch.old.parentNode.insertBefore(patch.new, patch.old.nextSibling);

        var promises = [];

        // Removed state for transitions API.
        if (states && states.detached && states.detached.length) {
          let detachedPromises = states.detached.map(callCallback, patch.old)
            .filter(Boolean);

          if (detachedPromises.length) {
            addPromises(detachedPromises);
            promises.push.apply(promises, detachedPromises);
          }
        }

        // Replaced state for transitions API.
        if (states && states.replaced && states.replaced.length) {
          let replacedPromises = states.replaced.map(callback => {
            return callback(patch.old, patch.new);
          }).filter(Boolean);

          if (replacedPromises.length) {
            addPromises(replacedPromises);
            promises.push.apply(promises, replacedPromises);
          }
        }

        // Ensure the title is set correctly.
        if (patch.new.tagName === 'title') {
          patch.old.ownerDocument.title = patch.new.childNodes[0].nodeValue;
        }

        if (!promises.length) {
          patch.old.parentNode.replaceChild(patch.new, patch.old);
        }
        else {
          Promise.all(promises).then(function() {
            patch.old.parentNode.replaceChild(patch.new, patch.old);
          });
        }

        let oldCustomElement = components[oldDescriptor.nodeName] || empty;
        let newCustomElement = components[newDescriptor.nodeName] || empty;

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

        makeNode.nodes[oldDescriptor.element] = undefined;
      }
    }

    // Attribute manipulation.
    else if (patch.__do__ === 2) {
      let oldValue = patch.element.getAttribute(patch.name);

      // Changes the attribute on the element.
      let augmentAttribute = function() {
        // Remove.
        if (patch.value === undefined) {
          patch.element.removeAttribute(patch.name);
        }
        // Change.
        else {
          patch.element.setAttribute(patch.name, patch.value);

          // Support live updating of the value attribute.
          if (patch.name === 'value') {
            patch.element[patch.name] = patch.value;
          }
        }
      };

      // Trigger all the attribute changed values.
      if (states && states.attributeChanged && states.attributeChanged.length) {
        addPromises(states.attributeChanged.map(callback => {
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
      let customElement = components[elementDescriptor.nodeName] || empty;

      if (customElement.attributeChangedCallback) {
        customElement.prototype.attributeChangedCallback.call(patch.old,
          patch.name, oldValue, patch.value);
      }
    }

    // Text node manipulation.
    else if (patch.__do__ === 3) {
      let originalValue = patch.element.textContent;

      // Changes the text.
      let augmentText = function() {
        patch.element.textContent = decodeEntities(patch.value);
      };

      // Trigger all the text changed values.
      if (states && states.textChanged && states.textChanged.length) {
        addPromises(states.textChanged.map(callback => {
          var promise = callback(patch.element.parentNode || patch.element,
            originalValue, patch.value);

          if (promise) { promise.then(augmentText); }
          else { augmentText(); }

          return promise;
        }));
      }
      else {
        patch.element.textContent = decodeEntities(patch.value);
      }
    }
  }

  var activePromises = promises.filter(Boolean);

  // Wait until all transition promises have resolved.
  if (activePromises.length) {
    return Promise.all(promises.filter(Boolean));
  }
}
