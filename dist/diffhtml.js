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
    var uuid = typeof ref === 'string' ? ref : ref.uuid;
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
        unprotectElement(elementMeta.oldTree, makeNode);
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
                }).forEach(function (element) {
                    unprotectElement(element, makeNode);
                });
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
            unprotectElement(elementMeta.oldTree, makeNode);
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
            unprotectElement(elementMeta.oldTree, makeNode);
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
var makeNode = _dereq_('./make');
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
            unprotectElement(removed[i], makeNode);
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
            unprotectElement(oldChildNodes[i], makeNode);
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
            unprotectElement(removed[i], makeNode);
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
},{"../util/memory":16,"../util/pools":18,"./make":7}],10:[function(_dereq_,module,exports){
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
function unprotectElement(element, makeNode) {
    element.childNodes.forEach(function (element) {
        unprotectElement(element, makeNode);
    });
    element.attributes.forEach(poolsCache.attributeObject.unprotect, poolsCache.attributeObject);
    poolsCache.elementObject.unprotect(element);
    if (makeNode && makeNode.nodes) {
        delete makeNode.nodes[element.uuid];
    }
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