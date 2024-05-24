/**
 * Code taken from https://stackoverflow.com/a/68146412.
 */
export function stringMatrixToCsv(data: string[][]) {
  return data.map(row =>
    row
      .map(v => v.replaceAll('"', '""')) // escape double quotes
      .map(v => `"${v}"`) // quote it
      .join(','), // comma-separated
  ).join('\r\n'); // rows starting on new lines
}

/**
 * Prompts the user to save a blob.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const pom = document.createElement('a');
  pom.href = url;
  pom.download = filename;
  document.body.appendChild(pom);
  pom.click();
  pom.remove();
  URL.revokeObjectURL(url);
}

const CHAR_SET = '123456789ABCDEFGHJKMNPQRSTUVWXYZ';

/**
 * Code taken from https://dev.to/munawwar/shorter-unique-ids-4316.
 */
export function genUserIdDefault() {
  const id = 'x'
    .repeat(11)
    .replace(/x/g, () => CHAR_SET[Math.trunc(Math.random() * 32)]);
  return Promise.resolve(id);
}
