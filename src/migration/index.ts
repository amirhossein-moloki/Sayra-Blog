import { MigrationManager } from './loaders/migration-manager';

const dryRun = process.argv.includes('--production') ? false : true;
const manager = new MigrationManager(dryRun);

manager.run()
  .catch(console.error);
