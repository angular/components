load("@aspect_rules_jasmine//jasmine:defs.bzl", _jasmine_test = "jasmine_test")
load("//tools/bazel:ts_project_interop.bzl", _ts_project = "ts_project")
load("//tools/bazel:module_name.bzl", "compute_module_name")
load("@aspect_rules_js//npm:defs.bzl", _npm_package = "npm_package")
load("@rules_angular//src/ng_project:index.bzl", _ng_project = "ng_project")
load("@devinfra//bazel/spec-bundling:index_rjs.bzl", "spec_bundle_amd", _spec_bundle = "spec_bundle")
load("@devinfra//bazel/karma:index.bzl", _karma_web_test_suite = "karma_web_test_suite")

spec_bundle = _spec_bundle

def npm_package(**kwargs):
    _npm_package(**kwargs)

def ts_project(
        name,
        source_map = True,
        testonly = False,
        tsconfig = None,
        **kwargs):
    if tsconfig == None and native.package_name().startswith("src"):
        tsconfig = "//src:test-tsconfig" if testonly else "//src:build-tsconfig"

    _ts_project(
        name,
        source_map = source_map,
        module_name = compute_module_name(testonly),
        testonly = testonly,
        tsconfig = tsconfig,
        **kwargs
    )

    # TODO(devversion): Partner with ISE team to support `rules_js` here.
    # if False and not testonly:
    #    _make_tsec_test(kwargs["name"])

def ng_project(
        name,
        source_map = True,
        testonly = False,
        tsconfig = None,
        **kwargs):
    if tsconfig == None and native.package_name().startswith("src"):
        tsconfig = "//src:test-tsconfig" if testonly else "//src:build-tsconfig"

    _ts_project(
        name,
        source_map = source_map,
        module_name = compute_module_name(testonly),
        rule_impl = _ng_project,
        testonly = testonly,
        tsconfig = tsconfig,
        **kwargs
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

def karma_web_test_suite(name, tags = [], deps = [], browsers = None, **kwargs):
    spec_bundle_amd(
        name = "%s_bundle" % name,
        workspace_name = "angular_material",
        srcs = ["//src:build-tsconfig"],
        deps = deps,
        config = {
            "resolveExtensions": [".js"],
            "tsconfig": "./src/bazel-tsconfig-build.json",
        },
    )

    test_tags = ["partial-compilation-integration"] + tags

    # Set up default browsers if no explicit `browsers` have been specified.
    if browsers == None:
        test_tags.append("native")
        browsers = [
            # Note: when changing the browser names here, also update the "yarn test"
            # script to reflect the new browser names.
            "@npm//@angular/build-tooling/bazel/browsers/chromium:chromium",
            "@npm//@angular/build-tooling/bazel/browsers/firefox:firefox",
        ]

    _karma_web_test_suite(
        name = name,
        tags = test_tags,
        deps = [":%s_bundle" % name],
        browsers = browsers,
        **kwargs
    )
