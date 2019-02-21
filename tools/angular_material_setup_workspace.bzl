# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license
"""Install Angular Material source dependencies"""

load("@build_bazel_rules_nodejs//:defs.bzl", "yarn_install")

def angular_material_setup_workspace():
  """
    This repository rule should be called from your WORKSPACE file.

    It creates some additional Bazel external repositories that are used internally
    to build Angular Material
  """
  # Use Bazel managed node modules.
  # TODO(jelbourn): move this directly to the WORKSPACE file
  yarn_install(
    name = "npm",
    package_json = "@angular_material//:package.json",
    # Ensure that the script is available when running `postinstall` in the Bazel sandbox.
    data = [
      "@angular_material//:tools/npm/check-npm.js",
      "//:angular-tsconfig.json",
    ],
    yarn_lock = "@angular_material//:yarn.lock",
  )
