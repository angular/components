load("@aspect_rules_jasmine//jasmine:defs.bzl", _jasmine_test = "jasmine_test")
load("//tools/bazel:ts_project_interop.bzl", _ts_project = "ts_project")
load("//tools/bazel:module_name.bzl", "compute_module_name")
load("@aspect_rules_js//npm:defs.bzl", _npm_package = "npm_package")
load("@rules_angular//src/ng_project:index.bzl", _ng_project = "ng_project")

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

def jasmine_test(data = [], args = [], **kwargs):
    # Create relative path to root, from current package dir. Necessary as
    # we change the `chdir` below to the package directory.
    relative_to_root = "/".join([".."] * len(native.package_name().split("/")))

    _jasmine_test(
        node_modules = "//:node_modules",
        chdir = native.package_name(),
        args = [
            "--require=%s/node_modules/source-map-support/register.js" % relative_to_root,
            "**/*spec.js",
            "**/*spec.mjs",
            "**/*spec.cjs",
        ] + args,
        data = data + [
            "//:node_modules/source-map-support",
            # Needed to ensure code is recognized as ESM.
            "//src:package_json",
        ],
        **kwargs
    )
