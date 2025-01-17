import {Injector, Type} from '@angular/core';
import {EXAMPLE_COMPONENTS} from '../example-module';

/**
 * Asynchronously loads the specified example and returns its component and
 * an injector instantiated from the containing example module.
 *
 * This is used in the `dev-app` and `e2e-app` and assumes ESBuild having created
 * entry-points for the example modules under the `<host>/bundles/` URL.
 */
export async function loadExample(
  name: string,
  injector: Injector,
): Promise<{component: Type<any>; injector: Injector}> {
  const {componentName, importPath} = EXAMPLE_COMPONENTS[name];
  const moduleExports = await import(`/bundles/components-examples/${importPath}/index.js`);
  const componentType: Type<any> = moduleExports[componentName];

  return {
    component: componentType,
    injector,
  };
}
