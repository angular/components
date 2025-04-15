load("//tools:defaults2.bzl", "protractor_web_test_suite")

def e2e_test_suite(name, tags = ["e2e"], deps = []):
    protractor_web_test_suite(
        name = name,
        server = "//src/e2e-app:server",
        tags = tags,
        deps = deps,
    )
