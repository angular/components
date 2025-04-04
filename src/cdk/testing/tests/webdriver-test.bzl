load("//tools:defaults2.bzl", "jasmine_test", "spec_bundle")
load("//tools/server-test:index.bzl", "server_test")

def webdriver_test(name, deps, tags = [], **kwargs):
    spec_bundle(
        name = "%s_bundle" % name,
        deps = deps,
    )

    jasmine_test(
        name = "%s_jasmine_test" % name,
        tags = tags + ["manual"],
        data = [
            ":%s_bundle" % name,
            "@rules_browsers//src/browsers/chromium",
        ],
        env = {
            "CHROME_HEADLESS_BIN": "$(CHROME-HEADLESS-SHELL)",
            "CHROMEDRIVER": "$(CHROMEDRIVER)",
        },
        toolchains = ["@rules_browsers//src/browsers/chromium:toolchain_alias"],
        **kwargs
    )

    server_test(
        name = "%s_chromium" % name,
        server = "//src/e2e-app:server",
        test = ":%s_jasmine_test" % name,
        tags = tags + ["e2e"],
    )

    native.test_suite(
        name = name,
        tests = [
            ":%s_chromium" % name,
        ],
    )
