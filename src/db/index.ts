import { createDatabase } from "@kilocode/app-builder-db";
import * as schema from "./schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDb(): any {
  if (!_db) {
    _db = createDatabase(schema);
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof createDatabase>, {
  get(_, prop) {
    return getDb()[prop];
  },
});
