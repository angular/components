### Server-side debugging app

Application that renders all components on the server and hydrates them on the client. Common tasks:

* Run `yarn universal-app` to start a local server. **Does not support live reload**
* To inspect the server-side-generated HTML, run `yarn universal-app`, visit the local server and
use either the dev tools or "View source" to see the `index.html` provided by the server.
* To test if all components would render on the server, run `yarn bazel test src/universal-app:prerender_test`.
