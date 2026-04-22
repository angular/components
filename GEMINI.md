# Jetski Global Instructions & Context
 
 ## Rules
 - **Skip Tests by Default**: Do not run unit or integration tests automatically after making code changes.
 - **Run Tests on Demand**: Only run tests when explicitly prompted by the user (e.g., "run tests", "verify with tests").
 - **Always allowed to run `git status`**: You can run `git status` at any time to check the state of the repository.
 - **Git Commits**: Follow Angular's commit message format (`<type>(<scope>): <subject>`). Use imperative mood, lowercase subject, and no trailing period. Valid scopes are in `.ng-dev/commit-message.mts`. Scopes can be omitted for `test` or refactoring types. Use `multiple` for cross-component changes. Do not use `aria` as a standalone scope.
 - **Git Pushing**: Always push branches to the `tjshiu` remote (e.g., `git push tjshiu <branch-name>`), as `origin` is not configured.
 
 ## Aliases
 - **start-fresh**: Run `git stash push --include-untracked -m "work-in-progress"`, checkout `main`, pull `origin main`, checkout a new branch, and stash pop.
 - **update-main**: Sync local main with remote using `git checkout main && git pull upstream main && git checkout -`.
 