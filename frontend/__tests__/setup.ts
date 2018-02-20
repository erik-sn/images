/* eslint-disable */
import { JSDOM } from 'jsdom';
import { configure } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as sinon from 'sinon';

// enzyme configuration
configure({ adapter: new Adapter.default() });

// jsdom configuration
declare var global: any;
const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const window = jsdom.window;
global.window = window;
global.window.innerWidth = 1000;
global.window.localStorage = storageMock();
global.window.sessionStorage = storageMock();
global.document = window.document;
global.navigator = { userAgent: 'node.js' };
global.HTMLElement = global.window.HTMLElement;

// cause prop type warnings to raise an exception so tests fail
sinon.stub(console, 'error').callsFake((warning) => {
  if (warning && warning.indexOf('Warning: Failed prop type:') > -1) {
    throw new Error(warning);
  }
});

export function updateWindowWidth(width: number): void {
  global.window.innerWidth = width;
}

export function updateWindowHeight(height: number): void {
  global.window.innerHeight = height;
}

// Storage Mock
export function storageMock() {
  const storage: any = {};
  return {
    setItem: (key: string, value: any) => {
      storage[key] = value || '';
    },
    getItem: (key: string) => (key in storage ? storage[key] : null),
    removeItem: (key: string) => {
      delete storage[key];
    },
    get length() {
      return Object.keys(storage).length;
    },
    key: (i: any) => {
      const keys = Object.keys(storage);
      return keys[i] || null;
    },
  };
}
