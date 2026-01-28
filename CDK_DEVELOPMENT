# CDK Development Guide

This guide covers setting up your development environment for working on the Angular CDK (Component Dev Kit) and using the live-reload development workflow.

## Initial Setup

### Prerequisites
1. **Node.js** - Install Node.js (we recommend using `nvm` to manage versions)
2. **pnpm 9+** - This project uses pnpm as its package manager
   ```bash
   npm install -g pnpm@9
   ```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/angular/components.git
   cd components
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Verify installation**
   ```bash
   pnpm dev-app
   ```
   This should start a local development server at http://localhost:4200

For more details on the general development setup, see [DEV_ENVIRONMENT.md](./DEV_ENVIRONMENT.md).

## CDK Live Development Workflow

### Using the watch-and-sync-cdk.sh Script

The `watch-and-sync-cdk.sh` script enables a powerful development workflow where changes to the CDK source code are automatically built and synced to a target project. This is ideal for testing CDK changes in real-time within an actual Angular application.

#### How It Works

The script:
1. Builds the CDK using `ibazel` (Bazel's watch mode) in the `components` project
2. Watches for changes to the built output
3. Automatically syncs the built CDK to your target project's `node_modules/@angular/cdk` folder
4. Allows you to see your CDK changes immediately in your target application

#### Prerequisites

1. **ibazel** - Already included in project dependencies (installed via `pnpm install`)
2. **fswatch** (optional, but recommended for better performance)
   ```bash
   brew install fswatch  # macOS
   ```
   If not installed, the script will fall back to polling mode.

3. **Target project** - An Angular project where you want to test your CDK changes
   - The target project must have `@angular/cdk` installed
   - Run `npm install` or `pnpm install` in your target project first

#### Usage

```bash
./watch-and-sync-cdk.sh /absolute/path/to/your/target/project
```

**Example:**
```bash
./watch-and-sync-cdk.sh /Users/username/projects/my-angular-app
```

#### What Happens

Once running, you'll see:
- Initial build progress from `ibazel`
- File watcher status
- Sync confirmations with timestamps whenever the CDK is rebuilt

```
========================================
  CDK Watch & Sync Script
========================================

Project root: /path/to/components
Target project: /path/to/my-angular-app

Getting bazel output path...
Bazel bin: /path/to/components/bazel-bin
CDK output: /path/to/components/bazel-bin/src/cdk/npm_package

Starting file watcher...
Using fswatch for efficient file watching

========================================
  Starting ibazel build...
========================================
Press Ctrl+C to stop
```

Every time you save a change in the CDK source:
1. `ibazel` automatically rebuilds the affected parts
2. The script detects the new build output
3. The built CDK is copied to your target project's `node_modules/@angular/cdk`
4. Your target application's dev server (if running) should pick up the changes

#### Development Workflow

**Recommended workflow:**

1. Start the watch-and-sync script in one terminal:
   ```bash
   ./watch-and-sync-cdk.sh /path/to/your/app
   ```

2. In a separate terminal, start your target application's dev server:
   ```bash
   cd /path/to/your/app
   ng serve
   # or
   npm start
   ```

3. Make changes to CDK source files in the `components` project

4. Watch as:
   - The CDK rebuilds automatically
   - The script syncs the changes
   - Your app's dev server reloads with the new CDK code

#### Stopping the Script

Press `Ctrl+C` to stop both the file watcher and the `ibazel` build process.

#### Troubleshooting

**Target project not found:**
- Ensure you provide an absolute path to your target project
- The path should be the root of your Angular project (where `package.json` is located)

**node_modules not found:**
- Run `npm install` or `pnpm install` in your target project first
- Make sure `@angular/cdk` is installed in the target project

**Slow syncing:**
- Install `fswatch` for better performance:
  ```bash
  brew install fswatch  # macOS
  apt-get install fswatch  # Linux
  ```

**Changes not appearing:**
- Check that your target app's dev server is running
- Try restarting the dev server
- Verify the sync messages in the watch-and-sync terminal

### Building CDK for Release

For a one-time build (without watch mode):

```bash
pnpm build
```

The output will be in `dist/releases/@angular/cdk`.

### Running CDK Tests

```bash
# Run all CDK tests
pnpm test cdk

# Run specific CDK package tests
pnpm test src/cdk/collections
pnpm test src/cdk/overlay
```

## Platform-Specific Notes

### macOS / Linux
The `watch-and-sync-cdk.sh` script is designed for Unix-like systems (macOS, Linux) and uses bash-specific features.

### Windows
**⚠️ Development on Windows requires additional research**

The `watch-and-sync-cdk.sh` script uses bash and Unix-specific commands that are not natively compatible with Windows. Potential options for Windows users:

1. **Windows Subsystem for Linux (WSL)** - Recommended approach
   - Install WSL following the [official guide](https://learn.microsoft.com/en-us/windows/wsl/install)
   - Run the entire development workflow within WSL
   - See [DEV_ENVIRONMENT.md](./DEV_ENVIRONMENT.md) for more details

2. **Git Bash** or **WSL2** - May work but not tested
   - The script might work in Git Bash or WSL2
   - Requires further testing and validation

3. **Manual sync** - Fallback option
   - Build the CDK manually: `pnpm bazel build //src/cdk:npm_package --config=snapshot-build`
   - Copy from `bazel-bin/src/cdk/npm_package` to your target project's `node_modules/@angular/cdk`
   - Repeat after each change (tedious but reliable)

If you're working on Windows and find a good solution, please consider contributing documentation!

## Additional Resources

- [Main Development Guide](./DEV_ENVIRONMENT.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Coding Standards](./CODING_STANDARDS.md)
- [CDK Documentation](https://material.angular.dev/cdk/categories)
