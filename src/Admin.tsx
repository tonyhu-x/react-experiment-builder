import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './database.js';
import { downloadBlob, stringMatrixToCsv } from './utils.js';

/**
 * Admin component that exposes useful information, such as results stored in the
 * current session.
 */
export function Admin() {
  // use Dexie live hook
  const results = useLiveQuery(() => db.results.toArray());

  function downloadResultsAsCsv() {
    if (results === undefined) {
      return;
    }

    // create a CSV string from the results
    const csv = stringMatrixToCsv(
      results.map(result => [
        String(result.id),
        String(result.taskId),
        result.key,
        result.val,
      ]),
    );

    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, 'results.csv');
  }

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
      <button onClick={downloadResultsAsCsv}>Download as CSV</button>
    </div>
  );
}
