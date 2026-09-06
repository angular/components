import {Component, viewChild, signal, computed, resource} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule, SortDirection} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {DatePipe} from '@angular/common';

/**
 * @title Table retrieving data through HTTP
 */
@Component({
  selector: 'table-http-example',
  styleUrl: 'table-http-example.css',
  templateUrl: 'table-http-example.html',
  imports: [MatProgressSpinnerModule, MatTableModule, MatSortModule, MatPaginatorModule, DatePipe],
})
export class TableHttpExample {
  readonly displayedColumns: string[] = ['created', 'state', 'number', 'title'];
  readonly paginator = viewChild.required(MatPaginator);
  readonly sort = viewChild.required(MatSort);
  readonly sortActive = signal('created');
  readonly sortDirection = signal<SortDirection>('desc');
  readonly pageIndex = signal(0);

  readonly issueResource = resource({
    params: () => ({
      sort: this.sortActive(),
      order: this.sortDirection(),
      page: this.pageIndex(),
    }),
    loader: async ({params: {sort, order, page}, abortSignal}) => {
      const base = 'https://api.github.com/search/issues';
      const requestUrl = `${base}?q=repo:angular/components&sort=${sort}&order=${order}&page=${
        page + 1
      }`;
      const response = await fetch(requestUrl, {signal: abortSignal});
      if (!response.ok) {
        throw new Error('Rate limit reached');
      }
      return (await response.json()) as GithubApi;
    },
  });

  readonly isLoadingResults = this.issueResource.isLoading;
  readonly isRateLimitReached = computed(() => this.issueResource.error() != null);

  readonly data = computed(() => {
    if (this.isRateLimitReached()) {
      return [];
    }
    return this.issueResource.value()?.items || [];
  });

  readonly resultsLength = computed(() => this.issueResource.value()?.total_count || 0);

  handleSort() {
    this.paginator().pageIndex = 0;
    this.pageIndex.set(0);
    this.sortActive.set(this.sort().active);
    this.sortDirection.set(this.sort().direction);
  }

  handlePage() {
    this.pageIndex.set(this.paginator().pageIndex);
  }
}

export interface GithubApi {
  items: GithubIssue[];
  total_count: number;
}

export interface GithubIssue {
  created_at: string;
  number: string;
  state: string;
  title: string;
}
