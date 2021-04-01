load("//tools:defaults.bzl", "jasmine_node_test")
load("@io_bazel_rules_webtesting//web:web.bzl", "web_test")
load("//tools/server-test:index.bzl", "server_test")

def webdriver_test(name, tags = [], **kwargs):
  jasmine_node_test(
      name = "%s_jasmine_test" % name,
      data = [
          "@npm//:node_modules",
      ],
      tags = ["manual"],
      **kwargs,
  )

  web_test(
      name = "%s_chromium_web_test" % name,
      browser = "@npm//@angular/dev-infra-private/browsers/chromium:chromium",
      tags = ["manual"],
      test = ":%s_jasmine_test" % name,
  )

  web_test(
      name = "%s_firefox_web_test" % name,
      browser = "@npm//@angular/dev-infra-private/browsers/firefox:firefox",
      tags = ["manual"],
      test = ":%s_jasmine_test" % name,
  )

  server_test(
      name = "%s_chromium" % name,
      server = "//src/e2e-app:devserver",
      test = ":%s_chromium_web_test" % name,
      tags = tags,
  )

  server_test(
      name = "%s_firefox" % name,
      server = "//src/e2e-app:devserver",
      test = ":%s_firefox_web_test" % name,
      tags = tags,
  )

  native.test_suite(
      name = name,
      tests = [
        ":%s_chromium" % name,
        ":%s_firefox" % name,
      ]
  )



