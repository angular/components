import { Tree, SchematicsException } from '@angular-devkit/schematics';
import * as parse5 from 'parse5';
import { getIndexPath } from './ast';
import { InsertChange } from './devkit-utils/change';

/**
 * Parses the index.html file to get the HEAD tag position.
 */
export function getHeadTag(host: Tree, src: string) {
  const document = parse5.parse(src,
    { locationInfo: true }) as parse5.AST.Default.Document;

  let head;
  const visit = (nodes: parse5.AST.Default.Node[]) => {
    nodes.forEach(node => {
      const element = <parse5.AST.Default.Element>node;
      if (element.tagName === 'head') {
        head = element;
      } else {
        if (element.childNodes) {
          visit(element.childNodes);
        }
      }
    });
  };

  visit(document.childNodes);

  if (!head) {
    throw new SchematicsException('Head element not found!');
  }

  return {
    position: head.__location.startTag.endOffset
  };
}

/**
 * Adds a link to the index.html head tag
 */
export function addHeadLink(host: Tree, link: string) {
  const indexPath = getIndexPath(host);
  const buffer = host.read(indexPath);
  if (!buffer) {
    throw new SchematicsException(`Could not find file for path: ${indexPath}`);
  }

  const src = buffer.toString();
  if (src.indexOf(link) === -1) {
    const node = getHeadTag(host, src);
    const chng = new InsertChange(indexPath, node.position, link);
    const recorder = host.beginUpdate(indexPath);
    recorder.insertLeft(chng.pos, chng.toAdd);
    host.commitUpdate(recorder);
  }
}
