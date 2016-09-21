// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Contains all the settings that may need massaging by the build script.
// Keeping all that centralized here allows us to use symlinks for the other
// files making for a faster compile/run cycle when only modifying HTML/JS.

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/** @type {remoting.Settings} */
remoting.settings = null;
/** @constructor */
remoting.Settings = function() {};

// The settings on this file are automatically substituted by build-webapp.py.
// Do not override them manually, except for running local tests.

/** @type {string} API client ID.*/
remoting.Settings.prototype.OAUTH2_CLIENT_ID = '440925447803-avn2sj1kc099s0r7v62je5s339mu0am1.apps.googleusercontent.com';
/** @type {string} API client secret.*/
remoting.Settings.prototype.OAUTH2_CLIENT_SECRET = 'Bgur6DFiOMM1h8x-AQpuTQlK';
/** @type {string} Google API Key.*/
remoting.Settings.prototype.GOOGLE_API_KEY = 'AIzaSyAmNf0MwlIinGgiQq3RcpR2TLVj5W5fpXo';

/** @type {string} Base URL for OAuth2 authentication. */
remoting.Settings.prototype.OAUTH2_BASE_URL = 'https://accounts.google.com/o/oauth2';
/** @type {string} Base URL for the OAuth2 API. */
remoting.Settings.prototype.OAUTH2_API_BASE_URL = 'https://www.googleapis.com/oauth2';
/** @type {string} Base URL for the Remoting Directory REST API. */
remoting.Settings.prototype.DIRECTORY_API_BASE_URL = 'https://www.googleapis.com/chromoting/v1';
/** @type {string} URL for the talk gadget web service. */
remoting.Settings.prototype.TALK_GADGET_URL = 'https://chromoting-client.talkgadget.google.com/talkgadget';
/** @type {string} Base URL for the telemetry REST API. */
remoting.Settings.prototype.TELEMETRY_API_BASE_URL = 'https://remoting-pa.googleapis.com/v1/events';

/**
 * @return {string} OAuth2 redirect URI. Note that this needs to be a function
 *     because it gets expanded at compile-time to an expression that involves
 *     a chrome API. Since this file is loaded into the WCS sandbox, which has
 *     no access to these APIs, we can't call it at global scope.
 */
remoting.Settings.prototype.OAUTH2_REDIRECT_URL = function() {
  return 'https://chromoting-oauth.talkgadget.google.com/talkgadget/oauth/chrome-remote-desktop/rel/' + chrome.i18n.getMessage('@@extension_id');
};

/** @type {string} Base URL for the App Remoting API. */
remoting.Settings.prototype.APP_REMOTING_API_BASE_URL =
    'APP_REMOTING_API_BASE_URL';

/** @type {string} XMPP JID for the remoting directory server bot. */
remoting.Settings.prototype.DIRECTORY_BOT_JID = 'remoting@bot.talk.google.com';

// XMPP server connection settings.
/** @type {string} XMPP server name and port. */
remoting.Settings.prototype.XMPP_SERVER = 'talk.google.com:443';
/** @type {boolean} Whether to use TLS on connections to the XMPP server. */
remoting.Settings.prototype.XMPP_SERVER_USE_TLS =
    true;

// Third party authentication settings.
/** @type {string} The third party auth redirect URI. */
remoting.Settings.prototype.THIRD_PARTY_AUTH_REDIRECT_URI =
    'https://chromoting-oauth.talkgadget.google.com/talkgadget/oauth/chrome-remote-desktop/thirdpartyauth';

/** @const {boolean} If true, use GCD instead of Chromoting registry. */
remoting.Settings.prototype.USE_GCD = false;
