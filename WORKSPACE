workspace(
    name = "angular_material",
    managed_directories = {"@npm": ["node_modules"]},
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Add NodeJS rules
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "dcc55f810142b6cf46a44d0180a5a7fb923c04a5061e2e8d8eb05ccccc60864b",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/5.8.0/rules_nodejs-5.8.0.tar.gz"],
)

# rules_js is used for the mio (material.angulare.io) build
http_archive(
    name = "aspect_rules_js",
    sha256 = "1aa0ab76d1f9520bb8993e2d84f82da2a9c87da1e6e8d121dbb4c857a292c2cd",
    strip_prefix = "rules_js-1.20.1",
    url = "https://github.com/aspect-build/rules_js/releases/download/v1.20.1/rules_js-v1.20.1.tar.gz",
)

# dev-infra required for browser repositories
http_archive(
  name = "dev-infra",
  strip_prefix = "dev-infra-9bc16c6fd4297c5220eb7627e42f8117ca6d1967",
  sha256 = "3208595ba1b237d71a1b1542a6241210a5a543074d42adb0f0378b7408b5369d",
  url = "https://github.com/angular/dev-infra/archive/9bc16c6fd4297c5220eb7627e42f8117ca6d1967/9bc16c6fd4297c5220eb7627e42f8117ca6d1967.tar.gz",
)

# Add a patch fix for rules_webtesting v0.3.5 required for enabling runfiles on Windows.
# TODO: Remove the http_archive for this transitive dependency when a release is cut
# for https://github.com/bazelbuild/rules_webtesting/commit/581b1557e382f93419da6a03b91a45c2ac9a9ec8
# and the version is updated in rules_nodejs.
http_archive(
    name = "io_bazel_rules_webtesting",
    patch_args = ["-p1"],
    patches = [
        "//mio:tools/patches/rules_webtesting__windows_runfiles_fix.patch",
    ],
    sha256 = "e9abb7658b6a129740c0b3ef6f5a2370864e102a5ba5ffca2cea565829ed825a",
    urls = ["https://github.com/bazelbuild/rules_webtesting/releases/download/0.3.5/rules_webtesting.tar.gz"],
)

# Add sass rules
http_archive(
    name = "io_bazel_rules_sass",
    sha256 = "1ea0103fa6adcb7d43ff26373b5082efe1d4b2e09c4f34f8a8f8b351e9a8a9b0",
    strip_prefix = "rules_sass-1.55.0",
    urls = [
        "https://github.com/bazelbuild/rules_sass/archive/1.55.0.zip",
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

load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")

rules_js_dependencies()

load("@build_bazel_rules_nodejs//:repositories.bzl", "build_bazel_rules_nodejs_dependencies")

build_bazel_rules_nodejs_dependencies()

load("@rules_nodejs//nodejs:repositories.bzl", "nodejs_register_toolchains")

nodejs_register_toolchains(
    name = "nodejs",
    node_version = "16.14.0",
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
        "//:tools/postinstall/devmode-es2020-bazel.patch",
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

load("@dev-infra//bazel/browsers:browser_repositories.bzl", "browser_repositories")

browser_repositories()

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

load("@aspect_rules_js//npm:npm_import.bzl", "npm_translate_lock")

npm_translate_lock(
    name = "npm_mio",
    data = ["//mio:package.json"],
    yarn_lock = "//mio:yarn.lock",
    pnpm_lock = "//mio:pnpm-lock.yaml",
    npmrc = "//mio:.npmrc",
    verify_node_modules_ignored = "//:.bazelignore",
    patches = {
      "@angular-devkit/architect-cli": ["//mio:tools/patches/bazel-architect-cli.patch"],
    },
)

load("@npm_mio//:repositories.bzl", "npm_repositories")

npm_repositories()
