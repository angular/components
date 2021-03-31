load("//tools:defaults.bzl", "jasmine_node_test")
load("@io_bazel_rules_webtesting//web:web.bzl", "web_test")

def _webdriver_test_impl(ctx):
    executable = ctx.actions.declare_file(ctx.label.name)
    args = ctx.actions.args()
    args.add(ctx.executable.server)
    args.add(ctx.executable.test)
    tools = [
        ctx.executable.server,
        ctx.executable.test,
        ctx.executable._runner,
    ]

    ctx.actions.run(
        outputs = [executable],
        tools = [ctx.executable.server, ctx.executable.test, ctx.executable._runner],
        arguments = [args],
        executable = ctx.executable._runner,
    )

    return [
        DefaultInfo(
            executable = executable,
            runfiles = ctx.runfiles(files = tools)
        ),
    ]

webdriver_test = rule(
    implementation = _webdriver_test_impl,
    test = True,
    attrs = {
        "server": attr.label(
            executable = True,
            cfg = "exec",
        ),
        "test": attr.label(
            executable = True,
            cfg = "exec",
        ),
        "_runner": attr.label(
            executable = True,
            cfg = "exec",
            default = Label("//tools/webdriver:run-webdriver-test-platform-independent"),
        ),
    },
)

def webdriver_e2e_test(name, deps, browser, tags = [], **kwargs):
    jasmine_node_test(
        name = "%s_jasmine_node_test" % name,
        data = [
            "@npm//:node_modules",
        ],
        tags = tags + ["manual"],
        deps = deps,
        **kwargs
    )

    web_test(
        name = "%s_web_test" % name,
        browser = browser,
        tags = tags + ["manual"],
        test = ":%s_jasmine_node_test" % name,
    )

    webdriver_test(
        name = name,
        testonly = True,
        server = "//src/e2e-app:devserver",
        test = ":%s_web_test" % name,
        tags = tags + ["e2e"],
    )

#    native.sh_test(
#        name = name,
#        testonly = True,
#        srcs = ["//tools/webdriver:run-webdriver-test"],
#        args = [
#            "$(location //src/e2e-app:devserver)",
#            "$(location :%s_web_test)" % name,
#        ],
#        data = [
#            ":%s_web_test" % name,
#            "//src/e2e-app:devserver",
#        ],
#        tags = tags + ["e2e"],
#        deps = ["@bazel_tools//tools/bash/runfiles"],
#    )
