// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var thirdPartyPath = '/talkgadget/oauth/chrome-remote-desktop/thirdpartyauth';

if (window.location.pathname == thirdPartyPath) {
  // Chrome may not deliver the message if window.close() is called after
  // sendMessage(), see crbug.com/444130 . To ensure the message is delivered
  // wait for a response before closing the window.
  chrome.extension.sendMessage(
      window.location.href, function() { window.close(); });
}
