const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');
exports.database = function () {
  const sqlite = new DatabaseSync(':memory:');
  const migrations = path.join(__dirname, '../../workers/alert-poller/migrations');
  for (const file of fs
    .readdirSync(migrations)
    .filter((f) => f.endsWith('.sql'))
    .sort())
    sqlite.exec(fs.readFileSync(path.join(migrations, file), 'utf8'));
  const db = {
    sqlite,
    queryCount: 0,
    prepare(sql) {
      function statement(args = []) {
        return {
          bind(...values) {
            return statement(values);
          },
          async first() {
            db.queryCount++;
            return sqlite.prepare(sql).get(...args) || null;
          },
          async all() {
            db.queryCount++;
            return { results: sqlite.prepare(sql).all(...args) };
          },
          async run() {
            db.queryCount++;
            return sqlite.prepare(sql).run(...args);
          },
        };
      }
      return statement();
    },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try {
        const results = [];
        for (const s of statements) results.push(await s.run());
        sqlite.exec('COMMIT');
        return results;
      } catch (e) {
        sqlite.exec('ROLLBACK');
        throw e;
      }
    },
  };
  return db;
};
