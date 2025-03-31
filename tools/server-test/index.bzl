load("@aspect_rules_js//js:defs.bzl", "js_test")

"""
  Runs a given test together with the specified server. The server executable is expected
  to support a `--port` command line flag. The chosen available port is then set as environment
  variable so that the test environment can connect to the server. Use `TEST_SERVER_PORT`.
"""

def server_test(server, test, **kwargs):
    js_test(
        data = [server, test, "//tools/server-test:test_runner_lib"],
        args = ["$(rootpath %s)" % server, "$(rootpath %s)" % test],
        entry_point = "//tools/server-test:test-runner.js",
        **kwargs
    )
