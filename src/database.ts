import { Dexie, Entity, type EntityTable } from 'dexie';

/**
 * Result object passed to onResultAdded each time addResult is called in a task.
 */
export interface Result {
  taskId: string;
  screenId: string;
  userId: string;
  key: string;
  val: string;
}

/**
 * A row in the 'results' table.
 */
class ResultRow extends Entity<ExperimentDB> implements Result {
  taskId!: string;
  screenId!: string;
  userId!: string;
  key!: string;
  val!: string;
  id!: number;
}

/**
 * Database that stores results.
 */
class ExperimentDB extends Dexie {
  results!: EntityTable<ResultRow, 'id'>;

  constructor() {
    super('ExperimentDB');
    this.version(1).stores({
      results: '++id, taskId, screenId, userId, key, val',
    });
    this.results.mapToClass(ResultRow);
  }
}

export const db = new ExperimentDB();
