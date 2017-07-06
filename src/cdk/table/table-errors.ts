/**
 * Returns an error to be thrown when attempting to find an unexisting column.
 * @param id Id whose lookup failed.
 * @docs-private
 */
export function getTableUnknownColumnError(id: string) {
  return Error(`cdk-table: Could not find column with id "${id}".`);
}

/**
 * Returns an error to be thrown when two column definitions have the same name.
 * @docs-private
 */
export function getTableDuplicateColumnNameError(name: string) {
  return Error(`cdk-table: Duplicate column definition name provided: "${name}".`);
}
