/**
 * @fileoverview Description of this file.
 */

/**
 * @constructor
 * @param {boolean} forceLocalAgent Whether to force this helper to send all
 *     its messages to the local agent for handling.
 * @extends {ExternalHelper}
 */
function SshForwardHelper(forceLocalAgent) {
  var localArgs = [SshForwardHelper.CONFIG];
  ExternalHelper.apply(this, localArgs.concat(arguments));
  /** @private {boolean} */
  this.forceLocalAgent_ = forceLocalAgent;
}

inherits(SshForwardHelper, ExternalHelper);

/**
 * Gets a handler for a request.
 * @param {HelperRequest} request The request to handle.
 * @return {RequestHandler} A handler for the request.
 */
SshForwardHelper.prototype.getHandler = function(request) {
  if (this.forceLocalAgent_ || request.type == 'auth-agent@openssh.com') {
    // If the user wants, force all messages to the local agent.
    // For SSH agent requests, tell the external helper always to go to its
    // local agent, in case the local agent has to support SSH agent features
    // gnubbyd cannot. (If the local agent isn't present, gnubbyd will still
    // act as the fallback.)
    request['localAlways'] = true;
  }
  return ExternalHelper.prototype.getHandler.call(this, request);
};

/**
 * @type {string}
 * @const
 */
SshForwardHelper.APP_ID = 'com.google.gnubby.native_helper';

/**
 * @type {ExternalHelperConfig}
 * @const
 */
SshForwardHelper.CONFIG = {
  source: 'SSH',
  appId: SshForwardHelper.APP_ID,
  sendMessage: chrome.runtime.sendNativeMessage,
  defaultError: -GnubbyDevice.NOTREMOTE
};

/**
 * Checks whether to retry with local devices with the given error code from the
 * SSH forward helper.
 * @param {number} code error code
 * @return {boolean} whether to retry with local devices with this error.
 */
SshForwardHelper.checkErrorCodeForRetry = function(code) {
  if (code == -GnubbyDevice.NOTREMOTE || code == -GnubbyDevice.COULDNOTDIAL)
    return true;
  return false;
};

/**
 * Determine (asynchronously) whether the SSH forward helper is installed.
 * @param {RegisteringHelper} registeringHelper
 * @return {Promise} Promise for the result of checking for the SSH forward
 *     helper.
 */
SshForwardHelper.lookForSshForwardHelper = function(registeringHelper) {
  return new Promise(function(resolve) {
    SshForwardHelper.CONFIG.sendMessage(
        SshForwardHelper.CONFIG.appId,
        {},
        function(response) {
          // Got a response, doesn't matter what it is. What matters is if there
          // was an error:
          if (chrome.runtime.lastError) {
            console.log(UTIL_fmt('SSH forward helper not installed:'));
            console.log(UTIL_fmt(chrome.runtime.lastError.message));
            resolve();
            return;
          }
          // If there wasn't an error, the remote helper exists/can be run, so
          // register it.
          // Check whether the user wants to get force all messages to the
          // local agent first:
          chrome.storage.local.get('ssh_forward_force_local_agent',
              function(stored) {
                var forceLocal = false;
                if (!chrome.runtime.lastError && stored &&
                    stored['ssh_forward_force_local_agent']) {
                  forceLocal = true;
                }
                console.log(UTIL_fmt(
                    'SSH forward helper installed, forceLocal = ' +
                    forceLocal));
                var sshForwardHelper = new SshForwardHelper(forceLocal);
                registeringHelper.addHelper(
                    sshForwardHelper,
                    RegisteringHelper.Priority.REMOTE_FORWARDING_PRIORITY,
                    SshForwardHelper.checkErrorCodeForRetry);
                resolve();
              });
        });
  });
};
