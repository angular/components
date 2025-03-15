def compute_module_name(testonly):
    current_pkg = native.package_name()

    # For test-only targets we do not compute any module name as
    # those are not publicly exposed through the `@angular` scope.
    if testonly:
        return None

    # We generate no module name for files outside of `src/<pkg>` (usually tools).
    if not current_pkg.startswith("src/"):
        return None

    # Skip module name generation for internal apps which are not built as NPM package
    # and not scoped under `@angular/`. This includes e2e-app, dev-app and universal-app.
    if "-app" in current_pkg:
        return None

    # Construct module names based on the current Bazel package. e.g. if a target is
    # defined within `src/cdk/a11y` then the module name will be `@angular/cdk/a11y`.
    return "@angular/%s" % current_pkg[len("src/"):]
