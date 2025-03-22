import ts from 'typescript';
import {CategorizedClassDoc} from './dgeni-definitions';

/**
 * Determines the component or directive metadata from the specified Dgeni class doc. The resolved
 * directive metadata will be stored in a Map.
 *
 * Currently only string literal assignments and array literal assignments are supported. Other
 * value types are not necessary because they are not needed for any user-facing documentation.
 *
 * ```ts
 * @Component({
 *   inputs: ["red", "blue"],
 *   exportAs: "test"
 * })
 * export class MyComponent {}
 * ```
 */
export function getMetadata(classDoc: CategorizedClassDoc): Map<string, any> | null {
  const declaration = classDoc.symbol.valueDeclaration;
  const decorators =
    declaration && ts.isClassDeclaration(declaration) ? ts.getDecorators(declaration) : null;

  if (!decorators?.length) {
    return null;
  }

  const expression = decorators
    .filter(decorator => decorator.expression && ts.isCallExpression(decorator.expression))
    .map(decorator => decorator.expression as ts.CallExpression)
    .find(
      callExpression =>
        callExpression.expression.getText() === 'Component' ||
        callExpression.expression.getText() === 'Directive',
    );

  if (!expression) {
    return null;
  }

  // The argument length of the CallExpression needs to be exactly one, because it's the single
  // JSON object in the @Component/@Directive decorator.
  if (expression.arguments.length !== 1) {
    return null;
  }

  const objectExpression = expression.arguments[0] as ts.ObjectLiteralExpression;
  const resultMetadata = new Map<string, any>();

  (objectExpression.properties as ts.NodeArray<ts.PropertyAssignment>).forEach(prop => {
    // Support ArrayLiteralExpression assignments in the directive metadata.
    if (ts.isArrayLiteralExpression(prop.initializer)) {
      const arrayData = prop.initializer.elements.map(literal => {
        if (ts.isStringLiteralLike(literal)) {
          return literal.text;
        }

        if (ts.isObjectLiteralExpression(literal)) {
          return literal.properties.reduce(
            (result, prop) => {
              if (ts.isPropertyAssignment(prop)) {
                result[prop.name.getText()] = ts.isStringLiteralLike(prop.initializer)
                  ? prop.initializer.text
                  : prop.initializer.getText();
              }

              return result;
            },
            {} as Record<string, string>,
          );
        }

        return literal.getText();
      });

      resultMetadata.set(prop.name.getText(), arrayData);
    }

    // Support normal StringLiteral and NoSubstitutionTemplateLiteral assignments
    if (ts.isStringLiteralLike(prop.initializer)) {
      resultMetadata.set(prop.name.getText(), prop.initializer.text);
    }
  });

  return resultMetadata;
}
