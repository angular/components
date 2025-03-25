load("@aspect_rules_jasmine//jasmine:defs.bzl", _jasmine_test = "jasmine_test")
load("//tools/bazel:ts_project_interop.bzl", _ts_project = "ts_project")
load("//tools/bazel:module_name.bzl", "compute_module_name")
load("@aspect_rules_js//npm:defs.bzl", _npm_package = "npm_package")

def npm_package(**kwargs):
    _npm_package(**kwargs)

def ts_project(
        name,
        source_map = True,
        testonly = False,
        **kwargs):
    _ts_project(
        name,
        source_map = source_map,
        module_name = compute_module_name(testonly),
        testonly = testonly,
        **kwargs
    )

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
