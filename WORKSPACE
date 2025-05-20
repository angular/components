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
    sha256 = "4f7e2b6bafa9a88ac1b0ee0c3ad69850282419aa51f6bd5b45cde8d0c945d18c",
    strip_prefix = "bazel-skylib-454b25912a8ddf3d90eb47f25260befd5ee274a8",
    urls = [
        "https://github.com/bazelbuild/bazel-skylib/archive/454b25912a8ddf3d90eb47f25260befd5ee274a8.tar.gz",
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
    sha256 = "83e5af4d17385d1c3268c31ae217dbfc8525aa7bcf52508dc6864baffc8b9501",
    strip_prefix = "rules_js-2.3.7",
    url = "https://github.com/aspect-build/rules_js/releases/download/v2.3.7/rules_js-v2.3.7.tar.gz",
)

load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")

rules_js_dependencies()

NODE_VERSION = "22.11.0"

NODE_REPOSITORIES = {
    "22.11.0-darwin_arm64": ("node-v22.11.0-darwin-arm64.tar.gz", "node-v22.11.0-darwin-arm64", "2e89afe6f4e3aa6c7e21c560d8a0453d84807e97850bbb819b998531a22bdfde"),
    "22.11.0-darwin_amd64": ("node-v22.11.0-darwin-x64.tar.gz", "node-v22.11.0-darwin-x64", "668d30b9512137b5f5baeef6c1bb4c46efff9a761ba990a034fb6b28b9da2465"),
    "22.11.0-linux_arm64": ("node-v22.11.0-linux-arm64.tar.xz", "node-v22.11.0-linux-arm64", "6031d04b98f59ff0f7cb98566f65b115ecd893d3b7870821171708cdbaf7ae6e"),
    "22.11.0-linux_ppc64le": ("node-v22.11.0-linux-ppc64le.tar.xz", "node-v22.11.0-linux-ppc64le", "d1d49d7d611b104b6d616e18ac439479d8296aa20e3741432de0e85f4735a81e"),
    "22.11.0-linux_s390x": ("node-v22.11.0-linux-s390x.tar.xz", "node-v22.11.0-linux-s390x", "f474ed77d6b13d66d07589aee1c2b9175be4c1b165483e608ac1674643064a99"),
    "22.11.0-linux_amd64": ("node-v22.11.0-linux-x64.tar.xz", "node-v22.11.0-linux-x64", "83bf07dd343002a26211cf1fcd46a9d9534219aad42ee02847816940bf610a72"),
    "22.11.0-windows_amd64": ("node-v22.11.0-win-x64.zip", "node-v22.11.0-win-x64", "905373a059aecaf7f48c1ce10ffbd5334457ca00f678747f19db5ea7d256c236"),
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
    sha256 = "6b15ac1c69f2c0f1282e41ab469fd63cd40eb2e2d83075e19b68a6a76669773f",
    strip_prefix = "rules_ts-3.6.0",
    url = "https://github.com/aspect-build/rules_ts/releases/download/v3.6.0/rules_ts-v3.6.0.tar.gz",
)

load("@aspect_rules_ts//ts:repositories.bzl", "rules_ts_dependencies")

rules_ts_dependencies(
    # Obtained by: curl --silent https://registry.npmjs.org/typescript/5.8.2 | jq -r '.dist.integrity'
    ts_integrity = "sha512-aJn6wq13/afZp/jT9QZmwEjDqqvSGp1VT5GVg+f/t6/oVyrgXM6BY1h9BRh/O5p3PlUPAe+WuiEZOmb/49RqoQ==",
    ts_version_from = "//:package.json",
)

http_archive(
    name = "aspect_rules_rollup",
    sha256 = "0b8ac7d97cd660eb9a275600227e9c4268f5904cba962939d1a6ce9a0a059d2e",
    strip_prefix = "rules_rollup-2.0.1",
    url = "https://github.com/aspect-build/rules_rollup/releases/download/v2.0.1/rules_rollup-v2.0.1.tar.gz",
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
    commit = "a9061f8b8f7bb7b0ea2b578d48dcfd4e6b83a18b",
    remote = "https://github.com/angular/dev-infra.git",
)

load("@devinfra//bazel:setup_dependencies_1.bzl", "setup_dependencies_1")

setup_dependencies_1()

load("@devinfra//bazel:setup_dependencies_2.bzl", "setup_dependencies_2")

setup_dependencies_2()

git_repository(
    name = "rules_angular",
    commit = "5b9b1fc545736b8b602a216f89134c1f20d3009c",
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
    sha256 = "530adfeae30bbbd097e8af845a44a04b641b680c5703b3bf885cbd384ffec779",
    strip_prefix = "rules_esbuild-0.22.1",
    url = "https://github.com/aspect-build/rules_esbuild/releases/download/v0.22.1/rules_esbuild-v0.22.1.tar.gz",
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
    commit = "fd3b3d37662206a19eaa34f157c757b3291978dc",
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
