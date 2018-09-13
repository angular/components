workspace(name = "angular_material")

BAZEL_BUILDTOOLS_VERSION = "82b21607e00913b16fe1c51bec80232d9d6de31c"

http_archive(
    name = "com_github_bazelbuild_buildtools",
    url = "https://github.com/bazelbuild/buildtools/archive/%s.zip" % BAZEL_BUILDTOOLS_VERSION,
    strip_prefix = "buildtools-%s" % BAZEL_BUILDTOOLS_VERSION,
    sha256 = "edb24c2f9c55b10a820ec74db0564415c0cf553fa55e9fc709a6332fb6685eff",
)

http_archive(
    name = "build_bazel_rules_nodejs",
    urls = ["https://github.com/bazelbuild/rules_nodejs/archive/0.12.2.zip"],
    strip_prefix = "rules_nodejs-0.12.2",
    sha256 = "b691443ee5877214bfce3b006204528ef92ee57c2c5d21aec6a757bc6f58a7b8",
)

# Runs the TypeScript compiler
local_repository(
    name = "build_bazel_rules_typescript",
    path = "node_modules/@bazel/typescript",
)

load("@build_bazel_rules_typescript//:package.bzl", "rules_typescript_dependencies")
rules_typescript_dependencies()

# Runs the Sass CSS preprocessor
http_archive(
    name = "io_bazel_rules_sass",
    url = "https://github.com/bazelbuild/rules_sass/archive/1.11.0.zip",
    strip_prefix = "rules_sass-1.11.0",
    sha256 = "dbe9fb97d5a7833b2a733eebc78c9c1e3880f676ac8af16e58ccf2139cbcad03",
)

# The @angular repo contains rule for building Angular applications
http_archive(
    name = "angular",
    url = "https://github.com/angular/angular/archive/7.0.0-beta.4.zip",
    strip_prefix = "angular-7.0.0-beta.4",
    sha256 = "8b124b71b8059c97009de3f20977f7798e80c2f3185fe1d1bb4ed0549baf03e0",
)

# The @rxjs repo contains targets for building rxjs with bazel
local_repository(
    name = "rxjs",
    path = "node_modules/rxjs/src",
)

####################################
# Load and install our dependencies downloaded above.

load("@build_bazel_rules_nodejs//:defs.bzl", "node_repositories", "yarn_install")

node_repositories(
    package_json = ["//:package.json"],
    preserve_symlinks = True,
)

load("@io_bazel_rules_go//go:def.bzl", "go_rules_dependencies", "go_register_toolchains")

go_rules_dependencies()
go_register_toolchains()

load("@io_bazel_rules_webtesting//web:repositories.bzl", "browser_repositories", "web_test_repositories")

web_test_repositories()
browser_repositories(
    chromium = True,
    firefox = True,
)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace", "check_rules_typescript_version")
ts_setup_workspace()

# 0.16.0: tsc_wrapped uses user's typescript version & check_rules_typescript_version
check_rules_typescript_version("0.16.0")

load("@io_bazel_rules_sass//sass:sass_repositories.bzl", "sass_repositories")
sass_repositories()

#
# Load and install our dependencies from local repositories
#

load("@angular//:index.bzl", "ng_setup_workspace")
ng_setup_workspace()
