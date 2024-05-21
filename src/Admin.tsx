import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './database.js';

/**
 * Admin component that exposes useful information, such as results stored in the
 * current session.
 */
export function Admin() {
  // use Dexie live hook
  const results = useLiveQuery(() => db.results.toArray());

  // return a HTML list of the key and value pairs in results
  return (
    <div>
      <h2>Results</h2>
      <ul>
        {results?.map(result => (
          <li key={result.id}>
            {result.key}
            :
            {result.val}
          </li>
        ))}
      </ul>
    </div>
  );
}
