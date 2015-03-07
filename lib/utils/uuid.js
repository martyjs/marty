function generate() {
  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
}

function small() {
  return s4() + s4() + s4() + s4();
}

function type(instanceType) {
  return `${instanceType}-${s4() + s4() + s4() + s4()}`;
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

module.exports = {
  type: type,
  small: small,
  generate: generate
};