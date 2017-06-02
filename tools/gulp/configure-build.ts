import {join} from 'path';
import {configureBuild} from './packaging/build-config';

/** Resolved version of the whole project. */
const buildVersion = require('../../package.json').version;

/** License for the project that will be placed inside of the bundles. */
const buildLicense = `/**
  * @license Angular Material v${buildVersion}
  * Copyright (c) 2017 Google, Inc. https://material.angular.io/
  * License: MIT
  */`;

configureBuild({
  projectVersion: buildVersion,
  projectDir: join(__dirname, '../..'),
  packagesDir: join(__dirname, '../../src'),
  outputDir: join(__dirname, '../../dist'),
  licenseBanner: buildLicense,
});
