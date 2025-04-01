#!/bin/env node
'use strict';

const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');

/**
 * Runs imagemin with pngquant to optimize the PNG images generated for the component scenes.
 *
 * Usage:
 * ```sh
 * node tools/optimize-scene-screenshots
 * ```
 */

// Imports
const sh = require('shelljs');
sh.set('-e');

imagemin(['src/assets/screenshots/*.png'], {
  destination: 'src/assets/screenshots',
  plugins: [imageminPngquant({quality: [0.4, 0.6]})],
})
  .then(() => console.log('Optimization complete.'))
  .catch(error => console.error);
