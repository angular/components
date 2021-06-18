load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_test")
load("@io_bazel_rules_webtesting//web:web.bzl", "web_test")

def _configure_screenshot_test_target(name, golden, approve_golden, data = [], tags = []):
    nodejs_test(
        name = "%s_nodejs_test_bin" % name,
        data = ["//src/universal-app:ssr_screenshot_test_lib", "//goldens:kitchen-sink-prerendered.png"] + data,
        entry_point = "//src/universal-app:ssr-screenshot-test-runner.ts",
        templated_args = [
            # TODO(josephperrott): update dependency usages to no longer need bazel patch module resolver
            # See: https://github.com/bazelbuild/rules_nodejs/wiki#--bazel_patch_module_resolver-now-defaults-to-false-2324
            "--bazel_patch_module_resolver",
            "$(rootpath %s)" % golden,
            "true" if approve_golden else "false",
        ],
        tags = ["manual"],
    )

    web_test(
        name = name,
        browser = "@npm//@angular/dev-infra-private/bazel/browsers/chromium:chromium",
        test = "%s_nodejs_test_bin" % name,
        # Disable sandbox so that Chromium can access the pre-rendered HTML file.
        tags = ["no-sandbox"] + tags,
    )

def ssr_screenshot_test(name, golden, data = []):
    _configure_screenshot_test_target(name, golden, False, data)

    # The accept target should approve the golden. Also add the `manual` tag to not run this
    # automatically (e.g. in CI).
    _configure_screenshot_test_target("%s.accept" % name, golden, True, data, ["manual"])
