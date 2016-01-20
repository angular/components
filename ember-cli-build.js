'use strict';
var fs = require('fs');
var path = require('path');

var mergeTrees = require('broccoli-merge-trees');
var Angular2App = require('angular-cli/lib/broccoli/angular2-app');
var BroccoliSass = require('broccoli-sass');
var broccoliAutoprefixer = require('broccoli-autoprefixer');
var cssjanus = require('cssjanus');

var autoprefixerOptions = require('./build/autoprefixer-options');

module.exports = function(defaults) {
  var demoAppCssTree = new BroccoliSass(['src/demo-app'], './demo-app.scss', 'demo-app/demo-app.css');
  var componentCssTree = getCssTree('src/components/', 'components/');
  var angularAppTree = new Angular2App(defaults);

  return mergeTrees([
    angularAppTree.toTree(),
    componentCssTree,
    demoAppCssTree,
  ]);
};


/** Generate RTL CSS files along side regular CSS. */
class BroccoliSassWithRtl extends BroccoliSass {
  build() {
    // This will output the regular CSS.
    super.build();

    // We then read that file and output the RTL CSS.
    const cssOutputPath = path.join(this.outputPath, this.outputFile);
    const cssRtlOutputPath = path.join(this.outputPath,
        path.dirname(this.outputFile),
        path.basename(this.outputFile, '.css') + '-rtl.css');
    fs.writeFileSync(cssRtlOutputPath, cssjanus.transform(fs.readFileSync(cssOutputPath).toString()));
  }
}



/** Gets the tree for all of the components' CSS. */
function getCssTree(source, destination) {
  function walk(dir) {
    const dirs = fs.readdirSync(dir)
        .filter(file => fs.statSync(path.join(dir, file)).isDirectory());
    if (!dirs.length) {
      return [dir];
    }

    return dirs.reduce((previous, current) => {
        return previous.concat(walk(path.join(dir, current)));
    }, [dir]);
  }

  const trees = walk(source)
    .reduce((previous, current) => {
      const dir = path.join(destination, current.substr(source.length));
      const scssFiles = fs.readdirSync(current)
          .filter(file => path.extname(file) === '.scss')
          .map(file => path.basename(file, '.scss'));

      return scssFiles.map(filename => {
          return new BroccoliSassWithRtl(
            [current, 'src/core/style'],
            path.join('.', filename + '.scss'),
            path.join(dir, filename + '.css')
          );
      }).concat(previous);
    }, []);

  return broccoliAutoprefixer(mergeTrees(trees), autoprefixerOptions);
}
