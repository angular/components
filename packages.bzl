# Each individual package uses a placeholder for the version of Angular to ensure they're
# all in-sync. This map is passed to each ng_package rule to stamp out the appropriate
# version for the placeholders.
TSLIB_PACKAGE_VERSION = "^2.3.0"
RXJS_PACKAGE_VERSION = "^6.5.3 || ^7.4.0"

# Each placeholder is used to stamp versions during the build process, replacing the key with its
# value pair. These replacements occur during building of `npm_package` and `ng_package` stamping in
# the peer dependencies and versions, primarily in `package.json`s.
NPM_PACKAGE_SUBSTITUTIONS = {
    # Peer dependency version on the Angular framework.
    "0.0.0-NG": "{STABLE_FRAMEWORK_PEER_DEP_RANGE}",
    # Version of `tslib`
    "0.0.0-TSLIB": TSLIB_PACKAGE_VERSION,
    # Version of the local package being built, generated via the `--workspace_status_command` flag.
    "0.0.0-PLACEHOLDER": "{STABLE_PROJECT_VERSION}",
    # Version of `rxjs`
    "0.0.0-RXJS": RXJS_PACKAGE_VERSION,
}

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
