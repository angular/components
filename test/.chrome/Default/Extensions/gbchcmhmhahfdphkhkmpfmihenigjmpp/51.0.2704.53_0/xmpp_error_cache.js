// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

/**
 * This class monitors incoming XMPP stanza and records the first
 * error encountered.  It also strips all PII from the error stanza,
 * so that it can be uploaded to the cloud for error analysis.
 *
 * @constructor
 */

remoting.XmppErrorCache = function() {
  /** @private {string} */
  this.firstErrorStanza_ = '';
};

/**
 * @return {string} The first XMPP error stanza that the monitor encountered.
 *     Returns an empty string if no errors have been encountered so far.
 */
remoting.XmppErrorCache.prototype.getFirstErrorStanza = function() {
  return this.firstErrorStanza_;
};

/**
 * Monitor the incoming stanza for error.
 *
 * @param {Element} iqNode
 */
remoting.XmppErrorCache.prototype.processStanza = function(iqNode) {
  if (this.firstErrorStanza_ != '') {
    return;
  }
  // The XML structure is as follows:
  // <iq type='error'>
  //   <jingle action='session-accept'/>
  //   <error type='modify' code=''/>
  // </iq>
  if (iqNode.getAttribute('type') != 'error') {
    return;
  }

  var strippedStanza = this.stripPII_(iqNode);
  this.firstErrorStanza_ = strippedStanza;
};

/**
 * @param {Element} iqNode
 * @return {string} Return a string representation of |iqNode| with all PII
 *    removed.
 * @private
 */
remoting.XmppErrorCache.prototype.stripPII_ = function(iqNode) {
  var parser = new DOMParser();
  var outDocument = parser.parseFromString('<iq/>', 'text/xml');
  stripPII(iqNode, outDocument.firstElementChild);
  return new XMLSerializer().serializeToString(outDocument.firstElementChild);
};

/**
 * @param {Element} node
 * @param {Element} outNode
 */
function stripPII(node, outNode) {
  var attributesWhiteList = new Set([
    'action',
    'code',
    'codec',
    'creator',
    'height',
    'id',
    'name',
    'sid',
    'supported-methods',
    'transport',
    'type',
    'version',
    'width',
    'xmlns',
  ]);

  var nodesWhiteList = new Set([
    'jingle',
    'content',
    'description',
    'error',
    'standard-ice',
    'control',
    'event',
    'video',
    'audio',
    'initial-resolution',
    'authentication',
    'service-unavailable'
  ]);

  // Strip PII from attributes.
  var attributes = node.attributes;
  for (var i = 0; i < attributes.length; i++) {
    var attribute = /** @type {Attr} */ (attributes[i]);
    var value = 'REDACTED';
    if (attributesWhiteList.has(attribute.nodeName)) {
      value = attribute.nodeValue;
    }
    outNode.setAttribute(attribute.nodeName, value);
  }

  // Copy the text content.
  if (node.childNodes.length == 1 &&
      node.firstChild.nodeType == Node.TEXT_NODE) {
    var textValue = 'REDACTED';
    if (nodesWhiteList.has(node.tagName)) {
      textValue = node.firstChild.nodeValue;
    }
    outNode.appendChild(outNode.ownerDocument.createTextNode(textValue));
    return;
  }

  // Strip PII from child nodes.
  var children = node.children;
  for (i = 0; i < children.length; i++) {
    var child = /** @type{Element}*/ (children[i]);
    var childCopy = outNode.ownerDocument.createElement(child.tagName);
    outNode.appendChild(childCopy);
    stripPII(child, childCopy);
  }
}

})();
