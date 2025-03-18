#Workspace for angular material
workspace(
    name = "angular_material",
)

# Point to the nested WORKSPACE we merged from github.com/angular/material.angular.io
# NB: even though this isn't referenced anywhere, it's required for Bazel to know about the
# nested workspace so that wildcard patterns like //... don't descend into it.
local_repository(
    name = "material_angular_io",
    path = "./material.angular.io",
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Add NodeJS rules
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "709cc0dcb51cf9028dd57c268066e5bc8f03a119ded410a13b5c3925d6e43c48",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/5.8.4/rules_nodejs-5.8.4.tar.gz"],
)

# Add sass rules
http_archive(
    name = "io_bazel_rules_sass",
    sha256 = "1c89680ca9cbbba33cb9cd462eb328e5782e14c0aa1286b794c71b5333385407",
    strip_prefix = "rules_sass-1.68.0",
    urls = [
        "https://github.com/bazelbuild/rules_sass/archive/1.68.0.zip",
    ],
)

# Add skylib which contains common Bazel utilities. Note that `rules_nodejs` would also
# bring in the skylib repository but with an older version that does not support shorthands
# for declaring Bazel build setting flags.
http_archive(
    name = "bazel_skylib",
    sha256 = "a9c5d3a22461ed7063aa7b088f9c96fa0aaaa8b6984b601f84d705adc47d8a58",
    strip_prefix = "bazel-skylib-8334f938c1574ef6f1f7a38a03550a31df65274e",
    urls = [
        "https://github.com/bazelbuild/bazel-skylib/archive/8334f938c1574ef6f1f7a38a03550a31df65274e.tar.gz",
    ],
)

http_archive(
    name = "rules_pkg",
    sha256 = "d94fd5b08dbdc227d66421cb9513f6c3b94bb3938fad276445a2d562f7df8f35",
    strip_prefix = "rules_pkg-61018b85819d57feb56886316e76e8ed8a4ce378",
    urls = [
        "https://github.com/bazelbuild/rules_pkg/archive/61018b85819d57feb56886316e76e8ed8a4ce378.tar.gz",
    ],
)

load("@rules_pkg//:deps.bzl", "rules_pkg_dependencies")

rules_pkg_dependencies()

load("@bazel_skylib//:workspace.bzl", "bazel_skylib_workspace")

bazel_skylib_workspace()

load("@build_bazel_rules_nodejs//:repositories.bzl", "build_bazel_rules_nodejs_dependencies")

build_bazel_rules_nodejs_dependencies()

http_archive(
    name = "aspect_rules_js",
    sha256 = "75c25a0f15a9e4592bbda45b57aa089e4bf17f9176fd735351e8c6444df87b52",
    strip_prefix = "rules_js-2.1.0",
    url = "https://github.com/aspect-build/rules_js/releases/download/v2.1.0/rules_js-v2.1.0.tar.gz",
)

load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")

rules_js_dependencies()

load("@rules_nodejs//nodejs:repositories.bzl", "nodejs_register_toolchains")

NODE_VERSION = "22.0.0"

NODE_REPOSITORIES = {
    "22.0.0-darwin_arm64": ("node-v22.0.0-darwin-arm64.tar.gz", "node-v22.0.0-darwin-arm64", "ea96d349cfaa67aa87ceeaa3e5b52c9167f7ac302fd8d1ff162d0785e9dc0785"),
    "22.0.0-darwin_amd64": ("node-v22.0.0-darwin-x64.tar.gz", "node-v22.0.0-darwin-x64", "422a3887ff5418f0a4552d89cf99346ab8ab51bb5d384660baa88b8444d2c111"),
    "22.0.0-linux_arm64": ("node-v22.0.0-linux-arm64.tar.xz", "node-v22.0.0-linux-arm64", "83711d29cbe46375bdffab5419f3d831892e24294169272f6c39edc364556241"),
    "22.0.0-linux_ppc64le": ("node-v22.0.0-linux-ppc64le.tar.xz", "node-v22.0.0-linux-ppc64le", "2b3fb8707a79243bfb3131312b86716ddc3855bce21bb168095b6b916798e5e9"),
    "22.0.0-linux_s390x": ("node-v22.0.0-linux-s390x.tar.xz", "node-v22.0.0-linux-s390x", "89a8efeeb9f94ce9ea251b8109e079c14919f4c0dc2cbc9f545ec47ef0886737"),
    "22.0.0-linux_amd64": ("node-v22.0.0-linux-x64.tar.xz", "node-v22.0.0-linux-x64", "9122e50f2642afd5f6078cafd1f52ede60fc464284384f05c18a04d13d07ae5a"),
    "22.0.0-windows_amd64": ("node-v22.0.0-win-x64.zip", "node-v22.0.0-win-x64", "32d639b47d4c0a651ff8f8d7d41a454168a3d4045be37985f9a810cf8cef6174"),
}

nodejs_register_toolchains(
    name = "nodejs",
    node_repositories = NODE_REPOSITORIES,
    node_version = NODE_VERSION,
)

load("@aspect_rules_js//js:toolchains.bzl", "rules_js_register_toolchains")

rules_js_register_toolchains(
    node_repositories = NODE_REPOSITORIES,
    node_version = NODE_VERSION,
)

load("@build_bazel_rules_nodejs//:index.bzl", "yarn_install")
load("//tools:integration.bzl", "create_npm_package_archive_build_file")

yarn_install(
    name = "npm",
    # We add the postinstall patches file here so that Yarn will rerun whenever
    # the file is modified.
    data = [
        "//:.yarn/releases/yarn-1.22.17.cjs",
        "//:.yarnrc",
        "//:tools/postinstall/apply-patches.js",
        "//:tools/postinstall/patches/@angular+bazel+20.0.0-next.1.patch",
        "//:tools/postinstall/patches/@angular+build-tooling+0.0.0-1ebf18a3a60b182a3dbad12e9a149fd93af5c29b.patch",
        "//:tools/postinstall/patches/@bazel+concatjs+5.8.1.patch",
        "//:tools/postinstall/patches/tsec+0.2.2.patch",
    ],
    # Currently disabled due to:
    #  1. Missing Windows support currently.
    #  2. Incompatibilites with the `ts_library` rule.
    exports_directories_only = False,
    # Add archive targets for some NPM packages that are needed in integration tests.
    manual_build_file_contents = create_npm_package_archive_build_file(),
    package_json = "//:package.json",
    quiet = False,
    yarn = "//:.yarn/releases/yarn-1.22.17.cjs",
    yarn_lock = "//:yarn.lock",
)

load("@npm//@bazel/protractor:package.bzl", "npm_bazel_protractor_dependencies")

npm_bazel_protractor_dependencies()

# Setup web testing. We need to setup a browser because the web testing rules for TypeScript need
# a reference to a registered browser (ideally that's a hermetic version of a browser)
load("@io_bazel_rules_webtesting//web:repositories.bzl", "web_test_repositories")

web_test_repositories()

# Setup the Sass rule repositories.
load("@io_bazel_rules_sass//:defs.bzl", "sass_repositories")

sass_repositories(
    yarn_script = "//:.yarn/releases/yarn-1.22.17.cjs",
)

# Setup repositories for browsers provided by the shared dev-infra package.
load(
    "@npm//@angular/build-tooling/bazel/browsers:browser_repositories.bzl",
    _dev_infra_browser_repositories = "browser_repositories",
)

_dev_infra_browser_repositories()

load("@build_bazel_rules_nodejs//toolchains/esbuild:esbuild_repositories.bzl", "esbuild_repositories")

esbuild_repositories(
    npm_repository = "npm",
)

load("@aspect_rules_js//npm:repositories.bzl", "npm_translate_lock")

npm_translate_lock(
    name = "npm2",
    custom_postinstalls = {
        "@angular/animations": "node ../../@nginfra/angular-linking/index.mjs",
        "@angular/common": "node ../../@nginfra/angular-linking/index.mjs",
        "@angular/forms": "node ../../@nginfra/angular-linking/index.mjs",
        "@angular/platform-browser": "node ../../@nginfra/angular-linking/index.mjs",
        "@angular/router": "node ../../@nginfra/angular-linking/index.mjs",
        "@angular/localize": "node ../../@nginfra/angular-linking/index.mjs",
    },
    data = [
        "//:package.json",
        "//:pnpm-workspace.yaml",
    ],
    npmrc = "//:.npmrc",
    pnpm_lock = "//:pnpm-lock.yaml",
    update_pnpm_lock = True,
    verify_node_modules_ignored = "//:.bazelignore",
    yarn_lock = "//:yarn.lock",
)

load("@npm2//:repositories.bzl", "npm_repositories")

npm_repositories()

http_archive(
    name = "aspect_rules_ts",
    sha256 = "9acd128abe77397505148eaa6895faed57839560dbf2177dd6285e51235e2724",
    strip_prefix = "rules_ts-3.3.1",
    url = "https://github.com/aspect-build/rules_ts/releases/download/v3.3.1/rules_ts-v3.3.1.tar.gz",
)

load("@aspect_rules_ts//ts:repositories.bzl", "rules_ts_dependencies")

rules_ts_dependencies(
    # Obtained by: curl --silent https://registry.npmjs.org/typescript/5.8.2 | jq -r '.dist.integrity'
    ts_integrity = "sha512-aJn6wq13/afZp/jT9QZmwEjDqqvSGp1VT5GVg+f/t6/oVyrgXM6BY1h9BRh/O5p3PlUPAe+WuiEZOmb/49RqoQ==",
    ts_version_from = "//:package.json",
)

http_archive(
    name = "aspect_rules_rollup",
    sha256 = "c4062681968f5dcd3ce01e09e4ba73670c064744a7046211763e17c98ab8396e",
    strip_prefix = "rules_rollup-2.0.0",
    url = "https://github.com/aspect-build/rules_rollup/releases/download/v2.0.0/rules_rollup-v2.0.0.tar.gz",
)

load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

git_repository(
    name = "devinfra",
    commit = "cc73dde52b557f831cc3b6e48daf8c3b542a33df",
    remote = "https://github.com/angular/dev-infra.git",
)

load("@devinfra//bazel:setup_dependencies_1.bzl", "setup_dependencies_1")

setup_dependencies_1()

load("@devinfra//bazel:setup_dependencies_2.bzl", "setup_dependencies_2")

setup_dependencies_2()

git_repository(
    name = "rules_angular",
    commit = "e10bf488aca18c159399f4c1163324a40f45a5dc",
    remote = "https://github.com/devversion/rules_angular.git",
)

load("@rules_angular//setup:step_1.bzl", "step_1")

step_1()

load("@rules_angular//setup:step_2.bzl", "step_2")

step_2()
