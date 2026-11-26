'use strict';
const cfg = require('./config');
const { init } = require('./db/init');
const { createApp } = require('./app');

const db = init(process.env.DB_FILE);
createApp(db).listen(cfg.port, () => console.log(`Academia Española → http://localhost:${cfg.port}`));
