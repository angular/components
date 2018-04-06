import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {TslintFixTask} from '@angular-devkit/schematics/tasks';
import * as path from 'path';

export default function(): Rule {
  return (_: Tree, context: SchematicContext) => {
    context.addTask(new TslintFixTask({
      rulesDirectory: path.join(__dirname, 'rules'),
      rules: {
        "switch-identifiers": true,
      }
    }, {
      includes: '*.ts',
      silent: false,
    }));
  };
}
