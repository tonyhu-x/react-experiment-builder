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
