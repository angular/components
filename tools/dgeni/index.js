const path = require('path');
const fs = require('fs');
const Dgeni = require('dgeni');
const DgeniPackage = Dgeni.Package;

// dgeni packages
const jsdocPackage = require('dgeni-packages/jsdoc');
const nunjucksPackage = require('dgeni-packages/nunjucks');
const typescriptPackage = require('dgeni-packages/typescript');
//const gitPackage = require('dgeni-packages/git');


// project configuration
const projectRootDir = path.resolve(__dirname, '../..');
const sourceDir = path.resolve(projectRootDir, 'src/lib');
const outputDir = path.resolve(projectRootDir, 'dist/docs');
const templateDir = path.resolve(__dirname, './templates');

// Package definition for material2 api docs. This only *defines* the package- it does not yet
// actually *run* anything.
//
// A dgeni package is very similar to an Angular 1 module. Modules contain:
//  "services" (injectables)
//  "processors" (injectables that conform to a specific interface)
//  "templates": nunjucks templates that can be used to render content
//
// A dgeni package also has a `config` method, similar to an Angular 1 module.
// A config block can inject any services/processors and configure them before
// docs processing begins.

const dgeniPackageDeps = [
  jsdocPackage,
  nunjucksPackage,
  typescriptPackage,
//  gitPackage,
];

module.exports = new DgeniPackage('material2-api-docs', dgeniPackageDeps)

.config(function(log) {
  log.level = 'info';
})

// Configure the processor for reading files from the file system.
.config(function(readFilesProcessor, writeFilesProcessor) {
  readFilesProcessor.basePath = sourceDir;
  readFilesProcessor.$enabled = false; // disable for now as we are using readTypeScriptModules

  writeFilesProcessor.outputFolder = outputDir;
})

// Configure the processor for understanding TypeScript.
.config(function(readTypeScriptModules) {
  console.log(sourceDir);
  readTypeScriptModules.basePath = sourceDir;
  readTypeScriptModules.ignoreExportsMatching = [/^_/];
  readTypeScriptModules.hidePrivateMembers = true;

  readTypeScriptModules.sourceFiles = [
    'autocomplete/index.ts',
    'button/index.ts',
    'button-toggle/index.ts',
    'card/index.ts',
    'checkbox/index.ts',
    'chips/index.ts',
    'core/index.ts',
    'dialog/index.ts',
    'grid-list/index.ts',
    'icon/index.ts',
    'input/index.ts',
    'list/index.ts',
    'menu/index.ts',
    'progress-bar/index.ts',
    'progress-circle/index.ts',
    'radio/index.ts',
    'select/index.ts',
    'sidenav/index.ts',
    'slide-toggle/index.ts',
    'slider/index.ts',
    'snack-bar/index.ts',
    'tabs/index.ts',
    'toolbar/index.ts',
    'tooltip/index.ts',
  ];
})


// Configure processor for finding nunjucks templates.
.config(function(templateFinder, templateEngine) {
  // Where to find the templates for the doc rendering
  templateFinder.templateFolders = [templateDir];

  // Standard patterns for matching docs to templates
  templateFinder.templatePatterns = [
    '${ doc.template }',
    '${ doc.id }.${ doc.docType }.template.html',
    '${ doc.id }.template.html',
    '${ doc.docType }.template.html',
    '${ doc.id }.${ doc.docType }.template.js',
    '${ doc.id }.template.js',
    '${ doc.docType }.template.js',
    '${ doc.id }.${ doc.docType }.template.json',
    '${ doc.id }.template.json',
    '${ doc.docType }.template.json',
    'common.template.html'
  ];

  // Nunjucks and Angular conflict in their template bindings so change Nunjucks
  templateEngine.config.tags = {
    variableStart: '{$',
    variableEnd: '$}'
  };
});