# Re-export of Bazel rules with repository-wide defaults

load("@rules_pkg//:pkg.bzl", "pkg_tar")
load("@rules_sass//src:index.bzl", _sass_binary = "sass_binary", _sass_library = "sass_library")
load("@npm//@angular/bazel:index.bzl", _ng_package = "ng_package")
load("//:packages.bzl", "NO_STAMP_NPM_PACKAGE_SUBSTITUTIONS", "NPM_PACKAGE_SUBSTITUTIONS")
load("//:pkg-externals.bzl", "PKG_EXTERNALS")
load("//tools/markdown-to-html:index.bzl", _markdown_to_html = "markdown_to_html")
load("//tools/extract-tokens:index.bzl", _extract_tokens = "extract_tokens")
load("//tools/bazel:ng_package_interop.bzl", "ng_package_interop")
load("//tools:defaults2.bzl", _ng_web_test_suite = "ng_web_test_suite")

npmPackageSubstitutions = select({
    "//tools:stamp": NPM_PACKAGE_SUBSTITUTIONS,
    "//conditions:default": NO_STAMP_NPM_PACKAGE_SUBSTITUTIONS,
})

# Re-exports to simplify build file load statements
markdown_to_html = _markdown_to_html
extract_tokens = _extract_tokens
ng_web_test_suite = _ng_web_test_suite

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
