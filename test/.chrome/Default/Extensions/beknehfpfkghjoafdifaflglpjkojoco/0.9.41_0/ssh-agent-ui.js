/**
 * @fileoverview UI for ssh-agent
 */

/**
 * @constructor
 */
function SshAgentUI() {
  this.input = [];
  this.appwindow = null;
  this.timeoutId = 0;
}

/**
 * Stop showing the UI.
 */
SshAgentUI.prototype.cancel = function() {
  window.clearTimeout(this.timeoutId);
  if (this.appwindow) {
    this.appwindow.close();
    this.appwindow = null;
  }
};

/**
 * @param {string} msg to display.
 * @param {number=} timeout to stop showing.
 * @param {Function=} onFailure callback.
 */
SshAgentUI.prototype.showMessage = function(msg, timeout, onFailure) {
  window.clearTimeout(this.timeoutId);

  if (timeout) {
    this.timeoutId = window.setTimeout(
        this.cancel.bind(this),
        timeout);
  }

  if (!this.appwindow) {
    var self = this;
    chrome.app.window.create(
        'touch.html',
        {
        'frame': 'none',
        'minWidth': 640,
        'maxWidth': 640,
        'minHeight': 170,
        'maxHeight': 170
        },
        function(w) {
          self.appwindow = w;
          w.drawAttention();

          // At this point window.onload has not run yet.
          // Create function that window.onload will call.
          var win = w.contentWindow;
          var doc = win.document;
          win.ui_onload = function() {
            doc.getElementById('status-text').innerText = msg;
            doc.body.onkeydown = function(e) {
              if (e.keyCode == 27 /*ESC*/) {
                e.preventDefault();
                e.stopPropagation();
                self.cancel();
                if (onFailure) onFailure.call(self);
              }
            };
          };
        });
  } else {
    this.appwindow.drawAttention();
    var doc = this.appwindow.contentWindow.document;
    doc.getElementById('status-text').innerText = msg;
  }
};

/**
 * @param {string} msg to display.
 * @param {Function} onSuccess callback.
 * @param {Function} onFailure callback.
 */
SshAgentUI.prototype.getPIN = function(msg, onSuccess, onFailure) {
  this.cancel();

  var self = this;
  chrome.app.window.create(
      'pin.html',
      {
        'frame': 'none',
        'minWidth': 640,
        'maxWidth': 640,
        'minHeight': 170,
        'maxHeight': 170
      },
      function(w) {
        self.appwindow = w;
        w.drawAttention();

        // At this point window.onload has not run yet.
        // Create function that window.onload will call.
        var win = w.contentWindow;
        var doc = win.document;
        win.ui_onload = function() {
          doc.getElementById('status-text').innerText = msg;
          doc.getElementById('pin').focus();
          doc.getElementById('pin').onchange = function(e) {
            self.input = UTIL_StringToBytes(e.srcElement.value);
            self.cancel();
            onSuccess.call(self);
          };
          doc.body.onkeydown = function(e) {
            if (e.keyCode == 27 /*ESC*/) {
              e.preventDefault();
              e.stopPropagation();
              self.cancel();
              onFailure.call(self);
            }
          };
        };
      });
};
