const path = require('path');
const fs = require('fs');
const Dgeni = require('dgeni');
const DgeniPackage = Dgeni.Package;

// dgeni packages
const jsdocPackage = require('dgeni-packages/jsdoc');
const nunjucksPackage = require('dgeni-packages/nunjucks');
const typescriptPackage = require('dgeni-packages/typescript');
const gitPackage = require('dgeni-packages/git');


// project configuration
const projectRootDir = path.resolve(__dirname, '../src/lib');
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
  gitPackage,
];

let apiDocsPackage = new DgeniPackage('material2-api-docs', dgeniPackageDeps);

// Configure the processor for reading files from the file system.
apiDocsPackage.config(readFilesProcessor => {
  readFilesProcessor.basePath = projectRootDir;
});

// Configure the processor for understanding TypeScript.
apiDocsPackage.config(readTypeScriptModules => {
  readTypeScriptModules.basePath = projectRootDir;
  readTypeScriptModules.ignoreExportsMatching = [/^_/];
  readTypeScriptModules.hidePrivateMembers = true;

  readTypeScriptModules.sourceFiles = []; // ???
});

// Configure processor for finding nunjucks templates.
apiDocsPackage.config(templateFinder => {
  templateFinder.templateFolders = [templateDir];

  // templateFinder.templatePatterns ???
});

// Configure the nunjucks templating engine.
apiDocsPackage.config(templateEngine => {
  // ???
});




// Run the dgeni pipeline, generating documentation.
let dgeni = new Dgeni([apiDocsPackage]);
dgeni.generate().then(docs => {
  console.log(docs);
});
