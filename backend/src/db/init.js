'use strict';
const { open } = require('./connection');
const { seed } = require('./seeds');
function init(file) { const db = open(file); seed(db); return db; }
module.exports = { init };
