# Experimental Ivy Scripts

These scripts exist for the testing of Ivy in the Material repo, pre-launch. This is uncharted
territory, so building Material this way may or may not work, and depending on the output is
non-trivial.

## Usage

For the first execution, a version of Angular must be built with `ngtsc`. To do this, a current
Angular repo is passed to `install-angular.sh`.

```bash
$ ./scripts/ivy/install-angular.sh /path/to/angular
```

This will replace `node_modules/@angular` with `ngtsc`-built versions of Angular packages.

Once that step is complete, the demo application can be built.

```bash
# Build the demo-app with Ivy
$ ./scripts/ivy/build.sh
# And serve it
$ cd dist/demo && http-server
```

## Known issues
* Much of the compilation will fail without commits in the Angular repo not yet in `master`.
* Ivy does not support the `ViewContainerRef.createComponent()` API yet, so the demo-app is unable to get past starting the Angular Router.

## Maintaining tsconfig files

The `ivy` branch has a lot of updated tsconfig files. These were mutated via script, which can
be re-run if needed

```bash
# Update tsconfigs
./scripts/ivy/update-tsconfigs.sh
```
