import {readFileSync} from 'fs';
import * as ts from 'typescript';
import {Glob} from 'glob-latest';

function countAnyKeywords(fileName: string): number {
  const sourceFile = ts.createSourceFile(
    fileName,
    readFileSync(fileName).toString(),
    ts.ScriptTarget.ES2022,
  );

  return countAnyKeywordsInNode(sourceFile);
}

function countAnyKeywordsInNode(node: ts.Node): number {
  if (node.kind === ts.SyntaxKind.AnyKeyword) {
    return 1;
  }

  let total = 0;
  ts.forEachChild(node, child => void (total += countAnyKeywordsInNode(child)));

  return total;
}

function printMap(map: ReadonlyMap<unknown, unknown>) {
  for (const [k, v] of map.entries()) {
    console.log(`${k}: ${v}`);
  }
}

async function main() {
  const tsFilesGlob = new Glob('src/**/*.ts', {});
  const filesMap = new Map<string, number>();

  for await (const path of tsFilesGlob) {
    const count = countAnyKeywords(path);
    if (count > 0) {
      filesMap.set(path, count);
    }
  }

  const total = Array.from(filesMap.values()).reduce((a, b) => a + b);
  const specCount = Array.from(filesMap.entries())
    .filter(([path]) => path.includes('spec.ts'))
    .reduce((sum, [, count]) => sum + count, 0);

  printMap(filesMap);

  console.log('\n');
  console.log('total:', total);
  console.log('spec', specCount);
  console.log('non-spec:', total - specCount);
}

main();
