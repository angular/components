/**
 * @fileoverview Implements a simple XmlHttpRequest-based text document
 * fetcher.
 *
 * @author juanlang@google.com (Juan Lang)
 */
'use strict';

/**
 * A fetcher of text files.
 * @interface
 */
function TextFetcher() {}

/**
 * @param {string} url The URL to fetch.
 * @param {string?} opt_method The HTTP method to use (default GET)
 * @param {string?} opt_body The request body
 * @return {!Promise<string>} A promise for the fetched text. In case of an
 *     error, this promise is rejected with an HTTP status code.
 */
TextFetcher.prototype.fetch = function(url, opt_method, opt_body) {};

/**
 * @constructor
 * @implements {TextFetcher}
 */
function XhrTextFetcher() {
}

/**
 * @param {string} url The URL to fetch.
 * @param {string?} opt_method The HTTP method to use (default GET)
 * @param {string?} opt_body The request body
 * @return {!Promise<string>} A promise for the fetched text. In case of an
 *     error, this promise is rejected with an HTTP status code.
 */
XhrTextFetcher.prototype.fetch = function(url, opt_method, opt_body) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    var method = opt_method || 'GET';
    xhr.open(method, url, true);
    xhr.onloadend = function() {
      if (xhr.status != 200) {
        reject(xhr.status);
        return;
      }
      resolve(xhr.responseText);
    };
    xhr.onerror = function() {
      // Treat any network-level errors as though the page didn't exist.
      reject(404);
    };
    if (opt_body)
      xhr.send(opt_body);
    else
      xhr.send();
  });
};
