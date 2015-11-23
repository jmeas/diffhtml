(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.diff = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';
var empty = function () {
};
var components = {};
exports.components = components;
function upgrade(tagName, element) {
    var CustomElement = components[tagName] || empty;
    if (element instanceof CustomElement) {
        return false;
    }
    if (CustomElement !== empty) {
        element.__proto__ = Object.create(CustomElement.prototype);
    }
    if (CustomElement.prototype.createdCallback) {
        CustomElement.prototype.createdCallback.call(element);
    }
    return true;
}
exports.upgrade = upgrade;
},{}],2:[function(_dereq_,module,exports){
'use strict';
var makeNode = _dereq_('../node/make');
var makeElement = _dereq_('../element/make');
function get(ref) {
    var uuid = ref.uuid || ref;
    var element = makeNode.nodes[uuid] || makeElement(ref);
    return {
        element: element,
        uuid: uuid
    };
}
module.exports = get;
},{"../element/make":3,"../node/make":7}],3:[function(_dereq_,module,exports){
'use strict';
var svg = _dereq_('../svg');
var makeNode = _dereq_('../node/make');
var components = _dereq_('./custom').components;
var upgrade = _dereq_('./custom').upgrade;
var empty = { prototype: {} };
function make(descriptor) {
    var element = null;
    var isSvg = false;
    var CustomElement = components[descriptor.nodeName] || empty;
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
    if (descriptor.nodeValue) {
        element.textContent = descriptor.nodeValue;
    }
    upgrade(descriptor.nodeName, element);
    if (CustomElement.prototype.createdCallback) {
        CustomElement.prototype.createdCallback.call(element);
    }
    makeNode.nodes[descriptor.uuid] = element;
    return element;
}
module.exports = make;
},{"../node/make":7,"../svg":12,"./custom":1}],4:[function(_dereq_,module,exports){
'use strict';
var inherits = _dereq_('../util/inherits');
var missingStackTrace = 'Browser doesn\'t support error stack traces.';
function DOMException(message) {
    Error.call(this);
    this.message = 'Uncaught DOMException: ' + message;
    this.stack = this.stack || missingStackTrace;
}
inherits(DOMException, Error);
module.exports = DOMException;
},{"../util/inherits":15}],5:[function(_dereq_,module,exports){
'use strict';
var inherits = _dereq_('../util/inherits');
var missingStackTrace = 'Browser doesn\'t support error stack traces.';
function TransitionStateError(message) {
    Error.call(this, message);
    this.message = message;
    this.stack = this.stack || missingStackTrace;
}
inherits(TransitionStateError, Error);
module.exports = TransitionStateError;
},{"../util/inherits":15}],6:[function(_dereq_,module,exports){
'use strict';
var patchNode = _dereq_('./node/patch').patchNode;
var releaseNode = _dereq_('./node/patch').releaseNode;
var transitionStates = _dereq_('./transition_states');
var components = _dereq_('./element/custom').components;
var TransitionStateError = _dereq_('./error/transition_state');
exports.TransitionStateError = TransitionStateError;
var DOMException = _dereq_('./error/dom_exception');
exports.DOMException = DOMException;
var realRegisterElement = document.register || document.registerElement;
function outerHTML(element, markup, options) {
    if (!element || !(element instanceof Element)) {
        throw new DOMException('Element is missing or invalid.');
    }
    markup = markup || '';
    options = options || {};
    options.inner = false;
    patchNode(element, markup, options);
}
exports.outerHTML = outerHTML;
function innerHTML(element, markup, options) {
    markup = markup || '';
    options = options || {};
    options.inner = true;
    patchNode(element, markup, options);
}
exports.innerHTML = innerHTML;
function element(element, newElement, options) {
    options = options || {};
    if (!newElement || !(newElement instanceof Element)) {
        throw new Error('New element is missing Element from its prototype');
    }
    patchNode(element, newElement, options);
}
exports.element = element;
exports.release = releaseNode;
function registerElement(tagName, constructor) {
    var normalizedConstructor = constructor.prototype ? constructor : null;
    if (!normalizedConstructor) {
        constructor.__proto__ = HTMLElement.prototype;
        normalizedConstructor = function () {
        };
        normalizedConstructor.prototype = constructor;
    }
    if (realRegisterElement) {
        return realRegisterElement.call(document, tagName, normalizedConstructor);
    }
    if (tagName in components) {
        throw new DOMException([
            'Failed to execute \'registerElement\' on \'Document\': Registration ',
            'failed for type \'',
            tagName,
            '\'. A type with that name is already ',
            'registered.'
        ].join(''));
    }
    components[tagName] = normalizedConstructor;
}
exports.registerElement = registerElement;
function addTransitionState(state, callback) {
    if (!state) {
        throw new TransitionStateError('Missing transition state name');
    }
    if (!callback) {
        throw new TransitionStateError('Missing transition state callback');
    }
    if (Object.keys(transitionStates).indexOf(state) === -1) {
        throw new TransitionStateError('Invalid state name: ' + state);
    }
    transitionStates[state].push(callback);
}
exports.addTransitionState = addTransitionState;
function removeTransitionState(state, callback) {
    if (!callback && state) {
        transitionStates[state].length = 0;
    } else if (state && callback) {
        if (Object.keys(transitionStates).indexOf(state) === -1) {
            throw new TransitionStateError('Invalid state name ' + state);
        }
        let index = transitionStates[state].indexOf(callback);
        transitionStates[state].splice(index, 1);
    } else {
        for (let state in transitionStates) {
            transitionStates[state].length = 0;
        }
    }
}
exports.removeTransitionState = removeTransitionState;
function enableProllyfill() {
    Object.defineProperty(window, 'TransitionStateError', {
        configurable: true,
        value: TransitionStateError
    });
    Object.defineProperty(document, 'addTransitionState', {
        configurable: true,
        value: function (state, callback) {
            addTransitionState(state, callback);
        }
    });
    Object.defineProperty(document, 'removeTransitionState', {
        configurable: true,
        value: function (state, callback) {
            removeTransitionState(state, callback);
        }
    });
    Object.defineProperty(Element.prototype, 'diffInnerHTML', {
        configurable: true,
        set: function (newHTML) {
            innerHTML(this, newHTML);
        }
    });
    Object.defineProperty(Element.prototype, 'diffOuterHTML', {
        configurable: true,
        set: function (newHTML) {
            outerHTML(this, newHTML);
        }
    });
    Object.defineProperty(Element.prototype, 'diffElement', {
        configurable: true,
        value: function (newElement, options) {
            element(this, newElement, options);
        }
    });
    Object.defineProperty(Element.prototype, 'diffRelease', {
        configurable: true,
        value: function (newElement) {
            releaseNode(this);
        }
    });
    Object.defineProperty(document, 'registerElement', {
        configurable: true,
        value: function (tagName, component) {
            registerElement(tagName, component);
        }
    });
    if (typeof Element === 'object' || typeof HTMLElement === 'object') {
        let realHTMLElement = HTMLElement || Element;
        if (!realHTMLElement.__proto__) {
            let copy = {
                    set: function (val) {
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
        HTMLElement = function () {
        };
        HTMLElement.prototype = Object.create(realHTMLElement.prototype);
        HTMLElement.__proto__ = realHTMLElement;
        Element = HTMLElement;
    }
    let activateComponents = function () {
        var documentElement = document.documentElement;
        documentElement.addEventListener('renderComplete', function render() {
            documentElement.diffRelease(documentElement);
            documentElement.removeEventListener('renderComplete', render);
        });
        documentElement.diffOuterHTML = documentElement.outerHTML;
        window.removeEventListener('load', activateComponents);
    };
    window.addEventListener('load', activateComponents);
    if (document.readyState === 'complete') {
        activateComponents();
    }
}
exports.enableProllyfill = enableProllyfill;
},{"./element/custom":1,"./error/dom_exception":4,"./error/transition_state":5,"./node/patch":8,"./transition_states":13}],7:[function(_dereq_,module,exports){
'use strict';
var poolsCache = _dereq_('../util/pools').cache;
var protectElement = _dereq_('../util/memory').protectElement;
var unprotectElement = _dereq_('../util/memory').unprotectElement;
var components = _dereq_('../element/custom').components;
var upgrade = _dereq_('../element/custom').upgrade;
var empty = {};
make.nodes = {};
function make(node, protect) {
    var nodeType = node.nodeType;
    var nodeValue = node.nodeValue;
    if (!nodeType || nodeType === 2 || nodeType === 4 || nodeType === 8) {
        return false;
    }
    if (nodeType === 3 && !nodeValue.trim()) {
        return false;
    }
    var entry = poolsCache.elementObject.get();
    make.nodes[entry.uuid] = node;
    entry.nodeName = node.nodeName.toLowerCase();
    entry.nodeValue = nodeValue;
    entry.childNodes.length = 0;
    entry.attributes.length = 0;
    if (protect) {
        protectElement(entry);
    }
    var attributes = node.attributes;
    if (attributes) {
        var attributesLength = attributes.length;
        if (attributesLength) {
            for (var i = 0; i < attributesLength; i++) {
                var attr = poolsCache.attributeObject.get();
                if (protect) {
                    poolsCache.attributeObject.protect(attr);
                }
                attr.name = attributes[i].name;
                attr.value = attributes[i].value;
                entry.attributes[entry.attributes.length] = attr;
            }
        }
    }
    var childNodes = node.childNodes;
    var childNodesLength = node.childNodes.length;
    if (node.nodeType !== 3 && childNodes) {
        for (var i = 0; i < childNodesLength; i++) {
            var newNode = make(childNodes[i], protect);
            if (newNode) {
                entry.childNodes[entry.childNodes.length] = newNode;
            }
        }
    }
    if (protect) {
        if (components[entry.nodeName]) {
            if (upgrade(entry.nodeName, node)) {
                if (node.parentNode && node.attachedCallback) {
                    node.attachedCallback();
                }
            }
        }
    }
    return entry;
}
module.exports = make;
},{"../element/custom":1,"../util/memory":16,"../util/pools":18}],8:[function(_dereq_,module,exports){
'use strict';
var createWorker = _dereq_('../worker/create').createWorker;
var hasWorker = _dereq_('../worker/create').hasWorker;
var cleanMemory = _dereq_('../util/memory').cleanMemory;
var protectElement = _dereq_('../util/memory').protectElement;
var unprotectElement = _dereq_('../util/memory').unprotectElement;
var poolsCache = _dereq_('../util/pools').cache;
var parseHTML = _dereq_('../util/parser').parseHTML;
var processPatches = _dereq_('../patch/process');
var makeNode = _dereq_('./make');
var makeElement = _dereq_('../element/make');
var syncNode = _dereq_('./sync');
var TreeCache = _dereq_('./tree');
function releaseNode(element) {
    var elementMeta = TreeCache.get(element) || {};
    if (elementMeta.worker) {
        elementMeta.worker.terminate();
    }
    if (elementMeta.oldTree) {
        unprotectElement(elementMeta.oldTree);
        cleanMemory();
    }
    TreeCache.delete(element);
}
exports.releaseNode = releaseNode;
function completeWorkerRender(element, elementMeta) {
    return function (ev) {
        var nodes = ev.data.nodes;
        if (nodes.additions.length) {
            nodes.additions.map(protectElement).map(function (descriptor) {
                elementMeta.oldTree.childNodes.push(descriptor);
                return descriptor;
            }).forEach(makeElement);
        }
        var completeRender = function () {
            if (nodes.removals.length) {
                nodes.removals.map(function (uuid) {
                    return poolsCache.elementObject._uuid[uuid];
                }).forEach(unprotectElement);
            }
            elementMeta._innerHTML = element.innerHTML;
            elementMeta._outerHTML = element.outerHTML;
            elementMeta._textContent = element.textContent;
            cleanMemory();
            elementMeta.hasWorkerRendered = true;
            elementMeta.isRendering = false;
            if (elementMeta.renderBuffer) {
                var nextRender = elementMeta.renderBuffer;
                elementMeta.renderBuffer = undefined;
                patchNode(element, nextRender.newHTML, nextRender.options);
            } else {
                element.dispatchEvent(new CustomEvent('renderComplete'));
            }
        };
        var processPromise = processPatches(element, ev.data.patches);
        if (processPromise) {
            processPromise.then(completeRender);
        } else {
            completeRender();
        }
    };
}
function patchNode(element, newHTML, options) {
    if (typeof options.enableWorker !== 'boolean') {
        options.enableWorker = document.ENABLE_WORKER;
    }
    var elementMeta = TreeCache.get(element) || {};
    TreeCache.set(element, elementMeta);
    var nextRender = function () {
        if (elementMeta.renderBuffer) {
            var nextRender = elementMeta.renderBuffer;
            elementMeta.renderBuffer = undefined;
            patchNode(element, nextRender.newHTML, nextRender.options);
        }
    };
    var differentInnerHTML = options.inner && element.innerHTML === newHTML;
    var differentOuterHTML = !options.inner && element.outerHTML === newHTML;
    var worker = null;
    if (options.enableWorker && hasWorker) {
        worker = elementMeta.worker = elementMeta.worker || createWorker();
    }
    if ((differentInnerHTML || differentOuterHTML) && elementMeta.oldTree) {
        return nextRender();
    }
    if (options.inner && elementMeta._innerHTML !== element.innerHTML || !options.inner && elementMeta._outerHTML !== element.outerHTML || elementMeta._textContent !== element.textContent) {
        if (elementMeta.oldTree) {
            unprotectElement(elementMeta.oldTree);
            cleanMemory();
        }
        elementMeta.oldTree = makeNode(element, true);
        elementMeta.updateOldTree = true;
    }
    if (options.enableWorker && hasWorker && worker) {
        elementMeta.isRendering = true;
        var transferObject = {};
        if (!elementMeta.hasWorkerRendered || elementMeta.updateOldTree) {
            transferObject.oldTree = elementMeta.oldTree;
            elementMeta.updateOldTree = false;
        }
        transferObject.uuid = elementMeta.oldTree.element;
        if (typeof newHTML !== 'string') {
            transferObject.newTree = makeNode(newHTML);
            worker.postMessage(transferObject);
            worker.onmessage = completeWorkerRender(element, elementMeta);
            return;
        }
        transferObject.newHTML = newHTML;
        transferObject.isInner = options.inner;
        worker.postMessage(transferObject);
        worker.onmessage = completeWorkerRender(element, elementMeta);
    } else {
        elementMeta.isRendering = true;
        var patches = [];
        var newTree = null;
        if (typeof newHTML === 'string') {
            newTree = parseHTML(newHTML, options.inner);
        } else {
            newTree = makeNode(newHTML);
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
        if (oldTreeName === newNodeName) {
            syncNode(patches, elementMeta.oldTree, newTree);
        } else if (newHTML) {
            patches[patches.length] = {
                __do__: 0,
                old: elementMeta.oldTree,
                new: newTree
            };
            unprotectElement(elementMeta.oldTree);
            elementMeta.oldTree = newTree;
        }
        var completeRender = function () {
            elementMeta.isRendering = false;
            elementMeta._innerHTML = element.innerHTML;
            elementMeta._outerHTML = element.outerHTML;
            elementMeta._textContent = element.textContent;
            cleanMemory();
            for (var uuid in makeNode.nodes) {
                if (!poolsCache.elementObject._uuid[uuid]) {
                    delete makeNode.nodes[uuid];
                }
            }
            patches.length = 0;
            element.dispatchEvent(new CustomEvent('renderComplete'));
            nextRender();
        };
        var processPromise = processPatches(element, patches);
        if (processPromise) {
            processPromise.then(completeRender);
        } else {
            completeRender();
        }
    }
}
exports.patchNode = patchNode;
},{"../element/make":3,"../patch/process":11,"../util/memory":16,"../util/parser":17,"../util/pools":18,"../worker/create":20,"./make":7,"./sync":9,"./tree":10}],9:[function(_dereq_,module,exports){
'use strict';
var poolsCache = _dereq_('../util/pools').cache;
var protectElement = _dereq_('../util/memory').protectElement;
var unprotectElement = _dereq_('../util/memory').unprotectElement;
var slice = Array.prototype.slice;
function sync(patches, oldTree, newTree) {
    var oldChildNodes = oldTree.childNodes;
    var oldChildNodesLength = oldChildNodes ? oldChildNodes.length : 0;
    var oldElement = oldTree.uuid;
    var textElements = [
            'script',
            'style',
            'textarea',
            '#text'
        ];
    if (!newTree) {
        var removed = oldChildNodes.splice(0, oldChildNodesLength);
        patches[patches.length] = {
            __do__: -1,
            element: oldElement
        };
        for (var i = 0; i < removed.length; i++) {
            if (patches.removals) {
                patches.removals.push(removed[i].uuid);
            }
            unprotectElement(removed[i]);
        }
        return;
    }
    var nodeValue = newTree.nodeValue;
    var childNodes = newTree.childNodes;
    var childNodesLength = childNodes ? childNodes.length : 0;
    var newElement = newTree.uuid;
    if (oldTree.nodeName !== newTree.nodeName) {
        return;
    }
    if (textElements.indexOf(newTree.nodeName) > -1) {
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
    if (childNodesLength > oldChildNodesLength) {
        var fragment = [];
        for (var i = oldChildNodesLength; i < childNodesLength; i++) {
            if (patches.additions) {
                patches.additions.push(childNodes[i]);
            }
            protectElement(childNodes[i]);
            oldChildNodes[oldChildNodes.length] = childNodes[i];
            fragment[fragment.length] = childNodes[i];
        }
        patches[patches.length] = {
            __do__: 1,
            element: oldElement,
            fragment: fragment
        };
    }
    for (var i = 0; i < childNodesLength; i++) {
        if (oldChildNodes[i].nodeName !== childNodes[i].nodeName) {
            patches[patches.length] = {
                __do__: 1,
                old: oldChildNodes[i],
                new: childNodes[i]
            };
            if (patches.removals) {
                patches.removals.push(oldChildNodes[i].uuid);
            }
            if (patches.additions) {
                patches.additions.push(childNodes[i]);
            }
            unprotectElement(oldChildNodes[i]);
            protectElement(childNodes[i]);
            oldChildNodes[i] = childNodes[i];
        }
    }
    if (oldChildNodesLength > childNodesLength) {
        var toRemove = slice.call(oldChildNodes, childNodesLength, oldChildNodesLength);
        for (var i = 0; i < toRemove.length; i++) {
            patches[patches.length] = {
                __do__: 1,
                old: toRemove[i].uuid
            };
        }
        var removed = oldChildNodes.splice(childNodesLength, oldChildNodesLength - childNodesLength);
        for (var i = 0; i < removed.length; i++) {
            if (patches.removals) {
                patches.removals.push(removed[i].uuid);
            }
            unprotectElement(removed[i]);
        }
    }
    var attributes = newTree.attributes;
    if (attributes) {
        var oldLength = oldTree.attributes.length;
        var newLength = attributes.length;
        if (newLength > oldLength) {
            var toAdd = slice.call(attributes, oldLength);
            for (var i = 0; i < toAdd.length; i++) {
                var change = {
                        __do__: 2,
                        element: oldElement,
                        name: toAdd[i].name,
                        value: toAdd[i].value
                    };
                var attr = poolsCache.attributeObject.get();
                attr.name = toAdd[i].name;
                attr.value = toAdd[i].value;
                poolsCache.attributeObject.protect(attr);
                oldTree.attributes[oldTree.attributes.length] = attr;
                patches[patches.length] = change;
            }
        }
        if (oldLength > newLength) {
            var toRemove = slice.call(oldTree.attributes, newLength);
            for (var i = 0; i < toRemove.length; i++) {
                var change = {
                        __do__: 2,
                        element: oldElement,
                        name: toRemove[i].name,
                        value: undefined
                    };
                var removed = oldTree.attributes.splice(i, 1);
                for (var i = 0; i < removed.length; i++) {
                    poolsCache.attributeObject.unprotect(removed[i]);
                }
                patches[patches.length] = change;
            }
        }
        var toModify = attributes;
        for (var i = 0; i < toModify.length; i++) {
            var oldAttrValue = oldTree.attributes[i] && oldTree.attributes[i].value;
            var newAttrValue = attributes[i] && attributes[i].value;
            if (oldAttrValue !== newAttrValue) {
                var change = {
                        __do__: 2,
                        element: oldElement,
                        name: toModify[i].name,
                        value: toModify[i].value
                    };
                var attr = oldTree.attributes[i];
                attr.name = toModify[i].name;
                attr.value = toModify[i].value;
                patches[patches.length] = change;
            }
        }
    }
    for (var i = 0; i < oldChildNodes.length; i++) {
        if (oldChildNodes[i].uuid !== childNodes[i].uuid) {
            sync(patches, oldTree.childNodes[i], childNodes[i]);
        }
    }
}
module.exports = sync;
},{"../util/memory":16,"../util/pools":18}],10:[function(_dereq_,module,exports){
'use strict';
var TreeCache = new WeakMap();
module.exports = TreeCache;
},{}],11:[function(_dereq_,module,exports){
'use strict';
var transitionStates = _dereq_('../transition_states');
var decodeEntities = _dereq_('../util/decode');
var getElement = _dereq_('../element/get');
var components = _dereq_('../element/custom').components;
var makeNode = _dereq_('../node/make');
var forEach = Array.prototype.forEach;
var empty = { prototype: {} };
function process(element, patches) {
    var states = transitionStates;
    var promises = [];
    var addPromises = promises.push.apply.bind(promises.push, promises);
    var attachedTransitionAndTitle = function (el) {
        var element = getElement(el).element;
        if (el.nodeName === '#text' || el.nodeName === 'text') {
            if (states && states.textChanged && states.textChanged.length) {
                addPromises(states.textChanged.map(function (callback) {
                    return callback(element.parentNode || element, null, el.nodeValue);
                }));
            }
        } else if (states && states.attached && states.attached.length) {
            addPromises(states.attached.map(callCallback, element));
        }
        el.childNodes.forEach(attachedTransitionAndTitle);
        titleCallback(el);
    };
    var callCallback = function (callback) {
        return callback(this);
    };
    var attachedCallback = function (elementDescriptor) {
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
            elementDescriptor.childNodes.forEach(attachedCallback, { fragment: false });
        }
        if (fragment) {
            fragment.appendChild(el);
        }
    };
    var titleCallback = function (elementDescriptor) {
        var el = getElement(elementDescriptor).element;
        if (el.tagName === 'title') {
            el.ownerDocument.title = el.childNodes[0].nodeValue;
        }
    };
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
        } else if (patch.__do__ === 1) {
            if (patch.element && patch.fragment && !patch.old) {
                var fragment = document.createDocumentFragment();
                patch.fragment.forEach(attachedCallback, { fragment: fragment });
                patch.element.appendChild(fragment);
                forEach.call(patch.fragment, attachedTransitionAndTitle);
            } else if (patch.old && !patch.new) {
                if (!patch.old.parentNode) {
                    throw new Error('Can\'t remove without parent, is this the ' + 'document root?');
                }
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
            } else if (patch.old && patch.new) {
                if (!patch.old.parentNode) {
                    throw new Error('Can\'t replace without parent, is this the ' + 'document root?');
                }
                patch.old.parentNode.insertBefore(patch.new, patch.old.nextSibling);
                if (states && states.detached && states.detached.length) {
                    addPromises(states.detached.map(callCallback, patch.old));
                }
                if (states && states.replaced && states.replaced.length) {
                    addPromises(states.replaced.map(function (callback) {
                        return callback(patch.old, patch.new);
                    }));
                }
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
                if (states && states.attached && states.attached.length) {
                    attachedTransitionAndTitle(newDescriptor);
                }
                makeNode.nodes[oldDescriptor.uuid] = undefined;
            }
        } else if (patch.__do__ === 2) {
            var oldValue = patch.element.getAttribute(patch.name);
            var augmentAttribute = function () {
                if (!patch.value) {
                    patch.element.removeAttribute(patch.name);
                } else {
                    patch.element.setAttribute(patch.name, patch.value);
                }
            };
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
            var customElement = components[elementDescriptor.nodeName] || empty;
            if (customElement.attributeChangedCallback) {
                customElement.prototype.attributeChangedCallback.call(patch.old, patch.name, oldValue, patch.value);
            }
        } else if (patch.__do__ === 3) {
            var originalValue = patch.element.textContent;
            var augmentText = function () {
                patch.element.textContent = decodeEntities(patch.value);
            };
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
                augmentText();
            }
        }
    }
    var activePromises = promises.filter(Boolean);
    if (activePromises.length) {
        return Promise.all(promises.filter(Boolean));
    }
}
module.exports = process;
},{"../element/custom":1,"../element/get":2,"../node/make":7,"../transition_states":13,"../util/decode":14}],12:[function(_dereq_,module,exports){
module.exports = {
    namespace: 'http://www.w3.org/2000/svg',
    elements: [
        'altGlyph',
        'altGlyphDef',
        'altGlyphItem',
        'animate',
        'animateColor',
        'animateMotion',
        'animateTransform',
        'circle',
        'clipPath',
        'color-profile',
        'cursor',
        'defs',
        'desc',
        'ellipse',
        'feBlend',
        'feColorMatrix',
        'feComponentTransfer',
        'feComposite',
        'feConvolveMatrix',
        'feDiffuseLighting',
        'feDisplacementMap',
        'feDistantLight',
        'feFlood',
        'feFuncA',
        'feFuncB',
        'feFuncG',
        'feFuncR',
        'feGaussianBlur',
        'feImage',
        'feMerge',
        'feMergeNode',
        'feMorphology',
        'feOffset',
        'fePointLight',
        'feSpecularLighting',
        'feSpotLight',
        'feTile',
        'feTurbulence',
        'filter',
        'font',
        'font-face',
        'font-face-format',
        'font-face-name',
        'font-face-src',
        'font-face-uri',
        'foreignObject',
        'g',
        'glyph',
        'glyphRef',
        'hkern',
        'image',
        'line',
        'linearGradient',
        'marker',
        'mask',
        'metadata',
        'missing-glyph',
        'mpath',
        'path',
        'pattern',
        'polygon',
        'polyline',
        'radialGradient',
        'rect',
        'script',
        'set',
        'stop',
        'style',
        'svg',
        'switch',
        'symbol',
        'text',
        'textPath',
        'tref',
        'tspan',
        'use',
        'view',
        'vkern'
    ]
};
},{}],13:[function(_dereq_,module,exports){
'use strict';
var transitionStates = {};
transitionStates.attached = [];
transitionStates.detached = [];
transitionStates.replaced = [];
transitionStates.attributeChanged = [];
transitionStates.textChanged = [];
module.exports = transitionStates;
},{}],14:[function(_dereq_,module,exports){
'use strict';
var element = document.createElement('div');
function decodeEntities(string) {
    element.innerHTML = string;
    return element.textContent;
}
module.exports = decodeEntities;
},{}],15:[function(_dereq_,module,exports){
'use strict';
function inherits(subClass, superClass) {
    var errorMesg = 'Super expression must either be null or a function, not ';
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError(errorMesg + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass && Object.setPrototypeOf) {
        Object.setPrototypeOf(subClass, superClass);
    } else if (superClass) {
        subClass.__proto__ = superClass;
    }
}
module.exports = inherits;
},{}],16:[function(_dereq_,module,exports){
'use strict';
var poolsCache = _dereq_('../util/pools').cache;
function protectElement(element) {
    poolsCache.elementObject.protect(element);
    element.childNodes.forEach(protectElement);
    element.attributes.forEach(poolsCache.attributeObject.protect, poolsCache.attributeObject);
    return element;
}
exports.protectElement = protectElement;
function unprotectElement(element) {
    element.childNodes.forEach(unprotectElement);
    element.attributes.forEach(poolsCache.attributeObject.unprotect, poolsCache.attributeObject);
    poolsCache.elementObject.unprotect(element);
    return element;
}
exports.unprotectElement = unprotectElement;
function cleanMemory() {
    poolsCache.attributeObject.freeAll();
    poolsCache.elementObject.freeAll();
}
exports.cleanMemory = cleanMemory;
},{"../util/pools":18}],17:[function(_dereq_,module,exports){
'use strict';
var poolsCache = _dereq_('./pools').cache;
var parser = makeParser();
function parseHTML(newHTML, isInner) {
    var documentElement = parser.parse(newHTML);
    var nodes = documentElement.childNodes;
    return isInner ? nodes : nodes[0];
}
exports.parseHTML = parseHTML;
function makeParser() {
    var kMarkupPattern = /<!--[^]*?(?=-->)-->|<(\/?)([a-z\-][a-z0-9\-]*)\s*([^>]*?)(\/?)>/gi;
    var kAttributePattern = /\b(id|class)\s*(=\s*("([^"]+)"|'([^']+)'|(\S+)))?/gi;
    var reAttrPattern = /\b([a-z][a-z0-9\-]*)\s*(=\s*("([^"]+)"|'([^']+)'|(\S+)))?/gi;
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
            li: { li: true },
            p: {
                p: true,
                div: true
            },
            td: {
                td: true,
                th: true
            },
            th: {
                td: true,
                th: true
            }
        };
    var kElementsClosedByClosing = {
            li: {
                ul: true,
                ol: true
            },
            a: { div: true },
            b: { div: true },
            i: { div: true },
            p: { div: true },
            td: {
                tr: true,
                table: true
            },
            th: {
                tr: true,
                table: true
            }
        };
    var kBlockTextElements = {
            script: true,
            noscript: true,
            style: true,
            pre: true
        };
    function TextNode(value) {
        var instance = poolsCache.elementObject.get();
        instance.nodeName = '#text';
        instance.nodeValue = value;
        instance.nodeType = 3;
        instance.childNodes.length = 0;
        instance.attributes.length = 0;
        return instance;
    }
    function HTMLElement(name, keyAttrs, rawAttrs) {
        var instance = poolsCache.elementObject.get();
        instance.nodeName = name;
        instance.nodeValue = '';
        instance.nodeType = 1;
        instance.childNodes.length = 0;
        instance.attributes.length = 0;
        if (rawAttrs) {
            for (var match; match = reAttrPattern.exec(rawAttrs);) {
                var attr = poolsCache.attributeObject.get();
                attr.name = match[1];
                attr.value = match[5] || match[4] || match[1];
                if (match[6] === '""') {
                    attr.value = '';
                }
                instance.attributes[instance.attributes.length] = attr;
            }
        }
        return instance;
    }
    var htmlParser = {
            parse: function (data, options) {
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
                for (var match, text; match = kMarkupPattern.exec(data);) {
                    if (lastTextPos > -1) {
                        if (lastTextPos + match[0].length < kMarkupPattern.lastIndex) {
                            text = data.slice(lastTextPos, kMarkupPattern.lastIndex - match[0].length);
                            if (text.trim()) {
                                currentParent.childNodes[currentParent.childNodes.length] = TextNode(text);
                            }
                        }
                    }
                    lastTextPos = kMarkupPattern.lastIndex;
                    if (match[0][1] === '!') {
                        continue;
                    }
                    if (options.lowerCaseTagName) {
                        match[2] = match[2].toLowerCase();
                    }
                    if (!match[1]) {
                        var attrs = {};
                        for (var attMatch; attMatch = kAttributePattern.exec(match[3]);) {
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
                            var closeMarkup = '</' + match[2] + '>';
                            var index = data.indexOf(closeMarkup, kMarkupPattern.lastIndex);
                            if (options[match[2]]) {
                                if (index == -1) {
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
                        while (currentParent) {
                            if (currentParent.nodeName == match[2]) {
                                stack.pop();
                                currentParent = stack[stack.length - 1];
                                break;
                            } else {
                                if (kElementsClosedByClosing[currentParent.nodeName]) {
                                    if (kElementsClosedByClosing[currentParent.nodeName][match[2]]) {
                                        stack.pop();
                                        currentParent = stack[stack.length - 1];
                                        continue;
                                    }
                                }
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
exports.makeParser = makeParser;
},{"./pools":18}],18:[function(_dereq_,module,exports){
'use strict';
var uuid = _dereq_('./uuid');
var poolsCache = {};
exports.cache = poolsCache;
var count = 10000;
exports.count = count;
function createPool(name, opts) {
    var size = opts.size;
    var fill = opts.fill;
    var free = [];
    var allocated = [];
    var protect = [];
    for (var i = 0; i < size; i++) {
        free[i] = fill();
    }
    return {
        _free: free,
        _allocated: allocated,
        _protected: protect,
        _uuid: {},
        get: function () {
            var obj = null;
            var freeLength = free.length;
            var minusOne = freeLength - 1;
            if (freeLength) {
                obj = free[minusOne];
                free.length = minusOne;
            } else {
                obj = fill();
            }
            allocated.push(obj);
            return obj;
        },
        protect: function (value) {
            var idx = allocated.indexOf(value);
            protect.push(idx === -1 ? value : allocated.splice(idx, 1)[0]);
            if (name === 'elementObject') {
                this._uuid[value.uuid] = value;
            }
        },
        unprotect: function (value) {
            var idx = protect.indexOf(value);
            if (idx !== -1) {
                var obj = protect.splice(idx, 1)[0];
                if (obj) {
                    allocated.push(obj);
                }
                if (name === 'elementObject') {
                    delete this._uuid[value.uuid];
                }
            }
        },
        freeAll: function () {
            var allocatedLength = allocated.length;
            var freeLength = free.length;
            free.push.apply(free, allocated.slice(0, size - freeLength));
            allocated.length = 0;
        },
        free: function (value) {
            var idx = allocated.indexOf(value);
            if (idx === -1) {
                return;
            }
            if (free.length < size) {
                free.push(value);
            }
            allocated.splice(idx, 1);
        }
    };
}
exports.createPool = createPool;
function initializePools(COUNT) {
    poolsCache.attributeObject = createPool('attributeObject', {
        size: COUNT,
        fill: function () {
            return {
                name: '',
                value: ''
            };
        }
    });
    poolsCache.elementObject = createPool('elementObject', {
        size: COUNT,
        fill: function () {
            return {
                uuid: uuid(),
                childNodes: [],
                attributes: []
            };
        }
    });
}
exports.initializePools = initializePools;
initializePools(count);
},{"./uuid":19}],19:[function(_dereq_,module,exports){
'use strict';
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 3 | 8;
        return v.toString(16);
    });
}
module.exports = uuid;
},{}],20:[function(_dereq_,module,exports){
'use strict';
var uuid = _dereq_('../util/uuid');
var poolsCache = _dereq_('../util/pools').cache;
var initializePools = _dereq_('../util/pools').initializePools;
var createPool = _dereq_('../util/pools').createPool;
var poolCount = _dereq_('../util/pools').count;
var parseHTML = _dereq_('../util/parser').parseHTML;
var makeParser = _dereq_('../util/parser').makeParser;
var syncNode = _dereq_('../node/sync');
var protectElement = _dereq_('../util/memory').protectElement;
var unprotectElement = _dereq_('../util/memory').unprotectElement;
var cleanMemory = _dereq_('../util/memory').cleanMemory;
var syncNode = _dereq_('../node/sync');
var workerSource = _dereq_('./source');
var hasWorker = typeof Worker === 'function';
exports.hasWorker = hasWorker;
function createWorker() {
    var workerBlob = null;
    var worker = null;
    if (hasWorker) {
        workerBlob = new Blob([[
                'var slice = Array.prototype.slice;',
                'var poolsCache = {};',
                'var nodes = 0;',
                uuid,
                protectElement,
                unprotectElement,
                cleanMemory,
                createPool,
                initializePools,
                'initializePools(' + poolCount + ');',
                'var syncNode = ' + syncNode,
                parseHTML,
                'var makeParser = ' + makeParser,
                'var parser = makeParser();',
                workerSource,
                'startup(self);'
            ].join('\n')], { type: 'application/javascript' });
        try {
            worker = new Worker(URL.createObjectURL(workerBlob));
        } catch (ex) {
            if (console && console.info) {
                console.info('Failed to create diffhtml worker', ex);
            }
            hasWorker = false;
        }
    }
    return worker;
}
exports.createWorker = createWorker;
},{"../node/sync":9,"../util/memory":16,"../util/parser":17,"../util/pools":18,"../util/uuid":19,"./source":21}],21:[function(_dereq_,module,exports){
'use strict';
var parseHTML;
var syncNode;
var pools;
function startup(worker) {
    var patches = [];
    var oldTree = null;
    patches.additions = [];
    patches.removals = [];
    worker.onmessage = function (e) {
        var data = e.data;
        var isInner = data.isInner;
        var newTree = null;
        if (oldTree) {
            unprotectElement(oldTree);
        }
        if (data.oldTree) {
            oldTree = data.oldTree;
        }
        if (data.newTree) {
            newTree = data.newTree;
        } else if (typeof data.newHTML === 'string') {
            newTree = parseHTML(data.newHTML, isInner);
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
        syncNode(patches, oldTree, newTree);
        protectElement(oldTree);
        worker.postMessage({
            nodes: {
                additions: patches.additions,
                removals: patches.removals
            },
            patches: patches
        });
        cleanMemory();
        patches.length = 0;
        patches.additions.length = 0;
        patches.removals.length = 0;
    };
}
module.exports = startup;
},{}]},{},[6])(6)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibGliL2VsZW1lbnQvY3VzdG9tLmpzIiwibGliL2VsZW1lbnQvZ2V0LmpzIiwibGliL2VsZW1lbnQvbWFrZS5qcyIsImxpYi9lcnJvci9kb21fZXhjZXB0aW9uLmpzIiwibGliL2Vycm9yL3RyYW5zaXRpb25fc3RhdGUuanMiLCJsaWIvaW5kZXguanMiLCJsaWIvbm9kZS9tYWtlLmpzIiwibGliL25vZGUvcGF0Y2guanMiLCJsaWIvbm9kZS9zeW5jLmpzIiwibGliL25vZGUvdHJlZS5qcyIsImxpYi9wYXRjaC9wcm9jZXNzLmpzIiwibGliL3N2Zy5qcyIsImxpYi90cmFuc2l0aW9uX3N0YXRlcy5qcyIsImxpYi91dGlsL2RlY29kZS5qcyIsImxpYi91dGlsL2luaGVyaXRzLmpzIiwibGliL3V0aWwvbWVtb3J5LmpzIiwibGliL3V0aWwvcGFyc2VyLmpzIiwibGliL3V0aWwvcG9vbHMuanMiLCJsaWIvdXRpbC91dWlkLmpzIiwibGliL3dvcmtlci9jcmVhdGUuanMiLCJsaWIvd29ya2VyL3NvdXJjZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlKQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcbnZhciBlbXB0eSA9IGZ1bmN0aW9uICgpIHtcbn07XG52YXIgY29tcG9uZW50cyA9IHt9O1xuZXhwb3J0cy5jb21wb25lbnRzID0gY29tcG9uZW50cztcbmZ1bmN0aW9uIHVwZ3JhZGUodGFnTmFtZSwgZWxlbWVudCkge1xuICAgIHZhciBDdXN0b21FbGVtZW50ID0gY29tcG9uZW50c1t0YWdOYW1lXSB8fCBlbXB0eTtcbiAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEN1c3RvbUVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoQ3VzdG9tRWxlbWVudCAhPT0gZW1wdHkpIHtcbiAgICAgICAgZWxlbWVudC5fX3Byb3RvX18gPSBPYmplY3QuY3JlYXRlKEN1c3RvbUVsZW1lbnQucHJvdG90eXBlKTtcbiAgICB9XG4gICAgaWYgKEN1c3RvbUVsZW1lbnQucHJvdG90eXBlLmNyZWF0ZWRDYWxsYmFjaykge1xuICAgICAgICBDdXN0b21FbGVtZW50LnByb3RvdHlwZS5jcmVhdGVkQ2FsbGJhY2suY2FsbChlbGVtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5leHBvcnRzLnVwZ3JhZGUgPSB1cGdyYWRlOyIsIid1c2Ugc3RyaWN0JztcbnZhciBtYWtlTm9kZSA9IHJlcXVpcmUoJy4uL25vZGUvbWFrZScpO1xudmFyIG1ha2VFbGVtZW50ID0gcmVxdWlyZSgnLi4vZWxlbWVudC9tYWtlJyk7XG5mdW5jdGlvbiBnZXQocmVmKSB7XG4gICAgdmFyIHV1aWQgPSByZWYudXVpZCB8fCByZWY7XG4gICAgdmFyIGVsZW1lbnQgPSBtYWtlTm9kZS5ub2Rlc1t1dWlkXSB8fCBtYWtlRWxlbWVudChyZWYpO1xuICAgIHJldHVybiB7XG4gICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgIHV1aWQ6IHV1aWRcbiAgICB9O1xufVxubW9kdWxlLmV4cG9ydHMgPSBnZXQ7IiwiJ3VzZSBzdHJpY3QnO1xudmFyIHN2ZyA9IHJlcXVpcmUoJy4uL3N2ZycpO1xudmFyIG1ha2VOb2RlID0gcmVxdWlyZSgnLi4vbm9kZS9tYWtlJyk7XG52YXIgY29tcG9uZW50cyA9IHJlcXVpcmUoJy4vY3VzdG9tJykuY29tcG9uZW50cztcbnZhciB1cGdyYWRlID0gcmVxdWlyZSgnLi9jdXN0b20nKS51cGdyYWRlO1xudmFyIGVtcHR5ID0geyBwcm90b3R5cGU6IHt9IH07XG5mdW5jdGlvbiBtYWtlKGRlc2NyaXB0b3IpIHtcbiAgICB2YXIgZWxlbWVudCA9IG51bGw7XG4gICAgdmFyIGlzU3ZnID0gZmFsc2U7XG4gICAgdmFyIEN1c3RvbUVsZW1lbnQgPSBjb21wb25lbnRzW2Rlc2NyaXB0b3Iubm9kZU5hbWVdIHx8IGVtcHR5O1xuICAgIGlmIChkZXNjcmlwdG9yLm5vZGVOYW1lID09PSAnI3RleHQnKSB7XG4gICAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkZXNjcmlwdG9yLm5vZGVWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHN2Zy5lbGVtZW50cy5pbmRleE9mKGRlc2NyaXB0b3Iubm9kZU5hbWUpID4gLTEpIHtcbiAgICAgICAgICAgIGlzU3ZnID0gdHJ1ZTtcbiAgICAgICAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoc3ZnLm5hbWVzcGFjZSwgZGVzY3JpcHRvci5ub2RlTmFtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChkZXNjcmlwdG9yLm5vZGVOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVzY3JpcHRvci5hdHRyaWJ1dGVzICYmIGRlc2NyaXB0b3IuYXR0cmlidXRlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGVzY3JpcHRvci5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGF0dHJpYnV0ZSA9IGRlc2NyaXB0b3IuYXR0cmlidXRlc1tpXTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUubmFtZSwgYXR0cmlidXRlLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVzY3JpcHRvci5jaGlsZE5vZGVzICYmIGRlc2NyaXB0b3IuY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGVzY3JpcHRvci5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChtYWtlKGRlc2NyaXB0b3IuY2hpbGROb2Rlc1tpXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChkZXNjcmlwdG9yLm5vZGVWYWx1ZSkge1xuICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gZGVzY3JpcHRvci5ub2RlVmFsdWU7XG4gICAgfVxuICAgIHVwZ3JhZGUoZGVzY3JpcHRvci5ub2RlTmFtZSwgZWxlbWVudCk7XG4gICAgaWYgKEN1c3RvbUVsZW1lbnQucHJvdG90eXBlLmNyZWF0ZWRDYWxsYmFjaykge1xuICAgICAgICBDdXN0b21FbGVtZW50LnByb3RvdHlwZS5jcmVhdGVkQ2FsbGJhY2suY2FsbChlbGVtZW50KTtcbiAgICB9XG4gICAgbWFrZU5vZGUubm9kZXNbZGVzY3JpcHRvci51dWlkXSA9IGVsZW1lbnQ7XG4gICAgcmV0dXJuIGVsZW1lbnQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IG1ha2U7IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnLi4vdXRpbC9pbmhlcml0cycpO1xudmFyIG1pc3NpbmdTdGFja1RyYWNlID0gJ0Jyb3dzZXIgZG9lc25cXCd0IHN1cHBvcnQgZXJyb3Igc3RhY2sgdHJhY2VzLic7XG5mdW5jdGlvbiBET01FeGNlcHRpb24obWVzc2FnZSkge1xuICAgIEVycm9yLmNhbGwodGhpcyk7XG4gICAgdGhpcy5tZXNzYWdlID0gJ1VuY2F1Z2h0IERPTUV4Y2VwdGlvbjogJyArIG1lc3NhZ2U7XG4gICAgdGhpcy5zdGFjayA9IHRoaXMuc3RhY2sgfHwgbWlzc2luZ1N0YWNrVHJhY2U7XG59XG5pbmhlcml0cyhET01FeGNlcHRpb24sIEVycm9yKTtcbm1vZHVsZS5leHBvcnRzID0gRE9NRXhjZXB0aW9uOyIsIid1c2Ugc3RyaWN0JztcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJy4uL3V0aWwvaW5oZXJpdHMnKTtcbnZhciBtaXNzaW5nU3RhY2tUcmFjZSA9ICdCcm93c2VyIGRvZXNuXFwndCBzdXBwb3J0IGVycm9yIHN0YWNrIHRyYWNlcy4nO1xuZnVuY3Rpb24gVHJhbnNpdGlvblN0YXRlRXJyb3IobWVzc2FnZSkge1xuICAgIEVycm9yLmNhbGwodGhpcywgbWVzc2FnZSk7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB0aGlzLnN0YWNrID0gdGhpcy5zdGFjayB8fCBtaXNzaW5nU3RhY2tUcmFjZTtcbn1cbmluaGVyaXRzKFRyYW5zaXRpb25TdGF0ZUVycm9yLCBFcnJvcik7XG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zaXRpb25TdGF0ZUVycm9yOyIsIid1c2Ugc3RyaWN0JztcbnZhciBwYXRjaE5vZGUgPSByZXF1aXJlKCcuL25vZGUvcGF0Y2gnKS5wYXRjaE5vZGU7XG52YXIgcmVsZWFzZU5vZGUgPSByZXF1aXJlKCcuL25vZGUvcGF0Y2gnKS5yZWxlYXNlTm9kZTtcbnZhciB0cmFuc2l0aW9uU3RhdGVzID0gcmVxdWlyZSgnLi90cmFuc2l0aW9uX3N0YXRlcycpO1xudmFyIGNvbXBvbmVudHMgPSByZXF1aXJlKCcuL2VsZW1lbnQvY3VzdG9tJykuY29tcG9uZW50cztcbnZhciBUcmFuc2l0aW9uU3RhdGVFcnJvciA9IHJlcXVpcmUoJy4vZXJyb3IvdHJhbnNpdGlvbl9zdGF0ZScpO1xuZXhwb3J0cy5UcmFuc2l0aW9uU3RhdGVFcnJvciA9IFRyYW5zaXRpb25TdGF0ZUVycm9yO1xudmFyIERPTUV4Y2VwdGlvbiA9IHJlcXVpcmUoJy4vZXJyb3IvZG9tX2V4Y2VwdGlvbicpO1xuZXhwb3J0cy5ET01FeGNlcHRpb24gPSBET01FeGNlcHRpb247XG52YXIgcmVhbFJlZ2lzdGVyRWxlbWVudCA9IGRvY3VtZW50LnJlZ2lzdGVyIHx8IGRvY3VtZW50LnJlZ2lzdGVyRWxlbWVudDtcbmZ1bmN0aW9uIG91dGVySFRNTChlbGVtZW50LCBtYXJrdXAsIG9wdGlvbnMpIHtcbiAgICBpZiAoIWVsZW1lbnQgfHwgIShlbGVtZW50IGluc3RhbmNlb2YgRWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbignRWxlbWVudCBpcyBtaXNzaW5nIG9yIGludmFsaWQuJyk7XG4gICAgfVxuICAgIG1hcmt1cCA9IG1hcmt1cCB8fCAnJztcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmlubmVyID0gZmFsc2U7XG4gICAgcGF0Y2hOb2RlKGVsZW1lbnQsIG1hcmt1cCwgb3B0aW9ucyk7XG59XG5leHBvcnRzLm91dGVySFRNTCA9IG91dGVySFRNTDtcbmZ1bmN0aW9uIGlubmVySFRNTChlbGVtZW50LCBtYXJrdXAsIG9wdGlvbnMpIHtcbiAgICBtYXJrdXAgPSBtYXJrdXAgfHwgJyc7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5pbm5lciA9IHRydWU7XG4gICAgcGF0Y2hOb2RlKGVsZW1lbnQsIG1hcmt1cCwgb3B0aW9ucyk7XG59XG5leHBvcnRzLmlubmVySFRNTCA9IGlubmVySFRNTDtcbmZ1bmN0aW9uIGVsZW1lbnQoZWxlbWVudCwgbmV3RWxlbWVudCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIGlmICghbmV3RWxlbWVudCB8fCAhKG5ld0VsZW1lbnQgaW5zdGFuY2VvZiBFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05ldyBlbGVtZW50IGlzIG1pc3NpbmcgRWxlbWVudCBmcm9tIGl0cyBwcm90b3R5cGUnKTtcbiAgICB9XG4gICAgcGF0Y2hOb2RlKGVsZW1lbnQsIG5ld0VsZW1lbnQsIG9wdGlvbnMpO1xufVxuZXhwb3J0cy5lbGVtZW50ID0gZWxlbWVudDtcbmV4cG9ydHMucmVsZWFzZSA9IHJlbGVhc2VOb2RlO1xuZnVuY3Rpb24gcmVnaXN0ZXJFbGVtZW50KHRhZ05hbWUsIGNvbnN0cnVjdG9yKSB7XG4gICAgdmFyIG5vcm1hbGl6ZWRDb25zdHJ1Y3RvciA9IGNvbnN0cnVjdG9yLnByb3RvdHlwZSA/IGNvbnN0cnVjdG9yIDogbnVsbDtcbiAgICBpZiAoIW5vcm1hbGl6ZWRDb25zdHJ1Y3Rvcikge1xuICAgICAgICBjb25zdHJ1Y3Rvci5fX3Byb3RvX18gPSBIVE1MRWxlbWVudC5wcm90b3R5cGU7XG4gICAgICAgIG5vcm1hbGl6ZWRDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgfTtcbiAgICAgICAgbm9ybWFsaXplZENvbnN0cnVjdG9yLnByb3RvdHlwZSA9IGNvbnN0cnVjdG9yO1xuICAgIH1cbiAgICBpZiAocmVhbFJlZ2lzdGVyRWxlbWVudCkge1xuICAgICAgICByZXR1cm4gcmVhbFJlZ2lzdGVyRWxlbWVudC5jYWxsKGRvY3VtZW50LCB0YWdOYW1lLCBub3JtYWxpemVkQ29uc3RydWN0b3IpO1xuICAgIH1cbiAgICBpZiAodGFnTmFtZSBpbiBjb21wb25lbnRzKSB7XG4gICAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24oW1xuICAgICAgICAgICAgJ0ZhaWxlZCB0byBleGVjdXRlIFxcJ3JlZ2lzdGVyRWxlbWVudFxcJyBvbiBcXCdEb2N1bWVudFxcJzogUmVnaXN0cmF0aW9uICcsXG4gICAgICAgICAgICAnZmFpbGVkIGZvciB0eXBlIFxcJycsXG4gICAgICAgICAgICB0YWdOYW1lLFxuICAgICAgICAgICAgJ1xcJy4gQSB0eXBlIHdpdGggdGhhdCBuYW1lIGlzIGFscmVhZHkgJyxcbiAgICAgICAgICAgICdyZWdpc3RlcmVkLidcbiAgICAgICAgXS5qb2luKCcnKSk7XG4gICAgfVxuICAgIGNvbXBvbmVudHNbdGFnTmFtZV0gPSBub3JtYWxpemVkQ29uc3RydWN0b3I7XG59XG5leHBvcnRzLnJlZ2lzdGVyRWxlbWVudCA9IHJlZ2lzdGVyRWxlbWVudDtcbmZ1bmN0aW9uIGFkZFRyYW5zaXRpb25TdGF0ZShzdGF0ZSwgY2FsbGJhY2spIHtcbiAgICBpZiAoIXN0YXRlKSB7XG4gICAgICAgIHRocm93IG5ldyBUcmFuc2l0aW9uU3RhdGVFcnJvcignTWlzc2luZyB0cmFuc2l0aW9uIHN0YXRlIG5hbWUnKTtcbiAgICB9XG4gICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgICB0aHJvdyBuZXcgVHJhbnNpdGlvblN0YXRlRXJyb3IoJ01pc3NpbmcgdHJhbnNpdGlvbiBzdGF0ZSBjYWxsYmFjaycpO1xuICAgIH1cbiAgICBpZiAoT2JqZWN0LmtleXModHJhbnNpdGlvblN0YXRlcykuaW5kZXhPZihzdGF0ZSkgPT09IC0xKSB7XG4gICAgICAgIHRocm93IG5ldyBUcmFuc2l0aW9uU3RhdGVFcnJvcignSW52YWxpZCBzdGF0ZSBuYW1lOiAnICsgc3RhdGUpO1xuICAgIH1cbiAgICB0cmFuc2l0aW9uU3RhdGVzW3N0YXRlXS5wdXNoKGNhbGxiYWNrKTtcbn1cbmV4cG9ydHMuYWRkVHJhbnNpdGlvblN0YXRlID0gYWRkVHJhbnNpdGlvblN0YXRlO1xuZnVuY3Rpb24gcmVtb3ZlVHJhbnNpdGlvblN0YXRlKHN0YXRlLCBjYWxsYmFjaykge1xuICAgIGlmICghY2FsbGJhY2sgJiYgc3RhdGUpIHtcbiAgICAgICAgdHJhbnNpdGlvblN0YXRlc1tzdGF0ZV0ubGVuZ3RoID0gMDtcbiAgICB9IGVsc2UgaWYgKHN0YXRlICYmIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyh0cmFuc2l0aW9uU3RhdGVzKS5pbmRleE9mKHN0YXRlKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUcmFuc2l0aW9uU3RhdGVFcnJvcignSW52YWxpZCBzdGF0ZSBuYW1lICcgKyBzdGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGluZGV4ID0gdHJhbnNpdGlvblN0YXRlc1tzdGF0ZV0uaW5kZXhPZihjYWxsYmFjayk7XG4gICAgICAgIHRyYW5zaXRpb25TdGF0ZXNbc3RhdGVdLnNwbGljZShpbmRleCwgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChsZXQgc3RhdGUgaW4gdHJhbnNpdGlvblN0YXRlcykge1xuICAgICAgICAgICAgdHJhbnNpdGlvblN0YXRlc1tzdGF0ZV0ubGVuZ3RoID0gMDtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMucmVtb3ZlVHJhbnNpdGlvblN0YXRlID0gcmVtb3ZlVHJhbnNpdGlvblN0YXRlO1xuZnVuY3Rpb24gZW5hYmxlUHJvbGx5ZmlsbCgpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LCAnVHJhbnNpdGlvblN0YXRlRXJyb3InLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IFRyYW5zaXRpb25TdGF0ZUVycm9yXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGRvY3VtZW50LCAnYWRkVHJhbnNpdGlvblN0YXRlJywge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiAoc3RhdGUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBhZGRUcmFuc2l0aW9uU3RhdGUoc3RhdGUsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkb2N1bWVudCwgJ3JlbW92ZVRyYW5zaXRpb25TdGF0ZScsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKHN0YXRlLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmVtb3ZlVHJhbnNpdGlvblN0YXRlKHN0YXRlLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRWxlbWVudC5wcm90b3R5cGUsICdkaWZmSW5uZXJIVE1MJywge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIHNldDogZnVuY3Rpb24gKG5ld0hUTUwpIHtcbiAgICAgICAgICAgIGlubmVySFRNTCh0aGlzLCBuZXdIVE1MKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFbGVtZW50LnByb3RvdHlwZSwgJ2RpZmZPdXRlckhUTUwnLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAobmV3SFRNTCkge1xuICAgICAgICAgICAgb3V0ZXJIVE1MKHRoaXMsIG5ld0hUTUwpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEVsZW1lbnQucHJvdG90eXBlLCAnZGlmZkVsZW1lbnQnLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIChuZXdFbGVtZW50LCBvcHRpb25zKSB7XG4gICAgICAgICAgICBlbGVtZW50KHRoaXMsIG5ld0VsZW1lbnQsIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEVsZW1lbnQucHJvdG90eXBlLCAnZGlmZlJlbGVhc2UnLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIChuZXdFbGVtZW50KSB7XG4gICAgICAgICAgICByZWxlYXNlTm9kZSh0aGlzKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkb2N1bWVudCwgJ3JlZ2lzdGVyRWxlbWVudCcsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKHRhZ05hbWUsIGNvbXBvbmVudCkge1xuICAgICAgICAgICAgcmVnaXN0ZXJFbGVtZW50KHRhZ05hbWUsIGNvbXBvbmVudCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAodHlwZW9mIEVsZW1lbnQgPT09ICdvYmplY3QnIHx8IHR5cGVvZiBIVE1MRWxlbWVudCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbGV0IHJlYWxIVE1MRWxlbWVudCA9IEhUTUxFbGVtZW50IHx8IEVsZW1lbnQ7XG4gICAgICAgIGlmICghcmVhbEhUTUxFbGVtZW50Ll9fcHJvdG9fXykge1xuICAgICAgICAgICAgbGV0IGNvcHkgPSB7XG4gICAgICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsID0gT2JqZWN0LmtleXModmFsKS5sZW5ndGggPyB2YWwgOiBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiB2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1trZXldID0gdmFsW2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyZWFsSFRNTEVsZW1lbnQsICdfX3Byb3RvX18nLCBjb3B5KTtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyZWFsSFRNTEVsZW1lbnQucHJvdG90eXBlLCAnX19wcm90b19fJywgY29weSk7XG4gICAgICAgIH1cbiAgICAgICAgSFRNTEVsZW1lbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIH07XG4gICAgICAgIEhUTUxFbGVtZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUocmVhbEhUTUxFbGVtZW50LnByb3RvdHlwZSk7XG4gICAgICAgIEhUTUxFbGVtZW50Ll9fcHJvdG9fXyA9IHJlYWxIVE1MRWxlbWVudDtcbiAgICAgICAgRWxlbWVudCA9IEhUTUxFbGVtZW50O1xuICAgIH1cbiAgICBsZXQgYWN0aXZhdGVDb21wb25lbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZG9jdW1lbnRFbGVtZW50ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICAgICAgICBkb2N1bWVudEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncmVuZGVyQ29tcGxldGUnLCBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICBkb2N1bWVudEVsZW1lbnQuZGlmZlJlbGVhc2UoZG9jdW1lbnRFbGVtZW50KTtcbiAgICAgICAgICAgIGRvY3VtZW50RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdyZW5kZXJDb21wbGV0ZScsIHJlbmRlcik7XG4gICAgICAgIH0pO1xuICAgICAgICBkb2N1bWVudEVsZW1lbnQuZGlmZk91dGVySFRNTCA9IGRvY3VtZW50RWxlbWVudC5vdXRlckhUTUw7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgYWN0aXZhdGVDb21wb25lbnRzKTtcbiAgICB9O1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgYWN0aXZhdGVDb21wb25lbnRzKTtcbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xuICAgICAgICBhY3RpdmF0ZUNvbXBvbmVudHMoKTtcbiAgICB9XG59XG5leHBvcnRzLmVuYWJsZVByb2xseWZpbGwgPSBlbmFibGVQcm9sbHlmaWxsOyIsIid1c2Ugc3RyaWN0JztcbnZhciBwb29sc0NhY2hlID0gcmVxdWlyZSgnLi4vdXRpbC9wb29scycpLmNhY2hlO1xudmFyIHByb3RlY3RFbGVtZW50ID0gcmVxdWlyZSgnLi4vdXRpbC9tZW1vcnknKS5wcm90ZWN0RWxlbWVudDtcbnZhciB1bnByb3RlY3RFbGVtZW50ID0gcmVxdWlyZSgnLi4vdXRpbC9tZW1vcnknKS51bnByb3RlY3RFbGVtZW50O1xudmFyIGNvbXBvbmVudHMgPSByZXF1aXJlKCcuLi9lbGVtZW50L2N1c3RvbScpLmNvbXBvbmVudHM7XG52YXIgdXBncmFkZSA9IHJlcXVpcmUoJy4uL2VsZW1lbnQvY3VzdG9tJykudXBncmFkZTtcbnZhciBlbXB0eSA9IHt9O1xubWFrZS5ub2RlcyA9IHt9O1xuZnVuY3Rpb24gbWFrZShub2RlLCBwcm90ZWN0KSB7XG4gICAgdmFyIG5vZGVUeXBlID0gbm9kZS5ub2RlVHlwZTtcbiAgICB2YXIgbm9kZVZhbHVlID0gbm9kZS5ub2RlVmFsdWU7XG4gICAgaWYgKCFub2RlVHlwZSB8fCBub2RlVHlwZSA9PT0gMiB8fCBub2RlVHlwZSA9PT0gNCB8fCBub2RlVHlwZSA9PT0gOCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChub2RlVHlwZSA9PT0gMyAmJiAhbm9kZVZhbHVlLnRyaW0oKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBlbnRyeSA9IHBvb2xzQ2FjaGUuZWxlbWVudE9iamVjdC5nZXQoKTtcbiAgICBtYWtlLm5vZGVzW2VudHJ5LnV1aWRdID0gbm9kZTtcbiAgICBlbnRyeS5ub2RlTmFtZSA9IG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICBlbnRyeS5ub2RlVmFsdWUgPSBub2RlVmFsdWU7XG4gICAgZW50cnkuY2hpbGROb2Rlcy5sZW5ndGggPSAwO1xuICAgIGVudHJ5LmF0dHJpYnV0ZXMubGVuZ3RoID0gMDtcbiAgICBpZiAocHJvdGVjdCkge1xuICAgICAgICBwcm90ZWN0RWxlbWVudChlbnRyeSk7XG4gICAgfVxuICAgIHZhciBhdHRyaWJ1dGVzID0gbm9kZS5hdHRyaWJ1dGVzO1xuICAgIGlmIChhdHRyaWJ1dGVzKSB7XG4gICAgICAgIHZhciBhdHRyaWJ1dGVzTGVuZ3RoID0gYXR0cmlidXRlcy5sZW5ndGg7XG4gICAgICAgIGlmIChhdHRyaWJ1dGVzTGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGF0dHJpYnV0ZXNMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBhdHRyID0gcG9vbHNDYWNoZS5hdHRyaWJ1dGVPYmplY3QuZ2V0KCk7XG4gICAgICAgICAgICAgICAgaWYgKHByb3RlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgcG9vbHNDYWNoZS5hdHRyaWJ1dGVPYmplY3QucHJvdGVjdChhdHRyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXR0ci5uYW1lID0gYXR0cmlidXRlc1tpXS5uYW1lO1xuICAgICAgICAgICAgICAgIGF0dHIudmFsdWUgPSBhdHRyaWJ1dGVzW2ldLnZhbHVlO1xuICAgICAgICAgICAgICAgIGVudHJ5LmF0dHJpYnV0ZXNbZW50cnkuYXR0cmlidXRlcy5sZW5ndGhdID0gYXR0cjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgY2hpbGROb2RlcyA9IG5vZGUuY2hpbGROb2RlcztcbiAgICB2YXIgY2hpbGROb2Rlc0xlbmd0aCA9IG5vZGUuY2hpbGROb2Rlcy5sZW5ndGg7XG4gICAgaWYgKG5vZGUubm9kZVR5cGUgIT09IDMgJiYgY2hpbGROb2Rlcykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkTm9kZXNMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG5ld05vZGUgPSBtYWtlKGNoaWxkTm9kZXNbaV0sIHByb3RlY3QpO1xuICAgICAgICAgICAgaWYgKG5ld05vZGUpIHtcbiAgICAgICAgICAgICAgICBlbnRyeS5jaGlsZE5vZGVzW2VudHJ5LmNoaWxkTm9kZXMubGVuZ3RoXSA9IG5ld05vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHByb3RlY3QpIHtcbiAgICAgICAgaWYgKGNvbXBvbmVudHNbZW50cnkubm9kZU5hbWVdKSB7XG4gICAgICAgICAgICBpZiAodXBncmFkZShlbnRyeS5ub2RlTmFtZSwgbm9kZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5wYXJlbnROb2RlICYmIG5vZGUuYXR0YWNoZWRDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBub2RlLmF0dGFjaGVkQ2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGVudHJ5O1xufVxubW9kdWxlLmV4cG9ydHMgPSBtYWtlOyIsIid1c2Ugc3RyaWN0JztcbnZhciBjcmVhdGVXb3JrZXIgPSByZXF1aXJlKCcuLi93b3JrZXIvY3JlYXRlJykuY3JlYXRlV29ya2VyO1xudmFyIGhhc1dvcmtlciA9IHJlcXVpcmUoJy4uL3dvcmtlci9jcmVhdGUnKS5oYXNXb3JrZXI7XG52YXIgY2xlYW5NZW1vcnkgPSByZXF1aXJlKCcuLi91dGlsL21lbW9yeScpLmNsZWFuTWVtb3J5O1xudmFyIHByb3RlY3RFbGVtZW50ID0gcmVxdWlyZSgnLi4vdXRpbC9tZW1vcnknKS5wcm90ZWN0RWxlbWVudDtcbnZhciB1bnByb3RlY3RFbGVtZW50ID0gcmVxdWlyZSgnLi4vdXRpbC9tZW1vcnknKS51bnByb3RlY3RFbGVtZW50O1xudmFyIHBvb2xzQ2FjaGUgPSByZXF1aXJlKCcuLi91dGlsL3Bvb2xzJykuY2FjaGU7XG52YXIgcGFyc2VIVE1MID0gcmVxdWlyZSgnLi4vdXRpbC9wYXJzZXInKS5wYXJzZUhUTUw7XG52YXIgcHJvY2Vzc1BhdGNoZXMgPSByZXF1aXJlKCcuLi9wYXRjaC9wcm9jZXNzJyk7XG52YXIgbWFrZU5vZGUgPSByZXF1aXJlKCcuL21ha2UnKTtcbnZhciBtYWtlRWxlbWVudCA9IHJlcXVpcmUoJy4uL2VsZW1lbnQvbWFrZScpO1xudmFyIHN5bmNOb2RlID0gcmVxdWlyZSgnLi9zeW5jJyk7XG52YXIgVHJlZUNhY2hlID0gcmVxdWlyZSgnLi90cmVlJyk7XG5mdW5jdGlvbiByZWxlYXNlTm9kZShlbGVtZW50KSB7XG4gICAgdmFyIGVsZW1lbnRNZXRhID0gVHJlZUNhY2hlLmdldChlbGVtZW50KSB8fCB7fTtcbiAgICBpZiAoZWxlbWVudE1ldGEud29ya2VyKSB7XG4gICAgICAgIGVsZW1lbnRNZXRhLndvcmtlci50ZXJtaW5hdGUoKTtcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRNZXRhLm9sZFRyZWUpIHtcbiAgICAgICAgdW5wcm90ZWN0RWxlbWVudChlbGVtZW50TWV0YS5vbGRUcmVlKTtcbiAgICAgICAgY2xlYW5NZW1vcnkoKTtcbiAgICB9XG4gICAgVHJlZUNhY2hlLmRlbGV0ZShlbGVtZW50KTtcbn1cbmV4cG9ydHMucmVsZWFzZU5vZGUgPSByZWxlYXNlTm9kZTtcbmZ1bmN0aW9uIGNvbXBsZXRlV29ya2VyUmVuZGVyKGVsZW1lbnQsIGVsZW1lbnRNZXRhKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldikge1xuICAgICAgICB2YXIgbm9kZXMgPSBldi5kYXRhLm5vZGVzO1xuICAgICAgICBpZiAobm9kZXMuYWRkaXRpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgbm9kZXMuYWRkaXRpb25zLm1hcChwcm90ZWN0RWxlbWVudCkubWFwKGZ1bmN0aW9uIChkZXNjcmlwdG9yKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudE1ldGEub2xkVHJlZS5jaGlsZE5vZGVzLnB1c2goZGVzY3JpcHRvcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlc2NyaXB0b3I7XG4gICAgICAgICAgICB9KS5mb3JFYWNoKG1ha2VFbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29tcGxldGVSZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAobm9kZXMucmVtb3ZhbHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgbm9kZXMucmVtb3ZhbHMubWFwKGZ1bmN0aW9uICh1dWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwb29sc0NhY2hlLmVsZW1lbnRPYmplY3QuX3V1aWRbdXVpZF07XG4gICAgICAgICAgICAgICAgfSkuZm9yRWFjaCh1bnByb3RlY3RFbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsZW1lbnRNZXRhLl9pbm5lckhUTUwgPSBlbGVtZW50LmlubmVySFRNTDtcbiAgICAgICAgICAgIGVsZW1lbnRNZXRhLl9vdXRlckhUTUwgPSBlbGVtZW50Lm91dGVySFRNTDtcbiAgICAgICAgICAgIGVsZW1lbnRNZXRhLl90ZXh0Q29udGVudCA9IGVsZW1lbnQudGV4dENvbnRlbnQ7XG4gICAgICAgICAgICBjbGVhbk1lbW9yeSgpO1xuICAgICAgICAgICAgZWxlbWVudE1ldGEuaGFzV29ya2VyUmVuZGVyZWQgPSB0cnVlO1xuICAgICAgICAgICAgZWxlbWVudE1ldGEuaXNSZW5kZXJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChlbGVtZW50TWV0YS5yZW5kZXJCdWZmZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dFJlbmRlciA9IGVsZW1lbnRNZXRhLnJlbmRlckJ1ZmZlcjtcbiAgICAgICAgICAgICAgICBlbGVtZW50TWV0YS5yZW5kZXJCdWZmZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgcGF0Y2hOb2RlKGVsZW1lbnQsIG5leHRSZW5kZXIubmV3SFRNTCwgbmV4dFJlbmRlci5vcHRpb25zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgncmVuZGVyQ29tcGxldGUnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZhciBwcm9jZXNzUHJvbWlzZSA9IHByb2Nlc3NQYXRjaGVzKGVsZW1lbnQsIGV2LmRhdGEucGF0Y2hlcyk7XG4gICAgICAgIGlmIChwcm9jZXNzUHJvbWlzZSkge1xuICAgICAgICAgICAgcHJvY2Vzc1Byb21pc2UudGhlbihjb21wbGV0ZVJlbmRlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb21wbGV0ZVJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHBhdGNoTm9kZShlbGVtZW50LCBuZXdIVE1MLCBvcHRpb25zKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLmVuYWJsZVdvcmtlciAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIG9wdGlvbnMuZW5hYmxlV29ya2VyID0gZG9jdW1lbnQuRU5BQkxFX1dPUktFUjtcbiAgICB9XG4gICAgdmFyIGVsZW1lbnRNZXRhID0gVHJlZUNhY2hlLmdldChlbGVtZW50KSB8fCB7fTtcbiAgICBUcmVlQ2FjaGUuc2V0KGVsZW1lbnQsIGVsZW1lbnRNZXRhKTtcbiAgICB2YXIgbmV4dFJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGVsZW1lbnRNZXRhLnJlbmRlckJ1ZmZlcikge1xuICAgICAgICAgICAgdmFyIG5leHRSZW5kZXIgPSBlbGVtZW50TWV0YS5yZW5kZXJCdWZmZXI7XG4gICAgICAgICAgICBlbGVtZW50TWV0YS5yZW5kZXJCdWZmZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBwYXRjaE5vZGUoZWxlbWVudCwgbmV4dFJlbmRlci5uZXdIVE1MLCBuZXh0UmVuZGVyLm9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB2YXIgZGlmZmVyZW50SW5uZXJIVE1MID0gb3B0aW9ucy5pbm5lciAmJiBlbGVtZW50LmlubmVySFRNTCA9PT0gbmV3SFRNTDtcbiAgICB2YXIgZGlmZmVyZW50T3V0ZXJIVE1MID0gIW9wdGlvbnMuaW5uZXIgJiYgZWxlbWVudC5vdXRlckhUTUwgPT09IG5ld0hUTUw7XG4gICAgdmFyIHdvcmtlciA9IG51bGw7XG4gICAgaWYgKG9wdGlvbnMuZW5hYmxlV29ya2VyICYmIGhhc1dvcmtlcikge1xuICAgICAgICB3b3JrZXIgPSBlbGVtZW50TWV0YS53b3JrZXIgPSBlbGVtZW50TWV0YS53b3JrZXIgfHwgY3JlYXRlV29ya2VyKCk7XG4gICAgfVxuICAgIGlmICgoZGlmZmVyZW50SW5uZXJIVE1MIHx8IGRpZmZlcmVudE91dGVySFRNTCkgJiYgZWxlbWVudE1ldGEub2xkVHJlZSkge1xuICAgICAgICByZXR1cm4gbmV4dFJlbmRlcigpO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5pbm5lciAmJiBlbGVtZW50TWV0YS5faW5uZXJIVE1MICE9PSBlbGVtZW50LmlubmVySFRNTCB8fCAhb3B0aW9ucy5pbm5lciAmJiBlbGVtZW50TWV0YS5fb3V0ZXJIVE1MICE9PSBlbGVtZW50Lm91dGVySFRNTCB8fCBlbGVtZW50TWV0YS5fdGV4dENvbnRlbnQgIT09IGVsZW1lbnQudGV4dENvbnRlbnQpIHtcbiAgICAgICAgaWYgKGVsZW1lbnRNZXRhLm9sZFRyZWUpIHtcbiAgICAgICAgICAgIHVucHJvdGVjdEVsZW1lbnQoZWxlbWVudE1ldGEub2xkVHJlZSk7XG4gICAgICAgICAgICBjbGVhbk1lbW9yeSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnRNZXRhLm9sZFRyZWUgPSBtYWtlTm9kZShlbGVtZW50LCB0cnVlKTtcbiAgICAgICAgZWxlbWVudE1ldGEudXBkYXRlT2xkVHJlZSA9IHRydWU7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmVuYWJsZVdvcmtlciAmJiBoYXNXb3JrZXIgJiYgd29ya2VyKSB7XG4gICAgICAgIGVsZW1lbnRNZXRhLmlzUmVuZGVyaW5nID0gdHJ1ZTtcbiAgICAgICAgdmFyIHRyYW5zZmVyT2JqZWN0ID0ge307XG4gICAgICAgIGlmICghZWxlbWVudE1ldGEuaGFzV29ya2VyUmVuZGVyZWQgfHwgZWxlbWVudE1ldGEudXBkYXRlT2xkVHJlZSkge1xuICAgICAgICAgICAgdHJhbnNmZXJPYmplY3Qub2xkVHJlZSA9IGVsZW1lbnRNZXRhLm9sZFRyZWU7XG4gICAgICAgICAgICBlbGVtZW50TWV0YS51cGRhdGVPbGRUcmVlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNmZXJPYmplY3QudXVpZCA9IGVsZW1lbnRNZXRhLm9sZFRyZWUuZWxlbWVudDtcbiAgICAgICAgaWYgKHR5cGVvZiBuZXdIVE1MICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdHJhbnNmZXJPYmplY3QubmV3VHJlZSA9IG1ha2VOb2RlKG5ld0hUTUwpO1xuICAgICAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKHRyYW5zZmVyT2JqZWN0KTtcbiAgICAgICAgICAgIHdvcmtlci5vbm1lc3NhZ2UgPSBjb21wbGV0ZVdvcmtlclJlbmRlcihlbGVtZW50LCBlbGVtZW50TWV0YSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNmZXJPYmplY3QubmV3SFRNTCA9IG5ld0hUTUw7XG4gICAgICAgIHRyYW5zZmVyT2JqZWN0LmlzSW5uZXIgPSBvcHRpb25zLmlubmVyO1xuICAgICAgICB3b3JrZXIucG9zdE1lc3NhZ2UodHJhbnNmZXJPYmplY3QpO1xuICAgICAgICB3b3JrZXIub25tZXNzYWdlID0gY29tcGxldGVXb3JrZXJSZW5kZXIoZWxlbWVudCwgZWxlbWVudE1ldGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnRNZXRhLmlzUmVuZGVyaW5nID0gdHJ1ZTtcbiAgICAgICAgdmFyIHBhdGNoZXMgPSBbXTtcbiAgICAgICAgdmFyIG5ld1RyZWUgPSBudWxsO1xuICAgICAgICBpZiAodHlwZW9mIG5ld0hUTUwgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBuZXdUcmVlID0gcGFyc2VIVE1MKG5ld0hUTUwsIG9wdGlvbnMuaW5uZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3VHJlZSA9IG1ha2VOb2RlKG5ld0hUTUwpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLmlubmVyKSB7XG4gICAgICAgICAgICB2YXIgY2hpbGROb2RlcyA9IG5ld1RyZWU7XG4gICAgICAgICAgICBuZXdUcmVlID0ge1xuICAgICAgICAgICAgICAgIGNoaWxkTm9kZXM6IGNoaWxkTm9kZXMsXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczogZWxlbWVudE1ldGEub2xkVHJlZS5hdHRyaWJ1dGVzLFxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnRNZXRhLm9sZFRyZWUuZWxlbWVudCxcbiAgICAgICAgICAgICAgICBub2RlTmFtZTogZWxlbWVudE1ldGEub2xkVHJlZS5ub2RlTmFtZSxcbiAgICAgICAgICAgICAgICBub2RlVmFsdWU6IGVsZW1lbnRNZXRhLm9sZFRyZWUubm9kZVZhbHVlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHZhciBvbGRUcmVlTmFtZSA9IGVsZW1lbnRNZXRhLm9sZFRyZWUubm9kZU5hbWUgfHwgJyc7XG4gICAgICAgIHZhciBuZXdOb2RlTmFtZSA9IG5ld1RyZWUgJiYgbmV3VHJlZS5ub2RlTmFtZTtcbiAgICAgICAgaWYgKG9sZFRyZWVOYW1lID09PSBuZXdOb2RlTmFtZSkge1xuICAgICAgICAgICAgc3luY05vZGUocGF0Y2hlcywgZWxlbWVudE1ldGEub2xkVHJlZSwgbmV3VHJlZSk7XG4gICAgICAgIH0gZWxzZSBpZiAobmV3SFRNTCkge1xuICAgICAgICAgICAgcGF0Y2hlc1twYXRjaGVzLmxlbmd0aF0gPSB7XG4gICAgICAgICAgICAgICAgX19kb19fOiAwLFxuICAgICAgICAgICAgICAgIG9sZDogZWxlbWVudE1ldGEub2xkVHJlZSxcbiAgICAgICAgICAgICAgICBuZXc6IG5ld1RyZWVcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB1bnByb3RlY3RFbGVtZW50KGVsZW1lbnRNZXRhLm9sZFRyZWUpO1xuICAgICAgICAgICAgZWxlbWVudE1ldGEub2xkVHJlZSA9IG5ld1RyZWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNvbXBsZXRlUmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZWxlbWVudE1ldGEuaXNSZW5kZXJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGVsZW1lbnRNZXRhLl9pbm5lckhUTUwgPSBlbGVtZW50LmlubmVySFRNTDtcbiAgICAgICAgICAgIGVsZW1lbnRNZXRhLl9vdXRlckhUTUwgPSBlbGVtZW50Lm91dGVySFRNTDtcbiAgICAgICAgICAgIGVsZW1lbnRNZXRhLl90ZXh0Q29udGVudCA9IGVsZW1lbnQudGV4dENvbnRlbnQ7XG4gICAgICAgICAgICBjbGVhbk1lbW9yeSgpO1xuICAgICAgICAgICAgZm9yICh2YXIgdXVpZCBpbiBtYWtlTm9kZS5ub2Rlcykge1xuICAgICAgICAgICAgICAgIGlmICghcG9vbHNDYWNoZS5lbGVtZW50T2JqZWN0Ll91dWlkW3V1aWRdKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBtYWtlTm9kZS5ub2Rlc1t1dWlkXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXRjaGVzLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdyZW5kZXJDb21wbGV0ZScpKTtcbiAgICAgICAgICAgIG5leHRSZW5kZXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHByb2Nlc3NQcm9taXNlID0gcHJvY2Vzc1BhdGNoZXMoZWxlbWVudCwgcGF0Y2hlcyk7XG4gICAgICAgIGlmIChwcm9jZXNzUHJvbWlzZSkge1xuICAgICAgICAgICAgcHJvY2Vzc1Byb21pc2UudGhlbihjb21wbGV0ZVJlbmRlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb21wbGV0ZVJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5wYXRjaE5vZGUgPSBwYXRjaE5vZGU7IiwiJ3VzZSBzdHJpY3QnO1xudmFyIHBvb2xzQ2FjaGUgPSByZXF1aXJlKCcuLi91dGlsL3Bvb2xzJykuY2FjaGU7XG52YXIgcHJvdGVjdEVsZW1lbnQgPSByZXF1aXJlKCcuLi91dGlsL21lbW9yeScpLnByb3RlY3RFbGVtZW50O1xudmFyIHVucHJvdGVjdEVsZW1lbnQgPSByZXF1aXJlKCcuLi91dGlsL21lbW9yeScpLnVucHJvdGVjdEVsZW1lbnQ7XG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG5mdW5jdGlvbiBzeW5jKHBhdGNoZXMsIG9sZFRyZWUsIG5ld1RyZWUpIHtcbiAgICB2YXIgb2xkQ2hpbGROb2RlcyA9IG9sZFRyZWUuY2hpbGROb2RlcztcbiAgICB2YXIgb2xkQ2hpbGROb2Rlc0xlbmd0aCA9IG9sZENoaWxkTm9kZXMgPyBvbGRDaGlsZE5vZGVzLmxlbmd0aCA6IDA7XG4gICAgdmFyIG9sZEVsZW1lbnQgPSBvbGRUcmVlLnV1aWQ7XG4gICAgdmFyIHRleHRFbGVtZW50cyA9IFtcbiAgICAgICAgICAgICdzY3JpcHQnLFxuICAgICAgICAgICAgJ3N0eWxlJyxcbiAgICAgICAgICAgICd0ZXh0YXJlYScsXG4gICAgICAgICAgICAnI3RleHQnXG4gICAgICAgIF07XG4gICAgaWYgKCFuZXdUcmVlKSB7XG4gICAgICAgIHZhciByZW1vdmVkID0gb2xkQ2hpbGROb2Rlcy5zcGxpY2UoMCwgb2xkQ2hpbGROb2Rlc0xlbmd0aCk7XG4gICAgICAgIHBhdGNoZXNbcGF0Y2hlcy5sZW5ndGhdID0ge1xuICAgICAgICAgICAgX19kb19fOiAtMSxcbiAgICAgICAgICAgIGVsZW1lbnQ6IG9sZEVsZW1lbnRcbiAgICAgICAgfTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZW1vdmVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAocGF0Y2hlcy5yZW1vdmFscykge1xuICAgICAgICAgICAgICAgIHBhdGNoZXMucmVtb3ZhbHMucHVzaChyZW1vdmVkW2ldLnV1aWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdW5wcm90ZWN0RWxlbWVudChyZW1vdmVkW2ldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBub2RlVmFsdWUgPSBuZXdUcmVlLm5vZGVWYWx1ZTtcbiAgICB2YXIgY2hpbGROb2RlcyA9IG5ld1RyZWUuY2hpbGROb2RlcztcbiAgICB2YXIgY2hpbGROb2Rlc0xlbmd0aCA9IGNoaWxkTm9kZXMgPyBjaGlsZE5vZGVzLmxlbmd0aCA6IDA7XG4gICAgdmFyIG5ld0VsZW1lbnQgPSBuZXdUcmVlLnV1aWQ7XG4gICAgaWYgKG9sZFRyZWUubm9kZU5hbWUgIT09IG5ld1RyZWUubm9kZU5hbWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGV4dEVsZW1lbnRzLmluZGV4T2YobmV3VHJlZS5ub2RlTmFtZSkgPiAtMSkge1xuICAgICAgICBpZiAob2xkVHJlZS5ub2RlVmFsdWUgIT09IG5vZGVWYWx1ZSkge1xuICAgICAgICAgICAgb2xkVHJlZS5ub2RlVmFsdWUgPSBub2RlVmFsdWU7XG4gICAgICAgICAgICBwYXRjaGVzW3BhdGNoZXMubGVuZ3RoXSA9IHtcbiAgICAgICAgICAgICAgICBfX2RvX186IDMsXG4gICAgICAgICAgICAgICAgZWxlbWVudDogb2xkRWxlbWVudCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogbm9kZVZhbHVlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGNoaWxkTm9kZXNMZW5ndGggPiBvbGRDaGlsZE5vZGVzTGVuZ3RoKSB7XG4gICAgICAgIHZhciBmcmFnbWVudCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gb2xkQ2hpbGROb2Rlc0xlbmd0aDsgaSA8IGNoaWxkTm9kZXNMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHBhdGNoZXMuYWRkaXRpb25zKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hlcy5hZGRpdGlvbnMucHVzaChjaGlsZE5vZGVzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByb3RlY3RFbGVtZW50KGNoaWxkTm9kZXNbaV0pO1xuICAgICAgICAgICAgb2xkQ2hpbGROb2Rlc1tvbGRDaGlsZE5vZGVzLmxlbmd0aF0gPSBjaGlsZE5vZGVzW2ldO1xuICAgICAgICAgICAgZnJhZ21lbnRbZnJhZ21lbnQubGVuZ3RoXSA9IGNoaWxkTm9kZXNbaV07XG4gICAgICAgIH1cbiAgICAgICAgcGF0Y2hlc1twYXRjaGVzLmxlbmd0aF0gPSB7XG4gICAgICAgICAgICBfX2RvX186IDEsXG4gICAgICAgICAgICBlbGVtZW50OiBvbGRFbGVtZW50LFxuICAgICAgICAgICAgZnJhZ21lbnQ6IGZyYWdtZW50XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGROb2Rlc0xlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChvbGRDaGlsZE5vZGVzW2ldLm5vZGVOYW1lICE9PSBjaGlsZE5vZGVzW2ldLm5vZGVOYW1lKSB7XG4gICAgICAgICAgICBwYXRjaGVzW3BhdGNoZXMubGVuZ3RoXSA9IHtcbiAgICAgICAgICAgICAgICBfX2RvX186IDEsXG4gICAgICAgICAgICAgICAgb2xkOiBvbGRDaGlsZE5vZGVzW2ldLFxuICAgICAgICAgICAgICAgIG5ldzogY2hpbGROb2Rlc1tpXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChwYXRjaGVzLnJlbW92YWxzKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hlcy5yZW1vdmFscy5wdXNoKG9sZENoaWxkTm9kZXNbaV0udXVpZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGF0Y2hlcy5hZGRpdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBwYXRjaGVzLmFkZGl0aW9ucy5wdXNoKGNoaWxkTm9kZXNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdW5wcm90ZWN0RWxlbWVudChvbGRDaGlsZE5vZGVzW2ldKTtcbiAgICAgICAgICAgIHByb3RlY3RFbGVtZW50KGNoaWxkTm9kZXNbaV0pO1xuICAgICAgICAgICAgb2xkQ2hpbGROb2Rlc1tpXSA9IGNoaWxkTm9kZXNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9sZENoaWxkTm9kZXNMZW5ndGggPiBjaGlsZE5vZGVzTGVuZ3RoKSB7XG4gICAgICAgIHZhciB0b1JlbW92ZSA9IHNsaWNlLmNhbGwob2xkQ2hpbGROb2RlcywgY2hpbGROb2Rlc0xlbmd0aCwgb2xkQ2hpbGROb2Rlc0xlbmd0aCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG9SZW1vdmUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHBhdGNoZXNbcGF0Y2hlcy5sZW5ndGhdID0ge1xuICAgICAgICAgICAgICAgIF9fZG9fXzogMSxcbiAgICAgICAgICAgICAgICBvbGQ6IHRvUmVtb3ZlW2ldLnV1aWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlbW92ZWQgPSBvbGRDaGlsZE5vZGVzLnNwbGljZShjaGlsZE5vZGVzTGVuZ3RoLCBvbGRDaGlsZE5vZGVzTGVuZ3RoIC0gY2hpbGROb2Rlc0xlbmd0aCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVtb3ZlZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHBhdGNoZXMucmVtb3ZhbHMpIHtcbiAgICAgICAgICAgICAgICBwYXRjaGVzLnJlbW92YWxzLnB1c2gocmVtb3ZlZFtpXS51dWlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVucHJvdGVjdEVsZW1lbnQocmVtb3ZlZFtpXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSBuZXdUcmVlLmF0dHJpYnV0ZXM7XG4gICAgaWYgKGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgdmFyIG9sZExlbmd0aCA9IG9sZFRyZWUuYXR0cmlidXRlcy5sZW5ndGg7XG4gICAgICAgIHZhciBuZXdMZW5ndGggPSBhdHRyaWJ1dGVzLmxlbmd0aDtcbiAgICAgICAgaWYgKG5ld0xlbmd0aCA+IG9sZExlbmd0aCkge1xuICAgICAgICAgICAgdmFyIHRvQWRkID0gc2xpY2UuY2FsbChhdHRyaWJ1dGVzLCBvbGRMZW5ndGgpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b0FkZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBjaGFuZ2UgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfX2RvX186IDIsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBvbGRFbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdG9BZGRbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0b0FkZFtpXS52YWx1ZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHZhciBhdHRyID0gcG9vbHNDYWNoZS5hdHRyaWJ1dGVPYmplY3QuZ2V0KCk7XG4gICAgICAgICAgICAgICAgYXR0ci5uYW1lID0gdG9BZGRbaV0ubmFtZTtcbiAgICAgICAgICAgICAgICBhdHRyLnZhbHVlID0gdG9BZGRbaV0udmFsdWU7XG4gICAgICAgICAgICAgICAgcG9vbHNDYWNoZS5hdHRyaWJ1dGVPYmplY3QucHJvdGVjdChhdHRyKTtcbiAgICAgICAgICAgICAgICBvbGRUcmVlLmF0dHJpYnV0ZXNbb2xkVHJlZS5hdHRyaWJ1dGVzLmxlbmd0aF0gPSBhdHRyO1xuICAgICAgICAgICAgICAgIHBhdGNoZXNbcGF0Y2hlcy5sZW5ndGhdID0gY2hhbmdlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChvbGRMZW5ndGggPiBuZXdMZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciB0b1JlbW92ZSA9IHNsaWNlLmNhbGwob2xkVHJlZS5hdHRyaWJ1dGVzLCBuZXdMZW5ndGgpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b1JlbW92ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBjaGFuZ2UgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfX2RvX186IDIsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBvbGRFbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdG9SZW1vdmVbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgcmVtb3ZlZCA9IG9sZFRyZWUuYXR0cmlidXRlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZW1vdmVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvb2xzQ2FjaGUuYXR0cmlidXRlT2JqZWN0LnVucHJvdGVjdChyZW1vdmVkW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGF0Y2hlc1twYXRjaGVzLmxlbmd0aF0gPSBjaGFuZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRvTW9kaWZ5ID0gYXR0cmlidXRlcztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b01vZGlmeS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG9sZEF0dHJWYWx1ZSA9IG9sZFRyZWUuYXR0cmlidXRlc1tpXSAmJiBvbGRUcmVlLmF0dHJpYnV0ZXNbaV0udmFsdWU7XG4gICAgICAgICAgICB2YXIgbmV3QXR0clZhbHVlID0gYXR0cmlidXRlc1tpXSAmJiBhdHRyaWJ1dGVzW2ldLnZhbHVlO1xuICAgICAgICAgICAgaWYgKG9sZEF0dHJWYWx1ZSAhPT0gbmV3QXR0clZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNoYW5nZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9fZG9fXzogMixcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IG9sZEVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0b01vZGlmeVtpXS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRvTW9kaWZ5W2ldLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdmFyIGF0dHIgPSBvbGRUcmVlLmF0dHJpYnV0ZXNbaV07XG4gICAgICAgICAgICAgICAgYXR0ci5uYW1lID0gdG9Nb2RpZnlbaV0ubmFtZTtcbiAgICAgICAgICAgICAgICBhdHRyLnZhbHVlID0gdG9Nb2RpZnlbaV0udmFsdWU7XG4gICAgICAgICAgICAgICAgcGF0Y2hlc1twYXRjaGVzLmxlbmd0aF0gPSBjaGFuZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvbGRDaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChvbGRDaGlsZE5vZGVzW2ldLnV1aWQgIT09IGNoaWxkTm9kZXNbaV0udXVpZCkge1xuICAgICAgICAgICAgc3luYyhwYXRjaGVzLCBvbGRUcmVlLmNoaWxkTm9kZXNbaV0sIGNoaWxkTm9kZXNbaV0pO1xuICAgICAgICB9XG4gICAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzeW5jOyIsIid1c2Ugc3RyaWN0JztcbnZhciBUcmVlQ2FjaGUgPSBuZXcgV2Vha01hcCgpO1xubW9kdWxlLmV4cG9ydHMgPSBUcmVlQ2FjaGU7IiwiJ3VzZSBzdHJpY3QnO1xudmFyIHRyYW5zaXRpb25TdGF0ZXMgPSByZXF1aXJlKCcuLi90cmFuc2l0aW9uX3N0YXRlcycpO1xudmFyIGRlY29kZUVudGl0aWVzID0gcmVxdWlyZSgnLi4vdXRpbC9kZWNvZGUnKTtcbnZhciBnZXRFbGVtZW50ID0gcmVxdWlyZSgnLi4vZWxlbWVudC9nZXQnKTtcbnZhciBjb21wb25lbnRzID0gcmVxdWlyZSgnLi4vZWxlbWVudC9jdXN0b20nKS5jb21wb25lbnRzO1xudmFyIG1ha2VOb2RlID0gcmVxdWlyZSgnLi4vbm9kZS9tYWtlJyk7XG52YXIgZm9yRWFjaCA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoO1xudmFyIGVtcHR5ID0geyBwcm90b3R5cGU6IHt9IH07XG5mdW5jdGlvbiBwcm9jZXNzKGVsZW1lbnQsIHBhdGNoZXMpIHtcbiAgICB2YXIgc3RhdGVzID0gdHJhbnNpdGlvblN0YXRlcztcbiAgICB2YXIgcHJvbWlzZXMgPSBbXTtcbiAgICB2YXIgYWRkUHJvbWlzZXMgPSBwcm9taXNlcy5wdXNoLmFwcGx5LmJpbmQocHJvbWlzZXMucHVzaCwgcHJvbWlzZXMpO1xuICAgIHZhciBhdHRhY2hlZFRyYW5zaXRpb25BbmRUaXRsZSA9IGZ1bmN0aW9uIChlbCkge1xuICAgICAgICB2YXIgZWxlbWVudCA9IGdldEVsZW1lbnQoZWwpLmVsZW1lbnQ7XG4gICAgICAgIGlmIChlbC5ub2RlTmFtZSA9PT0gJyN0ZXh0JyB8fCBlbC5ub2RlTmFtZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgICBpZiAoc3RhdGVzICYmIHN0YXRlcy50ZXh0Q2hhbmdlZCAmJiBzdGF0ZXMudGV4dENoYW5nZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgYWRkUHJvbWlzZXMoc3RhdGVzLnRleHRDaGFuZ2VkLm1hcChmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVsZW1lbnQucGFyZW50Tm9kZSB8fCBlbGVtZW50LCBudWxsLCBlbC5ub2RlVmFsdWUpO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZXMgJiYgc3RhdGVzLmF0dGFjaGVkICYmIHN0YXRlcy5hdHRhY2hlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGFkZFByb21pc2VzKHN0YXRlcy5hdHRhY2hlZC5tYXAoY2FsbENhbGxiYWNrLCBlbGVtZW50KSk7XG4gICAgICAgIH1cbiAgICAgICAgZWwuY2hpbGROb2Rlcy5mb3JFYWNoKGF0dGFjaGVkVHJhbnNpdGlvbkFuZFRpdGxlKTtcbiAgICAgICAgdGl0bGVDYWxsYmFjayhlbCk7XG4gICAgfTtcbiAgICB2YXIgY2FsbENhbGxiYWNrID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayh0aGlzKTtcbiAgICB9O1xuICAgIHZhciBhdHRhY2hlZENhbGxiYWNrID0gZnVuY3Rpb24gKGVsZW1lbnREZXNjcmlwdG9yKSB7XG4gICAgICAgIHZhciBlbCA9IGdldEVsZW1lbnQoZWxlbWVudERlc2NyaXB0b3IpLmVsZW1lbnQ7XG4gICAgICAgIHZhciBmcmFnbWVudCA9IHRoaXMuZnJhZ21lbnQ7XG4gICAgICAgIHZhciBjdXN0b21FbGVtZW50ID0gY29tcG9uZW50c1tlbGVtZW50RGVzY3JpcHRvci5ub2RlTmFtZV0gfHwgZW1wdHk7XG4gICAgICAgIGlmIChjdXN0b21FbGVtZW50LnByb3RvdHlwZS5hdHRhY2hlZENhbGxiYWNrKSB7XG4gICAgICAgICAgICBjdXN0b21FbGVtZW50LnByb3RvdHlwZS5hdHRhY2hlZENhbGxiYWNrLmNhbGwoZWwpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbC5ub2RlTmFtZSA9PT0gJyN0ZXh0Jykge1xuICAgICAgICAgICAgZWwudGV4dENvbnRlbnQgPSBkZWNvZGVFbnRpdGllcyhlbC50ZXh0Q29udGVudCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW1lbnREZXNjcmlwdG9yLmNoaWxkTm9kZXMpIHtcbiAgICAgICAgICAgIGVsZW1lbnREZXNjcmlwdG9yLmNoaWxkTm9kZXMuZm9yRWFjaChhdHRhY2hlZENhbGxiYWNrLCB7IGZyYWdtZW50OiBmYWxzZSB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZnJhZ21lbnQpIHtcbiAgICAgICAgICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGVsKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdmFyIHRpdGxlQ2FsbGJhY2sgPSBmdW5jdGlvbiAoZWxlbWVudERlc2NyaXB0b3IpIHtcbiAgICAgICAgdmFyIGVsID0gZ2V0RWxlbWVudChlbGVtZW50RGVzY3JpcHRvcikuZWxlbWVudDtcbiAgICAgICAgaWYgKGVsLnRhZ05hbWUgPT09ICd0aXRsZScpIHtcbiAgICAgICAgICAgIGVsLm93bmVyRG9jdW1lbnQudGl0bGUgPSBlbC5jaGlsZE5vZGVzWzBdLm5vZGVWYWx1ZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBwYXRjaCA9IHBhdGNoZXNbaV07XG4gICAgICAgIHZhciBuZXdEZXNjcmlwdG9yLCBvbGREZXNjcmlwdG9yLCBlbGVtZW50RGVzY3JpcHRvcjtcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBwYXRjaC5uZXc7XG4gICAgICAgIGlmIChwYXRjaC5lbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50RGVzY3JpcHRvciA9IHBhdGNoLmVsZW1lbnQ7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gZ2V0RWxlbWVudChwYXRjaC5lbGVtZW50KTtcbiAgICAgICAgICAgIHBhdGNoLmVsZW1lbnQgPSByZXN1bHQuZWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGF0Y2gub2xkKSB7XG4gICAgICAgICAgICBvbGREZXNjcmlwdG9yID0gcGF0Y2gub2xkO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGdldEVsZW1lbnQocGF0Y2gub2xkKTtcbiAgICAgICAgICAgIHBhdGNoLm9sZCA9IHJlc3VsdC5lbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXRjaC5uZXcpIHtcbiAgICAgICAgICAgIG5ld0Rlc2NyaXB0b3IgPSBwYXRjaC5uZXc7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gZ2V0RWxlbWVudChwYXRjaC5uZXcpO1xuICAgICAgICAgICAgcGF0Y2gubmV3ID0gcmVzdWx0LmVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW1lbnQgJiYgZWxlbWVudC5ub2RlTmFtZSA9PT0gJyN0ZXh0Jykge1xuICAgICAgICAgICAgcGF0Y2gubmV3LnRleHRDb250ZW50ID0gZGVjb2RlRW50aXRpZXMoZWxlbWVudC5ub2RlVmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXRjaC5fX2RvX18gPT09IDApIHtcbiAgICAgICAgICAgIHBhdGNoLm9sZC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChwYXRjaC5uZXcsIHBhdGNoLm9sZCk7XG4gICAgICAgICAgICB2YXIgb2xkQ3VzdG9tRWxlbWVudCA9IGNvbXBvbmVudHNbb2xkRGVzY3JpcHRvci5ub2RlTmFtZV0gfHwgZW1wdHk7XG4gICAgICAgICAgICB2YXIgbmV3Q3VzdG9tRWxlbWVudCA9IGNvbXBvbmVudHNbbmV3RGVzY3JpcHRvci5ub2RlTmFtZV0gfHwgZW1wdHk7XG4gICAgICAgICAgICBpZiAob2xkQ3VzdG9tRWxlbWVudC5wcm90b3R5cGUuZGV0YWNoZWRDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIG9sZEN1c3RvbUVsZW1lbnQucHJvdG90eXBlLmRldGFjaGVkQ2FsbGJhY2suY2FsbChwYXRjaC5vbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5ld0N1c3RvbUVsZW1lbnQucHJvdG90eXBlLmF0dGFjaGVkQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBuZXdDdXN0b21FbGVtZW50LnByb3RvdHlwZS5hdHRhY2hlZENhbGxiYWNrLmNhbGwocGF0Y2gubmV3KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChwYXRjaC5fX2RvX18gPT09IDEpIHtcbiAgICAgICAgICAgIGlmIChwYXRjaC5lbGVtZW50ICYmIHBhdGNoLmZyYWdtZW50ICYmICFwYXRjaC5vbGQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgICAgICAgICAgICAgcGF0Y2guZnJhZ21lbnQuZm9yRWFjaChhdHRhY2hlZENhbGxiYWNrLCB7IGZyYWdtZW50OiBmcmFnbWVudCB9KTtcbiAgICAgICAgICAgICAgICBwYXRjaC5lbGVtZW50LmFwcGVuZENoaWxkKGZyYWdtZW50KTtcbiAgICAgICAgICAgICAgICBmb3JFYWNoLmNhbGwocGF0Y2guZnJhZ21lbnQsIGF0dGFjaGVkVHJhbnNpdGlvbkFuZFRpdGxlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGF0Y2gub2xkICYmICFwYXRjaC5uZXcpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXBhdGNoLm9sZC5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuXFwndCByZW1vdmUgd2l0aG91dCBwYXJlbnQsIGlzIHRoaXMgdGhlICcgKyAnZG9jdW1lbnQgcm9vdD8nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHBhdGNoLm9sZC50YWdOYW1lID09PSAndGl0bGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhdGNoLm9sZC5vd25lckRvY3VtZW50LnRpdGxlID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBjdXN0b21FbGVtZW50ID0gY29tcG9uZW50c1tvbGREZXNjcmlwdG9yLm5vZGVOYW1lXSB8fCBlbXB0eTtcbiAgICAgICAgICAgICAgICBpZiAoY3VzdG9tRWxlbWVudC5wcm90b3R5cGUuZGV0YWNoZWRDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjdXN0b21FbGVtZW50LnByb3RvdHlwZS5kZXRhY2hlZENhbGxiYWNrLmNhbGwocGF0Y2gub2xkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGF0Y2gub2xkLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocGF0Y2gub2xkKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGVzICYmIHN0YXRlcy5kZXRhY2hlZCAmJiBzdGF0ZXMuZGV0YWNoZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZFByb21pc2VzKHN0YXRlcy5kZXRhY2hlZC5tYXAoY2FsbENhbGxiYWNrLCBwYXRjaC5vbGQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbWFrZU5vZGUubm9kZXNbb2xkRGVzY3JpcHRvci51dWlkXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGF0Y2gub2xkICYmIHBhdGNoLm5ldykge1xuICAgICAgICAgICAgICAgIGlmICghcGF0Y2gub2xkLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5cXCd0IHJlcGxhY2Ugd2l0aG91dCBwYXJlbnQsIGlzIHRoaXMgdGhlICcgKyAnZG9jdW1lbnQgcm9vdD8nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGF0Y2gub2xkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHBhdGNoLm5ldywgcGF0Y2gub2xkLm5leHRTaWJsaW5nKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGVzICYmIHN0YXRlcy5kZXRhY2hlZCAmJiBzdGF0ZXMuZGV0YWNoZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZFByb21pc2VzKHN0YXRlcy5kZXRhY2hlZC5tYXAoY2FsbENhbGxiYWNrLCBwYXRjaC5vbGQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlcyAmJiBzdGF0ZXMucmVwbGFjZWQgJiYgc3RhdGVzLnJlcGxhY2VkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBhZGRQcm9taXNlcyhzdGF0ZXMucmVwbGFjZWQubWFwKGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHBhdGNoLm9sZCwgcGF0Y2gubmV3KTtcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocGF0Y2gubmV3LnRhZ05hbWUgPT09ICd0aXRsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgcGF0Y2gub2xkLm93bmVyRG9jdW1lbnQudGl0bGUgPSBwYXRjaC5uZXcuY2hpbGROb2Rlc1swXS5ub2RlVmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBhdGNoLm9sZC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChwYXRjaC5uZXcsIHBhdGNoLm9sZCk7XG4gICAgICAgICAgICAgICAgdmFyIG9sZEN1c3RvbUVsZW1lbnQgPSBjb21wb25lbnRzW29sZERlc2NyaXB0b3Iubm9kZU5hbWVdIHx8IGVtcHR5O1xuICAgICAgICAgICAgICAgIHZhciBuZXdDdXN0b21FbGVtZW50ID0gY29tcG9uZW50c1tuZXdEZXNjcmlwdG9yLm5vZGVOYW1lXSB8fCBlbXB0eTtcbiAgICAgICAgICAgICAgICBpZiAob2xkQ3VzdG9tRWxlbWVudC5wcm90b3R5cGUuZGV0YWNoZWRDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBvbGRDdXN0b21FbGVtZW50LnByb3RvdHlwZS5kZXRhY2hlZENhbGxiYWNrLmNhbGwocGF0Y2gub2xkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5ld0N1c3RvbUVsZW1lbnQucHJvdG90eXBlLmF0dGFjaGVkQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3Q3VzdG9tRWxlbWVudC5wcm90b3R5cGUuYXR0YWNoZWRDYWxsYmFjay5jYWxsKHBhdGNoLm5ldyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzdGF0ZXMgJiYgc3RhdGVzLmF0dGFjaGVkICYmIHN0YXRlcy5hdHRhY2hlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0YWNoZWRUcmFuc2l0aW9uQW5kVGl0bGUobmV3RGVzY3JpcHRvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1ha2VOb2RlLm5vZGVzW29sZERlc2NyaXB0b3IudXVpZF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocGF0Y2guX19kb19fID09PSAyKSB7XG4gICAgICAgICAgICB2YXIgb2xkVmFsdWUgPSBwYXRjaC5lbGVtZW50LmdldEF0dHJpYnV0ZShwYXRjaC5uYW1lKTtcbiAgICAgICAgICAgIHZhciBhdWdtZW50QXR0cmlidXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICghcGF0Y2gudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcGF0Y2guZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUocGF0Y2gubmFtZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcGF0Y2guZWxlbWVudC5zZXRBdHRyaWJ1dGUocGF0Y2gubmFtZSwgcGF0Y2gudmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoc3RhdGVzICYmIHN0YXRlcy5hdHRyaWJ1dGVDaGFuZ2VkICYmIHN0YXRlcy5hdHRyaWJ1dGVDaGFuZ2VkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGFkZFByb21pc2VzKHN0YXRlcy5hdHRyaWJ1dGVDaGFuZ2VkLm1hcChmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb21pc2UgPSBjYWxsYmFjayhwYXRjaC5lbGVtZW50LCBwYXRjaC5uYW1lLCBvbGRWYWx1ZSwgcGF0Y2gudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvbWlzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZS50aGVuKGF1Z21lbnRBdHRyaWJ1dGUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXVnbWVudEF0dHJpYnV0ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXVnbWVudEF0dHJpYnV0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGN1c3RvbUVsZW1lbnQgPSBjb21wb25lbnRzW2VsZW1lbnREZXNjcmlwdG9yLm5vZGVOYW1lXSB8fCBlbXB0eTtcbiAgICAgICAgICAgIGlmIChjdXN0b21FbGVtZW50LmF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGN1c3RvbUVsZW1lbnQucHJvdG90eXBlLmF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjay5jYWxsKHBhdGNoLm9sZCwgcGF0Y2gubmFtZSwgb2xkVmFsdWUsIHBhdGNoLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChwYXRjaC5fX2RvX18gPT09IDMpIHtcbiAgICAgICAgICAgIHZhciBvcmlnaW5hbFZhbHVlID0gcGF0Y2guZWxlbWVudC50ZXh0Q29udGVudDtcbiAgICAgICAgICAgIHZhciBhdWdtZW50VGV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBwYXRjaC5lbGVtZW50LnRleHRDb250ZW50ID0gZGVjb2RlRW50aXRpZXMocGF0Y2gudmFsdWUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChzdGF0ZXMgJiYgc3RhdGVzLnRleHRDaGFuZ2VkICYmIHN0YXRlcy50ZXh0Q2hhbmdlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBhZGRQcm9taXNlcyhzdGF0ZXMudGV4dENoYW5nZWQubWFwKGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvbWlzZSA9IGNhbGxiYWNrKHBhdGNoLmVsZW1lbnQucGFyZW50Tm9kZSB8fCBwYXRjaC5lbGVtZW50LCBvcmlnaW5hbFZhbHVlLCBwYXRjaC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlLnRoZW4oYXVnbWVudFRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXVnbWVudFRleHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGF1Z21lbnRUZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIGFjdGl2ZVByb21pc2VzID0gcHJvbWlzZXMuZmlsdGVyKEJvb2xlYW4pO1xuICAgIGlmIChhY3RpdmVQcm9taXNlcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzLmZpbHRlcihCb29sZWFuKSk7XG4gICAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBwcm9jZXNzOyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIG5hbWVzcGFjZTogJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyxcbiAgICBlbGVtZW50czogW1xuICAgICAgICAnYWx0R2x5cGgnLFxuICAgICAgICAnYWx0R2x5cGhEZWYnLFxuICAgICAgICAnYWx0R2x5cGhJdGVtJyxcbiAgICAgICAgJ2FuaW1hdGUnLFxuICAgICAgICAnYW5pbWF0ZUNvbG9yJyxcbiAgICAgICAgJ2FuaW1hdGVNb3Rpb24nLFxuICAgICAgICAnYW5pbWF0ZVRyYW5zZm9ybScsXG4gICAgICAgICdjaXJjbGUnLFxuICAgICAgICAnY2xpcFBhdGgnLFxuICAgICAgICAnY29sb3ItcHJvZmlsZScsXG4gICAgICAgICdjdXJzb3InLFxuICAgICAgICAnZGVmcycsXG4gICAgICAgICdkZXNjJyxcbiAgICAgICAgJ2VsbGlwc2UnLFxuICAgICAgICAnZmVCbGVuZCcsXG4gICAgICAgICdmZUNvbG9yTWF0cml4JyxcbiAgICAgICAgJ2ZlQ29tcG9uZW50VHJhbnNmZXInLFxuICAgICAgICAnZmVDb21wb3NpdGUnLFxuICAgICAgICAnZmVDb252b2x2ZU1hdHJpeCcsXG4gICAgICAgICdmZURpZmZ1c2VMaWdodGluZycsXG4gICAgICAgICdmZURpc3BsYWNlbWVudE1hcCcsXG4gICAgICAgICdmZURpc3RhbnRMaWdodCcsXG4gICAgICAgICdmZUZsb29kJyxcbiAgICAgICAgJ2ZlRnVuY0EnLFxuICAgICAgICAnZmVGdW5jQicsXG4gICAgICAgICdmZUZ1bmNHJyxcbiAgICAgICAgJ2ZlRnVuY1InLFxuICAgICAgICAnZmVHYXVzc2lhbkJsdXInLFxuICAgICAgICAnZmVJbWFnZScsXG4gICAgICAgICdmZU1lcmdlJyxcbiAgICAgICAgJ2ZlTWVyZ2VOb2RlJyxcbiAgICAgICAgJ2ZlTW9ycGhvbG9neScsXG4gICAgICAgICdmZU9mZnNldCcsXG4gICAgICAgICdmZVBvaW50TGlnaHQnLFxuICAgICAgICAnZmVTcGVjdWxhckxpZ2h0aW5nJyxcbiAgICAgICAgJ2ZlU3BvdExpZ2h0JyxcbiAgICAgICAgJ2ZlVGlsZScsXG4gICAgICAgICdmZVR1cmJ1bGVuY2UnLFxuICAgICAgICAnZmlsdGVyJyxcbiAgICAgICAgJ2ZvbnQnLFxuICAgICAgICAnZm9udC1mYWNlJyxcbiAgICAgICAgJ2ZvbnQtZmFjZS1mb3JtYXQnLFxuICAgICAgICAnZm9udC1mYWNlLW5hbWUnLFxuICAgICAgICAnZm9udC1mYWNlLXNyYycsXG4gICAgICAgICdmb250LWZhY2UtdXJpJyxcbiAgICAgICAgJ2ZvcmVpZ25PYmplY3QnLFxuICAgICAgICAnZycsXG4gICAgICAgICdnbHlwaCcsXG4gICAgICAgICdnbHlwaFJlZicsXG4gICAgICAgICdoa2VybicsXG4gICAgICAgICdpbWFnZScsXG4gICAgICAgICdsaW5lJyxcbiAgICAgICAgJ2xpbmVhckdyYWRpZW50JyxcbiAgICAgICAgJ21hcmtlcicsXG4gICAgICAgICdtYXNrJyxcbiAgICAgICAgJ21ldGFkYXRhJyxcbiAgICAgICAgJ21pc3NpbmctZ2x5cGgnLFxuICAgICAgICAnbXBhdGgnLFxuICAgICAgICAncGF0aCcsXG4gICAgICAgICdwYXR0ZXJuJyxcbiAgICAgICAgJ3BvbHlnb24nLFxuICAgICAgICAncG9seWxpbmUnLFxuICAgICAgICAncmFkaWFsR3JhZGllbnQnLFxuICAgICAgICAncmVjdCcsXG4gICAgICAgICdzY3JpcHQnLFxuICAgICAgICAnc2V0JyxcbiAgICAgICAgJ3N0b3AnLFxuICAgICAgICAnc3R5bGUnLFxuICAgICAgICAnc3ZnJyxcbiAgICAgICAgJ3N3aXRjaCcsXG4gICAgICAgICdzeW1ib2wnLFxuICAgICAgICAndGV4dCcsXG4gICAgICAgICd0ZXh0UGF0aCcsXG4gICAgICAgICd0cmVmJyxcbiAgICAgICAgJ3RzcGFuJyxcbiAgICAgICAgJ3VzZScsXG4gICAgICAgICd2aWV3JyxcbiAgICAgICAgJ3ZrZXJuJ1xuICAgIF1cbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIHRyYW5zaXRpb25TdGF0ZXMgPSB7fTtcbnRyYW5zaXRpb25TdGF0ZXMuYXR0YWNoZWQgPSBbXTtcbnRyYW5zaXRpb25TdGF0ZXMuZGV0YWNoZWQgPSBbXTtcbnRyYW5zaXRpb25TdGF0ZXMucmVwbGFjZWQgPSBbXTtcbnRyYW5zaXRpb25TdGF0ZXMuYXR0cmlidXRlQ2hhbmdlZCA9IFtdO1xudHJhbnNpdGlvblN0YXRlcy50ZXh0Q2hhbmdlZCA9IFtdO1xubW9kdWxlLmV4cG9ydHMgPSB0cmFuc2l0aW9uU3RhdGVzOyIsIid1c2Ugc3RyaWN0JztcbnZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5mdW5jdGlvbiBkZWNvZGVFbnRpdGllcyhzdHJpbmcpIHtcbiAgICBlbGVtZW50LmlubmVySFRNTCA9IHN0cmluZztcbiAgICByZXR1cm4gZWxlbWVudC50ZXh0Q29udGVudDtcbn1cbm1vZHVsZS5leHBvcnRzID0gZGVjb2RlRW50aXRpZXM7IiwiJ3VzZSBzdHJpY3QnO1xuZnVuY3Rpb24gaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHtcbiAgICB2YXIgZXJyb3JNZXNnID0gJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJztcbiAgICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGVycm9yTWVzZyArIHR5cGVvZiBzdXBlckNsYXNzKTtcbiAgICB9XG4gICAgc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7XG4gICAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgICAgICB2YWx1ZTogc3ViQ2xhc3MsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoc3VwZXJDbGFzcyAmJiBPYmplY3Quc2V0UHJvdG90eXBlT2YpIHtcbiAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKTtcbiAgICB9IGVsc2UgaWYgKHN1cGVyQ2xhc3MpIHtcbiAgICAgICAgc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzcztcbiAgICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IGluaGVyaXRzOyIsIid1c2Ugc3RyaWN0JztcbnZhciBwb29sc0NhY2hlID0gcmVxdWlyZSgnLi4vdXRpbC9wb29scycpLmNhY2hlO1xuZnVuY3Rpb24gcHJvdGVjdEVsZW1lbnQoZWxlbWVudCkge1xuICAgIHBvb2xzQ2FjaGUuZWxlbWVudE9iamVjdC5wcm90ZWN0KGVsZW1lbnQpO1xuICAgIGVsZW1lbnQuY2hpbGROb2Rlcy5mb3JFYWNoKHByb3RlY3RFbGVtZW50KTtcbiAgICBlbGVtZW50LmF0dHJpYnV0ZXMuZm9yRWFjaChwb29sc0NhY2hlLmF0dHJpYnV0ZU9iamVjdC5wcm90ZWN0LCBwb29sc0NhY2hlLmF0dHJpYnV0ZU9iamVjdCk7XG4gICAgcmV0dXJuIGVsZW1lbnQ7XG59XG5leHBvcnRzLnByb3RlY3RFbGVtZW50ID0gcHJvdGVjdEVsZW1lbnQ7XG5mdW5jdGlvbiB1bnByb3RlY3RFbGVtZW50KGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LmNoaWxkTm9kZXMuZm9yRWFjaCh1bnByb3RlY3RFbGVtZW50KTtcbiAgICBlbGVtZW50LmF0dHJpYnV0ZXMuZm9yRWFjaChwb29sc0NhY2hlLmF0dHJpYnV0ZU9iamVjdC51bnByb3RlY3QsIHBvb2xzQ2FjaGUuYXR0cmlidXRlT2JqZWN0KTtcbiAgICBwb29sc0NhY2hlLmVsZW1lbnRPYmplY3QudW5wcm90ZWN0KGVsZW1lbnQpO1xuICAgIHJldHVybiBlbGVtZW50O1xufVxuZXhwb3J0cy51bnByb3RlY3RFbGVtZW50ID0gdW5wcm90ZWN0RWxlbWVudDtcbmZ1bmN0aW9uIGNsZWFuTWVtb3J5KCkge1xuICAgIHBvb2xzQ2FjaGUuYXR0cmlidXRlT2JqZWN0LmZyZWVBbGwoKTtcbiAgICBwb29sc0NhY2hlLmVsZW1lbnRPYmplY3QuZnJlZUFsbCgpO1xufVxuZXhwb3J0cy5jbGVhbk1lbW9yeSA9IGNsZWFuTWVtb3J5OyIsIid1c2Ugc3RyaWN0JztcbnZhciBwb29sc0NhY2hlID0gcmVxdWlyZSgnLi9wb29scycpLmNhY2hlO1xudmFyIHBhcnNlciA9IG1ha2VQYXJzZXIoKTtcbmZ1bmN0aW9uIHBhcnNlSFRNTChuZXdIVE1MLCBpc0lubmVyKSB7XG4gICAgdmFyIGRvY3VtZW50RWxlbWVudCA9IHBhcnNlci5wYXJzZShuZXdIVE1MKTtcbiAgICB2YXIgbm9kZXMgPSBkb2N1bWVudEVsZW1lbnQuY2hpbGROb2RlcztcbiAgICByZXR1cm4gaXNJbm5lciA/IG5vZGVzIDogbm9kZXNbMF07XG59XG5leHBvcnRzLnBhcnNlSFRNTCA9IHBhcnNlSFRNTDtcbmZ1bmN0aW9uIG1ha2VQYXJzZXIoKSB7XG4gICAgdmFyIGtNYXJrdXBQYXR0ZXJuID0gLzwhLS1bXl0qPyg/PS0tPiktLT58PChcXC8/KShbYS16XFwtXVthLXowLTlcXC1dKilcXHMqKFtePl0qPykoXFwvPyk+L2dpO1xuICAgIHZhciBrQXR0cmlidXRlUGF0dGVybiA9IC9cXGIoaWR8Y2xhc3MpXFxzKig9XFxzKihcIihbXlwiXSspXCJ8JyhbXiddKyknfChcXFMrKSkpPy9naTtcbiAgICB2YXIgcmVBdHRyUGF0dGVybiA9IC9cXGIoW2Etel1bYS16MC05XFwtXSopXFxzKig9XFxzKihcIihbXlwiXSspXCJ8JyhbXiddKyknfChcXFMrKSkpPy9naTtcbiAgICB2YXIga0Jsb2NrRWxlbWVudHMgPSB7XG4gICAgICAgICAgICBkaXY6IHRydWUsXG4gICAgICAgICAgICBwOiB0cnVlLFxuICAgICAgICAgICAgbGk6IHRydWUsXG4gICAgICAgICAgICB0ZDogdHJ1ZSxcbiAgICAgICAgICAgIHNlY3Rpb246IHRydWUsXG4gICAgICAgICAgICBicjogdHJ1ZVxuICAgICAgICB9O1xuICAgIHZhciBrU2VsZkNsb3NpbmdFbGVtZW50cyA9IHtcbiAgICAgICAgICAgIG1ldGE6IHRydWUsXG4gICAgICAgICAgICBpbWc6IHRydWUsXG4gICAgICAgICAgICBsaW5rOiB0cnVlLFxuICAgICAgICAgICAgaW5wdXQ6IHRydWUsXG4gICAgICAgICAgICBhcmVhOiB0cnVlLFxuICAgICAgICAgICAgYnI6IHRydWUsXG4gICAgICAgICAgICBocjogdHJ1ZVxuICAgICAgICB9O1xuICAgIHZhciBrRWxlbWVudHNDbG9zZWRCeU9wZW5pbmcgPSB7XG4gICAgICAgICAgICBsaTogeyBsaTogdHJ1ZSB9LFxuICAgICAgICAgICAgcDoge1xuICAgICAgICAgICAgICAgIHA6IHRydWUsXG4gICAgICAgICAgICAgICAgZGl2OiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGQ6IHtcbiAgICAgICAgICAgICAgICB0ZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0aDogdHJ1ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRoOiB7XG4gICAgICAgICAgICAgICAgdGQ6IHRydWUsXG4gICAgICAgICAgICAgICAgdGg6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB2YXIga0VsZW1lbnRzQ2xvc2VkQnlDbG9zaW5nID0ge1xuICAgICAgICAgICAgbGk6IHtcbiAgICAgICAgICAgICAgICB1bDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBvbDogdHJ1ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGE6IHsgZGl2OiB0cnVlIH0sXG4gICAgICAgICAgICBiOiB7IGRpdjogdHJ1ZSB9LFxuICAgICAgICAgICAgaTogeyBkaXY6IHRydWUgfSxcbiAgICAgICAgICAgIHA6IHsgZGl2OiB0cnVlIH0sXG4gICAgICAgICAgICB0ZDoge1xuICAgICAgICAgICAgICAgIHRyOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRhYmxlOiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGg6IHtcbiAgICAgICAgICAgICAgICB0cjogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0YWJsZTogdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIHZhciBrQmxvY2tUZXh0RWxlbWVudHMgPSB7XG4gICAgICAgICAgICBzY3JpcHQ6IHRydWUsXG4gICAgICAgICAgICBub3NjcmlwdDogdHJ1ZSxcbiAgICAgICAgICAgIHN0eWxlOiB0cnVlLFxuICAgICAgICAgICAgcHJlOiB0cnVlXG4gICAgICAgIH07XG4gICAgZnVuY3Rpb24gVGV4dE5vZGUodmFsdWUpIHtcbiAgICAgICAgdmFyIGluc3RhbmNlID0gcG9vbHNDYWNoZS5lbGVtZW50T2JqZWN0LmdldCgpO1xuICAgICAgICBpbnN0YW5jZS5ub2RlTmFtZSA9ICcjdGV4dCc7XG4gICAgICAgIGluc3RhbmNlLm5vZGVWYWx1ZSA9IHZhbHVlO1xuICAgICAgICBpbnN0YW5jZS5ub2RlVHlwZSA9IDM7XG4gICAgICAgIGluc3RhbmNlLmNoaWxkTm9kZXMubGVuZ3RoID0gMDtcbiAgICAgICAgaW5zdGFuY2UuYXR0cmlidXRlcy5sZW5ndGggPSAwO1xuICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgfVxuICAgIGZ1bmN0aW9uIEhUTUxFbGVtZW50KG5hbWUsIGtleUF0dHJzLCByYXdBdHRycykge1xuICAgICAgICB2YXIgaW5zdGFuY2UgPSBwb29sc0NhY2hlLmVsZW1lbnRPYmplY3QuZ2V0KCk7XG4gICAgICAgIGluc3RhbmNlLm5vZGVOYW1lID0gbmFtZTtcbiAgICAgICAgaW5zdGFuY2Uubm9kZVZhbHVlID0gJyc7XG4gICAgICAgIGluc3RhbmNlLm5vZGVUeXBlID0gMTtcbiAgICAgICAgaW5zdGFuY2UuY2hpbGROb2Rlcy5sZW5ndGggPSAwO1xuICAgICAgICBpbnN0YW5jZS5hdHRyaWJ1dGVzLmxlbmd0aCA9IDA7XG4gICAgICAgIGlmIChyYXdBdHRycykge1xuICAgICAgICAgICAgZm9yICh2YXIgbWF0Y2g7IG1hdGNoID0gcmVBdHRyUGF0dGVybi5leGVjKHJhd0F0dHJzKTspIHtcbiAgICAgICAgICAgICAgICB2YXIgYXR0ciA9IHBvb2xzQ2FjaGUuYXR0cmlidXRlT2JqZWN0LmdldCgpO1xuICAgICAgICAgICAgICAgIGF0dHIubmFtZSA9IG1hdGNoWzFdO1xuICAgICAgICAgICAgICAgIGF0dHIudmFsdWUgPSBtYXRjaFs1XSB8fCBtYXRjaFs0XSB8fCBtYXRjaFsxXTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hbNl0gPT09ICdcIlwiJykge1xuICAgICAgICAgICAgICAgICAgICBhdHRyLnZhbHVlID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluc3RhbmNlLmF0dHJpYnV0ZXNbaW5zdGFuY2UuYXR0cmlidXRlcy5sZW5ndGhdID0gYXR0cjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgfVxuICAgIHZhciBodG1sUGFyc2VyID0ge1xuICAgICAgICAgICAgcGFyc2U6IGZ1bmN0aW9uIChkYXRhLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJvb3RPYmplY3QgPSB7fTtcbiAgICAgICAgICAgICAgICB2YXIgcm9vdCA9IEhUTUxFbGVtZW50KG51bGwsIHJvb3RPYmplY3QpO1xuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50UGFyZW50ID0gcm9vdDtcbiAgICAgICAgICAgICAgICB2YXIgc3RhY2sgPSBbcm9vdF07XG4gICAgICAgICAgICAgICAgdmFyIGxhc3RUZXh0UG9zID0gLTE7XG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuaW5kZXhPZignPCcpID09PSAtMSAmJiBkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRQYXJlbnQuY2hpbGROb2Rlc1tjdXJyZW50UGFyZW50LmNoaWxkTm9kZXMubGVuZ3RoXSA9IFRleHROb2RlKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm9vdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgbWF0Y2gsIHRleHQ7IG1hdGNoID0ga01hcmt1cFBhdHRlcm4uZXhlYyhkYXRhKTspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RUZXh0UG9zID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYXN0VGV4dFBvcyArIG1hdGNoWzBdLmxlbmd0aCA8IGtNYXJrdXBQYXR0ZXJuLmxhc3RJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgPSBkYXRhLnNsaWNlKGxhc3RUZXh0UG9zLCBrTWFya3VwUGF0dGVybi5sYXN0SW5kZXggLSBtYXRjaFswXS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0ZXh0LnRyaW0oKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50UGFyZW50LmNoaWxkTm9kZXNbY3VycmVudFBhcmVudC5jaGlsZE5vZGVzLmxlbmd0aF0gPSBUZXh0Tm9kZSh0ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbGFzdFRleHRQb3MgPSBrTWFya3VwUGF0dGVybi5sYXN0SW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaFswXVsxXSA9PT0gJyEnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5sb3dlckNhc2VUYWdOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaFsyXSA9IG1hdGNoWzJdLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXRjaFsxXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGF0dHJzID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBhdHRNYXRjaDsgYXR0TWF0Y2ggPSBrQXR0cmlidXRlUGF0dGVybi5leGVjKG1hdGNoWzNdKTspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyc1thdHRNYXRjaFsxXV0gPSBhdHRNYXRjaFszXSB8fCBhdHRNYXRjaFs0XSB8fCBhdHRNYXRjaFs1XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWF0Y2hbNF0gJiYga0VsZW1lbnRzQ2xvc2VkQnlPcGVuaW5nW2N1cnJlbnRQYXJlbnQubm9kZU5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtFbGVtZW50c0Nsb3NlZEJ5T3BlbmluZ1tjdXJyZW50UGFyZW50Lm5vZGVOYW1lXVttYXRjaFsyXV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2sucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRQYXJlbnQgPSBzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50UGFyZW50ID0gY3VycmVudFBhcmVudC5jaGlsZE5vZGVzW2N1cnJlbnRQYXJlbnQuY2hpbGROb2Rlcy5wdXNoKEhUTUxFbGVtZW50KG1hdGNoWzJdLCBhdHRycywgbWF0Y2hbM10pKSAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2sucHVzaChjdXJyZW50UGFyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrQmxvY2tUZXh0RWxlbWVudHNbbWF0Y2hbMl1dKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNsb3NlTWFya3VwID0gJzwvJyArIG1hdGNoWzJdICsgJz4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IGRhdGEuaW5kZXhPZihjbG9zZU1hcmt1cCwga01hcmt1cFBhdHRlcm4ubGFzdEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9uc1ttYXRjaFsyXV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gZGF0YS5zbGljZShrTWFya3VwUGF0dGVybi5sYXN0SW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA9IGRhdGEuc2xpY2Uoa01hcmt1cFBhdHRlcm4ubGFzdEluZGV4LCBpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRleHQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFBhcmVudC5jaGlsZE5vZGVzW2N1cnJlbnRQYXJlbnQuY2hpbGROb2Rlcy5sZW5ndGhdID0gVGV4dE5vZGUodGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RUZXh0UG9zID0ga01hcmt1cFBhdHRlcm4ubGFzdEluZGV4ID0gZGF0YS5sZW5ndGggKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRQYXJlbnQubm9kZVZhbHVlID0gZGF0YS5zbGljZShrTWFya3VwUGF0dGVybi5sYXN0SW5kZXgsIGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFRleHRQb3MgPSBrTWFya3VwUGF0dGVybi5sYXN0SW5kZXggPSBpbmRleCArIGNsb3NlTWFya3VwLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hbMV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2hbMV0gfHwgbWF0Y2hbNF0gfHwga1NlbGZDbG9zaW5nRWxlbWVudHNbbWF0Y2hbMl1dKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY3VycmVudFBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50UGFyZW50Lm5vZGVOYW1lID09IG1hdGNoWzJdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50UGFyZW50ID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrRWxlbWVudHNDbG9zZWRCeUNsb3NpbmdbY3VycmVudFBhcmVudC5ub2RlTmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrRWxlbWVudHNDbG9zZWRCeUNsb3NpbmdbY3VycmVudFBhcmVudC5ub2RlTmFtZV1bbWF0Y2hbMl1dKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2sucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFBhcmVudCA9IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcm9vdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICByZXR1cm4gaHRtbFBhcnNlcjtcbn1cbmV4cG9ydHMubWFrZVBhcnNlciA9IG1ha2VQYXJzZXI7IiwiJ3VzZSBzdHJpY3QnO1xudmFyIHV1aWQgPSByZXF1aXJlKCcuL3V1aWQnKTtcbnZhciBwb29sc0NhY2hlID0ge307XG5leHBvcnRzLmNhY2hlID0gcG9vbHNDYWNoZTtcbnZhciBjb3VudCA9IDEwMDAwO1xuZXhwb3J0cy5jb3VudCA9IGNvdW50O1xuZnVuY3Rpb24gY3JlYXRlUG9vbChuYW1lLCBvcHRzKSB7XG4gICAgdmFyIHNpemUgPSBvcHRzLnNpemU7XG4gICAgdmFyIGZpbGwgPSBvcHRzLmZpbGw7XG4gICAgdmFyIGZyZWUgPSBbXTtcbiAgICB2YXIgYWxsb2NhdGVkID0gW107XG4gICAgdmFyIHByb3RlY3QgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgICAgICBmcmVlW2ldID0gZmlsbCgpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBfZnJlZTogZnJlZSxcbiAgICAgICAgX2FsbG9jYXRlZDogYWxsb2NhdGVkLFxuICAgICAgICBfcHJvdGVjdGVkOiBwcm90ZWN0LFxuICAgICAgICBfdXVpZDoge30sXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG51bGw7XG4gICAgICAgICAgICB2YXIgZnJlZUxlbmd0aCA9IGZyZWUubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIG1pbnVzT25lID0gZnJlZUxlbmd0aCAtIDE7XG4gICAgICAgICAgICBpZiAoZnJlZUxlbmd0aCkge1xuICAgICAgICAgICAgICAgIG9iaiA9IGZyZWVbbWludXNPbmVdO1xuICAgICAgICAgICAgICAgIGZyZWUubGVuZ3RoID0gbWludXNPbmU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9iaiA9IGZpbGwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFsbG9jYXRlZC5wdXNoKG9iaik7XG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9LFxuICAgICAgICBwcm90ZWN0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBpZHggPSBhbGxvY2F0ZWQuaW5kZXhPZih2YWx1ZSk7XG4gICAgICAgICAgICBwcm90ZWN0LnB1c2goaWR4ID09PSAtMSA/IHZhbHVlIDogYWxsb2NhdGVkLnNwbGljZShpZHgsIDEpWzBdKTtcbiAgICAgICAgICAgIGlmIChuYW1lID09PSAnZWxlbWVudE9iamVjdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl91dWlkW3ZhbHVlLnV1aWRdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHVucHJvdGVjdDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgaWR4ID0gcHJvdGVjdC5pbmRleE9mKHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChpZHggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IHByb3RlY3Quc3BsaWNlKGlkeCwgMSlbMF07XG4gICAgICAgICAgICAgICAgaWYgKG9iaikge1xuICAgICAgICAgICAgICAgICAgICBhbGxvY2F0ZWQucHVzaChvYmopO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobmFtZSA9PT0gJ2VsZW1lbnRPYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl91dWlkW3ZhbHVlLnV1aWRdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZnJlZUFsbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGFsbG9jYXRlZExlbmd0aCA9IGFsbG9jYXRlZC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgZnJlZUxlbmd0aCA9IGZyZWUubGVuZ3RoO1xuICAgICAgICAgICAgZnJlZS5wdXNoLmFwcGx5KGZyZWUsIGFsbG9jYXRlZC5zbGljZSgwLCBzaXplIC0gZnJlZUxlbmd0aCkpO1xuICAgICAgICAgICAgYWxsb2NhdGVkLmxlbmd0aCA9IDA7XG4gICAgICAgIH0sXG4gICAgICAgIGZyZWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGlkeCA9IGFsbG9jYXRlZC5pbmRleE9mKHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChpZHggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZyZWUubGVuZ3RoIDwgc2l6ZSkge1xuICAgICAgICAgICAgICAgIGZyZWUucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhbGxvY2F0ZWQuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZXhwb3J0cy5jcmVhdGVQb29sID0gY3JlYXRlUG9vbDtcbmZ1bmN0aW9uIGluaXRpYWxpemVQb29scyhDT1VOVCkge1xuICAgIHBvb2xzQ2FjaGUuYXR0cmlidXRlT2JqZWN0ID0gY3JlYXRlUG9vbCgnYXR0cmlidXRlT2JqZWN0Jywge1xuICAgICAgICBzaXplOiBDT1VOVCxcbiAgICAgICAgZmlsbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogJydcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBwb29sc0NhY2hlLmVsZW1lbnRPYmplY3QgPSBjcmVhdGVQb29sKCdlbGVtZW50T2JqZWN0Jywge1xuICAgICAgICBzaXplOiBDT1VOVCxcbiAgICAgICAgZmlsbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1dWlkOiB1dWlkKCksXG4gICAgICAgICAgICAgICAgY2hpbGROb2RlczogW10sXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczogW11cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbmV4cG9ydHMuaW5pdGlhbGl6ZVBvb2xzID0gaW5pdGlhbGl6ZVBvb2xzO1xuaW5pdGlhbGl6ZVBvb2xzKGNvdW50KTsiLCIndXNlIHN0cmljdCc7XG5mdW5jdGlvbiB1dWlkKCkge1xuICAgIHJldHVybiAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uIChjKSB7XG4gICAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKSAqIDE2IHwgMCwgdiA9IGMgPT0gJ3gnID8gciA6IHIgJiAzIHwgODtcbiAgICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgIH0pO1xufVxubW9kdWxlLmV4cG9ydHMgPSB1dWlkOyIsIid1c2Ugc3RyaWN0JztcbnZhciB1dWlkID0gcmVxdWlyZSgnLi4vdXRpbC91dWlkJyk7XG52YXIgcG9vbHNDYWNoZSA9IHJlcXVpcmUoJy4uL3V0aWwvcG9vbHMnKS5jYWNoZTtcbnZhciBpbml0aWFsaXplUG9vbHMgPSByZXF1aXJlKCcuLi91dGlsL3Bvb2xzJykuaW5pdGlhbGl6ZVBvb2xzO1xudmFyIGNyZWF0ZVBvb2wgPSByZXF1aXJlKCcuLi91dGlsL3Bvb2xzJykuY3JlYXRlUG9vbDtcbnZhciBwb29sQ291bnQgPSByZXF1aXJlKCcuLi91dGlsL3Bvb2xzJykuY291bnQ7XG52YXIgcGFyc2VIVE1MID0gcmVxdWlyZSgnLi4vdXRpbC9wYXJzZXInKS5wYXJzZUhUTUw7XG52YXIgbWFrZVBhcnNlciA9IHJlcXVpcmUoJy4uL3V0aWwvcGFyc2VyJykubWFrZVBhcnNlcjtcbnZhciBzeW5jTm9kZSA9IHJlcXVpcmUoJy4uL25vZGUvc3luYycpO1xudmFyIHByb3RlY3RFbGVtZW50ID0gcmVxdWlyZSgnLi4vdXRpbC9tZW1vcnknKS5wcm90ZWN0RWxlbWVudDtcbnZhciB1bnByb3RlY3RFbGVtZW50ID0gcmVxdWlyZSgnLi4vdXRpbC9tZW1vcnknKS51bnByb3RlY3RFbGVtZW50O1xudmFyIGNsZWFuTWVtb3J5ID0gcmVxdWlyZSgnLi4vdXRpbC9tZW1vcnknKS5jbGVhbk1lbW9yeTtcbnZhciBzeW5jTm9kZSA9IHJlcXVpcmUoJy4uL25vZGUvc3luYycpO1xudmFyIHdvcmtlclNvdXJjZSA9IHJlcXVpcmUoJy4vc291cmNlJyk7XG52YXIgaGFzV29ya2VyID0gdHlwZW9mIFdvcmtlciA9PT0gJ2Z1bmN0aW9uJztcbmV4cG9ydHMuaGFzV29ya2VyID0gaGFzV29ya2VyO1xuZnVuY3Rpb24gY3JlYXRlV29ya2VyKCkge1xuICAgIHZhciB3b3JrZXJCbG9iID0gbnVsbDtcbiAgICB2YXIgd29ya2VyID0gbnVsbDtcbiAgICBpZiAoaGFzV29ya2VyKSB7XG4gICAgICAgIHdvcmtlckJsb2IgPSBuZXcgQmxvYihbW1xuICAgICAgICAgICAgICAgICd2YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7JyxcbiAgICAgICAgICAgICAgICAndmFyIHBvb2xzQ2FjaGUgPSB7fTsnLFxuICAgICAgICAgICAgICAgICd2YXIgbm9kZXMgPSAwOycsXG4gICAgICAgICAgICAgICAgdXVpZCxcbiAgICAgICAgICAgICAgICBwcm90ZWN0RWxlbWVudCxcbiAgICAgICAgICAgICAgICB1bnByb3RlY3RFbGVtZW50LFxuICAgICAgICAgICAgICAgIGNsZWFuTWVtb3J5LFxuICAgICAgICAgICAgICAgIGNyZWF0ZVBvb2wsXG4gICAgICAgICAgICAgICAgaW5pdGlhbGl6ZVBvb2xzLFxuICAgICAgICAgICAgICAgICdpbml0aWFsaXplUG9vbHMoJyArIHBvb2xDb3VudCArICcpOycsXG4gICAgICAgICAgICAgICAgJ3ZhciBzeW5jTm9kZSA9ICcgKyBzeW5jTm9kZSxcbiAgICAgICAgICAgICAgICBwYXJzZUhUTUwsXG4gICAgICAgICAgICAgICAgJ3ZhciBtYWtlUGFyc2VyID0gJyArIG1ha2VQYXJzZXIsXG4gICAgICAgICAgICAgICAgJ3ZhciBwYXJzZXIgPSBtYWtlUGFyc2VyKCk7JyxcbiAgICAgICAgICAgICAgICB3b3JrZXJTb3VyY2UsXG4gICAgICAgICAgICAgICAgJ3N0YXJ0dXAoc2VsZik7J1xuICAgICAgICAgICAgXS5qb2luKCdcXG4nKV0sIHsgdHlwZTogJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgd29ya2VyID0gbmV3IFdvcmtlcihVUkwuY3JlYXRlT2JqZWN0VVJMKHdvcmtlckJsb2IpKTtcbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgIGlmIChjb25zb2xlICYmIGNvbnNvbGUuaW5mbykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnRmFpbGVkIHRvIGNyZWF0ZSBkaWZmaHRtbCB3b3JrZXInLCBleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBoYXNXb3JrZXIgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gd29ya2VyO1xufVxuZXhwb3J0cy5jcmVhdGVXb3JrZXIgPSBjcmVhdGVXb3JrZXI7IiwiJ3VzZSBzdHJpY3QnO1xudmFyIHBhcnNlSFRNTDtcbnZhciBzeW5jTm9kZTtcbnZhciBwb29scztcbmZ1bmN0aW9uIHN0YXJ0dXAod29ya2VyKSB7XG4gICAgdmFyIHBhdGNoZXMgPSBbXTtcbiAgICB2YXIgb2xkVHJlZSA9IG51bGw7XG4gICAgcGF0Y2hlcy5hZGRpdGlvbnMgPSBbXTtcbiAgICBwYXRjaGVzLnJlbW92YWxzID0gW107XG4gICAgd29ya2VyLm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHZhciBkYXRhID0gZS5kYXRhO1xuICAgICAgICB2YXIgaXNJbm5lciA9IGRhdGEuaXNJbm5lcjtcbiAgICAgICAgdmFyIG5ld1RyZWUgPSBudWxsO1xuICAgICAgICBpZiAob2xkVHJlZSkge1xuICAgICAgICAgICAgdW5wcm90ZWN0RWxlbWVudChvbGRUcmVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YS5vbGRUcmVlKSB7XG4gICAgICAgICAgICBvbGRUcmVlID0gZGF0YS5vbGRUcmVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkYXRhLm5ld1RyZWUpIHtcbiAgICAgICAgICAgIG5ld1RyZWUgPSBkYXRhLm5ld1RyZWU7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRhdGEubmV3SFRNTCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIG5ld1RyZWUgPSBwYXJzZUhUTUwoZGF0YS5uZXdIVE1MLCBpc0lubmVyKTtcbiAgICAgICAgICAgIGlmIChpc0lubmVyKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkTm9kZXMgPSBuZXdUcmVlO1xuICAgICAgICAgICAgICAgIG5ld1RyZWUgPSB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZXM6IGNoaWxkTm9kZXMsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IG9sZFRyZWUuYXR0cmlidXRlcyxcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogb2xkVHJlZS5lbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICBub2RlTmFtZTogb2xkVHJlZS5ub2RlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgbm9kZVZhbHVlOiBvbGRUcmVlLm5vZGVWYWx1ZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3luY05vZGUocGF0Y2hlcywgb2xkVHJlZSwgbmV3VHJlZSk7XG4gICAgICAgIHByb3RlY3RFbGVtZW50KG9sZFRyZWUpO1xuICAgICAgICB3b3JrZXIucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgbm9kZXM6IHtcbiAgICAgICAgICAgICAgICBhZGRpdGlvbnM6IHBhdGNoZXMuYWRkaXRpb25zLFxuICAgICAgICAgICAgICAgIHJlbW92YWxzOiBwYXRjaGVzLnJlbW92YWxzXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0Y2hlczogcGF0Y2hlc1xuICAgICAgICB9KTtcbiAgICAgICAgY2xlYW5NZW1vcnkoKTtcbiAgICAgICAgcGF0Y2hlcy5sZW5ndGggPSAwO1xuICAgICAgICBwYXRjaGVzLmFkZGl0aW9ucy5sZW5ndGggPSAwO1xuICAgICAgICBwYXRjaGVzLnJlbW92YWxzLmxlbmd0aCA9IDA7XG4gICAgfTtcbn1cbm1vZHVsZS5leHBvcnRzID0gc3RhcnR1cDsiXX0=
