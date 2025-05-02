# Angular Components Docs Site

This is the repository for the [Angular Components documentation site](https://material.angular.dev/).

Versions of this site are also available for
- [v5](https://v5.material.angular.dev/)
- [v6](https://v6.material.angular.dev/)
- [v7](https://v7.material.angular.dev/)
- [v8](https://v8.material.angular.dev/)
- [v9](https://v9.material.angular.dev/)
- [v10](https://v10.material.angular.dev/)
- [v11](https://v11.material.angular.dev/)
- [v12](https://material.angular.dev/)

## Contributing

Please open bugs against the Angular Material and CDK components, directives, documentation
contents, API docs, and demos in the
[Angular Components repo](https://github.com/angular/components/issues).

Please only open issues with the documentation site itself (not the content) in
[this repo](https://github.com/angular/material.angular.dev/issues). This includes issues like the
navigation not working properly, examples or documentation not being presented in an accessible way,
issues with rendering or layout of the documentation pages, etc.

### Where does the content come from?

The guides, examples, and docs content repo
[angular/material2-docs-content](https://github.com/angular/material2-docs-content) contains the
documentation content and examples. They are generated from:
- [Angular Material and CDK Guides](https://github.com/angular/components/tree/main/guides)
- [Material components, services, and directives](https://github.com/angular/components/tree/main/src/material)
- [CDK components, services, and directives](https://github.com/angular/components/tree/main/src/cdk)

## Development Server

1. Run `pnpm bazel run //docs:serve` for a dev server. Navigate to `http://localhost:4200/`.

## Build

Run `pnpm bazel build //docs:build.production` to build the project.

## Running unit tests

1. Run `pnpm bazel test //docs/...` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Scenes Development server

1. Run `pnpm bazel run //docs/scenes:build.serve` for a dev server. Navigate to `http://localhost:4200/`.

# Build

Run `pnpm bazel build //docs/scenes:build.production` to build the project.

## Running unit tests

1. Run `pnpm bazel test //docs/scenes/...` to execute the unit tests via [Karma](https://karma-runner.github.io).
