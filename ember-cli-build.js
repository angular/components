// This file only hook up on require calls to transpile the TypeScript.
// If you're looking at this file to see ember build configuration, you
// should look at tools/ember-cli-build.ts instead.

require('ts-node/register');
// Import the TS once we know it's safe to require.
module.exports = require('./tools/ember-cli-build.ts').config;
