const ALIAS_KEYS = require('babel-types').ALIAS_KEYS;

Object.keys(ALIAS_KEYS).forEach(name => {
  if (ALIAS_KEYS[name].includes('Statement')) {
    console.log(name);
  }
});
