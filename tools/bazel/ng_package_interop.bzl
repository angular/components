load("@aspect_rules_js//npm:providers.bzl", "NpmPackageInfo")
load("@aspect_rules_js//js:libs.bzl", "js_lib_helpers")

def _ng_package_interop_impl(ctx):
    # forward all npm_package_store_infos
    npm_package_store_infos = js_lib_helpers.gather_npm_package_store_infos(
        targets = ctx.attr.interop_deps,
    )

    return [
        NpmPackageInfo(
            package = ctx.attr.package_name,
            version = "0.0.0",
            src = ctx.files.src[0],
            npm_package_store_infos = npm_package_store_infos,
        ),
    ]

ng_package_interop = rule(
    implementation = _ng_package_interop_impl,
    doc = """
        Rule that makes `ng_package` rule output usable with `rules_js`. E.g.
        for pnpm workspace linking of such first-party packages.
    """,
    attrs = {
        "package_name": attr.string(mandatory = True),
        "src": attr.label(mandatory = True),
        "interop_deps": attr.label_list(mandatory = True),
    },
)
