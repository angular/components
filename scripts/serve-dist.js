var app = require('connect')();
var express = require('express');
var path = require('path');
var connect_livereload = require('connect-livereload');
var serve_static = require('serve-static');

var root = 'dist/';
var port = 4200;

app.use(connect_livereload());
app.use(serve_static(path.join(process.cwd(), root)));

// Add a fallback that serves index.html
const defaultRoute = express();
defaultRoute.all("/*", function(req, res) { res.sendFile("index.html", { root: root }); });
app.use(defaultRoute);

app.listen(port, function () {
  var host = 'localhost';

  console.log('folder "%s" serving at http://%s:%s', root, host, port);
});
