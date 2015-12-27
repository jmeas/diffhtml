import simpleJSDom from 'simple-jsdom';
import assert from '../assert';

// Install Simple JSDom, and expose Element on the global
// scope for our unit/element.js tests
simpleJSDom.install();
global.Element = window.Element;
global.HTMLElement = window.HTMLElement;

global.assert = assert;
