# Re-export of Bazel rules with repository-wide defaults

load("@rules_pkg//:pkg.bzl", "pkg_tar")
load("@rules_sass//src:index.bzl", _sass_binary = "sass_binary", _sass_library = "sass_library")
load("@rules_angular//src/ng_package:index.bzl", _ng_package = "ng_package")
load("//:packages.bzl", "NO_STAMP_NPM_PACKAGE_SUBSTITUTIONS", "NPM_PACKAGE_SUBSTITUTIONS")
load("//:pkg-externals.bzl", "PKG_EXTERNALS")
load("//tools/markdown-to-html:index.bzl", _markdown_to_html = "markdown_to_html")
load("//tools/extract-tokens:index.bzl", _extract_tokens = "extract_tokens")
load("//tools/bazel:ng_package_interop.bzl", "ng_package_interop")
load("@devinfra//bazel/http-server:index.bzl", _http_server = "http_server")
load("@devinfra//bazel/spec-bundling:index_rjs.bzl", _spec_bundle = "spec_bundle")
load("//tools/bazel:web_test_suite.bzl", _ng_web_test_suite = "ng_web_test_suite")
load("@aspect_rules_js//npm:defs.bzl", _npm_package = "npm_package")
load("@rules_angular//src/ng_package/text_replace:index.bzl", _text_replace = "text_replace")
load("@rules_angular//src/ng_project:index.bzl", _ng_project = "ng_project")
load("@rules_angular//src/ts_project:index.bzl", _ts_project = "ts_project")
load("@devinfra//bazel/ts_project:index.bzl", "strict_deps_test")
load("@aspect_rules_jasmine//jasmine:defs.bzl", _jasmine_test = "jasmine_test")
load("@rules_browsers//src/protractor_test:index.bzl", "protractor_test")

# Re-exports to simplify build file load statements
markdown_to_html = _markdown_to_html
extract_tokens = _extract_tokens
ng_web_test_suite = _ng_web_test_suite
spec_bundle = _spec_bundle
http_server = _http_server

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
        package = package_name,
        readme_md = readme_md,
        substitutions = select({
            "//tools:stamp": NPM_PACKAGE_SUBSTITUTIONS,
            "//conditions:default": NO_STAMP_NPM_PACKAGE_SUBSTITUTIONS,
        }),
        visibility = visibility,
        rollup_runtime_deps = [
            "//:node_modules/@rollup/plugin-commonjs",
            "//:node_modules/@rollup/plugin-node-resolve",
            "//:node_modules/magic-string",
            "//:node_modules/rollup-plugin-dts",
            "//:node_modules/rollup-plugin-sourcemaps2",
        ],
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
        interop_deps = deps + package_deps,
        package_name = package_name,
    )

def npm_package(name, srcs = [], **kwargs):
    _text_replace(
        name = "%s_substituted" % name,
        srcs = srcs,
        substitutions = select({
            "//tools:stamp": NPM_PACKAGE_SUBSTITUTIONS,
            "//conditions:default": NO_STAMP_NPM_PACKAGE_SUBSTITUTIONS,
        }),
    )
    _npm_package(
        name = name,
        srcs = srcs + [
            "%s_substituted" % name,
        ],
        replace_prefixes = {
            "%s_substituted" % name: "/",
        },
        allow_overwrites = True,
        **kwargs
    )

def ts_project(
        name,
        deps = [],
        source_map = True,
        testonly = False,
        tsconfig = None,
        visibility = None,
        # TODO: Switch this flag as we no longer depend on `interop_deps`.
        ignore_strict_deps = True,
        **kwargs):
    if tsconfig == None and native.package_name().startswith("src"):
        tsconfig = "//src:test-tsconfig" if testonly else "//src:build-tsconfig"

    _ts_project(
        name = name,
        source_map = source_map,
        testonly = testonly,
        declaration = True,
        tsconfig = tsconfig,
        visibility = visibility,
        deps = deps,
        **kwargs
    )

    if not ignore_strict_deps:
        strict_deps_test(
            name = "%s_strict_deps_test" % name,
            srcs = kwargs.get("srcs", []),
            deps = deps,
        )

    # TODO(devversion): Partner with ISE team to support `rules_js` here.
    # if False and not testonly:
    #    _make_tsec_test(kwargs["name"])

def ng_project(
        name,
        deps = [],
        source_map = True,
        testonly = False,
        tsconfig = None,
        visibility = None,
        # TODO: Switch this flag as we no longer depend on `interop_deps`.
        ignore_strict_deps = True,
        **kwargs):
    if tsconfig == None and native.package_name().startswith("src"):
        tsconfig = "//src:test-tsconfig" if testonly else "//src:build-tsconfig"

    _ng_project(
        name = name,
        source_map = source_map,
        testonly = testonly,
        declaration = True,
        tsconfig = tsconfig,
        visibility = visibility,
        deps = deps,
        **kwargs
    )

    if not ignore_strict_deps:
        strict_deps_test(
            name = "%s_strict_deps_test" % name,
            srcs = kwargs.get("srcs", []),
            deps = deps,
        )

    # TODO(devversion): Partner with ISE team to support `rules_js` here.
    # if False and not testonly:
    #    _make_tsec_test(kwargs["name"])

def jasmine_test(name, data = [], args = [], **kwargs):
    # Create relative path to root, from current package dir. Necessary as
    # we change the `chdir` below to the package directory.
    relative_to_root = "/".join([".."] * len(native.package_name().split("/")))

    _jasmine_test(
        name = name,
        node_modules = "//:node_modules",
        chdir = native.package_name(),
        fixed_args = [
            "--require=%s/node_modules/source-map-support/register.js" % relative_to_root,
            "**/*spec.js",
            "**/*spec.mjs",
            "**/*spec.cjs",
        ] + args,
        data = data + [
            "//:node_modules/source-map-support",
        ],
        **kwargs
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
