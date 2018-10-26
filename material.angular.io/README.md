# Angular Material Docs Site

This is the repository for the [Angular Material documentation site](https://material.angular.io/).

Versions of this site are also available for
- [Beta](https://next.material.angular.io/)
- [v5](https://v5.material.angular.io/)
- [v6](https://v6.material.angular.io/)

## Contributing
Please open bugs against the Angular Material components, directives, documentation contents, API docs,
and demos in the [Angular Material repo](https://github.com/angular/material2/issues).

Please only open issues with the documentation site itself (not the content) in
[this repo](https://github.com/angular/material.angular.io/issues). This includes issues like the navigation
not working properly, examples or documentation not being presented in an accessible way, issues with
rendering or layout of the documentation pages, etc.

### Where does the content come from?
The documentation is generated from the following resources
- [Guides](https://github.com/angular/material2/tree/master/guides)
- [Examples](https://github.com/angular/material2/tree/master/src/material-examples)
- [Material components, services, and directives](https://github.com/angular/material2/tree/master/src/lib)
- [CDK components, services, and directives](https://github.com/angular/material2/tree/master/src/cdk)

## Development Setup
1. Clone Angular Material in the parent directory of this repo
    1. `cd ..`
    1. `git clone git@github.com:angular/material2.git`
1. Install Gulp globally: `npm i -g gulp`
1. Build and copy docs and examples from Angular Material: `npm run fetch-local`
    - Note that you may need to run this after each time that you run `npm i` as some of the examples are
      actually placed in `node_modules/@angular/`
    - If you see the error `Cannot find module '@angular/material-examples'`,
      it means that you need to run `npm run fetch-local` again

## Development Server
1. Run `npm start` for a dev server. Navigate to `http://localhost:4200/`

## Build
Run `npm run prod-build` to build the project.

## Running unit tests
1. Run `npm run test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests
Run `npm run e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `npm start`.

## Deployment instructions
```
> npm install

# Development
> npm run publish-dev

# Production
> npm run publish-prod
```
