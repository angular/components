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

      let isEscapedHtmlTag = true;
      const matches = new RegExp(/[<>]/);

      const numberOfBackticks = fullText.split('`').length - 1;
      if ((numberOfBackticks === 1) || ((numberOfBackticks === 0) && matches.test(fullText))) {
        isEscapedHtmlTag = false;
      }

      // if there are no backticks and [<>], there's no need for any more checks
      if ((numberOfBackticks > 1) && matches.test(fullText)) {
        // if there are backticks there should be an even number of them
        if (!!(numberOfBackticks % 2)) {
          isEscapedHtmlTag = false;
        } else {
          /** 
           * This logic behaves like a stack structure. isBacktickWithoutMatch plays
           * the stack role: it is set to true whenever, during a comment scan, an 'open' 
           * backtick is found in the string, and it is set back to false when the next matching
           * (closing) backtick is found. Every backtick must have a matching. < and >
           * must always be between two matching backticks.
           */
          const splitedFullText = fullText.split('');
          let isBacktickWithoutMatch = false;

          for (var i = 0; i < splitedFullText.length; i++) {
            if (splitedFullText[i] === '`') {
              isBacktickWithoutMatch = !isBacktickWithoutMatch;
            } else if (matches.test(splitedFullText[i]) && !isBacktickWithoutMatch) {
              isEscapedHtmlTag = false;
              break;
            }
          }
        }
      }

      if (commentRange.kind === ts.SyntaxKind.MultiLineCommentTrivia && !isEscapedHtmlTag) {
        this.addFailureAt(commentRange.pos, commentRange.end - commentRange.pos, ERROR_MESSAGE);
      }
    });
  }
}

exports.Rule = Rule;
