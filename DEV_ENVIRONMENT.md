# Developer guide: getting your environment set up
1. Make sure you have both `node` and `pnpm@9` installed.
   We recommend using `nvm` to manage your node versions.
2. If you are on Windows, see [the extra steps needed for contributing on Windows](#windows)
3. Fork the `angular/components` repo on GitHub.
4. Clone your fork to your machine with `git clone`.
   Recommendation: name your git remotes `upstream` for `angular/components`
   and `<your-username>` for your fork. Also see the [team git shortcuts](https://github.com/angular/components/wiki/Team-git----bash-shortcuts).
5. From the root of the project, run `pnpm` to install the dependencies.


To build angular/components in release mode, run `pnpm build`. The output can be found under `dist/releases`.

To bring up a local server, run `pnpm dev-app`. This will automatically watch for changes
and rebuild. The browser should refresh automatically when changes are made.

### Running tests
To run unit tests, run `pnpm test <target>`. The `target` can be either a short name (e.g. `pnpm test button`) or an explicit path `pnpm test src/cdk/stepper`.
To run the e2e tests, run `pnpm e2e`.
To run lint, run `pnpm lint`.

You can debug unit tests by running `pnpm test` with the `--debug` option. This will allow you to
manually connect a browser to the Karma server.

### Getting Packages from Build Artifacts
Each CI run for a Pull Request stores the built Angular packages as
[build artifacts](https://circleci.com/docs/2.0/artifacts). The artifacts are not guaranteed to be
available as a long-term distribution mechanism, but they are guaranteed to be available around the
time of the build.

You can access the artifacts for a specific CI run by going to the workflow page, clicking on the
`upload_release_packages` job and then switching to the "Artifacts" tab.

#### Archives for each Package
On the "Artifacts" tab, there is a list of links to compressed archives for Angular packages. The
archive names are of the format `<package-name>-pr<pr-number>-<sha>.tgz` (for example
`material-pr12345-a1b2c3d.tgz`).

One can use the URL to the `.tgz` file for each package to install them as dependencies in a
project they need to test the Pull Request changes against. Pnpm or Yarn support installing
dependencies from URLs to `.tgz` files. As an example, update the dependencies in `package.json`
to point to the artifact URLs and then run `pnpm` to install the packages:

```json
"dependencies": {
  "@angular/cdk": "https://<...>.circle-artifacts.com<...>/cdk-pr12345-a1b2c3d.tgz",
  "@angular/material": "https://<...>.circle-artifacts.com<...>/material-pr12345-a1b2c3d.tgz",
}
```

#### Download all Packages
In addition to the individual package archives, a `.tgz` file including all packages is also
available (named `all-pr<pr-number>-<sha>.tgz`). This can be used if one prefers to download all
packages locally and test them by either of the following ways:

1. Update the dependencies in `package.json` to point to the local uncompressed package directories.
2. Directly copy the local uncompressed package directories into the `node_modules/` directory
   of a project.


### Approving public API changes
If you're making changes to a public API, they need to be propagated to our public API golden files.
To save the changes you can run `pnpm approve-api <target>` and to review the changes, you can look
at the file under `goldens/<package>/<entry-point>.api.md`.


### Disabling Git hooks
If your development workflow does not intend the commit message validation to run automatically
when commits are being created, or if you do not want to run the formatter upon `git commit`, you
can disable any installed Git hooks by setting `HUSKY=0` in your shell environment. e.g.

```bash
# .zshrc
export HUSKY=0

# .bashrc
export HUSKY=0
```

### Injecting variables into the dev app

A set of environment variables is made available within the dev-app. Such variables
will be injected into the dev-app, so that e.g. API keys can be used for development
without requiring secrets to be committed.

The following variables are currently used in the dev-app:

* `GOOGLE_MAPS_KEY` - Optional key for the Google Maps API.

For example, you can store a personal development Google Maps API key for the
dev-app within your `.bashrc` or `.zshrc` file.

```bash
export GOOGLE_MAPS_KEY=<api-key>
```

## Windows

To contribute to Angular using a Windows machine, you need to use the [Windows Linux Subsystem](https://learn.microsoft.com/en-us/windows/wsl/about) (also known as WSL).
Installing WSL on your machine requires a few extra steps, but we believe it's generally useful for developing on Windows:

1.  Run `wsl --install` from Powershell (as administrator).
2.  Restart your machine.
3.  Enter the WSL environment by running: `wsl`.
4.  Continue with the developer guide as if you were on a native Linux system.

For a more detailed guide, refer to the official Microsoft documentation: [Installing WSL](https://learn.microsoft.com/en-us/windows/wsl/install).

**Note:** Angular continues to support native Windows development via the `ng` CLI and rigorously tests on Windows for every code change. This recommendation specifically applies to contributing to the Angular codebase itself.
