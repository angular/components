// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * A module that contains basic utility components and methods for the
 * chromoting project
 *
 */

'use strict';

/** @suppress {duplicate} */
var base = base || {};

/**
 * @interface
 */
base.Disposable = function() {};
base.Disposable.prototype.dispose = function() {};

/**
 * @constructor
 * @param {...base.Disposable} var_args
 * @implements {base.Disposable}
 * @suppress {reportUnknownTypes}
 */
base.Disposables = function(var_args) {
  /**
   * @type {Array<base.Disposable>}
   * @private
   */
  this.disposables_ = Array.prototype.slice.call(arguments, 0);
};

/**
 * @param {...base.Disposable} var_args
 * @suppress {reportUnknownTypes}
 */
base.Disposables.prototype.add = function(var_args) {
  var disposables = Array.prototype.slice.call(arguments, 0);
  for (var i = 0; i < disposables.length; i++) {
    var current = /** @type {base.Disposable} */ (disposables[i]);
    if (this.disposables_.indexOf(current) === -1) {
      this.disposables_.push(current);
    }
  }
};

/**
 * @param {...base.Disposable} var_args  Dispose |var_args| and remove
 *    them from the current object.
 * @suppress {reportUnknownTypes}
 */
base.Disposables.prototype.remove = function(var_args) {
  var disposables = Array.prototype.slice.call(arguments, 0);
  for (var i = 0; i < disposables.length; i++) {
    var disposable = /** @type {base.Disposable} */ (disposables[i]);
    var index = this.disposables_.indexOf(disposable);
    if(index !== -1) {
      this.disposables_.splice(index, 1);
      disposable.dispose();
    }
  }
};

base.Disposables.prototype.dispose = function() {
  for (var i = 0; i < this.disposables_.length; i++) {
    this.disposables_[i].dispose();
  }
  this.disposables_ = null;
};

/**
 * A utility function to invoke |obj|.dispose without a null check on |obj|.
 * @param {base.Disposable} obj
 */
base.dispose = function(obj) {
  if (obj) {
    console.assert(typeof obj.dispose == 'function',
                   'dispose() should have type function, not ' +
                   typeof obj.dispose + '.');
    obj.dispose();
  }
};

/**
 * Copy all properties from src to dest.
 * @param {Object} dest
 * @param {Object} src
 */
base.mix = function(dest, src) {
  for (var prop in src) {
    if (src.hasOwnProperty(prop) && !(prop in dest)) {
      dest[prop] = src[prop];
    }
  }
};

/**
 * Adds a mixin to a class.
 * @param {Object} dest
 * @param {Object} src
 * @suppress {checkTypes|reportUnknownTypes}
 */
base.extend = function(dest, src) {
  base.mix(dest.prototype, src.prototype || src);
};

/**
 * Inherits properties and methods from |parentCtor| at object construction time
 * using prototypical inheritance. e.g.
 *
 * var ParentClass = function(parentArg) {
 *   this.parentProperty = parentArg;
 * }
 *
 * var ChildClass = function() {
 *   base.inherits(this, ParentClass, 'parentArg'); // must be the first line.
 * }
 *
 * var child = new ChildClass();
 * child instanceof ParentClass // true
 *
 * See base_inherits_unittest.js for the guaranteed behavior of base.inherits().
 * This lazy approach is chosen so that it is not necessary to maintain proper
 * script loading order between the parent class and the child class.
 *
 * @param {*} childObject
 * @param {*} parentCtor
 * @param {...} parentCtorArgs
 * @suppress {checkTypes|reportUnknownTypes}
 */
base.inherits = function(childObject, parentCtor, parentCtorArgs) {
  console.assert(parentCtor && parentCtor.prototype,
                 'Invalid parent constructor.');
  var parentArgs = Array.prototype.slice.call(arguments, 2);

  // Mix in the parent's prototypes so that they're available during the parent
  // ctor.
  base.mix(childObject, parentCtor.prototype);
  parentCtor.apply(childObject, parentArgs);

  // Note that __proto__ is deprecated.
  //   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/
  //   Global_Objects/Object/proto.
  // It is used so that childObject instanceof parentCtor will
  // return true.
  childObject.__proto__.__proto__ = parentCtor.prototype;
  console.assert(childObject instanceof parentCtor,
                 'child is not an instance of parent.');
};

base.doNothing = function() {};

/**
 * Returns an array containing the values of |dict|.
 * @param {!Object} dict
 * @return {Array}
 */
base.values = function(dict) {
  return Object.keys(dict).map(
    /** @param {string} key */
    function(key) {
      return dict[key];
    });
};

/**
 * @param {*} value
 * @return {*} a recursive copy of |value| or null if |value| is not copyable
 *   (e.g. undefined, NaN).
 */
base.deepCopy = function(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (e) {}
  return null;
};

/**
 * Returns a copy of the input object with all null/undefined fields
 * removed.  Returns an empty object for a null/undefined input.
 *
 * @param {Object<?T>|undefined} input
 * @return {!Object<T>}
 * @template T
 */
base.copyWithoutNullFields = function(input) {
  var result = {};
  base.mergeWithoutNullFields(result, input);
  return result;
};

/**
 * Merge non-null fields of |src| into |dest|.
 *
 * @param {!Object<T>} dest
 * @param {Object<?T>|undefined} src
 * @template T
 */
base.mergeWithoutNullFields = function(dest, src) {
  if (src) {
    for (var field in src) {
      var value = /** @type {*} */ (src[field]);
      if (value != null) {
        dest[field] = base.deepCopy(value);
      }
    }
  }
};

/**
 * @param {!Object} object
 * @return {boolean} True if the object is empty (equal to {}); false otherwise.
 */
base.isEmptyObject = function(object) {
  return Object.keys(object).length === 0;
};

/**
 * @type {boolean|undefined}
 * @private
 */
base.isAppsV2_ = undefined;

/**
 * @return {boolean} True if this is a v2 app; false if it is a legacy app.
 */
base.isAppsV2 = function() {
  if (base.isAppsV2_ === undefined) {
    var manifest = chrome.runtime.getManifest();
    base.isAppsV2_ =
        Boolean(manifest && manifest.app && manifest.app.background);
  }
  return base.isAppsV2_;
};

/**
 * Joins the |url| with optional query parameters defined in |opt_params|
 * See unit test for usage.
 * @param {string} url
 * @param {Object<string>=} opt_params
 * @return {string}
 */
base.urlJoin = function(url, opt_params) {
  if (!opt_params) {
    return url;
  }
  var queryParameters = [];
  for (var key in opt_params) {
    queryParameters.push(encodeURIComponent(key) + "=" +
                         encodeURIComponent(opt_params[key]));
  }
  return url + '?' + queryParameters.join('&');
};


/**
 * @return {Object<string>} The URL parameters.
 */
base.getUrlParameters = function() {
  var result = {};
  var parts = window.location.search.substring(1).split('&');
  for (var i = 0; i < parts.length; i++) {
    var pair = parts[i].split('=');
    result[pair[0]] = decodeURIComponent(pair[1]);
  }
  return result;
};

/**
 * Convert special characters (e.g. &, < and >) to HTML entities.
 *
 * @param {string} str
 * @return {string}
 */
base.escapeHTML = function(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

/**
 * Promise is a great tool for writing asynchronous code. However, the construct
 *   var p = new promise(function init(resolve, reject) {
 *     ... // code that fulfills the Promise.
 *   });
 * forces the Promise-resolving logic to reside in the |init| function
 * of the constructor.  This is problematic when you need to resolve the
 * Promise in a member function(which is quite common for event callbacks).
 *
 * base.Deferred comes to the rescue.  It encapsulates a Promise
 * object and exposes member methods (resolve/reject) to fulfill it.
 *
 * Here are the recommended steps to follow when implementing an asynchronous
 * function that returns a Promise:
 * 1. Create a deferred object by calling
 *      var deferred = new base.Deferred();
 * 2. Call deferred.resolve() when the asynchronous operation finishes.
 * 3. Call deferred.reject() when the asynchronous operation fails.
 * 4. Return deferred.promise() to the caller so that it can subscribe
 *    to status changes using the |then| handler.
 *
 * Sample Usage:
 *  function myAsyncAPI() {
 *    var deferred = new base.Deferred();
 *    window.setTimeout(function() {
 *      deferred.resolve();
 *    }, 100);
 *    return deferred.promise();
 *  };
 *
 * @constructor
 * @template T
 */
base.Deferred = function() {
  /**
   * @private {?function(?):void}
   */
  this.resolve_ = null;

  /**
   * @private {?function(?):void}
   */
  this.reject_ = null;

  /**
   * @this {base.Deferred}
   * @param {function(?):void} resolve
   * @param {function(*):void} reject
   */
  var initPromise = function(resolve, reject) {
    this.resolve_ = resolve;
    this.reject_ = reject;
  };

  /**
   * @private {!Promise<T>}
   */
  this.promise_ = new Promise(initPromise.bind(this));
};

/** @param {*} reason */
base.Deferred.prototype.reject = function(reason) {
  this.reject_(reason);
};

/** @param {*=} opt_value */
base.Deferred.prototype.resolve = function(opt_value) {
  this.resolve_(opt_value);
};

/** @return {!Promise<T>} */
base.Deferred.prototype.promise = function() {
  return this.promise_;
};

base.Promise = function() {};

/**
 * @param {number} delay
 * @param {*=} opt_value
 * @return {!Promise} a Promise that will be fulfilled with |opt_value|
 *     after |delay| ms.
 */
base.Promise.sleep = function(delay, opt_value) {
  return new Promise(
    function(resolve) {
      window.setTimeout(function() {
        resolve(opt_value);
      }, delay);
    });
};

/**
 * @param {Promise} promise
 * @return {Promise} a Promise that will be fulfilled iff the specified Promise
 *     is rejected.
 */
base.Promise.negate = function(promise) {
  return promise.then(
      /** @return {Promise} */
      function() {
        return Promise.reject();
      },
      /** @return {Promise} */
      function() {
        return Promise.resolve();
      });
};

/**
 * Creates a promise that will be fulfilled within a certain timeframe.
 *
 * This function creates a result promise |R| that will be resolved to
 * either |promise| or |opt_defaultValue|.  If |promise| is fulfulled
 * (i.e. resolved or rejected) within |delay| milliseconds, then |R|
 * is resolved with |promise|.  Otherwise, |R| is resolved with
 * |opt_defaultValue|.
 *
 * Avoid passing a promise as |opt_defaultValue|, as this could result
 * in |R| remaining unfulfilled after |delay| milliseconds.
 *
 * @param {!Promise<T>} promise The promise to wrap.
 * @param {number} delay The number of milliseconds to wait.
 * @param {*=} opt_defaultValue The default value used to resolve the
 *     result.
 * @return {!Promise<T>} A new promise.
 * @template T
 */
base.Promise.withTimeout = function(promise, delay, opt_defaultValue) {
  return Promise.race([promise, base.Promise.sleep(delay, opt_defaultValue)]);
};

/**
 * Creates a promise that will be rejected if it is not fulfilled within a
 * certain timeframe.
 *
 * This function creates a result promise |R|.  If |promise| is fulfilled
 * (i.e. resolved or rejected) within |delay| milliseconds, then |R|
 * is resolved or rejected, respectively.  Otherwise, |R| is rejected with
 * |opt_defaultError|.
 *
 * @param {!Promise<T>} promise The promise to wrap.
 * @param {number} delay The number of milliseconds to wait.
 * @param {*=} opt_defaultError The default error used to reject the promise.
 * @return {!Promise<T>} A new promise.
 * @template T
 */
base.Promise.rejectAfterTimeout = function(promise, delay, opt_defaultError) {
  return Promise.race([
    promise,
    base.Promise.sleep(delay).then(function() {
      return Promise.reject(opt_defaultError);
    })
  ]);
};

/**
 * Converts a |method| with callbacks into a Promise.
 *
 * @param {Function} method
 * @param {Array} params
 * @param {*=} opt_context
 * @param {boolean=} opt_hasErrorHandler whether the method has an error handler
 * @return {Promise}
 */
base.Promise.as = function(method, params, opt_context, opt_hasErrorHandler) {
  return new Promise(function(resolve, reject) {
    params.push(resolve);
    if (opt_hasErrorHandler) {
      params.push(reject);
    }
    try {
      method.apply(opt_context, params);
    } catch (/** @type {*} */ e) {
      reject(e);
    }
  });
};

/**
 * A mixin for classes with events.
 *
 * For example, to create an alarm event for SmokeDetector:
 * functionSmokeDetector() {
 *    base.inherits(this, base.EventSourceImpl);
 *    this.defineEvents(['alarm']);
 * };
 *
 * To fire an event:
 * SmokeDetector.prototype.onCarbonMonoxideDetected = function() {
 *   var param = {} // optional parameters
 *   this.raiseEvent('alarm', param);
 * }
 *
 * To listen to an event:
 * var smokeDetector = new SmokeDetector();
 * smokeDetector.addEventListener('alarm', listenerObj.someCallback)
 *
 */

/**
  * Helper interface for the EventSource.
  * @constructor
  */
base.EventEntry = function() {
  /** @type {Array<Function>} */
  this.listeners = [];
};


/** @interface */
base.EventSource = function() {};

 /**
  * Add a listener |fn| to listen to |type| event.
  * @param {string} type
  * @param {Function} fn
  */
base.EventSource.prototype.addEventListener = function(type, fn) {};

 /**
  * Remove a listener |fn| to listen to |type| event.
  * @param {string} type
  * @param {Function} fn
  */
base.EventSource.prototype.removeEventListener = function(type, fn) {};


/**
  * @constructor
  * Since this class is implemented as a mixin, the constructor may not be
  * called.  All initializations should be done in defineEvents.
  * @implements {base.EventSource}
  */
base.EventSourceImpl = function() {
  /** @type {Object<base.EventEntry>} */
  this.eventMap_;
};

/**
  * @param {base.EventSourceImpl} obj
  * @param {string} type
  * @private
  */
base.EventSourceImpl.assertHasEvent_ = function(obj, type) {
  console.assert(Boolean(obj.eventMap_),
                 "The object doesn't support events.");
  console.assert(Boolean(obj.eventMap_[type]),
                 'Event <' + type +'> is undefined for the current object.');
};

base.EventSourceImpl.prototype = {
  /**
    * Define |events| for this event source.
    * @param {Array<string>} events
    */
  defineEvents: function(events) {
    console.assert(!Boolean(this.eventMap_),
                   'defineEvents() can only be called once.');
    this.eventMap_ = {};
    events.forEach(
      /**
        * @this {base.EventSourceImpl}
        * @param {string} type
        */
      function(type) {
        console.assert(typeof type == 'string',
                       'Event name must be a string; found ' + type + '.');
        this.eventMap_[type] = new base.EventEntry();
    }, this);
  },

  /**
    * @param {string} type
    * @param {Function} fn
    */
  addEventListener: function(type, fn) {
    console.assert(typeof fn == 'function',
                   'addEventListener(): event listener for ' + type +
                   ' must be function, not ' + typeof fn + '.');
    base.EventSourceImpl.assertHasEvent_(this, type);

    var listeners = this.eventMap_[type].listeners;
    listeners.push(fn);
  },

  /**
    * @param {string} type
    * @param {Function} fn
    */
  removeEventListener: function(type, fn) {
    console.assert(typeof fn == 'function',
                   'removeEventListener(): event listener for ' + type +
                   ' must be function, not ' + typeof fn + '.');
    base.EventSourceImpl.assertHasEvent_(this, type);

    var listeners = this.eventMap_[type].listeners;
    // find the listener to remove.
    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      if (listener == fn) {
        listeners.splice(i, 1);
        break;
      }
    }
  },

  /**
    * Fire an event of a particular type on this object.
    * @param {string} type
    * @param {*=} opt_details The type of |opt_details| should be ?= to
    *     match what is defined in add(remove)EventListener.  However, JSCompile
    *     cannot handle invoking an unknown type as an argument to |listener|
    *     As a hack, we set the type to *=.
    */
  raiseEvent: function(type, opt_details) {
    base.EventSourceImpl.assertHasEvent_(this, type);

    var entry = this.eventMap_[type];
    var listeners = entry.listeners.slice(0); // Make a copy of the listeners.

    listeners.forEach(
      /** @param {Function} listener */
      function(listener){
        if (listener) {
          listener(opt_details);
        }
    });
  }
};


/**
  * A lightweight object that helps manage the lifetime of an event listener.
  *
  * For example, do the following if you want to automatically unhook events
  * when your object is disposed:
  *
  * var MyConstructor = function(domElement) {
  *   this.eventHooks_ = new base.Disposables(
  *     new base.EventHook(domElement, 'click', this.onClick_.bind(this)),
  *     new base.EventHook(domElement, 'keydown', this.onClick_.bind(this)),
  *     new base.ChromeEventHook(chrome.runtime.onMessage,
  *                              this.onMessage_.bind(this))
  *   );
  * }
  *
  * MyConstructor.prototype.dispose = function() {
  *   this.eventHooks_.dispose();
  *   this.eventHooks_ = null;
  * }
  *
  * @param {base.EventSource} src
  * @param {string} eventName
  * @param {Function} listener
  *
  * @constructor
  * @implements {base.Disposable}
  */
base.EventHook = function(src, eventName, listener) {
  this.src_ = src;
  this.eventName_ = eventName;
  this.listener_ = listener;
  src.addEventListener(eventName, listener);
};

base.EventHook.prototype.dispose = function() {
  this.src_.removeEventListener(this.eventName_, this.listener_);
};

/**
  * An event hook implementation for DOM Events.
  *
  * @param {HTMLElement|Element|Window|HTMLDocument} src
  * @param {string} eventName
  * @param {Function} listener
  * @param {boolean} capture
  *
  * @constructor
  * @implements {base.Disposable}
  */
base.DomEventHook = function(src, eventName, listener, capture) {
  this.src_ = src;
  this.eventName_ = eventName;
  this.listener_ = listener;
  this.capture_ = capture;
  src.addEventListener(eventName, listener, capture);
};

base.DomEventHook.prototype.dispose = function() {
  this.src_.removeEventListener(this.eventName_, this.listener_, this.capture_);
};


/**
  * An event hook implementation for Chrome Events.
  *
  * @param {ChromeEvent|chrome.contextMenus.ClickedEvent|ChromeObjectEvent} src
  * @param {!Function} listener
  *
  * @constructor
  * @implements {base.Disposable}
  */
base.ChromeEventHook = function(src, listener) {
  this.src_ = src;
  this.listener_ = listener;
  src.addListener(listener);
};

base.ChromeEventHook.prototype.dispose = function() {
  this.src_.removeListener(this.listener_);
};

/**
 * A disposable repeating timer.
 *
 * @param {Function} callback
 * @param {number} interval
 * @param {boolean=} opt_invokeNow Whether to invoke the callback now, default
 *    to false.
 *
 * @constructor
 * @implements {base.Disposable}
 */
base.RepeatingTimer = function(callback, interval, opt_invokeNow) {
  /** @private */
  this.intervalId_ = window.setInterval(callback, interval);
  if (opt_invokeNow) {
    callback();
  }
};

base.RepeatingTimer.prototype.dispose = function() {
  window.clearInterval(this.intervalId_);
  this.intervalId_ = null;
};

/**
 * A disposable one shot timer.
 *
 * @param {Function} callback
 * @param {number} timeout
 *
 * @constructor
 * @implements {base.Disposable}
 */
base.OneShotTimer = function(callback, timeout) {
  var that = this;

  /** @private */
  this.timerId_ = window.setTimeout(function() {
    that.timerId_ = null;
    callback();
  }, timeout);
};

base.OneShotTimer.prototype.dispose = function() {
  if (this.timerId_ !== null) {
    window.clearTimeout(this.timerId_);
    this.timerId_ = null;
  }
};

/**
  * Converts UTF-8 string to ArrayBuffer.
  *
  * @param {string} string
  * @return {!ArrayBuffer}
  */
base.encodeUtf8 = function(string) {
  var utf8String = unescape(encodeURIComponent(string));
  var result = new Uint8Array(utf8String.length);
  for (var i = 0; i < utf8String.length; i++)
    result[i] = utf8String.charCodeAt(i);
  return result.buffer;
};

/**
  * Decodes UTF-8 string from ArrayBuffer.
  *
  * @param {ArrayBuffer} buffer
  * @return {string}
  */
base.decodeUtf8 = function(buffer) {
  return decodeURIComponent(
      escape(String.fromCharCode.apply(null, new Uint8Array(buffer))));
};

/**
 * Generate a nonce, to be used as an xsrf protection token.
 *
 * @return {string} A URL-Safe Base64-encoded 128-bit random value. */
base.generateXsrfToken = function() {
  var random = new Uint8Array(16);
  window.crypto.getRandomValues(random);
  var base64Token = window.btoa(String.fromCharCode.apply(null, random));
  return base64Token.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

/**
 * @return {string} A random UUID.
 */
base.generateUuid = function() {
  var random = new Uint16Array(8);
  window.crypto.getRandomValues(random);
  /** @type {Array<string>} */
  var e = new Array();
  for (var i = 0; i < 8; i++) {
    e[i] = (/** @type {number} */ (random[i]) + 0x10000).
        toString(16).substring(1);
  }
  return e[0] + e[1] + '-' + e[2] + '-' + e[3] + '-' +
      e[4] + '-' + e[5] + e[6] + e[7];
};

/**
 * @param {string} jsonString A JSON-encoded string.
 * @return {Object|undefined} The decoded object, or undefined if the string
 *     cannot be parsed.
 */
base.jsonParseSafe = function(jsonString) {
  try {
    return /** @type {Object} */ (JSON.parse(jsonString));
  } catch (err) {
    return undefined;
  }
};

/**
 * Return the current time as a formatted string suitable for logging.
 *
 * @return {string} The current time, formatted as the standard ISO string.
 *     [yyyy-mm-ddDhh:mm:ss.xyz]
 */
base.timestamp = function() {
  return '[' + new Date().toISOString() + ']';
};


/**
 * A online function that can be stubbed by unit tests.
 * @return {boolean}
 */
base.isOnline = function() {
  return navigator.onLine;
};

/**
 * Size the current window to fit its content.
 * @param {boolean=} opt_centerWindow If true, position the window in the
 *     center of the screen after resizing it.
 */
base.resizeWindowToContent = function(opt_centerWindow) {
  var appWindow = chrome.app.window.current();
  var borderX = appWindow.outerBounds.width - appWindow.innerBounds.width;
  var borderY = appWindow.outerBounds.height - appWindow.innerBounds.height;
  var width = Math.ceil(document.documentElement.scrollWidth + borderX);
  var height = Math.ceil(document.documentElement.scrollHeight + borderY);
  appWindow.outerBounds.width = width;
  appWindow.outerBounds.height = height;
  if (opt_centerWindow) {
    var screenWidth = screen.availWidth;
    var screenHeight = screen.availHeight;
    appWindow.outerBounds.left = Math.round((screenWidth - width) / 2);
    appWindow.outerBounds.top = Math.round((screenHeight - height) / 2);
  }
};

/**
 * @return {boolean} Whether NaCL is enabled in chrome://plugins.
 */
base.isNaclEnabled = function() {
  for (var i = 0; i < navigator.mimeTypes.length; i++) {
    if (navigator.mimeTypes.item(i).type == 'application/x-pnacl') {
      return true;
    }
  }
  return false;
};

/**
 * Alias for document.getElementById that returns an HTMLElement
 * @param {string} id The ID of the element to find.
 * @return {?HTMLElement} The found element or null if not found.
 */
base.getHtmlElement = function(id) {
  var el = document.getElementById(id);
  if (el)
    console.assert(el instanceof HTMLElement);
  return /** @type {HTMLElement} */(el);
};
