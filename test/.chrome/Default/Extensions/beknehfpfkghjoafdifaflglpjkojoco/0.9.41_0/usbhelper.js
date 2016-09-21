/**
 * @fileoverview Implements a helper using USB gnubbies.
 * @author juanlang@google.com (Juan Lang)
 */
'use strict';

/**
 * @constructor
 * @extends {GenericRequestHelper}
 */
function UsbHelper() {
  GenericRequestHelper.apply(this, arguments);

  var self = this;
  this.registerHandlerFactory('enroll_helper_request', function(request) {
    return new UsbEnrollHandler(/** @type {EnrollHelperRequest} */ (request));
  });
  this.registerHandlerFactory('sign_helper_request', function(request) {
    return new UsbSignHandler(/** @type {SignHelperRequest} */ (request));
  });
}

inherits(UsbHelper, GenericRequestHelper);
