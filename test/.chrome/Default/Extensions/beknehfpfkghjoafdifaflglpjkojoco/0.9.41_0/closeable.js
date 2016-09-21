/**
 * @fileoverview Defines a Closeable interface.
 * @author juanlang@google.com (Juan Lang)
 */
'use strict';

/**
 * A closeable interface.
 * @interface
 */
function Closeable() {}

/** Closes this object. */
Closeable.prototype.close = function() {};
