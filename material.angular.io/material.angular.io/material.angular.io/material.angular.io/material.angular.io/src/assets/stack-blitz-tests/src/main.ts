import './polyfills';
import './test/jasmine-setup';
import 'jasmine-core/lib/jasmine-core/jasmine-html.js';
import 'jasmine-core/lib/jasmine-core/boot.js';
import './test.ts';
import './app/material-docs-example.spec';

(function bootstrap() {
  if ((window as any).jasmineRef) {
    location.reload();
    return;
  }

  window.onload?.(new Event('anything'));
  (window as any).jasmineRef = jasmine.getEnv();
})();
