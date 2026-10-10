// D1 Free permits 50 queries per invocation. Leave five for the scheduler
// lease and indexed retention cleanup, including during an alert burst.
export function queryBudget(database, limit = 44) {
  let used = 0;
  const db = {
    prepare(sql) {
      let statement = database.prepare(sql);
      const wrap = {
        bind(...args) {
          statement = statement.bind(...args);
          return wrap;
        },
      };
      for (const method of ['first', 'all', 'run'])
        wrap[method] = async (...args) => {
          if (used >= limit) throw Error('query_budget');
          used++;
          return statement[method](...args);
        };
      return wrap;
    },
  };
  return { db, remaining: () => limit - used };
}
