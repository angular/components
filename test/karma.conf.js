// This file only hook up on require calls to transpile the TypeScript.
// If you're looking at this file to see Karma configuration, you should look at
// karma.config.ts instead.

require('ts-node/register');
// Import the TS once we know it's safe to require.
module.exports = require('./karma.config.ts').config;
