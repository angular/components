#Workspace for angular material
workspace(
    name = "angular_material",
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Add NodeJS rules
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "709cc0dcb51cf9028dd57c268066e5bc8f03a119ded410a13b5c3925d6e43c48",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/5.8.4/rules_nodejs-5.8.4.tar.gz"],
)

# Add skylib which contains common Bazel utilities.
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
    sha256 = "3388abe9b9728ef68ea8d8301f932b11b2c9a271d74741ddd5f3b34d1db843ac",
    strip_prefix = "rules_js-2.1.1",
    url = "https://github.com/aspect-build/rules_js/releases/download/v2.1.1/rules_js-v2.1.1.tar.gz",
)

load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")

rules_js_dependencies()

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

load("@aspect_rules_js//js:toolchains.bzl", "rules_js_register_toolchains")

rules_js_register_toolchains(
    node_repositories = NODE_REPOSITORIES,
    node_version = NODE_VERSION,
)

load("@aspect_rules_js//npm:repositories.bzl", "npm_translate_lock")

npm_translate_lock(
    name = "npm",
    custom_postinstalls = {
        "@angular/animations": "node ../../@nginfra/angular-linking/index.mjs",
        "@angular/common": "node ../../@nginfra/angular-linking/index.mjs",
        "@angular/forms": "node ../../@nginfra/angular-linking/index.mjs",
        "@angular/localize": "node ../../@nginfra/angular-linking/index.mjs",
        "@angular/platform-browser": "node ../../@nginfra/angular-linking/index.mjs",
        "@angular/platform-server": "node ../../@nginfra/angular-linking/index.mjs",
        "@angular/router": "node ../../@nginfra/angular-linking/index.mjs",
    },
    data = [
        "//:package.json",
        "//:patches/@angular-devkit__architect-cli.patch",
        "//:pnpm-workspace.yaml",
        "//integration:package.json",
        "//src/cdk:package.json",
        "//src/cdk-experimental:package.json",
        "//src/components-examples:package.json",
        "//src/dev-app:package.json",
        "//src/e2e-app:package.json",
        "//src/google-maps:package.json",
        "//src/material:package.json",
        "//src/material-date-fns-adapter:package.json",
        "//src/material-experimental:package.json",
        "//src/material-luxon-adapter:package.json",
        "//src/material-moment-adapter:package.json",
        "//src/universal-app:package.json",
        "//src/youtube-player:package.json",
    ],
    npmrc = "//:.npmrc",
    package_visibility = {
        "@angular/cdk": [
            "//integration:__subpackages__",
            "//docs:__subpackages__",
        ],
        "@angular/cdk-experimental": [
            "//integration:__subpackages__",
            "//docs:__subpackages__",
        ],
        "@angular/material": [
            "//integration:__subpackages__",
            "//docs:__subpackages__",
        ],
        "@angular/material-experimental": [
            "//integration:__subpackages__",
            "//docs:__subpackages__",
        ],
        "@angular/google-maps": [
            "//integration:__subpackages__",
            "//docs:__subpackages__",
        ],
        "@angular/youtube-player": [
            "//integration:__subpackages__",
            "//docs:__subpackages__",
        ],
        "@angular/material-moment-adapter": [
            "//integration:__subpackages__",
            "//docs:__subpackages__",
        ],
        "@angular/material-date-fns-adapter": [
            "//integration:__subpackages__",
            "//docs:__subpackages__",
        ],
        "@angular/material-luxon-adapter": [
            "//integration:__subpackages__",
            "//docs:__subpackages__",
        ],
    },
    pnpm_lock = "//:pnpm-lock.yaml",
    pnpm_version = "9.14.1",
    verify_node_modules_ignored = "//:.bazelignore",
)

load("@npm//:repositories.bzl", "npm_repositories")

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

http_archive(
    name = "aspect_rules_jasmine",
    sha256 = "0d2f9c977842685895020cac721d8cc4f1b37aae15af46128cf619741dc61529",
    strip_prefix = "rules_jasmine-2.0.0",
    url = "https://github.com/aspect-build/rules_jasmine/releases/download/v2.0.0/rules_jasmine-v2.0.0.tar.gz",
)

load("@aspect_rules_jasmine//jasmine:dependencies.bzl", "rules_jasmine_dependencies")

rules_jasmine_dependencies()

load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

git_repository(
    name = "devinfra",
    commit = "c4f7d3cdec164044284139182b709dfd4be339ed",
    remote = "https://github.com/angular/dev-infra.git",
)

load("@devinfra//bazel:setup_dependencies_1.bzl", "setup_dependencies_1")

setup_dependencies_1()

load("@devinfra//bazel:setup_dependencies_2.bzl", "setup_dependencies_2")

setup_dependencies_2()

git_repository(
    name = "rules_angular",
    commit = "0a54fca16350cab2b823908f1725aec175fcfeb2",
    remote = "https://github.com/devversion/rules_angular.git",
)

load("@rules_angular//setup:step_1.bzl", "rules_angular_step1")

rules_angular_step1()

load("@rules_angular//setup:step_2.bzl", "rules_angular_step2")

rules_angular_step2()

load("@rules_angular//setup:step_3.bzl", "rules_angular_step3")

rules_angular_step3(
    angular_compiler_cli = "//:node_modules/@angular/compiler-cli",
    typescript = "//:node_modules/typescript",
)

http_archive(
    name = "aspect_rules_esbuild",
    sha256 = "550e33ddeb86a564b22b2c5d3f84748c6639b1b2b71fae66bf362c33392cbed8",
    strip_prefix = "rules_esbuild-0.21.0",
    url = "https://github.com/aspect-build/rules_esbuild/releases/download/v0.21.0/rules_esbuild-v0.21.0.tar.gz",
)

load("@aspect_rules_esbuild//esbuild:dependencies.bzl", "rules_esbuild_dependencies")

rules_esbuild_dependencies()

load("@aspect_rules_esbuild//esbuild:repositories.bzl", "LATEST_ESBUILD_VERSION", "esbuild_register_toolchains")

esbuild_register_toolchains(
    name = "esbuild",
    esbuild_version = LATEST_ESBUILD_VERSION,
)

git_repository(
    name = "rules_browsers",
    commit = "c8246bb6d8bba4e2ae23fc39c7b0cec651953e6d",
    remote = "https://github.com/devversion/rules_browsers.git",
)

load("@rules_browsers//setup:step_1.bzl", "rules_browsers_setup_1")

rules_browsers_setup_1()

load("@rules_browsers//setup:step_2.bzl", "rules_browsers_setup_2")

rules_browsers_setup_2()

git_repository(
    name = "rules_sass",
    commit = "3cd198e291caf21ba8f7105d53963dd3df62ef6d",
    remote = "https://github.com/devversion/rules_sass.git",
)

load("@rules_sass//src/toolchain:repositories.bzl", "setup_rules_sass")

setup_rules_sass()
