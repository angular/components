/**
 * @fileoverview Provides a representation of a web request sender, and
 * utility functions for creating them.
 */
'use strict';

/**
 * @typedef {{
 *   origin: string,
 *   tlsChannelId: (string|undefined),
 *   tabId: (number|undefined)
 * }}
 */
var WebRequestSender;

/**
 * Creates an object representing the sender's origin, and, if available,
 * tab.
 * @param {MessageSender} messageSender The message sender.
 * @return {?WebRequestSender} The sender's origin and tab, or null if the
 *     sender is invalid.
 */
function createSenderFromMessageSender(messageSender) {
  var origin = getOriginFromUrl(/** @type {string} */ (messageSender.url));
  if (!origin) {
    return null;
  }
  var sender = {
    origin: origin
  };
  if (messageSender.tlsChannelId) {
    sender.tlsChannelId = messageSender.tlsChannelId;
  }
  if (messageSender.tab) {
    sender.tabId = messageSender.tab.id;
  }
  return sender;
}

/**
 * Checks whether the given tab could have sent a message from the given
 * origin.
 * @param {Tab} tab The tab to match
 * @param {string} origin The origin to check.
 * @return {Promise} A promise resolved with the tab id if it the tab could,
 *     have sent the request, and rejected if it can't.
 */
function tabMatchesOrigin(tab, origin) {
  // If the tab's origin matches, trust that the request came from this tab.
  if (getOriginFromUrl(tab.url) == origin) {
    return Promise.resolve(tab.id);
  }
  return Promise.reject(false);
}

/**
 * Attempts to ensure that the tabId of the sender is set, using chrome.tabs
 * when available.
 * @param {WebRequestSender} sender The request sender.
 * @return {Promise} A promise resolved once the tabId retrieval is done.
 *     The promise is rejected if the tabId is untrustworthy, e.g. if the
 *     user rapidly switched tabs.
 */
function getTabIdWhenPossible(sender) {
  if (sender.tabId) {
    // Already got it? Done.
    return Promise.resolve(true);
  } else if (!chrome.tabs) {
    // Can't get it? Done. (This happens to packaged apps, which can't access
    // chrome.tabs.)
    return Promise.resolve(true);
  } else {
    return new Promise(function(resolve, reject) {
      chrome.tabs.query({active: true, lastFocusedWindow: true},
          function(tabs) {
            if (!tabs.length) {
              // Safety check.
              reject(false);
              return;
            }
            var tab = tabs[0];
            tabMatchesOrigin(tab, sender.origin).then(function(tabId) {
              sender.tabId = tabId;
              resolve(true);
            }, function() {
              // Didn't match? Check if the debugger is open.
              if (tab.url.indexOf('chrome-devtools://') != 0) {
                reject(false);
                return;
              }
              // Debugger active: find first tab with the sender's origin.
              chrome.tabs.query({active: true}, function(tabs) {
                if (!tabs.length) {
                  // Safety check.
                  reject(false);
                  return;
                }
                var numRejected = 0;
                for (var i = 0; i < tabs.length; i++) {
                  tab = tabs[i];
                  tabMatchesOrigin(tab, sender.origin).then(function(tabId) {
                    sender.tabId = tabId;
                    resolve(true);
                  }, function() {
                    if (++numRejected >= tabs.length) {
                      // None matches: reject.
                      reject(false);
                    }
                  });
                }
              });
            });
          });
    });
  }
}

/**
 * Checks whether the given tab is in the foreground, i.e. is the active tab
 * of the focused window.
 * @param {number} tabId The tab id to check.
 * @return {Promise<boolean>} A promise for the result of the check.
 */
function tabInForeground(tabId) {
  return new Promise(function(resolve, reject) {
      if (!chrome.tabs || !chrome.tabs.get) {
        reject();
        return;
      }
      if (!chrome.windows || !chrome.windows.get) {
        reject();
        return;
      }
      chrome.tabs.get(tabId, function(tab) {
            if (chrome.runtime.lastError) {
              resolve(false);
              return;
            }
            if (!tab.active) {
              resolve(false);
              return;
            }
            chrome.windows.get(tab.windowId, function(aWindow) {
                  resolve(aWindow && aWindow.focused);
                });
          });
  });
}
