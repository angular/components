# Angular Components Docs Site

This is the repository for the [Angular Components documentation site](https://material.angular.io/).

Versions of this site are also available for
- [v5](https://v5.material.angular.io/)
- [v6](https://v6.material.angular.io/)
- [v7](https://v7.material.angular.io/)
- [v8](https://v8.material.angular.io/)
- [v9](https://v9.material.angular.io/)
- [v10](https://v10.material.angular.io/)
- [v11](https://v11.material.angular.io/)
- [v12](https://material.angular.io/)

## Contributing

Please open bugs against the Angular Material and CDK components, directives, documentation
contents, API docs, and demos in the
[Angular Components repo](https://github.com/angular/components/issues).

Please only open issues with the documentation site itself (not the content) in
[this repo](https://github.com/angular/material.angular.io/issues). This includes issues like the
navigation not working properly, examples or documentation not being presented in an accessible way,
issues with rendering or layout of the documentation pages, etc.

### Where does the content come from?

The guides, examples, and docs content repo
[angular/material2-docs-content](https://github.com/angular/material2-docs-content) contains the
documentation content and examples. They are generated from:
- [Angular Material and CDK Guides](https://github.com/angular/components/tree/master/guides)
- [Material components, services, and directives](https://github.com/angular/components/tree/master/src/material)
- [CDK components, services, and directives](https://github.com/angular/components/tree/master/src/cdk)

## Development Setup

1. Make sure you have [NodeJS LTS](https://nodejs.org) installed
1. Make sure you have [Yarn](https://yarnpkg.com) installed
1. Install the project's dependencies
   - `yarn install`
1. Update to the latest version of the docs-content and examples
   - `yarn build:content`

## Development Server

1. Run `yarn start` for a dev server. Navigate to `http://localhost:4200/`.

## Build

Run `yarn prod-build` to build the project.

## Running unit tests

1. Run `yarn test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `yarn e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `yarn start`.

## Deployment instructions

```
> yarn install
> yarn upgrade @angular/components-examples

# Development
> yarn publish-dev

# Production
> yarn publish-prod
```
