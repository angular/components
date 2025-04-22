# Packages which are versioned together on npm
ANGULAR_COMPONENTS_SCOPED_PACKAGES = ["@angular/%s" % p for p in [
    "material",
    "cdk",
    "cdk-experimental",
    "material-experimental",
    "material-luxon-adapter",
    "material-moment-adapter",
    "material-date-fns-adapter",
]]

PKG_GROUP_REPLACEMENTS = {
    "\"NG_UPDATE_PACKAGE_GROUP\"": """[
      %s
    ]""" % ",\n      ".join(["\"%s\"" % s for s in ANGULAR_COMPONENTS_SCOPED_PACKAGES]),
}

# Each placeholder is used to stamp versions during the build process, replacing the key with its
# value pair. These replacements occur during building of `npm_package` and `ng_package` stamping in
# the peer dependencies and versions, primarily in `package.json`s.
NPM_PACKAGE_SUBSTITUTIONS = dict(PKG_GROUP_REPLACEMENTS, **{
    # Peer dependency version on the Angular framework.
    "0.0.0-NG": "{STABLE_FRAMEWORK_PEER_DEP_RANGE}",
    # Version of the local package being built, generated via the `--workspace_status_command` flag.
    "0.0.0-PLACEHOLDER": "{STABLE_PROJECT_VERSION}",
})

NO_STAMP_NPM_PACKAGE_SUBSTITUTIONS = dict(NPM_PACKAGE_SUBSTITUTIONS, **{
    # When building NPM packages for tests (where stamping is disabled),
    # we use `0.0.0` for the version placeholder.
    "0.0.0-PLACEHOLDER": "0.0.0",
    "0.0.0-NG": ">=0.0.0",
})

ANGULAR_PACKAGES_CONFIG = [
    ("@angular/animations", struct(entry_points = ["browser"])),
    ("@angular/common", struct(entry_points = ["http/testing", "http", "testing"])),
    ("@angular/compiler", struct(entry_points = [])),
    ("@angular/core", struct(entry_points = ["testing"])),
    ("@angular/forms", struct(entry_points = [])),
    ("@angular/platform-browser", struct(entry_points = ["testing", "animations"])),
    ("@angular/platform-server", struct(entry_points = [], platform = "node")),
    ("@angular/platform-browser-dynamic", struct(entry_points = ["testing"])),
    ("@angular/router", struct(entry_points = [])),
    ("@angular/localize", struct(entry_points = ["init"])),
]

ANGULAR_PACKAGES = [
    struct(
        name = name[len("@angular/"):],
        entry_points = config.entry_points,
        platform = config.platform if hasattr(config, "platform") else "browser",
        module_name = name,
    )
    for name, config in ANGULAR_PACKAGES_CONFIG
]
