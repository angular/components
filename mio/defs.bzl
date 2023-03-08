load("@npm//:@angular-devkit/architect-cli/package_json.bzl", architect_cli = "bin")
load("@aspect_bazel_lib//lib:copy_to_bin.bzl", "copy_to_bin")

# NOTE:
#  *_DEPS are runtime dependencies
#  *_CONFIG are tools and their dependencies

# Global dependencies such as common config files, tools
COMMON_CONFIG = [
    "//:ng-base-config",

    # The architect-cli invoking the build
    "//:node_modules/@angular-devkit/architect-cli",

    # Required for angular.json reference to '@angular/cli/lib/config/schema.json'
    "//:node_modules/@angular/cli",

    # builders referenced from angular.json
    "//:node_modules/@angular-devkit/build-angular",
]

# Standard dependencies common across libs/tests
# Only include the core Angular + Components/Material which are versioned together
NG_COMMON_DEPS = [
    # Angular libraries versioned together
    "//:node_modules/@angular/animations",
    "//:node_modules/@angular/common",
    "//:node_modules/@angular/core",
    "//:node_modules/@angular/forms",
    "//:node_modules/@angular/localize",
    "//:node_modules/@angular/router",
    "//:node_modules/@angular/platform-browser",
    "//:node_modules/@angular/platform-browser-dynamic",

    # Angular cdk+material libraries versioned together
    "//:node_modules/@angular/cdk",
    "//:node_modules/@angular/cdk-experimental",
    "//:node_modules/@angular/material",
    "//:node_modules/@angular/material-experimental",
    "//:node_modules/@angular/material-moment-adapter",
    "//:node_modules/@angular/youtube-player",

    # Common libraries used throughout
    "//:node_modules/rxjs",
    "//:node_modules/tslib",
    "//:node_modules/zone.js",
]

# Common dependencies of Angular CLI applications
APPLICATION_CONFIG = COMMON_CONFIG + [
    ":ng-app-config",
]
APPLICATION_DEPS = [
]

# Common dependencies of Angular CLI test suites
TEST_CONFIG = COMMON_CONFIG + [
    "@dev-infra//bazel/browsers/chromium",
    "@dev-infra//bazel/browsers/firefox",

    "//:ng-base-test-config",
    ":ng-test-config",
    "//:node_modules/karma",
    "//:node_modules/karma-chrome-launcher",
    "//:node_modules/karma-firefox-launcher",
    "//:node_modules/karma-jasmine",
    "//:node_modules/karma-jasmine-html-reporter",
    "//:node_modules/karma-coverage-istanbul-reporter",
]
TEST_DEPS = [
    "//:node_modules/@types/jasmine",
    "//:node_modules/@types/node",
    "//:node_modules/@angular/compiler",
    "//:node_modules/jasmine-core",
]

# Common dependencies of Angular CLI e2e tests
E2E_CONFIG = COMMON_CONFIG + [
    "@dev-infra//bazel/browsers/chromium",
    "@dev-infra//bazel/browsers/firefox",

    "//:ng-base-test-config",
    ":ng-e2e-config",
    "//:node_modules/jasmine-spec-reporter",
]
E2E_DEPS = APPLICATION_DEPS + [
    "//:node_modules/@types/jasmine",
    "//:node_modules/@types/node",
    "//:node_modules/protractor",
    "//:node_modules/webdriver-manager",
]

LINT_CONFIG = COMMON_CONFIG + [
  # Lint uses the e2e config
  "//:ng-base-test-config",
  ":ng-e2e-config",
  "//:ng-base-lint-config",
  "//:node_modules/@angular-eslint/builder",
  "//:node_modules/@angular-eslint/eslint-plugin",
  "//:node_modules/@angular-eslint/eslint-plugin-template",
  "//:node_modules/@angular-eslint/template-parser",
  "//:node_modules/eslint-plugin-ban",
  "//:node_modules/eslint-plugin-import",
  "//:node_modules/eslint-plugin-jsdoc",
  "//:node_modules/eslint-plugin-prefer-arrow",
  "//:node_modules/@typescript-eslint/eslint-plugin",
  "//:node_modules/@typescript-eslint/parser",
]
LINT_DEPS = APPLICATION_DEPS + [
  # TODO(bazel): this should be included as a transitive of @angular-devkit/architect-cli!?
  "//:node_modules/@angular-devkit/architect",
]


ARCHITEXT_ENV = {
  "NG_BUILD_LEGACY_SASS": "1",
}

def ng_app(name, project_name = None, deps = [], test_deps = [], e2e_deps = [], **kwargs):
    """
    Macro for Angular applications, creating various targets aligning with the Angular CLI.

    For a given application targets are created aligning with Angular CLI commands.
    CLI commands can be found in angular.json at `project.[project].architect.[command]`.
    Additional targets may be created from different command configurations such as `build.production`.

    Args:
      name: the rule name
      project_name: the Angular CLI project name, to the rule name
      deps: dependencies of the library
      test_deps: additional dependencies for tests
      e2e_deps: additional dependencies for e2e tests
      **kwargs: extra args passed to main Angular CLI rules
    """
    srcs = native.glob(
        ["src/**/*"],
        exclude = [
            "src/**/*.spec.ts",
            "src/test.ts",
        ],
    )

    test_srcs = native.glob(["src/test.ts", "src/**/*.spec.ts"])

    e2e_srcs =  native.glob(["e2e/src/**/*.ts"])

    tags = kwargs.pop("tags", [])

    # config files
    copy_to_bin(
        name = "ng-app-config",
        srcs = [
          "tsconfig.app.json",
        ],
        visibility = ["//visibility:private"],
    )
    copy_to_bin(
        name = "ng-test-config",
        srcs = [
          "karma.conf.js",
          "tsconfig.spec.json",
        ],
        visibility = ["//visibility:private"],
    )
    copy_to_bin(
        name = "ng-e2e-config",
        srcs = [
          "e2e/tsconfig.json",
          "e2e/protractor.conf.js",
        ],
        visibility = ["//visibility:private"],
    )

    # Lint config files in addition to the root
    if native.package_name() != '':
      copy_to_bin(
          name = "lint-config",
          srcs = [
              ".eslintrc.json",
          ],
          visibility = ["//visibility:private"],
      )

    project_name = project_name if project_name else name

    native.alias(
        name = name,
        actual = "build.production",
    )

    _architect_build(
        project_name,
        srcs = srcs + deps + NG_COMMON_DEPS + APPLICATION_DEPS + APPLICATION_CONFIG,
        tags = tags + ["manual"],
        **kwargs
    )
    _architect_build(
        project_name,
        srcs = srcs + deps + NG_COMMON_DEPS + APPLICATION_DEPS + APPLICATION_CONFIG,
        configuration = "production",
        tags = tags,
        **kwargs
    )

    _architect_binary(
        project_name,
        "serve",
        srcs = srcs + deps + NG_COMMON_DEPS + APPLICATION_DEPS + APPLICATION_CONFIG,
        tags = tags + ["manual"],
        **kwargs
    )
    _architect_binary(
        project_name,
        "serve",
        configuration = "production",
        srcs = srcs + deps + NG_COMMON_DEPS + APPLICATION_DEPS + APPLICATION_CONFIG,
        tags = tags + ["manual"],
        **kwargs
    )

    _architect_test(
        project_name,
        "test",
        args = ["--no-watch"],
        srcs = srcs + test_srcs + deps + test_deps + NG_COMMON_DEPS + TEST_DEPS + TEST_CONFIG,
        tags = tags,
        **kwargs
    )

    # FUTURE:
    # _architect_test(
    #     project_name,
    #     "e2e",
    #     size = "large",
    #     srcs = srcs + e2e_srcs + deps + e2e_deps + NG_COMMON_DEPS + E2E_DEPS + E2E_CONFIG,
    #     args = [
    #       "--no-webdriver-update",
    #       "--port=0",
    #     ],
    #     tags = tags + ["e2e"],
    #     **kwargs
    # )

    _architect_test(
        project_name,
        "lint",
        srcs = srcs + test_srcs + e2e_srcs + deps + test_deps + NG_COMMON_DEPS + LINT_DEPS + LINT_CONFIG + ([":lint-config"] if native.package_name() != '' else []),
        tags = tags + ["lint"],
        **kwargs
    )

def _architect_build(project_name, configuration = None, args = [], srcs = [], **kwargs):
    output_dir = "%s%s" % (project_name, ".%s" % configuration if configuration else "")

    args = [
      "%s:build%s" % (project_name, ":%s" % configuration if configuration else ""),
      "--output-path", output_dir
    ] + args

    architect_cli.architect(
        name = "%s%s" % ("build", ".%s" % configuration if configuration else ""),
        chdir = native.package_name(),
        args = args,
        out_dirs = [output_dir],
        srcs = srcs,
        env = ARCHITEXT_ENV,
        **kwargs,
    )

def _architect_test(project_name, command, configuration = None, args = [], srcs = [], **kwargs):
    to_root = ""
    if native.package_name() != "":
      to_root = "".join(["../" for _ in native.package_name().split("/")])

    env = {
        "CHROME_BIN": to_root + "$(CHROMIUM)",
        "CHROMEDRIVER_BIN": to_root + "$(CHROMEDRIVER)",
    }
    env.update(ARCHITEXT_ENV)

    architect_cli.architect_test(
        name = "%s%s" % (command, ".%s" % configuration if configuration else ""),
        chdir = native.package_name(),
        args = [
          "%s:%s%s" % (project_name, command, ":%s" % configuration if configuration else "")
        ] + args,
        data = srcs,
        env = env,
        toolchains = [
            "@dev-infra//bazel/browsers/chromium:toolchain_alias",
            "@dev-infra//bazel/browsers/firefox:toolchain_alias",
        ],
        **kwargs,
    )

def _architect_binary(project_name, command, configuration = None, args = [], srcs = [], **kwargs):
    architect_cli.architect_binary(
        name = "%s%s" % (command, ".%s" % configuration if configuration else ""),
        chdir = native.package_name(),
        args = [
          "%s:%s%s" % (project_name, command, ":%s" % configuration if configuration else "")
        ] + args,
        data = srcs,
        env = ARCHITEXT_ENV,
        **kwargs,
    )

