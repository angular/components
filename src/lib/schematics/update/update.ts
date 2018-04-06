import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {TslintFixTask} from '@angular-devkit/schematics/tasks';
import * as path from 'path';

/** Entry point for `ng update` from Angular CLI. */
export default function(): Rule {
  return (_: Tree, context: SchematicContext) => {
    context.addTask(new TslintFixTask({
      rulesDirectory: path.join(__dirname, 'rules'),
      rules: {
        "switch-identifiers": true,
        "switch-property-names": true,
        "switch-string-literal-attribute-selectors": true,
        "switch-string-literal-css-names": true,
        "switch-string-literal-element-selectors": true,
        // TODO(mmalerba): These require an extra CLI param, figure out how to handle.
        /*"switch-stylesheet-attribute-selectors": true,
        "switch-stylesheet-css-names": true,
        "switch-stylesheet-element-selectors": true,
        "switch-stylesheet-input-names": true,
        "switch-stylesheet-output-names": true,*/
        "switch-template-attribute-selectors": true,
        "switch-template-css-names": true,
        "switch-template-element-selectors": true,
        "switch-template-export-as-names": true,
        "switch-template-input-names": true,
        "switch-template-output-names": true,
      }
    }, {
      silent: false,
      tsConfigPath: './tsconfig.json',
    }));
  };
}
