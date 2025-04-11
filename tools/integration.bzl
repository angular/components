load("//:packages.bzl", "ANGULAR_COMPONENTS_SCOPED_PACKAGES")
load("@devinfra//bazel/integration:index.bzl", _integration_test = "integration_test")

LOCAL_NPM_PACKAGES = {
    "//src/%s:npm_package_archive" % (pkg[len("@angular/"):]): pkg
    for pkg in ANGULAR_COMPONENTS_SCOPED_PACKAGES
}

def integration_test(
        data = [],
        environment = {},
        tool_mappings = {},
        toolchains = [],
        setup_chromium = False,
        node_repository = "nodejs",
        **kwargs):
    """Configures an integration test, simulating a real end-user."""

    # Expose pnpm and Node as hermetic tools.
    test_tool_mappings = dict({
        "@pnpm//:pnpm": "pnpm",
        "@%s_toolchains//:resolved_toolchain" % node_repository: "node",
    }, **tool_mappings)
    test_data = data + []
    test_toolchains = toolchains + []
    test_environment = dict({}, **environment)

    # If Chromium should be configured, add it to the runfiles and expose its binaries
    # through test environment variables. The variables are auto-detected by e.g. Karma.
    if setup_chromium:
        test_data.append("@rules_browsers//src/browsers/chromium")
        test_toolchains.append("@rules_browsers//src/browsers/chromium:toolchain_alias")
        test_environment.update({
            "CHROMEDRIVER_BIN": "$(CHROMEDRIVER)",
            "CHROME_BIN": "$(CHROME-HEADLESS-SHELL)",
        })

    _integration_test(
        data = test_data,
        environment = test_environment,
        toolchains = test_toolchains,
        tool_mappings = test_tool_mappings,
        **kwargs
    )
