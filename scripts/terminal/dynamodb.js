const { createTables } = require('../dynamodb');

(async () => {
  await createTables();
})();