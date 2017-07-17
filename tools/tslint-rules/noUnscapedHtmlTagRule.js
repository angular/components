const ts = require('typescript');
const utils = require('tsutils');
const Lint = require('tslint');

const ERROR_MESSAGE =
    'A HTML tag may only appear if it is escaped. ' +
    'This is meant to prevent failures in docs generation caused by a misinterpreted tag.';

/**
 * Rule that walks through all comments inside of the library and adds failures when it
 * detects unescaped HTML tags inside of multi-line comments.
 */
class Rule extends Lint.Rules.AbstractRule {

  apply(sourceFile) {
    return this.applyWithWalker(new NoUnescapedHtmlTagWalker(sourceFile, this.getOptions()));
  }
}

class NoUnescapedHtmlTagWalker extends Lint.RuleWalker {

  visitSourceFile(sourceFile) {
    utils.forEachComment(sourceFile, (fullText, commentRange) => {

      let isEscapedHtmlTag = true;
      while (true) {
        const iOpenTag = fullText.indexOf('<');
        const iCloseTag = fullText.indexOf('>');
        if ((iOpenTag === -1) && (iCloseTag === -1)) {
          break;
        }
        if ((iCloseTag < iOpenTag) || (iCloseTag === -1)) {
          isEscapedHtmlTag = false;
          break;
        }
        let iTestTag = fullText.indexOf('<', iOpenTag + 1);
        if ((iTestTag > iOpenTag) && (iTestTag < iCloseTag)) {
          isEscapedHtmlTag = false;
          break;
        }
        iTestTag = fullText.indexOf('`<');
        if (iTestTag !== (iOpenTag - 1)) {
          isEscapedHtmlTag = false;
          break;
        }
        iTestTag = fullText.indexOf('>`')
        if (iTestTag !== iCloseTag) {
          isEscapedHtmlTag = false;
          break;
        }
        if ((iCloseTag + 2) > fullText.length) {
          break;
        }
        fullText = fullText.substring(iCloseTag + 2, fullText.length)
      }

      if (commentRange.kind === ts.SyntaxKind.MultiLineCommentTrivia && !isEscapedHtmlTag) {
        this.addFailureAt(commentRange.pos, commentRange.end - commentRange.pos, ERROR_MESSAGE);
      }
    });
  }
}

exports.Rule = Rule;