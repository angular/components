'use strict';

const path = require('path');
const fs = require('fs-extra');

/**
 * Inline the templates for a source file. Simply search for instances of `templateUrl: ...` and
 * replace with `template: ...` (with the content of the file included).
 * @param filePath {string|function} The path of the source file.
 * @param content {string} The source file's content.
 * @return {string} The content with all templates inlined.
 */
function inlineTemplate(filePath, content) {

  // Transform the filePath into a function, to be able to customize the path.
  if (typeof filePath !== 'function') filePath = () => filePath;

  return content.replace(/templateUrl:\s*(?:'|")(.+?\.html)(?:"|')/g, function(m, templateUrl) {
    const templateFile = path.join(path.dirname(filePath(templateUrl)), templateUrl);

    if (!fs.existsSync(templateFile)) return;

    const templateContent = fs.readFileSync(templateFile, 'utf-8');
    const shortenedTemplate = templateContent
      .replace(/([\n\r]\s*)+/gm, ' ')
      .replace(/"/g, '\\"');

    return `template: "${shortenedTemplate}"`;
  });
}


/**
 * Inline the styles for a source file. Simply search for instances of `styleUrls: [...]` and
 * replace with `styles: [...]` (with the content of the file included).
 * @param filePath {string|function} The path of the source file.
 * @param content {string} The source file's content.
 * @return {string} The content with all styles inlined.
 */
function inlineStyle(filePath, content) {

  // Transform the filePath into a function, to be able to customize the path.
  if (typeof filePath !== 'function') filePath = () => filePath;

  return content.replace(/styleUrls:\s*(\[[\s\S]*?])/gm, function(m, styleUrls) {
    const urls = eval(styleUrls);

    let inlineStyles = urls
      .map(styleUrl => path.join(path.dirname(filePath(styleUrl)), styleUrl))
      .filter(styleUrl => fs.existsSync(styleUrl))
      .map(styleFile => {
        const styleContent = fs.readFileSync(styleFile, 'utf-8');
        const shortenedStyle = styleContent
          .replace(/([\n\r]\s*)+/gm, ' ')
          .replace(/"/g, '\\"');

        return `"${shortenedStyle}"`;
      });

    return 'styles: [' + inlineStyles.join(',\n') + ']';
  });
}

/**
 * Removes the module ids of the component metadata.
 * Since the templates and styles are now inlined, the module id has become unnecessary and
 * can cause unexpected issues.
 */
function removeModuleIds(content) {
  // Match the line feeds as well, because we want to get rid of that line.
  return content.replace(/^\W+moduleId:\W+module\.id,?[\n|\r]+/gm, '');
}

module.exports = {
  inlineStyle: inlineStyle,
  inlineTemplate: inlineTemplate,
  removeModuleIds: removeModuleIds
};