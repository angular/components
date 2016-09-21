/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Warning displayed on a phishing alert.
 * @author adhintz@google.com (Drew Hintz)
 * @author henryc@google.com (Henry Chang)
 */


// URI encoded parameters from the URL.
// [phishingTabId, url, securityEmailAddress]
var parameters = window.location.search.substr(1).split('&');
var phishingTabId = parseInt(parameters[0]);
var url = decodeURIComponent(parameters[1]);
var host = decodeURIComponent(parameters[2]);
var securityEmailAddress = decodeURIComponent(parameters[3]);

document.getElementById('warning_banner_header').textContent =
    chrome.i18n.getMessage('phishing_warning_banner_header');
document.getElementById('warning_banner_text').textContent =
    chrome.i18n.getMessage('phishing_warning_banner_body');
document.getElementById('learn_more').textContent =
    chrome.i18n.getMessage('learn_more');

// The report button will have different look and function between consumer
// and enterprise modes.
if (securityEmailAddress === 'undefined') {  // consumer mode
  document.getElementById('report_phishing').textContent =
      chrome.i18n.getMessage('report_phishing');
} else {
  document.getElementById('report_phishing').textContent =
      chrome.i18n.getMessage('contact_security');
}
document.getElementById('back').textContent =
    chrome.i18n.getMessage('back');
document.getElementById('visit_this_site').textContent =
    chrome.i18n.getMessage('visit_this_site');

document.getElementById('report_phishing').onclick = function() {
  if (securityEmailAddress === 'undefined') {  // consumer mode
    window.location.href =
        'https://www.google.com/safebrowsing/report_phish/?url=' +
        encodeURIComponent(url);
  } else {
    // Use window.open in case mail client is non-browser, and the phishing
    // tab can be closed.
    window.open('mailto:' + encodeURIComponent(securityEmailAddress) + '?' +
        'subject=User has detected possible phishing site.&' +
        'body=I have visited ' + encodeURIComponent(url) + ' and a phishing ' +
        'warning was triggered. Please see if this is indeed a phishing ' +
        'attempt and requires further action.');
    chrome.tabs.remove(phishingTabId);
  }
};

document.getElementById('back').onclick = function() {
  chrome.tabs.get(phishingTabId, function(tab) {
    chrome.tabs.highlight({'tabs': tab.index}, function() {
      // When the phishing site gets opened in a new tab.
      if (window.history.length <= 2) {
        window.close();
        return;
      }
      window.history.go(-2);
    });
  });
};


PHISHING_WARNING_WHITELIST_KEY_ = 'phishing_warning_whitelist';


/**
 * If a user decides to visit the site, the site will be whitelisted from
 * future phishing warnings.  The saved object in chrome storage has the
 * below structure. The top-level key is used as the argument for
 * StorageArea get(), and the associated value will be an inner object that
 * has all the host details.
 *
 * {phishing_warning_whitelist:
 *     {https://www.example1.com: true,
 *      https://www.example2.com: true}
 * }
 *
 * @private
 */
document.getElementById('visit_this_site').onclick = function() {
  chrome.tabs.get(phishingTabId, function(tab) {
    chrome.tabs.highlight({'tabs': tab.index}, function() {});
    chrome.storage.local.get(
        PHISHING_WARNING_WHITELIST_KEY_,
        function(result) {
          if (result[PHISHING_WARNING_WHITELIST_KEY_] === undefined) {
            result[PHISHING_WARNING_WHITELIST_KEY_] = {};
          }
          result[PHISHING_WARNING_WHITELIST_KEY_][host] = true;
          chrome.storage.local.set(result);
          window.history.back();
        });
  });
};
