/**
 * @fileoverview Applet update window for gnubby.
 */

window.addEventListener('message', function(event) {
  if (event.data.type == 'update-failed') {
    var innerText;
    switch (event.data.rc) {
      case 403:  // RC_FORBIDDEN: No GMC.
        innerText = 'Security Key cannot be updated from this machine.\n';
        innerText += 'Please see Techstop.';
        break;

      case 412:  // RC_PRECOND_FAILED: No CPLC.
        innerText = 'This Security Key cannot be updated at this time.\n';
        innerText += 'Please see Techstop.';
        break;

      default:
        innerText = 'Update failed. Try again?';
        break;
    }
    document.getElementById('status-text').innerText = innerText;
  }
}, false);
