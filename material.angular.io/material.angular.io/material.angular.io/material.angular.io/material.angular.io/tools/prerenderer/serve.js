const fs = require('fs');
const path = require('path');
const hapi = require('hapi');
const inert = require('inert');

const server = new hapi.Server();
server.connection({ port: 4201 });

server.register(inert, () => {});

server.route({
  method: 'GET',
  path: '/{documentId*}',
  handler: {
    file: function (request) {
      console.log(request.params.documentId);

      var documentId = request.params.documentId;

      if (documentId === undefined || documentId.endsWith('/')) {
        documentId = documentId + 'index';
      }

      if (!documentId.includes('.')) {
        documentId = documentId + '.html';

        if (!fs.existsSync(absolutePath(documentId))) {
          documentId = 'index.html';
        }
      }

      return absolutePath(documentId);
    }
  }
});

server.start((err) => {

  if (err) {
    throw err;
  }

  console.log('Server running at:', server.info.uri);
});


function absolutePath(documentId) {
  return path.join(__dirname, '../..', 'dist', documentId);
}