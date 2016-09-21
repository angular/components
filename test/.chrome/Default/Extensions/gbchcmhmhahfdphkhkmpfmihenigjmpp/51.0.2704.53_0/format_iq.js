// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Module to format IQ messages so they can be displayed in the debug log.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * @constructor
 * @param {string} clientJid
 * @param {string} hostJid
 */
remoting.FormatIq = function(clientJid, hostJid) {
  /** @private */
  this.clientJid_ = clientJid;
  /** @private */
  this.hostJid_ = hostJid;
};

/**
 * Verify that the only attributes on the given |node| are those specified
 * in the |attrs| string.
 *
 * @param {Node} node The node to verify.
 * @param {string} validAttrs Comma-separated list of valid attributes.
 *
 * @return {boolean} True if the node contains only valid attributes.
 */
remoting.FormatIq.prototype.verifyAttributes = function(node, validAttrs) {
  var attrs = ',' + validAttrs + ',';
  var len = node.attributes.length;
  for (var i = 0; i < len; i++) {
    /** @type {Node} */
    var attrNode = node.attributes[i];
    var attr = attrNode.nodeName;
    if (attrs.indexOf(',' + attr + ',') == -1) {
      return false;
    }
  }
  return true;
};

/**
 * Calculate the 'pretty' version of data from the |server| node.
 *
 * @param {Node} server Xml node with server info.
 *
 * @return {?string} Formatted server string. Null if error.
 */
remoting.FormatIq.prototype.calcServerString = function(server) {
  if (!this.verifyAttributes(server, 'host,udp,tcp,tcpssl')) {
    return null;
  }
  var host = server.getAttribute('host');
  var udp = server.getAttribute('udp');
  var tcp = server.getAttribute('tcp');
  var tcpssl = server.getAttribute('tcpssl');

  var str = "'" + host + "'";
  if (udp)
    str += ' udp:' + udp;
  if (tcp)
    str += ' tcp:' + tcp;
  if (tcpssl)
    str += ' tcpssl:' + tcpssl;

  str += '; ';
  return str;
};

/**
 * Calc the 'pretty' version of channel data.
 *
 * @param {Node} channel Xml node with channel info.
 *
 * @return {?string} Formatted channel string. Null if error.
 */
remoting.FormatIq.prototype.calcChannelString = function(channel) {
  var name = channel.nodeName;
  if (!this.verifyAttributes(channel, 'transport,version,codec')) {
    return null;
  }
  var transport = channel.getAttribute('transport');
  var version = channel.getAttribute('version');

  var str = name + ' ' + transport + ' v' + version;
  if (name == 'video') {
    str += ' codec=' + channel.getAttribute('codec');
  }
  str += '; ';
  return str;
};

/**
 * Pretty print the jingleinfo from the given Xml node.
 *
 * @param {Node} query Xml query node with jingleinfo in the child nodes.
 *
 * @return {?string} Pretty version of jingleinfo. Null if error.
 */
remoting.FormatIq.prototype.prettyJingleinfo = function(query) {
  var nodes = query.childNodes;
  var stun_servers = '';
  var result = '';
  for (var i = 0; i < nodes.length; i++) {
    /** @type {Node} */
    var node = nodes[i];
    var name = node.nodeName;
    if (name == 'stun') {
      var sserver = '';
      var stun_nodes = node.childNodes;
      for(var s = 0; s < stun_nodes.length; s++) {
        /** @type {Node} */
        var stun_node = stun_nodes[s];
        var sname = stun_node.nodeName;
        if (sname == 'server') {
          var stun_str = this.calcServerString(stun_node);
          if (!stun_str) {
            return null;
          }
          sserver += stun_str;
        }
      }
      result += '\n  stun ' + sserver;
    } else if (name == 'relay') {
      var token = '';
      var rserver = '';
      var relay_nodes = node.childNodes;
      for(var r = 0; r < relay_nodes.length; r++) {
        /** @type {Node} */
        var relay_node = relay_nodes[r];
        var rname = relay_node.nodeName;
        if (rname == 'token') {
          token = token + relay_node.textContent;
        }
        if (rname == 'server') {
          var relay_str = this.calcServerString(relay_node);
          if (!relay_str) {
            return null;
          }
          rserver += relay_str;
        }
      }
      result += '\n  relay ' + rserver + ' token: ' + token;
    } else {
      return null;
    }
  }

  return result;
};

/**
 * Pretty print the session-initiate or session-accept info from the given
 * Xml node.
 *
 * @param {Node} jingle Xml node with jingle session-initiate or session-accept
 *                      info contained in child nodes.
 *
 * @return {?string} Pretty version of jingle stanza. Null if error.
 */
remoting.FormatIq.prototype.prettySessionInitiateAccept = function(jingle) {
  if (jingle.childNodes.length != 1) {
    return null;
  }
  var content = jingle.firstChild;
  if (content.nodeName != 'content') {
    return null;
  }
  var content_children = content.childNodes;
  var result = '';
  for (var c = 0; c < content_children.length; c++) {
    /** @type {Node} */
    var content_child = content_children[c];
    var cname = content_child.nodeName;
    if (cname == 'description') {
      var channels = '';
      var resolution = '';
      var auth = '';
      var desc_children = content_child.childNodes;
      for (var d = 0; d < desc_children.length; d++) {
        /** @type {Node} */
        var desc = desc_children[d];
        var dname = desc.nodeName;
        if (dname == 'control' || dname == 'event' || dname == 'video') {
          var channel_str = this.calcChannelString(desc);
          if (!channel_str) {
            return null;
          }
          channels += channel_str;
        } else if (dname == 'initial-resolution') {
          resolution = desc.getAttribute('width') + 'x' +
              desc.getAttribute('height');
        } else if (dname == 'authentication') {
          var auth_children = desc.childNodes;
          for (var a = 0; a < auth_children.length; a++) {
            /** @type {Node} */
            var auth_info = auth_children[a];
            if (auth_info.nodeName == 'auth-token') {
              auth = auth + ' (auth-token) ' + auth_info.textContent;
            } else if (auth_info.nodeName == 'certificate') {
              auth = auth + ' (certificate) ' + auth_info.textContent;
            } else if (auth_info.nodeName == 'master-key') {
              auth = auth + ' (master-key) ' + auth_info.textContent;
            } else {
              return null;
            }
          }
        } else {
          return null;
        }
      }
      result += '\n  channels: ' + channels;
      result += '\n  auth: ' + auth;
      result += '\n  initial resolution: ' + resolution;
    } else if (cname == 'transport') {
      // The 'transport' node is currently empty.
      var transport_children = content_child.childNodes;
      if (transport_children.length != 0) {
        return null;
      }
    } else {
      return null;
    }
  }
  return result;
};

/**
 * Pretty print the session-terminate info from the given Xml node.
 *
 * @param {Node} jingle Xml node with jingle session-terminate info contained in
 *                      child nodes.
 *
 * @return {?string} Pretty version of jingle session-terminate stanza. Null if
 *                  error.
 */
remoting.FormatIq.prototype.prettySessionTerminate = function(jingle) {
  if (jingle.childNodes.length != 1) {
    return null;
  }
  var reason = jingle.firstChild;
  if (reason.nodeName != 'reason' || reason.childNodes.length != 1) {
    return null;
  }
  var info = reason.firstChild;
  if (info.nodeName == 'success' || info.nodeName == 'general-error') {
    return '\n  reason=' + info.nodeName;
  }
  return null;
};

/**
 * Pretty print the transport-info info from the given Xml node.
 *
 * @param {Node} jingle Xml node with jingle transport info contained in child
 *                      nodes.
 *
 * @return {?string} Pretty version of jingle transport-info stanza. Null if
 *                  error.
 */
remoting.FormatIq.prototype.prettyTransportInfo = function(jingle) {
  if (jingle.childNodes.length != 1) {
    return null;
  }
  var content = jingle.firstChild;
  if (content.nodeName != 'content') {
    return null;
  }
  var transport = content.firstChild;
  if (transport.nodeName != 'transport') {
    return null;
  }
  var transport_children = transport.childNodes;
  var result = '';
  for (var t = 0; t < transport_children.length; t++) {
    /** @type {Node} */
    var candidate = transport_children[t];
    if (candidate.nodeName != 'candidate') {
      return null;
    }
    if (!this.verifyAttributes(candidate, 'name,address,port,preference,' +
                               'username,protocol,generation,password,type,' +
                               'network')) {
      return null;
    }
    var name = candidate.getAttribute('name');
    var address = candidate.getAttribute('address');
    var port = candidate.getAttribute('port');
    var pref = candidate.getAttribute('preference');
    var username = candidate.getAttribute('username');
    var protocol = candidate.getAttribute('protocol');
    var generation = candidate.getAttribute('generation');
    var password = candidate.getAttribute('password');
    var type = candidate.getAttribute('type');
    var network = candidate.getAttribute('network');

    var info = name + ': ' + address + ':' + port + ' ' + protocol +
        ' name:' + username + ' pwd:' + password +
        ' pref:' + pref +
        ' ' + type;
    if (network) {
      info = info + " network:'" + network + "'";
    }
    result += '\n  ' + info;
  }
  return result;
};

/**
 * Pretty print the jingle action contained in the given Xml node.
 *
 * @param {Node} jingle Xml node with jingle action contained in child nodes.
 * @param {string} action String containing the jingle action.
 *
 * @return {?string} Pretty version of jingle action stanze. Null if error.
 */
remoting.FormatIq.prototype.prettyJingleAction = function(jingle, action) {
  if (action == 'session-initiate' || action == 'session-accept') {
    return this.prettySessionInitiateAccept(jingle);
  }
  if (action == 'session-terminate') {
    return this.prettySessionTerminate(jingle);
  }
  if (action == 'transport-info') {
    return this.prettyTransportInfo(jingle);
  }
  return null;
};

/**
 * Pretty print the jingle error information contained in the given Xml node.
 *
 * @param {Node} error Xml node containing error information in child nodes.
 *
 * @return {?string} Pretty version of error stanze. Null if error.
 */
remoting.FormatIq.prototype.prettyError = function(error) {
  if (!this.verifyAttributes(error, 'xmlns:err,code,type,err:hostname,' +
                             'err:bnsname,err:stacktrace')) {
    return null;
  }
  var code = error.getAttribute('code');
  var type = error.getAttribute('type');
  var hostname = error.getAttribute('err:hostname');
  var bnsname = error.getAttribute('err:bnsname');
  var stacktrace = error.getAttribute('err:stacktrace');

  var result = '\n  error ' + code + ' ' + type + " hostname:'" +
             hostname + "' bnsname:'" + bnsname + "'";
  var children = error.childNodes;
  for (var i = 0; i < children.length; i++) {
    /** @type {Node} */
    var child = children[i];
    result += '\n  ' + child.nodeName;
  }
  if (stacktrace) {
    var stack = stacktrace.split(' | ');
    result += '\n  stacktrace:';
    // We use 'length-1' because the stack trace ends with " | " which results
    // in an empty string at the end after the split.
    for (var s = 0; s < stack.length - 1; s++) {
      result += '\n    ' + stack[s];
    }
  }
  return result;
};

/**
 * Print out the heading line for an iq node.
 *
 * @param {string} action String describing action (send/receive).
 * @param {string} id Packet id.
 * @param {string} desc Description of iq action for this node.
 * @param {string|null} sid Session id.
 *
 * @return {string} Pretty version of stanza heading info.
 */
remoting.FormatIq.prototype.prettyIqHeading = function(action, id, desc,
                                                       sid) {
  var message = 'iq ' + action + ' id=' + id;
  if (desc) {
    message = message + ' ' + desc;
  }
  if (sid) {
    message = message + ' sid=' + sid;
  }
  return message;
};

/**
 * Print out an iq 'result'-type node.
 *
 * @param {string} action String describing action (send/receive).
 * @param {NodeList} iq_list Node list containing the 'result' xml.
 *
 * @return {?string} Pretty version of Iq result stanza. Null if error.
 */
remoting.FormatIq.prototype.prettyIqResult = function(action, iq_list) {
  /** @type {Node} */
  var iq = iq_list[0];
  var id = iq.getAttribute('id');
  var iq_children = iq.childNodes;

  if (iq_children.length == 0) {
    return this.prettyIqHeading(action, id, 'result (empty)', null);
  } else if (iq_children.length == 1) {
    /** @type {Node} */
    var child = iq_children[0];
    if (child.nodeName == 'query') {
      if (!this.verifyAttributes(child, 'xmlns')) {
        return null;
      }
      var xmlns = child.getAttribute('xmlns');
      if (xmlns == 'google:jingleinfo') {
        var result = this.prettyIqHeading(action, id, 'result ' + xmlns, null);
        result += this.prettyJingleinfo(child);
        return result;
      }
      return '';
    } else if (child.nodeName == 'rem:log-result') {
      if (!this.verifyAttributes(child, 'xmlns:rem')) {
        return null;
      }
      return this.prettyIqHeading(action, id, 'result (log-result)', null);
    }
  }
  return null;
};

/**
 * Print out an Iq 'get'-type node.
 *
 * @param {string} action String describing action (send/receive).
 * @param {NodeList} iq_list Node containing the 'get' xml.
 *
 * @return {?string} Pretty version of Iq get stanza. Null if error.
 */
remoting.FormatIq.prototype.prettyIqGet = function(action, iq_list) {
  /** @type {Node} */
  var iq = iq_list[0];
  var id = iq.getAttribute('id');
  var iq_children = iq.childNodes;

  if (iq_children.length != 1) {
    return null;
  }

  /** @type {Node} */
  var query = iq_children[0];
  if (query.nodeName != 'query') {
    return null;
  }
  if (!this.verifyAttributes(query, 'xmlns')) {
    return null;
  }
  var xmlns = query.getAttribute('xmlns');
  return this.prettyIqHeading(action, id, 'get ' + xmlns, null);
};

/**
 * Print out an iq 'set'-type node.
 *
 * @param {string} action String describing action (send/receive).
 * @param {NodeList} iq_list Node containing the 'set' xml.
 *
 * @return {?string} Pretty version of Iq set stanza. Null if error.
 */
remoting.FormatIq.prototype.prettyIqSet = function(action, iq_list) {
  /** @type {Node} */
  var iq = iq_list[0];
  var id = iq.getAttribute('id');
  var iq_children = iq.childNodes;

  var children = iq_children.length;
  if (children == 1) {
    /** @type {Node} */
    var child = iq_children[0];
    if (child.nodeName == 'gr:log') {
      var grlog = child;
      if (!this.verifyAttributes(grlog, 'xmlns:gr')) {
        return null;
      }

      if (grlog.childNodes.length != 1) {
        return null;
      }
      var grentry = grlog.firstChild;
      if (grentry.nodeName != 'gr:entry') {
        return null;
      }
      if (!this.verifyAttributes(grentry, 'role,event-name,session-state,' +
                                 'os-name,cpu,browser-version,' +
                                 'webapp-version')) {
        return null;
      }
      var role = grentry.getAttribute('role');
      var event_name = grentry.getAttribute('event-name');
      var session_state = grentry.getAttribute('session-state');
      var os_name = grentry.getAttribute('os-name');
      var cpu = grentry.getAttribute('cpu');
      var browser_version = grentry.getAttribute('browser-version');
      var webapp_version = grentry.getAttribute('webapp-version');

      var result = this.prettyIqHeading(action, id, role + ' ' + event_name +
                                        ' ' + session_state, null);
      result += '\n  ' + os_name + ' ' + cpu + " browser:" + browser_version +
                     " webapp:" + webapp_version;
      return result;
    }
    if (child.nodeName == 'jingle') {
      var jingle = child;
      if (!this.verifyAttributes(jingle, 'xmlns,action,sid,initiator')) {
        return null;
      }

      var jingle_action = jingle.getAttribute('action');
      var sid = jingle.getAttribute('sid');

      var result = this.prettyIqHeading(action, id, 'set ' + jingle_action,
                                        sid);
      var action_str = this.prettyJingleAction(jingle, jingle_action);
      if (!action_str) {
        return null;
      }
      return result + action_str;
    }
  }
  return null;
};

/**
 * Print out an iq 'error'-type node.
 *
 * @param {string} action String describing action (send/receive).
 * @param {NodeList} iq_list Node containing the 'error' xml.
 *
 * @return {?string} Pretty version of iq error stanza. Null if error parsing
 *                  this stanza.
 */
remoting.FormatIq.prototype.prettyIqError = function(action, iq_list) {
  /** @type {Node} */
  var iq = iq_list[0];
  var id = iq.getAttribute('id');
  var iq_children = iq.childNodes;

  var children = iq_children.length;
  if (children != 2) {
    return null;
  }

  /** @type {Node} */
  var jingle = iq_children[0];
  if (jingle.nodeName != 'jingle') {
    return null;
  }
  if (!this.verifyAttributes(jingle, 'xmlns,action,sid,initiator')) {
    return null;
  }
  var jingle_action = jingle.getAttribute('action');
  var sid = jingle.getAttribute('sid');
  var result = this.prettyIqHeading(action, id, 'error from ' + jingle_action,
                                    sid);
  var action_str = this.prettyJingleAction(jingle, jingle_action);
  if (!action_str) {
    return null;
  }
  result += action_str;

  /** @type {Node} */
  var error = iq_children[1];
  if (error.nodeName != 'cli:error') {
    return null;
  }

  var error_str = this.prettyError(error);
  if (!error_str) {
    return null;
  }
  result += error_str;
  return result;
};

/**
 * Try to log a pretty-print the given IQ stanza (XML).
 * Return true if the stanza was successfully printed.
 *
 * @param {boolean} send True if we're sending this stanza; false for receiving.
 * @param {string} message The XML stanza to add to the log.
 *
 * @return {?string} Pretty version of the Iq stanza. Null if error.
 */
remoting.FormatIq.prototype.prettyIq = function(send, message) {
  var parser = new DOMParser();
  var xml = parser.parseFromString(message, 'text/xml');

  var iq_list = xml.getElementsByTagName('iq');

  if (iq_list && iq_list.length > 0) {
    /** @type {Node} */
    var iq = iq_list[0];
    if (!this.verifyAttributes(iq, 'xmlns,xmlns:cli,id,to,from,type'))
      return null;

    // Verify that the to/from fields match the expected sender/receiver.
    var to = iq.getAttribute('to');
    var from = iq.getAttribute('from');
    var action = '';
    var bot = remoting.settings.DIRECTORY_BOT_JID;
    if (send) {
      if (to && to != this.hostJid_ && to != bot) {
        console.warn('FormatIq: bad to: ' + to);
        return null;
      }
      if (from && from != this.clientJid_) {
        console.warn('FormatIq: bad from: ' + from);
        return null;
      }

      action = "send";
      if (to == bot) {
        action = action + " (to bot)";
      }
    } else {
      if (to && to != this.clientJid_) {
        console.warn('FormatIq: bad to: ' + to);
        return null;
      }
      if (from && from != this.hostJid_ && from != bot) {
        console.warn('FormatIq: bad from: ' + from);
        return null;
      }

      action = "receive";
      if (from == bot) {
        action = action + " (from bot)";
      }
    }

    var type = iq.getAttribute('type');
    if (type == 'result') {
      return this.prettyIqResult(action, iq_list);
    } else if (type == 'get') {
      return this.prettyIqGet(action, iq_list);
    } else if (type == 'set') {
      return this.prettyIqSet(action, iq_list);
    } else  if (type == 'error') {
      return this.prettyIqError(action, iq_list);
    }
  }

  return null;
};

/**
 * Return a pretty-formatted string for the IQ stanza being sent.
 * If the stanza cannot be made pretty, then a string with a raw dump of the
 * stanza will be returned.
 *
 * @param {string} message The XML stanza to make pretty.
 *
 * @return {string} Pretty version of XML stanza being sent. A raw dump of the
 *                  stanza is returned if there was a parsing error.
 */
remoting.FormatIq.prototype.prettifySendIq = function(message) {
  var result = this.prettyIq(true, message);
  if (!result) {
    // Fall back to showing the raw stanza.
    return 'Sending Iq: ' + message;
  }
  return result;
};

/**
 * Return a pretty-formatted string for the IQ stanza that was received.
 * If the stanza cannot be made pretty, then a string with a raw dump of the
 * stanza will be returned.
 *
 * @param {string} message The XML stanza to make pretty.
 *
 * @return {string} Pretty version of XML stanza that was received. A raw dump
 *                  of the stanza is returned if there was a parsing error.
 */
remoting.FormatIq.prototype.prettifyReceiveIq = function(message) {
  var result = this.prettyIq(false, message);
  if (!result) {
    // Fall back to showing the raw stanza.
    return 'Receiving Iq: ' + message;
  }
  return result;
};
