load("@aspect_rules_jasmine//jasmine:defs.bzl", _jasmine_test = "jasmine_test")
load("@aspect_rules_js//npm:defs.bzl", _npm_package = "npm_package")
load("@devinfra//bazel/http-server:index.bzl", _http_server = "http_server")
load("@devinfra//bazel/spec-bundling:index_rjs.bzl", _spec_bundle = "spec_bundle")
load("@rules_angular//src/ng_project:index.bzl", _ng_project = "ng_project")
load("@rules_browsers//src/protractor_test:index.bzl", "protractor_test")
load("//tools/bazel:module_name.bzl", "compute_module_name")
load("//tools/bazel:ts_project_interop.bzl", _ts_project = "ts_project")
load("//tools/bazel:web_test_suite.bzl", _ng_web_test_suite = "ng_web_test_suite")

spec_bundle = _spec_bundle
http_server = _http_server
ng_web_test_suite = _ng_web_test_suite

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
