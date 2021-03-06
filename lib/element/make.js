import * as svg from '../svg';
import makeNode from '../node/make';
import { components, upgrade } from './custom';

var empty = { prototype: {} };

/**
 * Takes in a virtual descriptor and creates an HTML element. Set's the element
 * into the cache.
 *
 * @param descriptor
 * @return {Element}
 */
export default function make(descriptor) {
  var element = null;
  var isSvg = false;
  // Get the custom element constructor for a given element.
  var CustomElement = components[descriptor.nodeName] || empty;

  if (makeNode.nodes[descriptor.element]) {
    return makeNode.nodes[descriptor.element];
  }

  if (descriptor.nodeName === '#text') {
    element = document.createTextNode(descriptor.nodeValue);
  }
  else {
    if (svg.elements.indexOf(descriptor.nodeName) > -1) {
      isSvg = true;
      element = document.createElementNS(svg.namespace, descriptor.nodeName);
    }
    else {
      element = document.createElement(descriptor.nodeName);
    }

    if (descriptor.attributes && descriptor.attributes.length) {
      for (let i = 0; i < descriptor.attributes.length; i++) {
        let attribute = descriptor.attributes[i];
        element.setAttribute(attribute.name, attribute.value);
      }
    }

    if (descriptor.childNodes && descriptor.childNodes.length) {
      for (let i = 0; i < descriptor.childNodes.length; i++) {
        element.appendChild(make(descriptor.childNodes[i]));
      }
    }
  }

  // Always set the node's value.
  if (descriptor.nodeValue) {
    element.textContent = descriptor.nodeValue;
  }

  // Upgrade the element after creating it.
  upgrade(descriptor.nodeName, element);

  // Custom elements have a createdCallback method that should be called.
  if (CustomElement.prototype.createdCallback) {
    CustomElement.prototype.createdCallback.call(element);
  }

  // Add to the nodes cache using the designated uuid as the lookup key.
  makeNode.nodes[descriptor.element] = element;

  return element;
}
