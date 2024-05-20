import { Dexie, Entity, type EntityTable } from 'dexie';

class Result extends Entity<ExperimentDB> {
  id!: number;
  taskId!: number;
  key!: string;
  val!: string;
}

/**
 * Database that stores results.
 */
class ExperimentDB extends Dexie {
  results!: EntityTable<Result, 'id'>;

  constructor() {
    super('ExperimentDB');
    this.version(1).stores({
      results: '++id, taskId, key, val',
    });
    this.results.mapToClass(Result);
  }
}

export const db = new ExperimentDB();
