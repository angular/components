/**
 * Allows using async/await in Jasmine tests.
 * @param spec Test to be executed. Needs to be marked as `async`.
 */
export function asyncSpec(spec: () => Promise<any>) {
  return async (done: DoneFn) => {
    try {
      await spec();
      done();
    } catch (error) {
      done.fail(error);
    }
  };
}
