workspace(name = "angular_material")

# Add TypeScript rules
http_archive(
  name = "build_bazel_rules_typescript",
  url = "https://github.com/bazelbuild/rules_typescript/archive/0.17.0.zip",
  strip_prefix = "rules_typescript-0.17.0",
  sha256 = "1626ee2cc9770af6950bfc77dffa027f9aedf330fe2ea2ee7e504428927bd95d",
)

# Fetch transient dependencies of the TypeScript bazel rules.
load("@build_bazel_rules_typescript//:package.bzl", "rules_typescript_dependencies")
rules_typescript_dependencies()

# Add sass rules
http_archive(
  name = "io_bazel_rules_sass",
  url = "https://github.com/bazelbuild/rules_sass/archive/0.1.0.zip",
  strip_prefix = "rules_sass-0.1.0",
  sha256 = "b243c4d64f054c174051785862ab079050d90b37a1cef7da93821c6981cb9ad4",
)

load("@io_bazel_rules_sass//sass:sass_repositories.bzl", "sass_repositories")
sass_repositories()

# NOTE: this rule installs nodejs, npm, and yarn, but does NOT install
# your npm dependencies. You must still run the package manager.
load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories")

check_bazel_version("0.15.0")
node_repositories(
  package_json = ["//:package.json"],
  # Disabled until we use fine-grained dependencies. This was previously disabled but is now
  # enabled by default.
  preserve_symlinks = False,
)

# Setup TypeScript Bazel workspace
load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace")
ts_setup_workspace()

# Add Angular rules
local_repository(
  name = "angular",
  path = "node_modules/@angular/bazel",
)

# Add rxjs
local_repository(
  name = "rxjs",
  path = "node_modules/rxjs/src",
)

# This commit matches the version of buildifier in angular/ngcontainer
# If you change this, also check if it matches the version in the angular/ngcontainer
# version in /.circleci/config.yml
BAZEL_BUILDTOOLS_VERSION = "82b21607e00913b16fe1c51bec80232d9d6de31c"
