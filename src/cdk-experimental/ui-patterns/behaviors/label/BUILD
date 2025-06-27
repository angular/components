load("//tools:defaults.bzl", "ng_web_test_suite", "ts_project")

package(default_visibility = ["//visibility:public"])

ts_project(
    name = "label",
    srcs = [
        "label.ts",
    ],
    deps = [
        "//:node_modules/@angular/core",
        "//src/cdk-experimental/ui-patterns/behaviors/signal-like",
    ],
)

ts_project(
    name = "unit_test_sources",
    testonly = True,
    srcs = [
        "label.spec.ts",
    ],
    deps = [
        ":label",
        "//:node_modules/@angular/core",
    ],
)

ng_web_test_suite(
    name = "unit_tests",
    deps = [":unit_test_sources"],
)
