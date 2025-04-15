load("@rules_browsers//src/wtr:index.bzl", "wtr_test")
load("@devinfra//bazel/spec-bundling:index_rjs.bzl", "spec_bundle")

def _web_test(name, tags = [], deps = [], bootstrap = [], **kwargs):
    spec_bundle(
        name = "%s_bundle" % name,
        srcs = ["//src:build-tsconfig"],
        bootstrap = bootstrap,
        deps = deps,
        config = {
            "resolveExtensions": [".js"],
            "tsconfig": "./src/bazel-tsconfig-build.json",
        },
    )

    test_tags = ["partial-compilation-integration"] + tags

    wtr_test(
        name = name,
        deps = [":%s_bundle" % name],
        tags = test_tags,
        **kwargs
    )

def ng_web_test_suite(deps = [], static_css = [], **kwargs):
    # Always include a prebuilt theme in the test suite because otherwise tests, which depend on CSS
    # that is needed for measuring, will unexpectedly fail. Also always adding a prebuilt theme
    # reduces the amount of setup that is needed to create a test suite Bazel target. Note that the
    # prebuilt theme will be also added to CDK test suites but shouldn't affect anything.
    static_css = static_css + [
        "//src/material/prebuilt-themes:azure-blue",
    ]

    bootstrap = []

    # Workaround for https://github.com/bazelbuild/rules_typescript/issues/301
    # Since some of our tests depend on CSS files which are not part of the `ng_project` rule,
    # we need to somehow load static CSS files within Karma (e.g. overlay prebuilt). Those styles
    # are required for successful test runs. Since the `karma_web_test_suite` rule currently only
    # allows JS files to be included and served within Karma, we need to create a JS file that
    # loads the given CSS file.
    for css_label in static_css:
        css_id = "static-css-file-%s" % (css_label.replace("/", "_").replace(":", "-"))
        bootstrap.append(":%s" % css_id)

        native.genrule(
            name = css_id,
            srcs = [css_label],
            outs = ["%s.css.init.js" % css_id],
            output_to_bindir = True,
            cmd = """
        files=($(execpaths %s))
        # Escape all double-quotes so that the content can be safely inlined into the
        # JS template. Note that it needs to be escaped a second time because the string
        # will be evaluated first in Bash and will then be stored in the JS output.
        css_content=$$(cat $${files[0]} | sed 's/"/\\\\"/g')
        js_template='var cssElement = document.createElement("style"); \
                    cssElement.type = "text/css"; \
                    cssElement.innerHTML = "'"$$css_content"'"; \
                    document.head.appendChild(cssElement);'
         echo "$$js_template" > $@
      """ % css_label,
        )

    _web_test(
        # Depend on our custom test initialization script. This needs to be the first dependency.
        deps = deps,
        bootstrap = ["//test:angular_test_init"] + bootstrap,
        **kwargs
    )
