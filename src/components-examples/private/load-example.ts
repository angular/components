import {ComponentFactory, Injector, Type, ɵNgModuleFactory} from '@angular/core';
import {EXAMPLE_COMPONENTS} from '../example-module';

/** Asynchronously loads the specified example and returns its component factory. */
export async function loadExampleFactory(name: string, injector: Injector)
    : Promise<ComponentFactory<any>> {
  const {componentName, module} = EXAMPLE_COMPONENTS[name];
  const moduleExports = await import(
      `@angular/components-examples/${module.importSpecifier}`);
  const moduleType: Type<any> = moduleExports[module.name];
  const componentType: Type<any> = moduleExports[componentName];
  // The components examples package is built with Ivy. This means that no factory files are
  // generated. To retrieve the factory of the AOT compiled module, we simply pass the module
  // class symbol to Ivy's module factory constructor. There is no equivalent for View Engine,
  // where factories are stored in separate files. Hence the API is currently Ivy-only.
  const moduleFactory = new ɵNgModuleFactory(moduleType);
  return moduleFactory.create(injector)
    .componentFactoryResolver.resolveComponentFactory(componentType);
}
