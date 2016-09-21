// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var remoting = remoting || {};

(function(){

/**
 * Attach appropriate event handlers and show or hide the feedback button based
 * on whether or not the current version of Chrome recognizes Chrome Remote
 * Desktop as an authorized feedback source.
 *
 * @param {HTMLElement} container The menu containing the help and feedback
 *     items.
 */
remoting.manageHelpAndFeedback = function(container) {
  var helpButton = container.querySelector('.menu-help');
  console.assert(helpButton != null, 'Missing help button.');
  helpButton.addEventListener('click', showHelp, false);

  var creditsButton = container.querySelector('.menu-credits');
  console.assert(creditsButton != null, 'Missing credits button.');
  creditsButton.addEventListener('click', showCredits, false);

  var feedbackButton = container.querySelector('.menu-feedback');
  console.assert(feedbackButton != null, 'Missing feedback button.');
  var chromeVersion = parseInt(
      window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
  if (chromeVersion >= 35) {
    feedbackButton.addEventListener('click', sendFeedback, false);
  } else {
    feedbackButton.hidden = true;
  }
};

function showHelp() {
  window.open('https://support.google.com/chrome/answer/1649523');
};

function showCredits() {
  chrome.app.window.create(
      'credits.html',
      {
        'width': 800,
        'height': 600,
        'id' : 'remoting-credits'
      });
};

/**
 * Pass the current version of Chrome Remote Desktop to the Google Feedback
 * extension and instruct it to show the feedback dialog.
 */
function sendFeedback() {
  var message = {
    requestFeedback: true,
    feedbackInfo: {
      description: '',
      systemInformation: [
        {
          key: 'version',
          value: remoting.app.getExtensionInfo()
        },
        {
          key: 'consoleErrors',
          value: JSON.stringify(
              remoting.ConsoleWrapper.getInstance().getHistory())
        }
      ]
    }
  };
  var kFeedbackExtensionId = 'gfdkimpbcpahaombhbimeihdjnejgicl';
  chrome.runtime.sendMessage(kFeedbackExtensionId, message, function() {});
};

})();
