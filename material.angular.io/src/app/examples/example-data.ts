/**
 * Example data
 *   with information about Component name, selector, files used in example, and path to examples
 */
export class ExampleData {
  // TODO: figure out how do we get these variables.
  description: string = 'Some description for material';
  // TODO: use real example and delete the example/ folder.
  examplePath = '/assets/example/';
  exampleFiles = ['button-demo.html', 'button-demo.scss', 'button-demo.ts'];

  // TODO: extract these variables from example code.
  selectorName = 'button-demo';
  indexFilename = 'button-demo';
  componentName = 'ButtonDemo';

  constructor(example: string) {
    if (example) {
      this.examplePath = `/app/examples/${example}/`;
      // TODO(tinayuangao): Do not hard-code extensions
      this.exampleFiles = ['html', 'ts', 'css']
        .map((extension) => `${example}-example.${extension}`);
      this.selectorName = this.indexFilename = `${example}-example`;
      var exampleName = example.replace(/(?:^\w|\b\w)/g, function(letter) {
        return letter.toUpperCase();
      });
      this.description = exampleName.replace(/[\-]+/g, ' ') + ' Example';
      this.componentName = exampleName.replace(/[\-]+/g, '') + 'Example';
    }
  }
}
