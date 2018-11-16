# Notes for releasing

## Angular version

For Bazel support downstream, the version of the @angular/bazel npm package
in `package.json` and `tools/npm/package.json` must match the version of the
`@angular` `http_archive` in `WORKSPACE`. For this reason, `@angular/bazel`
should be pinned to a specific version in both `package.json` files. If updating
the version of the angular http_archive, ensure sure that all 3 versions line up.

For example:

```
http_archive(
  name = "angular",
  url = "https://github.com/angular/angular/archive/7.0.4.zip",
  strip_prefix = "angular-7.0.4",
)
```

in `WORKSPACE` must match the version in in `package.json` and `tools/npm/package.json`:

```
"@angular/bazel": "7.0.4",
```
