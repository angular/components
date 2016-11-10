'use strict';


// TODO: re-address this script once there is static document loading.


const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

function getAllFiles(root /** string */)/** : string[] */ {
  // console.log('getAllFiles', root);
  const list = fs.readdirSync(root);
  return list.reduce((prev, file) => {
    const stats = fs.lstatSync(path.resolve(root, file));
    if (stats.isFile()) {
      // console.log('pushing', path.resolve(root, file));
      prev.push(path.resolve(root, file));
      return prev;
    } else if (stats.isDirectory()) {
      return prev.concat(getAllFiles(path.resolve(root, file)))
    } else {
      console.error('Wat?', stats, file);
    }
  }, []);
}

function chunkArray(arr, numChunks) {
  const itemsPerChunk = Math.ceil(arr.length / numChunks);
  let chunkedArray = [];
  console.log('numChunks', numChunks);
  for (let i=0; i< numChunks; i++) {
    chunkedArray.push(arr.slice(i*itemsPerChunk, (i+1) * itemsPerChunk))
  }
  return chunkedArray;
}

// const docsUrls = getAllFiles(path.resolve('src/assets/documents/'))
//   .map(f => `http://localhost:4201/${path.relative('src/assets/documents/', f).replace(/(index)?\.html$/, '')}`);
const docsUrls = [];
const chunked = chunkArray(docsUrls, 10);

fse.removeSync('tmp/prerender-specs');
fse.removeSync('tmp/prerendered');
fse.mkdirpSync('tmp/prerender-specs');
chunked.forEach((chunk, i) => {
  fs.writeFileSync(`tmp/prerender-specs/chunk${i}.spec.js`, `
  'use strict';
  const protractor = require('protractor');
  const browser = protractor.browser;
  const url = require('url');
  const mkdirp = require('mkdirp');
  const fs = require('fs');
  const BASE_DIR = 'tmp/prerendered';
  const path = require('path');
  describe('chunk ${i}', () => {
    ${JSON.stringify(chunk)}.forEach((urlToPage) => {
      it(\`should render \${url.parse(urlToPage).path}\`, (done) => {
        browser.get(urlToPage);
        browser.getPageSource()
          .then((source) => {
            // TODO(i): does this error checking actually work?
            if (source.indexOf(\`Whoops. Looks like what you're looking for can't be found.\`) > -1) {
              return Promise.reject(\`404 for \${urlToPage}\`)
            }

            const relativeFilePath = url.parse(urlToPage).path.replace(/\\/$/, '/index').replace(/^\\//, '') + '.html';
            const absoluteFilePath = path.resolve(BASE_DIR, relativeFilePath);
            const absoluteDirPath = path.dirname(path.resolve(BASE_DIR, relativeFilePath));
            console.log('mkdirp', absoluteDirPath);
            mkdirp.sync(absoluteDirPath);
            console.log('writing to', absoluteFilePath);
            fs.writeFileSync(absoluteFilePath, source, 'utf-8')
          })
          .then(() => done(), err => done.fail(err))
      });
    })
  });
  `, 'utf-8');
});
