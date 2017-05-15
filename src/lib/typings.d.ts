declare var module: {id: string};

/** Extends the interface for Matchers in jasmine to allow for custom matchers. */
declare namespace jasmine {
  interface Matchers {
    toBeRole(expectedRole: string): boolean;
    toMatchTableContent(expectedContent: any[]): boolean;
  }
}
