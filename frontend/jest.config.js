module.exports = {
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    '**/*.js',
    '!node_modules/**',
    '!coverage/**',
    '!jest.config.js'
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  testMatch: ['**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setup.js']
};
