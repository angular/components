# Re-export of Bazel rules with repository-wide defaults

load("@rules_pkg//:pkg.bzl", "pkg_tar")
load("@build_bazel_rules_nodejs//:index.bzl", _pkg_npm = "pkg_npm")
load("@rules_sass//src:index.bzl", _sass_binary = "sass_binary", _sass_library = "sass_library")
load("@npm//@angular/bazel:index.bzl", _ng_package = "ng_package")
load("//:packages.bzl", "NO_STAMP_NPM_PACKAGE_SUBSTITUTIONS", "NPM_PACKAGE_SUBSTITUTIONS")
load("//:pkg-externals.bzl", "PKG_EXTERNALS")
load("//tools/markdown-to-html:index.bzl", _markdown_to_html = "markdown_to_html")
load("//tools/extract-tokens:index.bzl", _extract_tokens = "extract_tokens")
load("//tools/bazel:ng_package_interop.bzl", "ng_package_interop")
load("//tools:defaults2.bzl", "spec_bundle", _karma_web_test_suite = "karma_web_test_suite")
load("@rules_browsers//src/protractor_test:index.bzl", "protractor_test")

npmPackageSubstitutions = select({
    "//tools:stamp": NPM_PACKAGE_SUBSTITUTIONS,
    "//conditions:default": NO_STAMP_NPM_PACKAGE_SUBSTITUTIONS,
})

# Re-exports to simplify build file load statements
markdown_to_html = _markdown_to_html
extract_tokens = _extract_tokens
karma_web_test_suite = _karma_web_test_suite

def sass_binary(sourcemap = False, include_paths = [], **kwargs):
    _sass_binary(
        sourcemap = sourcemap,
        include_paths = include_paths,
        module_mappings = {
            "@angular/cdk": "/".join([".."] * (native.package_name().count("/") + 1)) + "/src/cdk",
            "@angular/material": "/".join([".."] * (native.package_name().count("/") + 1)) + "/src/material",
            "@angular/material-experimental": "/".join([".."] * (native.package_name().count("/") + 1)) + "/src/material-experimental",
        },
        **kwargs
    )

def sass_library(**kwargs):
    _sass_library(**kwargs)

def ng_package(
        name,
        package_name,
        package_deps = [],
        srcs = [],
        deps = [],
        externals = PKG_EXTERNALS,
        readme_md = None,
        visibility = None,
        **kwargs):
    # If no readme file has been specified explicitly, use the default readme for
    # release packages from "src/README.md".
    if not readme_md:
        readme_md = "//src:README.md"

    # We need a genrule that copies the license into the current package. This
    # allows us to include the license in the "ng_package".
    native.genrule(
        name = "license_copied",
        srcs = ["//:LICENSE"],
        outs = ["LICENSE"],
        cmd = "cp $< $@",
    )

    _ng_package(
        name = name,
        externals = externals,
        srcs = srcs + [":license_copied"],
        deps = deps,
        # We never set a `package_name` for NPM packages, neither do we enable validation.
        # This is necessary because the source targets of the NPM packages all have
        # package names set and setting a similar `package_name` on the NPM package would
        # result in duplicate linker mappings that will conflict. e.g. consider the following
        # scenario: We have a `ts_library` for `@angular/cdk`. We will configure a package
        # name for the target so that it can be resolved in NodeJS executions from `node_modules`.
        # If we'd also set a `package_name` for the associated `pkg_npm` target, there would be
        # two mappings for `@angular/cdk` and the linker will complain. For a better development
        # experience, we want the mapping to resolve to the direct outputs of the `ts_library`
        # instead of requiring tests and other targets to assemble the NPM package first.
        package_name = None,
        validate = False,
        readme_md = readme_md,
        substitutions = npmPackageSubstitutions,
        visibility = visibility,
        **kwargs
    )

    pkg_tar(
        name = name + "_archive",
        srcs = [":%s" % name],
        extension = "tar.gz",
        strip_prefix = "./%s" % name,
        package_dir = "package/",
        # Target should not build on CI unless it is explicitly requested.
        tags = ["manual"],
        visibility = visibility,
    )

    ng_package_interop(
        name = "pkg",
        src = ":%s" % name,
        visibility = visibility,
        interop_deps = [d.replace("_legacy", "") for d in deps] + package_deps,
        package_name = package_name,
    )

def pkg_npm(name, visibility = None, **kwargs):
    _pkg_npm(
        name = name,
        # We never set a `package_name` for NPM packages, neither do we enable validation.
        # This is necessary because the source targets of the NPM packages all have
        # package names set and setting a similar `package_name` on the NPM package would
        # result in duplicate linker mappings that will conflict. e.g. consider the following
        # scenario: We have a `ts_library` for `@angular/cdk`. We will configure a package
        # name for the target so that it can be resolved in NodeJS executions from `node_modules`.
        # If we'd also set a `package_name` for the associated `pkg_npm` target, there would be
        # two mappings for `@angular/cdk` and the linker will complain. For a better development
        # experience, we want the mapping to resolve to the direct outputs of the `ts_library`
        # instead of requiring tests and other targets to assemble the NPM package first.
        package_name = None,
        validate = False,
        substitutions = npmPackageSubstitutions,
        visibility = visibility,
        **kwargs
    )

    pkg_tar(
        name = name + "_archive",
        srcs = [":%s" % name],
        package_dir = "package/",
        extension = "tar.gz",
        strip_prefix = "./%s" % name,
        # Target should not build on CI unless it is explicitly requested.
        tags = ["manual"],
        visibility = visibility,
    )

def protractor_web_test_suite(name, deps, **kwargs):
    spec_bundle(
        name = "%s_bundle" % name,
        deps = deps,
        external = ["protractor", "selenium-webdriver"],
    )

    protractor_test(
        name = name,
        deps = [":%s_bundle" % name],
        extra_config = {
            "useAllAngular2AppRoots": True,
            "allScriptsTimeout": 120000,
            "getPageTimeout": 120000,
            "jasmineNodeOpts": {
                "defaultTimeoutInterval": 120000,
            },
            # Since we want to use async/await we don't want to mix up with selenium's promise
            # manager. In order to enforce this, we disable the promise manager.
            "SELENIUM_PROMISE_MANAGER": False,
        },
        data = [
            "//:node_modules/protractor",
            "//:node_modules/selenium-webdriver",
        ],
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

    karma_web_test_suite(
        # Depend on our custom test initialization script. This needs to be the first dependency.
        deps = deps,
        bootstrap = ["//test:angular_test_init"] + bootstrap,
        **kwargs
    )
