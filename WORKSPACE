workspace(name = "angular_material_src")

####################################
# Fetch and install the NodeJS rules

# Using a pre-release snapshot to pick up a commit that makes all nodejs_binary
# programs produce source-mapped stack traces and uglify sourcemaps.
RULES_NODEJS_VERSION = "0162fdbe8ed986c9b5d5b79e53c98385ddaf6edd"

http_archive(
    name = "build_bazel_rules_nodejs",
    url = "https://github.com/bazelbuild/rules_nodejs/archive/%s.zip" % RULES_NODEJS_VERSION,
    strip_prefix = "rules_nodejs-%s" % RULES_NODEJS_VERSION,
    sha256 = "922327733a9ffe5961cd6edbce597d07845ea69cc753066d554137f663dedbe5",
)

load("@build_bazel_rules_nodejs//:defs.bzl", "node_repositories", "yarn_install")

node_repositories(package_json = ["//:package.json"])


# Add sass rules
http_archive(
    name = "io_bazel_rules_sass",
    url = "https://github.com/bazelbuild/rules_sass/archive/0.0.3.zip",
    strip_prefix = "rules_sass-0.0.3",
    sha256 = "8fa98e7b48a5837c286a1ea254b5a5c592fced819ee9fe4fdd759768d97be868",
)

load("@io_bazel_rules_sass//sass:sass.bzl", "sass_repositories")
sass_repositories()

####################################
# Fetch and install the TypeScript rules
http_archive(
    name = "build_bazel_rules_typescript",
    url = "https://github.com/bazelbuild/rules_typescript/archive/0.10.1.zip",
    strip_prefix = "rules_typescript-0.10.1",
    sha256 = "a2c81776a4a492ff9f878f9705639f5647bef345f7f3e1da09c9eeb8dec80485",
)

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
