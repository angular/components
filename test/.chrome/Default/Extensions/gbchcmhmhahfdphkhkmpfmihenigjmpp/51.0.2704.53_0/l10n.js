/* Copyright (c) 2012 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

var l10n = l10n || {};

/**
 * Localize a tag, returning the tag itself and logging an error if no
 * translation exists.
 *
 * @param {string} tag The localization tag.
 * @param {(string|Array)=} opt_substitutions An optional set of substitution
 *     strings corresponding to the "placeholders" attributes in messages.json.
 * @return {string} The translated tag.
 */
l10n.getTranslationOrError = function(tag, opt_substitutions) {
  var translation = chrome.i18n.getMessage(tag, opt_substitutions);
  if (translation) {
    return translation;
  }
  console.error('Missing translation for "' + tag + '"');
  return tag;
};

/**
 * Localize an element by setting its innerText according to the specified tag
 * and an optional set of substitutions.
 *
 * @param {Element} element The element to localize.
 * @param {string} tag The localization tag or
 *     an Error object containing the tag.
 * @param {(string|Array)=} opt_substitutions An optional set of substitution
 *     strings corresponding to the "placeholders" attributes in messages.json.
 * @param {boolean=} opt_asHtml If true, set innerHTML instead of innerText.
 *     This parameter should be used with caution.
 * @return {boolean} True if the localization was successful; false otherwise.
 */
l10n.localizeElementFromTag = function(element, tag, opt_substitutions,
                                       opt_asHtml) {
  var translation = l10n.getTranslationOrError(tag, opt_substitutions);
  if (opt_asHtml) {
    element.innerHTML = translation;
  } else {
    element.innerText = translation;
  }
  return translation != null;
};

/**
 * Localize an element by setting its innerText according to its i18n-content
 * attribute, and an optional set of substitutions.
 *
 * @param {Element} element The element to localize.
 * @param {(string|Array)=} opt_substitutions An optional set of substitution
 *     strings corresponding to the "placeholders" attributes in messages.json.
 * @param {boolean=} opt_asHtml If true, set innerHTML instead of innerText.
 *     This parameter should be used with caution.
 * @return {boolean} True if the localization was successful; false otherwise.
 */
l10n.localizeElement = function(element, opt_substitutions, opt_asHtml) {
  var tag = element.getAttribute('i18n-content');
  return l10n.localizeElementFromTag(element, tag, opt_substitutions,
                                     opt_asHtml);
};

/**
 * Localize all tags with the i18n-content attribute, using i18n-data-n
 * attributes to specify any placeholder substitutions.
 *
 * Because we use i18n-value attributes to implement translations of rich
 * content (including paragraphs with hyperlinks), we localize these as
 * HTML iff there are any substitutions.
 */
l10n.localize = function() {
  var elements = document.querySelectorAll('[i18n-content],[i18n-title]');
  for (var i = 0; i < elements.length; ++i) {
    /** @type {Element} */ var element = elements[i];
    var substitutions = [];
    for (var j = 1; j < 9; ++j) {
      var value = 'i18n-value-' + j;
      var valueName = 'i18n-value-name-' + j;
      if (element.hasAttribute(value)) {
        substitutions.push(element.getAttribute(value));
      } else if (element.hasAttribute(valueName)) {
        var name = element.getAttribute(valueName);
        var translation = chrome.i18n.getMessage(name);
        if (translation) {
          substitutions.push(translation);
        } else {
          console.error('Missing translation for substitution: ' + name);
          substitutions.push(name);
        }
      } else {
        break;
      }
    }
    var titleTag = element.getAttribute('i18n-title');
    if (titleTag) {
      element.title = l10n.getTranslationOrError(titleTag, substitutions);
    } else {
      l10n.localizeElement(element, substitutions,
                           substitutions.length != 0);
    }
  }
};


/**
 * @return {string} The current locale.
 */
l10n.getLocale = function() {
  return chrome.i18n.getMessage('@@ui_locale');
};
