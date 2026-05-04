export interface PagedTableDataSourceNextPageData<T> {
  content: T[];
  nextPageToken?: string;
}
