// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * XmppStreamParser is used to parse XMPP stream. Data is fed to the parser
 * using appendData() method and it calls |onStanzaCallback| and
 * |onErrorCallback| specified using setCallbacks().
 *
 * @constructor
 */
remoting.XmppStreamParser = function() {
  /** @type {function(Element):void} @private */
  this.onStanzaCallback_ = function(stanza) {};
  /** @type {function(string):void} @private */
  this.onErrorCallback_ = function(error) {};

  /**
   * Buffer containing the data that has been received but haven't been parsed.
   * @private
   */
  this.data_ = new ArrayBuffer(0);

  /**
   * Current depth in the XML stream.
   * @private
   */
  this.depth_ = 0;

  /**
   * Set to true after error.
   * @private
   */
  this.error_ = false;

  /**
   * The <stream> opening tag received at the beginning of the stream.
   * @private
   */
  this.startTag_ = '';

  /**
   * Closing tag matching |startTag_|.
   * @private
   */
  this.startTagEnd_ = '';

  /**
   * String containing current incomplete stanza.
   * @private
   */
  this.currentStanza_ = '';
}

/**
 * Sets callbacks to be called on incoming stanzas and on error.
 *
 * @param {function(Element):void} onStanzaCallback
 * @param {function(string):void} onErrorCallback
 */
remoting.XmppStreamParser.prototype.setCallbacks =
    function(onStanzaCallback, onErrorCallback) {
  this.onStanzaCallback_ = onStanzaCallback;
  this.onErrorCallback_ = onErrorCallback;
}

/** @param {ArrayBuffer} data */
remoting.XmppStreamParser.prototype.appendData = function(data) {
  console.assert(!this.error_, 'appendData() called in error state.');

  if (this.data_.byteLength > 0) {
    // Concatenate two buffers.
    var newData = new Uint8Array(this.data_.byteLength + data.byteLength);
    newData.set(new Uint8Array(this.data_), 0);
    newData.set(new Uint8Array(data), this.data_.byteLength);
    this.data_ = newData.buffer;
  } else {
    this.data_ = data;
  }

  // Check if the newly appended data completes XML tag or a piece of text by
  // looking for '<' and '>' char codes. This has to be done before converting
  // data to string because the input may not contain complete UTF-8 sequence.
  var tagStartCode = '<'.charCodeAt(0);
  var tagEndCode = '>'.charCodeAt(0);
  var spaceCode = ' '.charCodeAt(0);
  var tryAgain = true;
  while (this.data_.byteLength > 0 && tryAgain && !this.error_) {
    tryAgain = false;

    // If we are not currently in a middle of a stanza then skip spaces (server
    // may send spaces periodically as heartbeats) and make sure that the first
    // character starts XML tag.
    if (this.depth_ <= 1) {
      var view = new DataView(this.data_);
      var firstChar = view.getUint8(0);
      if (firstChar == spaceCode) {
        tryAgain = true;
        this.data_ = this.data_.slice(1);
        continue;
      } else if (firstChar != tagStartCode) {
        var dataAsText = '';
        try {
          dataAsText = base.decodeUtf8(this.data_);
        } catch (exception) {
          dataAsText = 'charCode = ' + firstChar;
        }
        this.processError_('Received unexpected text data: ' + dataAsText);
        return;
      }
    }

    // Iterate over characters in the buffer to find complete tags.
    var view = new DataView(this.data_);
    for (var i = 0; i < view.byteLength; ++i) {
      var currentChar = view.getUint8(i);
      if (currentChar == tagStartCode) {
        if (i > 0) {
          var text = this.extractStringFromBuffer_(i);
          if (text == null)
            return;
          this.processText_(text);
          tryAgain = true;
          break;
        }
      } else if (currentChar == tagEndCode) {
        var tag = this.extractStringFromBuffer_(i + 1);
        if (tag == null)
          return;
        if (tag.charAt(0) != '<') {
          this.processError_('Received \'>\' without \'<\': ' + tag);
          return;
        }
        this.processTag_(tag);
        tryAgain = true;
        break;
      }
    }
  }
}

/**
 * @param {string} text
 * @private
 */
remoting.XmppStreamParser.prototype.processText_ = function(text) {
  // Tokenization code in appendData() shouldn't allow text tokens in between
  // stanzas.
  console.assert(this.depth_ > 1, 'Bad depth: ' + this.depth_ + '.');
  this.currentStanza_ += text;
}

/**
 * @param {string} tag
 * @private
 */
remoting.XmppStreamParser.prototype.processTag_ = function(tag) {
  console.assert(tag.charAt(0) == '<' && tag.charAt(tag.length - 1) == '>',
                 'Malformed tag: ' + tag);

  this.currentStanza_ += tag;

  var openTag = tag.charAt(1) != '/';
  if (openTag) {
    ++this.depth_;
    if (this.depth_ == 1) {
      this.startTag_ = this.currentStanza_;
      this.currentStanza_ = '';

      // Create end tag matching the start.
      var tagName =
          this.startTag_.substr(1, this.startTag_.length - 2).split(' ', 1)[0];
      this.startTagEnd_ = '</' + tagName + '>';

      // Try parsing start together with the end
      var parsed = this.parseTag_(this.startTag_ + this.startTagEnd_);
      if (!parsed) {
        this.processError_('Failed to parse start tag: ' + this.startTag_);
        return;
      }
    }
  }

  var closingTag =
      (tag.charAt(1) == '/') || (tag.charAt(tag.length - 2) == '/');
  if (closingTag) {
    // The first start tag is not expected to be closed.
    if (this.depth_ <= 1) {
      this.processError_('Unexpected closing tag: ' + tag)
      return;
    }
    --this.depth_;
    if (this.depth_ == 1) {
      this.processCompleteStanza_();
      this.currentStanza_ = '';
    }
  }
}

/**
 * @private
 */
remoting.XmppStreamParser.prototype.processCompleteStanza_ = function() {
  var stanza = this.startTag_ + this.currentStanza_ + this.startTagEnd_;
  var parsed = this.parseTag_(stanza);
  if (!parsed) {
    this.processError_('Failed to parse stanza: ' + this.currentStanza_);
    return;
  }
  this.onStanzaCallback_(parsed.firstElementChild);
}

/**
 * @param {string} text
 * @private
 */
remoting.XmppStreamParser.prototype.processError_ = function(text) {
  this.onErrorCallback_(text);
  this.error_ = true;
}

/**
 * Helper to extract and decode |bytes| bytes from |data_|. Returns NULL in case
 * the buffer contains invalidUTF-8.
 *
 * @param {number} bytes Specifies how many bytes should be extracted.
 * @returns {string?}
 * @private
 */
remoting.XmppStreamParser.prototype.extractStringFromBuffer_ = function(bytes) {
  var result = '';
  try {
    result = base.decodeUtf8(this.data_.slice(0, bytes));
  } catch (exception) {
    this.processError_('Received invalid UTF-8 data.');
    result = null;
  }
  this.data_ = this.data_.slice(bytes);
  return result;
}

/**
 * @param {string} text
 * @return {Element}
 * @private
 */
remoting.XmppStreamParser.prototype.parseTag_ = function(text) {
  /** @type {Document} */
  var result = new DOMParser().parseFromString(text, 'text/xml');
  if (result.querySelector('parsererror') != null)
    return null;
  return result.firstElementChild;
}
