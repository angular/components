workspace(name = "angular_material")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Add NodeJS rules (explicitly used for sass bundle rules)
http_archive(
  name = "build_bazel_rules_nodejs",
  sha256 = "1416d03823fed624b49a0abbd9979f7c63bbedfd37890ddecedd2fe25cccebc6",
  urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/0.18.6/rules_nodejs-0.18.6.tar.gz"],
)

load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories")

# The minimum bazel version to use with this repo is 0.18.0
check_bazel_version("0.18.0")

node_repositories(
  # For deterministic builds, specify explicit NodeJS and Yarn versions.
  node_version = "10.13.0",
  # Use latest yarn version to support integrity field (added in yarn 1.10)
  yarn_version = "1.12.1",
)

load("@angular_material//:index.bzl", "angular_material_setup_workspace")
angular_material_setup_workspace()

# Install all bazel dependencies of the @ngdeps npm packages
load("@npm//:install_bazel_dependencies.bzl", "install_bazel_dependencies")
install_bazel_dependencies()

# Setup TypeScript Bazel workspace
load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace")
ts_setup_workspace()

# Fetch transitive dependencies which are needed to use the karma rules.
load("@build_bazel_rules_karma//:package.bzl", "rules_karma_dependencies")
rules_karma_dependencies()

# Add RxJS as repository because those are needed in order to build Angular from source.
# Also we cannot refer to the RxJS version from the node modules because self-managed
# node modules are not guaranteed to be installed.
# TODO(gmagolan): remove this once rxjs ships with an named UMD bundle and we
# are no longer building it from source.
http_archive(
  name = "rxjs",
  url = "https://registry.yarnpkg.com/rxjs/-/rxjs-6.3.3.tgz",
  strip_prefix = "package/src",
  sha256 = "72b0b4e517f43358f554c125e40e39f67688cd2738a8998b4a266981ed32f403",
)

# Add sass rules
http_archive(
  name = "io_bazel_rules_sass",
  url = "https://github.com/bazelbuild/rules_sass/archive/1.16.1.zip",
  strip_prefix = "rules_sass-1.16.1",
)

# Fetch transitive dependencies which are needed to use the Sass rules.
load("@io_bazel_rules_sass//:package.bzl", "rules_sass_dependencies")
rules_sass_dependencies()

# Setup the Sass rule repositories.
load("@io_bazel_rules_sass//:defs.bzl", "sass_repositories")
sass_repositories()

http_archive(
  name = "io_bazel_rules_webtesting",
  sha256 = "1c0900547bdbe33d22aa258637dc560ce6042230e41e9ea9dad5d7d2fca8bc42",
  urls = [
    "https://github.com/bazelbuild/rules_webtesting/releases/download/0.3.0/rules_webtesting.tar.gz"
  ],
)

# Setup web testing. We need to setup a browser because the web testing rules for TypeScript need
# a reference to a registered browser (ideally that's a hermetic version of a browser)
load("@io_bazel_rules_webtesting//web:repositories.bzl", "browser_repositories",
    "web_test_repositories")

web_test_repositories()
browser_repositories(
  chromium = True,
)
