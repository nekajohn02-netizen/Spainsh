'use strict';
const r = require('../../core/router');

r.get('/api/team', ({ db }) => ({ members: db.prepare('SELECT name,role_ar,bio,photo,cv_url FROM team_members WHERE visible=1 ORDER BY ord').all() }));
