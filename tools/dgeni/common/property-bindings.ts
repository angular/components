import {PropertyMemberDoc} from 'dgeni-packages/typescript/api-doc-types/PropertyMemberDoc';
import {hasMemberDecorator} from './decorators';

/** Interface that describes an Angular property binding. Can be either an input or output. */
export interface PropertyBinding {
  name: string;
  alias?: string;
}

/**
 * Detects whether the specified property member is an input. If the property is an input, the
 * alias and input name will be returned.
 */
export function getInputBindingData(
  doc: PropertyMemberDoc,
  metadata: Map<string, any>,
): PropertyBinding | undefined {
  return getBindingPropertyData(doc, metadata, 'inputs', 'Input');
}

/**
 * Detects whether the specified property member is an output. If the property is an output, the
 * alias and output name will be returned.
 */
export function getOutputBindingData(
  doc: PropertyMemberDoc,
  metadata: Map<string, any>,
): PropertyBinding | undefined {
  return getBindingPropertyData(doc, metadata, 'outputs', 'Output');
}

/**
 * Method that detects the specified type of property binding (either "output" or "input") from
 * the directive metadata or from the associated decorator on the property.
 */
function getBindingPropertyData(
  doc: PropertyMemberDoc,
  metadata: Map<string, any>,
  propertyName: string,
  decoratorName: string,
) {
  if (metadata) {
    const metadataValues: (string | {name: string; alias?: string})[] =
      metadata.get(propertyName) || [];
    const foundValue = metadataValues.find(value => {
      const name = typeof value === 'string' ? value.split(':')[0] : value.name;
      return name === doc.name;
    });

    if (foundValue) {
      return {
        name: doc.name,
        alias:
          typeof foundValue === 'string'
            ? foundValue.split(':')[1]
            : foundValue.alias || foundValue.name,
      };
    }
  }

  if (hasMemberDecorator(doc, decoratorName)) {
    return {
      name: doc.name,
      alias: doc.decorators!.find(d => d.name == decoratorName)!.arguments![0],
    };
  }

  return undefined;
}
