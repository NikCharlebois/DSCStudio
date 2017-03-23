import config from '../build/webpack.config.dev';

import express from 'express';
import webpack from 'webpack';
import path from 'path';
import open from 'open';

/* eslint-disable no-console */

const projectRoot = path.join(__dirname, '..', '..');
const sourceRoot = path.join(projectRoot, 'src');
const cssRoot = path.join(sourceRoot, 'css');
const imgRoot = path.join(sourceRoot, 'img');

const port = 3000;
const app = express();
const compiler = webpack(config);

// Rather than getting webpack to have to rebuild and store in the
// file system every time a change is made, run the dev middleware
// so that the compiled bundle is stored in memory for faster updates.
app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use('/css/fabric.min.css', express.static(path.join(projectRoot, "node_modules/office-ui-fabric-js/dist/css/fabric.min.css")));
app.use('/css/fabric.components.min.css', express.static(path.join(projectRoot, "node_modules/office-ui-fabric-js/dist/css/fabric.components.min.css")));
app.use('/css/shCore.css', express.static(path.join(sourceRoot, "syntaxhighlighter/shCore.css")));
app.use('/DynamicTemplate.js', express.static(path.join(sourceRoot, "DynamicTemplate.js")));
app.use('/css/shCoreDefault.css', express.static(path.join(sourceRoot, "syntaxhighlighter/shCoreDefault.css")));
app.use('/css/main.css', express.static(path.join(cssRoot, "main.css")));
app.use('/img', express.static(path.join(imgRoot)));

app.use('/scripts/fabric.js', express.static(path.join(projectRoot, "node_modules/office-ui-fabric-js/dist/js/fabric.js")));
app.use('/scripts/FileSaver.js', express.static(path.join(projectRoot, "node_modules/file-saver/FileSaver.js")));
app.use('/scripts/shCore.js', express.static(path.join(projectRoot, "src/syntaxhighlighter/shCore.js")));
app.use('/scripts/shBrushPowerShell.js', express.static(path.join(projectRoot, "src/syntaxhighlighter/shBrushPowerShell.js")));


app.get('/', function(req, res) {
  res.sendFile(path.join(sourceRoot, 'index.htm'));
});

app.listen(port, function(err) {
  if (err) {
    console.log(err);
  } else {
    open(`http://localhost:${port}`);
  }
});
