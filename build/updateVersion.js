var fs = require('fs');
var util = require('util');
var semver = require('semver');
var join = require('path').join;
var inc = process.env.inc || 'patch';
var version = semver.inc(require('../package.json').version, inc);

console.log(version)

updateDocs();
updateMarty();
updateVersion();
['../package.json', '../bower.json'].forEach(updateConfig);

function updateDocs() {
  var config = read('../docs/_config.yml');
  config = config.replace(/current_version: .*/, util.format("current_version: %s", version));
  write('../docs/_config.yml', config);
}

function updateMarty() {
  var marty = read('../marty.js');
  marty = marty.replace(/new Marty('.*'/, util.format("new Marty('%s'", version));
  write('../marty.js', marty);
}

function updateConfig(path) {
  var config = JSON.parse(read(path));
  config.version = version;
  write(path, JSON.stringify(config, null, 2));
}

function updateVersion() {
  write('../VERSION', version);
}

function write(path, data) {
  fs.writeFileSync(join(__dirname, path), data);
}

function read(path) {
  return fs.readFileSync(join(__dirname, path), 'utf-8');
}