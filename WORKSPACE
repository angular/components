#Workspace for angular material
workspace(
    name = "angular_material",
    managed_directories = {"@npm": ["node_modules"]},
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

load("@rules_nodejs//nodejs:repositories.bzl", "nodejs_register_toolchains")

nodejs_register_toolchains(
    name = "nodejs",
    node_repositories = {
        "18.18.2-darwin_arm64": ("node-v18.18.2-darwin-arm64.tar.gz", "node-v18.18.2-darwin-arm64", "9f982cc91b28778dd8638e4f94563b0c2a1da7aba62beb72bd427721035ab553"),
        "18.18.2-darwin_amd64": ("node-v18.18.2-darwin-x64.tar.gz", "node-v18.18.2-darwin-x64", "5bb8da908ed590e256a69bf2862238c8a67bc4600119f2f7721ca18a7c810c0f"),
        "18.18.2-linux_arm64": ("node-v18.18.2-linux-arm64.tar.xz", "node-v18.18.2-linux-arm64", "2e630e18548627f61eaf573233da7949dc0a1df5eef3f486fa9820c5f6c121aa"),
        "18.18.2-linux_ppc64le": ("node-v18.18.2-linux-ppc64le.tar.xz", "node-v18.18.2-linux-ppc64le", "b0adff5cf5938266b711d6c724fb134d802e0dee40b3a3f73d162de1b3d11880"),
        "18.18.2-linux_s390x": ("node-v18.18.2-linux-s390x.tar.xz", "node-v18.18.2-linux-s390x", "c70ec2074b5e2b42c55bb4b8105418b67bf8a61c500d9376a07430dfcc341fdb"),
        "18.18.2-linux_amd64": ("node-v18.18.2-linux-x64.tar.xz", "node-v18.18.2-linux-x64", "75aba25ae76999309fc6c598efe56ce53fbfc221381a44a840864276264ab8ac"),
        "18.18.2-windows_amd64": ("node-v18.18.2-win-x64.zip", "node-v18.18.2-win-x64", "3bb0e51e579a41a22b3bf6cb2f3e79c03801aa17acbe0ca00fc555d1282e7acd"),
    },
    node_version = "18.18.2",
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
        "//:tools/postinstall/patches/@angular+bazel+16.0.0-next.6.patch",
        "//:tools/postinstall/patches/@bazel+concatjs+5.8.1.patch",
    ],
    # Currently disabled due to:
    #  1. Missing Windows support currently.
    #  2. Incompatibilites with the `ts_library` rule.
    exports_directories_only = False,
    # Add archive targets for some NPM packages that are needed in integration tests.
    manual_build_file_contents = create_npm_package_archive_build_file(),
    package_json = "//:package.json",
    quiet = False,
    # We prefer to symlink the `node_modules` to only maintain a single install.
    # See https://github.com/angular/dev-infra/pull/446#issuecomment-1059820287 for details.
    symlink_node_modules = True,
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
