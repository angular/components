workspace(name = "angular_material")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Add NodeJS rules (explicitly used for sass bundle rules)
http_archive(
  name = "build_bazel_rules_nodejs",
  sha256 = "86ea92217dfd4a84e1e335cc07dfd942b12899796b080492546b947f12c5ab77",
  urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/0.26.0-beta.0/rules_nodejs-0.26.0-beta.0.tar.gz"],
)

# Add sass rules
http_archive(
  name = "io_bazel_rules_sass",
  url = "https://github.com/bazelbuild/rules_sass/archive/1.16.1.zip",
  strip_prefix = "rules_sass-1.16.1",
)

load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories", "yarn_install")

# The minimum bazel version to use with this repo is 0.18.0
check_bazel_version("0.18.0")

node_repositories(
  # For deterministic builds, specify explicit NodeJS and Yarn versions.
  node_version = "10.13.0",
  # Use latest yarn version to support integrity field (added in yarn 1.10)
  yarn_version = "1.12.1",
)

yarn_install(
  name = "npm",
  package_json = "//:package.json",
  # Ensure that the script is available when running `postinstall` in the Bazel sandbox.
  data = [
    "//:tools/npm/check-npm.js",
    "//:angular-tsconfig.json",
  ],
  yarn_lock = "//:yarn.lock",
)

# Install all bazel dependencies of the @ngdeps npm packages
load("@npm//:install_bazel_dependencies.bzl", "install_bazel_dependencies")
install_bazel_dependencies()

# Setup TypeScript Bazel workspace
load("@npm_bazel_typescript//:index.bzl", "ts_setup_workspace")
ts_setup_workspace()

# Fetch transitive dependencies which are needed to use the karma rules.
load("@npm_bazel_karma//:package.bzl", "rules_karma_dependencies")
rules_karma_dependencies()

# Fetch transitive dependencies which are needed to use the Sass rules.
load("@io_bazel_rules_sass//:package.bzl", "rules_sass_dependencies")
rules_sass_dependencies()

# Setup the Sass rule repositories.
load("@io_bazel_rules_sass//:defs.bzl", "sass_repositories")
sass_repositories()

# Setup web testing. We need to setup a browser because the web testing rules for TypeScript need
# a reference to a registered browser (ideally that's a hermetic version of a browser)
load("@io_bazel_rules_webtesting//web:repositories.bzl", "web_test_repositories")

web_test_repositories()

load("@npm_bazel_karma//:browser_repositories.bzl", "browser_repositories")

browser_repositories()
