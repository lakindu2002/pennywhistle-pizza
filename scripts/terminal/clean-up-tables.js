const { cleanupTables } = require('../clean-up-tables');

(async () => {
  await cleanupTables();
})();