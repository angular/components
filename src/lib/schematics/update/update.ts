import {chain, Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {NodePackageInstallTask, TslintFixTask} from '@angular-devkit/schematics/tasks';
import * as path from 'path';

// Import everything that the `TslintFixTask` will need to cache it in memory.
import * as color from './material/color';
import * as componentData from  './material/component-data';
import * as extraStylesheets from './material/extra-stylsheets';
import * as typescriptSpecifiers from './material/typescript-specifiers';
import * as switchIdentifiersRule from './rules/switchIdentifiersRule';
import * as switchPropertyNamesRule from './rules/switchPropertyNamesRule';
import * as switchStringLiteralAttributeSelecotrsRule from './rules/switchStringLiteralAttributeSelectorsRule';
import * as switchStringLiteralCssNamesRule from './rules/switchStringLiteralCssNamesRule';
import * as switchStringLiteralElementSelectorsRule from './rules/switchStringLiteralElementSelectorsRule';
import * as switchTemplateAttributeSelectorRule from './rules/switchTemplateAttributeSelectorsRule';
import * as switchTemplateCssNamesRule from './rules/switchTemplateCssNamesRule';
import * as switchTemplateElementSelectorsRule from './rules/switchTemplateElementSelectorsRule';
import * as switchTemplateExportAsNamesRule from './rules/switchTemplateExportAsNamesRule';
import * as switchTemplateInputNamesRule from './rules/switchTemplateInputNamesRule';
import * as switchTemplateOutpitNamesRule from './rules/switchTemplateOutputNamesRule';
import * as componentFile from './tslint/component-file';
import * as componentWalker from './tslint/component-walker';
import * as findTslintBinary from './tslint/find-tslint-binary';
import * as identifiers from './typescript/identifiers';
import * as imports from './typescript/imports';
import * as literal from './typescript/literal';

/** Entry point for `ng update` from Angular CLI. */
export default function(): Rule {
  return chain([
    (_: Tree, context: SchematicContext) => {
      context.addTask(new NodePackageInstallTask({
        packageName: '@angular/cdk@">=5 <6"'
      }));
      context.addTask(new NodePackageInstallTask({
        packageName: '@angular/material@">=5 <6"'
      }));
    },
    (_: Tree, context: SchematicContext) => {
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
    },
    (_: Tree, context: SchematicContext) => {
      context.addTask(new NodePackageInstallTask({
        packageName: '@angular/cdk@next'
      }));
      context.addTask(new NodePackageInstallTask({
        packageName: '@angular/material@next'
      }));
    },
  ]);
}
