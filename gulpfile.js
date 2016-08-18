'use strict';
const path = require('path');


require('ts-node').register({
  project: path.join(__dirname, 'tools/gulp')
});

require('./tools/gulp/gulpfile');
