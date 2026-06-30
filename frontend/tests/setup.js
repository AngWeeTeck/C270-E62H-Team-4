// Setup file for frontend tests
const { TextEncoder, TextDecoder } = require('util');

global.jest = jest;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;
