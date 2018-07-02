# Experimental Ivy Scripts

These scripts exist for the testing of Ivy in the Material repo, pre-launch. This is uncharted
territory, so building Material this way may or may not work, and depending on the output is non-
trivial.

## Usage

For the first execution, a version of Angular must be built with `ngtsc`. To do this, a current
Angular repo is passed to build.sh

```bash
$ scripts/ivy/build.sh --update-angular=/path/to/angular
```

This will replace `node_modules/@angular` with `ngtsc`-built versions of Angular packages. It will
then build CDK and Material into `dist/packages` using `ngtsc`.

Part of this process involves generating `index.ts` files in some places and fixing up
`tsconfig-build.json` files within the repo.

Unless a new version of Angular needs to be used, future invocations can omit the `--update-angular`
flag:

```bash
# Build everything
$ scripts/ivy/build.sh

# Build only Material (assumes CDK has already been built; for efficiency)
$ scripts/ivy/build.sh --skip-cdk
