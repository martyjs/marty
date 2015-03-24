let fs = require('fs');
let util = require('util');
let semver = require('semver');
let join = require('path').join;
let inc = process.env.inc || 'patch';
let version = semver.inc(require('../package.json').version, inc);

console.log(version)

updateDocs();
updateMarty();
updateVersion();
['../package.json', '../bower.json'].forEach(updateConfig);

function updateDocs() {
  let config = read('../docs/_config.yml');
  config = config.replace(/current_version: .*/, util.format("current_version: %s", version));
  write('../docs/_config.yml', config);
}

function updateMarty() {
  let marty = read('../marty.js');
  marty = marty.replace(/version: '.*'/, util.format("version: '%s'", version));
  write('../marty.js', marty);
}

function updateConfig(path) {
  let config = JSON.parse(read(path));
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