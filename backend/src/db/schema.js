'use strict';
exports.SCHEMA = `
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, pw_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student', status TEXT NOT NULL DEFAULT 'active',
  stage TEXT NOT NULL DEFAULT 'A1.1', xp INTEGER NOT NULL DEFAULT 0, goal_min INTEGER NOT NULL DEFAULT 15,
  bio TEXT DEFAULT '', timezone TEXT DEFAULT 'Africa/Cairo', hue INTEGER DEFAULT 20, public_profile INTEGER DEFAULT 0,
  placement_stage TEXT, onboarded INTEGER DEFAULT 0, last_login INTEGER, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(
  token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  csrf TEXT NOT NULL, expires_at INTEGER NOT NULL, ua TEXT, created_at INTEGER NOT NULL, last_seen INTEGER);
CREATE TABLE IF NOT EXISTS password_resets(
  token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL, used INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS email_outbox(id INTEGER PRIMARY KEY, to_email TEXT, subject TEXT, body TEXT, at INTEGER);

CREATE TABLE IF NOT EXISTS stages(code TEXT PRIMARY KEY, level TEXT NOT NULL, idx INTEGER NOT NULL, title_ar TEXT, purpose TEXT, outcomes TEXT, hours INTEGER);
CREATE TABLE IF NOT EXISTS tracks(id TEXT PRIMARY KEY, title_ar TEXT, title_es TEXT, icon TEXT, color TEXT, ord INTEGER);
CREATE TABLE IF NOT EXISTS courses(
  id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title_ar TEXT NOT NULL, title_es TEXT, description TEXT,
  stage TEXT NOT NULL, track TEXT NOT NULL, instructor TEXT, hours INTEGER DEFAULT 10, color TEXT DEFAULT '#d9461f',
  status TEXT NOT NULL DEFAULT 'published', created_at INTEGER);
CREATE TABLE IF NOT EXISTS modules(id INTEGER PRIMARY KEY, course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE, title_ar TEXT NOT NULL, ord INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS lessons(
  id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, course_id TEXT REFERENCES courses(id) ON DELETE SET NULL, module_id INTEGER REFERENCES modules(id) ON DELETE SET NULL,
  title_ar TEXT NOT NULL, title_es TEXT, summary TEXT, stage TEXT NOT NULL, track TEXT NOT NULL, minutes INTEGER DEFAULT 10,
  body TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'published', ord INTEGER DEFAULT 1, version INTEGER NOT NULL DEFAULT 1, updated_at INTEGER);
CREATE TABLE IF NOT EXISTS lesson_versions(id INTEGER PRIMARY KEY, lesson_id TEXT, version INTEGER, body TEXT, at INTEGER, by_user INTEGER);
CREATE TABLE IF NOT EXISTS questions(
  id TEXT PRIMARY KEY, lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE, bank TEXT NOT NULL DEFAULT 'lesson',
  type TEXT NOT NULL DEFAULT 'single', prompt TEXT NOT NULL, options TEXT DEFAULT '[]', answer TEXT NOT NULL, explain TEXT, stage TEXT, difficulty INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS enrollments(user_id INTEGER NOT NULL, course_id TEXT NOT NULL, enrolled_at INTEGER, completed_at INTEGER, PRIMARY KEY(user_id, course_id));
CREATE TABLE IF NOT EXISTS progress(user_id INTEGER NOT NULL, lesson_id TEXT NOT NULL, status TEXT NOT NULL, best_score INTEGER, updated_at INTEGER NOT NULL, PRIMARY KEY(user_id, lesson_id));
CREATE TABLE IF NOT EXISTS attempts(id INTEGER PRIMARY KEY, user_id INTEGER, lesson_id TEXT, score INTEGER, total INTEGER, at INTEGER);
CREATE TABLE IF NOT EXISTS mistakes(user_id INTEGER, question_id TEXT, count INTEGER DEFAULT 1, at INTEGER, PRIMARY KEY(user_id, question_id));
CREATE TABLE IF NOT EXISTS notes(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, lesson_id TEXT, body TEXT NOT NULL, at INTEGER);

CREATE TABLE IF NOT EXISTS vocab(id INTEGER PRIMARY KEY, es TEXT UNIQUE NOT NULL, ar TEXT NOT NULL, pos TEXT, gender TEXT, example TEXT, example_ar TEXT, stage TEXT, topic TEXT);
CREATE TABLE IF NOT EXISTS srs(user_id INTEGER, vocab_id INTEGER, ease REAL DEFAULT 2.5, interval INTEGER DEFAULT 0, reps INTEGER DEFAULT 0, due INTEGER, PRIMARY KEY(user_id, vocab_id));
CREATE TABLE IF NOT EXISTS activity(user_id INTEGER, day TEXT, minutes INTEGER DEFAULT 0, xp INTEGER DEFAULT 0, PRIMARY KEY(user_id, day));
CREATE TABLE IF NOT EXISTS practice_log(user_id INTEGER, day TEXT, game TEXT, xp INTEGER DEFAULT 0, plays INTEGER DEFAULT 0, PRIMARY KEY(user_id, day, game));

CREATE TABLE IF NOT EXISTS stories(
  id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title_ar TEXT NOT NULL, title_es TEXT, stage TEXT NOT NULL, category TEXT, minutes INTEGER DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'published', body TEXT NOT NULL DEFAULT '[]', glossary TEXT NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS story_reads(user_id INTEGER, story_id INTEGER, at INTEGER, PRIMARY KEY(user_id, story_id));

CREATE TABLE IF NOT EXISTS achievements(code TEXT PRIMARY KEY, title_ar TEXT, desc_ar TEXT, icon TEXT, xp INTEGER DEFAULT 0, ord INTEGER);
CREATE TABLE IF NOT EXISTS user_achievements(user_id INTEGER, code TEXT, at INTEGER, PRIMARY KEY(user_id, code));
CREATE TABLE IF NOT EXISTS notifications(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, title TEXT, body TEXT, kind TEXT, read INTEGER DEFAULT 0, at INTEGER);
CREATE TABLE IF NOT EXISTS announcements(id INTEGER PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL, audience TEXT DEFAULT 'all', at INTEGER, author INTEGER);
CREATE TABLE IF NOT EXISTS certificates(code TEXT PRIMARY KEY, user_id INTEGER, course_id TEXT, issued_at INTEGER);
CREATE TABLE IF NOT EXISTS settings(k TEXT PRIMARY KEY, v TEXT);
CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY, user_id INTEGER, action TEXT, ip TEXT, at INTEGER);
CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_stage ON lessons(stage, status);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, read);
`;

exports.SCHEMA_V2 = `
CREATE TABLE IF NOT EXISTS levels(code TEXT PRIMARY KEY, title_ar TEXT NOT NULL, title_es TEXT, color TEXT DEFAULT '#8b1a2b', ord INTEGER DEFAULT 0, visible INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS media(id INTEGER PRIMARY KEY, filename TEXT UNIQUE NOT NULL, original TEXT, mime TEXT, size INTEGER, width INTEGER, at INTEGER, by_user INTEGER);
`;
exports.SCHEMA_V3 = `
CREATE TABLE IF NOT EXISTS quiz_sessions(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, lesson_id TEXT NOT NULL, started_at INTEGER NOT NULL, submitted_at INTEGER, UNIQUE(user_id, lesson_id));
CREATE TABLE IF NOT EXISTS cheat_events(id INTEGER PRIMARY KEY, user_id INTEGER, lesson_id TEXT, kind TEXT NOT NULL, at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS articles(
  id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title_ar TEXT NOT NULL, title_es TEXT, excerpt TEXT, seo_title TEXT, seo_description TEXT,
  category TEXT, cover TEXT, body TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'draft', author INTEGER, published_at INTEGER, created_at INTEGER, updated_at INTEGER);
CREATE TABLE IF NOT EXISTS placement_tests(
  id TEXT PRIMARY KEY, title_ar TEXT NOT NULL, title_es TEXT, stages TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'published', ord INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS team_members(
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, role_ar TEXT, bio TEXT, photo TEXT, cv_url TEXT, email TEXT, ord INTEGER DEFAULT 1, visible INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS events(
  id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title_ar TEXT NOT NULL, title_es TEXT, description TEXT,
  starts_at INTEGER NOT NULL, ends_at INTEGER NOT NULL, points_note TEXT, status TEXT NOT NULL DEFAULT 'draft', created_at INTEGER);
CREATE TABLE IF NOT EXISTS event_joins(user_id INTEGER NOT NULL, event_id INTEGER NOT NULL, joined_at INTEGER, PRIMARY KEY(user_id, event_id));
`;
// أعمدة تُضاف لقواعد البيانات القديمة
exports.COLUMNS = [
  ['stages', 'visible', 'INTEGER NOT NULL DEFAULT 1'], ['stages', 'title_es', 'TEXT'], ['stages', 'color', 'TEXT'],
  ['tracks', 'visible', 'INTEGER NOT NULL DEFAULT 1'], ['tracks', 'description', 'TEXT'],
  ['courses', 'cover', 'TEXT'], ['stories', 'cover', 'TEXT'],
  ['lessons', 'time_limit_min', 'INTEGER'], ['lessons', 'cover', 'TEXT'], ['levels', 'cover', 'TEXT'],
];
