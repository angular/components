// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Class for enabling experimental features.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

var kExperimentsStorageName = 'remoting-experiments';
var ACTIVE_FIELD_TRIALS = {'ChromotingVP9': 'vp9'};

/**
 * @param {Array.<string>} list
 */
function save(list) {
  var storageMap = {};
  storageMap[kExperimentsStorageName] = list;
  chrome.storage.local.set(storageMap);
};

/** @type {Object} */
remoting.experiments = {};

/**
 * Enables an experiment.
 *
 * @param {string} experiment to enable.
 */
remoting.experiments.enable = function(experiment) {
  remoting.experiments.get().then(function(/** Array.<string> */list) {
    if (list.indexOf(experiment) == -1) {
      list.push(experiment);
      save(list);
    }
  });
};

/**
 * Disables an experiment.
 *
 * @param {string} experiment to disable.
 */
remoting.experiments.disable = function(experiment) {
  remoting.experiments.get().then(function(/** Array.<string> */list) {
    list = list.filter(function(e) { return e !== experiment; });
    save(list);
  });
};

/**
 * Determines if the field-trial is enabled for this session.
 *
 * @param {string} trialName The FieldTrial to check for enabling.
 * @return {Promise}
 */
function getTrialState(trialName) {
  var deferred = new base.Deferred();
  chrome.metricsPrivate.getFieldTrial(trialName,
                                      function(/** string */ group) {
                                        if (group == 'Enabled') {
                                          deferred.resolve(true);
                                        } else {
                                          deferred.resolve(false);
                                        }
                                      });
  return deferred.promise();
};

/**
 * Returns list of all enabled experiments.
 * @return {Promise}
 */
remoting.experiments.get = function() {

  var localStorageList = new Promise(function(resolve, reject) {
    chrome.storage.local.get(kExperimentsStorageName, function(items) {
      /** @type {Array<string>} */
      var experiments = new Array();
      if (items.hasOwnProperty(kExperimentsStorageName)) {
        experiments = /** @type {Array<string>} */
            (items[kExperimentsStorageName]);
      }
      resolve(experiments);
    });
  });

  var trialNames = Object.keys(ACTIVE_FIELD_TRIALS);

  return Promise.all([localStorageList].concat(
                         trialNames.map(function(/** string */ trialName) {
                           return getTrialState(trialName);
                         })))
      .then(function(results) {
        /** @type {Array<string>} */
        var list = results[0];
        for (var i = 0; i < trialNames.length; ++i) {
          if (results[i + 1]) {
            list.push(ACTIVE_FIELD_TRIALS[trialNames[i]]);
          }
        }
        return list;
      });
};

})();
