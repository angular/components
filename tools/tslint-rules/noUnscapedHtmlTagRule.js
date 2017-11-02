const ts = require('typescript');
const utils = require('tsutils');
const Lint = require('tslint');

const ERROR_MESSAGE =
  'An HTML tag may only appear in a JSDoc comment if it is escaped.' +
  ' This prevents failures in document generation caused by a misinterpreted tag.';

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

      const htmlIsEscaped = parseForHtml(fullText);

      if (commentRange.kind === ts.SyntaxKind.MultiLineCommentTrivia && !htmlIsEscaped) {
        this.addFailureAt(commentRange.pos, commentRange.end - commentRange.pos, ERROR_MESSAGE);
      }
    });
  }

  /** Gets whether the comment's HTML, if any, is properly escaped */
  parseForHtml(fullText) {
    const matches = new RegExp(/[<>]/);

    const backtickCount = fullText.split('`').length - 1;
    if ((backtickCount === 1) || ((backtickCount === 0) && matches.test(fullText))) {
      return false;
    }

    // if there are no backticks and no [<>], there's no need for any more checks
    if ((backtickCount > 1) && matches.test(fullText)) {
      // if there are backticks there should be an even number of them
      if (backtickCount % 2) {
        return false;
      } else {
        // < and > must always be between two matching backticks.
        const fullTextArray = fullText.split('');

        // Whether an opening backtick has been found without a closing pair
        let openBacktick = false;

        for (let i = 0; i < fullTextArray.length; i++) {
          if (fullTextArray[i] === '`') {
            openBacktick = !openBacktick;
          } else if (matches.test(fullTextArray[i]) && !openBacktick) {
            return false;
          }
        }
      }
    }

    return true;
  }
}

exports.Rule = Rule;
