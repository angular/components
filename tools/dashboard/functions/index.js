/**
 * Entry point for the Firebase functions of the dashboard app. Firebase functions only support
 * JavaScript files and therefore the TypeScript files needs to be transpiled.
 */

'use strict';

const path = require('path');

// Enable TypeScript compilation at runtime using ts-node.
require('ts-node').register({
  project: path.join(__dirname, 'tsconfig.json')
});

const functionExports = require('./dashboard-functions');

// Re-export every firebase function from TypeScript
Object.keys(functionExports).forEach(fnName => {
  module.exports[fnName] = functionExports[fnName];
});
