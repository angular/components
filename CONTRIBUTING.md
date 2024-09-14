# Contributing to Angular Material

We would love for you to contribute to Angular Material and help make it ever better!
As a contributor, here are the guidelines we would like you to follow:

 - [Code of Conduct](#coc)
 - [Question or Problem?](#question)
 - [Issues and Bugs](#issue)
 - [Feature Requests](#feature)
 - [Submission Guidelines](#submit-pr)
 - [Coding Rules](#rules)
 - [Commit Message Guidelines](#commit)
 - [Signing the CLA](#cla)

## <a name="coc"></a> Code of Conduct
Help us keep Angular open and inclusive. Please read and follow our [Code of Conduct][coc].

## <a name="question"></a> Got a Question or Problem?

Please do not open issues for general support questions as we want to keep GitHub issues for bug reports and feature requests. You've got much better chances of getting your question answered on [StackOverflow](https://stackoverflow.com/questions/tagged/angular-material2) where the questions should be tagged with tag `angular-material2`.

StackOverflow is a much better place to ask questions since:

- there are thousands of people willing to help on StackOverflow
- questions and answers stay available for public viewing so your question / answer might help someone else
- StackOverflow's voting system assures that the best answers are prominently visible.

To save your and our time, we will be systematically closing all the issues that are requests for general support and redirecting people to StackOverflow.

If you would like to chat about the question in real-time, you can reach out via [our gitter channel][gitter].

## <a name="issue"></a> Found an Issue?
If you find a bug in the source code or a mistake in the documentation, you can help us by
[submitting an issue](#submit-issue) to our [GitHub Repository][github]. 

For bugs, include an issue reproduction (via your preferred REPL: StackBlitz, CodePen, JsBin,
Plunkr, etc.) Our team has limited resources, and this allows us quickly diagnose issues and make
optimal use of the time we dedicate to fixing them. Issues that do not include a REPL reproduction
will be closed. If a REPL reproduction is not possible for your issue, please explain why and
include any other information that may be helpful in debugger (link to a repo, error messages, 
screenshots, etc.)

You can help the team even more and [submit a Pull Request](#submit-pr) with a fix.

## <a name="feature"></a> Want a Feature?
You can *request* a new feature by [submitting an issue](#submit-issue) to our [GitHub
Repository][github]. If you would like to *implement* a new feature, please submit an issue with
a proposal for your work first, to be sure that we can use it.
Please consider what kind of change it is:

* For a **Major Feature**, first open an issue and outline your proposal so that it can be
discussed. This will also allow us to better coordinate our efforts, prevent duplication of work,
and help you to craft the change so that it is successfully accepted into the project.
* **Small Features** can be crafted and directly [submitted as a Pull Request](#submit-pr).

### <a name="submit-issue"></a> Submitting an Issue
Before you submit an issue, search the archive, maybe your question was already answered.

If your issue appears to be a bug, and hasn't been reported, open a new issue.
Help us to maximize the effort we can spend fixing issues and adding new
features by not reporting duplicate issues.  Providing the following information will increase the
chances of your issue being dealt with quickly:

* **Overview of the Issue** - if an error is being thrown a non-minified stack trace helps
* **Angular and Material Versions** - which versions of Angular and Material are affected
    (e.g. 2.0.0-alpha.53)
* **Motivation for or Use Case** - explain what are you trying to do and why the current behavior
    is a bug for you
* **Browsers and Operating System** - is this a problem with all browsers?
* **Reproduce the Error** - provide a live example (using [CodePen][codepen], [JsBin][jsbin],
    [Plunker][plunker], etc.) or an unambiguous set of steps
* **Screenshots** - Due to the visual nature of Angular Material, screenshots can help the team
    triage issues far more quickly than a text description.
* **Related Issues** - has a similar issue been reported before?
* **Suggest a Fix** - if you can't fix the bug yourself, perhaps you can point to what might be
    causing the problem (line of code or commit)

You can file new issues by providing the above information [here](https://github.com/angular/components/issues/new).


### <a name="submit-pr"></a> Submitting a Pull Request (PR)
Before you submit your Pull Request (PR) consider the following guidelines:

* Search [GitHub](https://github.com/angular/components/pulls) for an open or closed PR
  that relates to your submission. You don't want to duplicate effort.
* Please sign our [Contributor License Agreement (CLA)](#cla) before sending PRs.
  We cannot accept code without this.
* Make your changes in a new git branch:

     ```shell
     git checkout -b my-fix-branch main
     ```

* Create your patch, **including appropriate test cases**.
* Follow our [Coding Rules](#rules).
* Test your changes with our supported browsers and screen readers.
* Run the full Angular Material test suite, as described in the [developer documentation][dev-doc],
  and ensure that all tests pass.
* Commit your changes using a descriptive commit message that follows our
  [commit message conventions](#commit). Adherence to these conventions
  is necessary because release notes are automatically generated from these messages.

     ```shell
     git commit -a
     ```
  Note: the optional commit `-a` command line option will automatically "add" and "rm" edited files.

* Push your branch to GitHub:

    ```shell
    git push my-fork my-fix-branch
    ```

* In GitHub, send a pull request to `components:main`.
* If we suggest changes then:
  * Make the required updates.
  * Re-run the Angular Material test suites to ensure tests are still passing.
  * Rebase your branch and force push to your GitHub repository (this will update your Pull
    Request):

    ```shell
    git rebase upstream/main -i
    git push -f
    ```

That's it! Thank you for your contribution!

#### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes
from the main (upstream) repository:

* Delete the remote branch on GitHub either through the GitHub web UI or your local shell as
    follows:

    ```shell
    git push my-fork --delete my-fix-branch
    ```

* Check out the main branch:

    ```shell
    git checkout main -f
    ```

* Delete the local branch:

    ```shell
    git branch -D my-fix-branch
    ```

* Update your local `main` with the latest upstream version:

    ```shell
    git pull --ff upstream main
    ```

## <a name="rules"></a> Coding Rules
To ensure consistency throughout the source code, keep these rules in mind as you are working:

* All features or bug fixes **must be tested** by one or more specs (unit-tests).
* All public API methods **must be documented**. (Details TBD).
* We follow [Google's JavaScript Style Guide][js-style-guide], but wrap all code at
  **100 characters**.

## <a name="commit"></a> Commit Message Guidelines

We have very precise rules over how our git commit messages can be formatted.  This leads to **more
readable messages** that are easy to follow when looking through the **project history**.  But also,
we use the git commit messages to **generate the Angular Material change log**.

### Commit Message Format
Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
format that includes a **type**, a **package**, a **scope** and a **subject**:

```
<type>(<package>/<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory. For changes which are shown in the changelog (`fix`, `feat`,
`perf` and `revert`), the **package** and **scope** fields are mandatory.

The `package` and `scope` fields can be omitted if the change does not affect a specific
package and is not displayed in the changelog (e.g. build changes or refactorings).

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on GitHub as well as in various git tools.

Example:

```
fix(material/button): unable to disable button through binding

Fixes a bug in the Angular Material `button` component where buttons
cannot be disabled through a binding. This is because the `disabled`
input did not set the `.mat-button-disabled` class on the host element.

Fixes #1234
```

### Revert
If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of
the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is
the SHA of the commit being reverted.

### Type
Must be one of the following:

* **feat**: Creates a new feature
* **fix**: Fixes a previously discovered failure/bug
* **docs**: Changes which exclusively affects documentation
* **refactor**: Refactor without any change in functionality or API (includes style changes)
* **perf**: Improves performance without any change in functionality or API
* **test**: Improvements or corrections made to the project's test suite
* **build**: Changes to local repository build system and tooling
* **ci**: Changes to CI configuration and CI specific tooling
* **release**: A release point in the repository

### Package
The commit message should specify which package is affected by the change. For example:
`material`, `cdk-experimental`, etc.

### Scope
The scope specifies place of the commit change. For example
`material/datepicker`, `cdk/dialog`, etc.
See full list [here][commit-message-scopes].

### Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

### Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

### Footer
The footer should contain any information about **Breaking Changes** or **Deprecations** and
is also the place to reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines.
The rest of the commit message is then used for this.

**Deprecations** should start with the word `DEPRECATED:`. The rest of the commit message will be
used as content for the note.

A detailed explanation can be found in this [document][commit-message-format].

## <a name="cla"></a> Signing the CLA

Please sign our Contributor License Agreement (CLA) before sending pull requests. For any code
changes to be accepted, the CLA must be signed. It's a quick process, we promise!

* For individuals, we have a [simple click-through form][individual-cla].
* For corporations, we'll need you to
  [print, sign and one of scan+email, fax or mail the form][corporate-cla].


[material-group]: https://groups.google.com/forum/#!forum/angular-material2
[coc]: https://github.com/angular/code-of-conduct/blob/main/CODE_OF_CONDUCT.md
[commit-message-format]: https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/preview
[commit-message-scopes]: https://github.com/angular/components/blob/main/.ng-dev/commit-message.mts#L10
[corporate-cla]: https://code.google.com/legal/corporate-cla-v1.0.html
[dev-doc]: https://github.com/angular/components/blob/main/DEV_ENVIRONMENT.md
[github]: https://github.com/angular/components
[gitter]: https://gitter.im/angular/material2
[individual-cla]: https://code.google.com/legal/individual-cla-v1.0.html
[js-style-guide]: https://google.github.io/styleguide/jsguide.html
[codepen]: https://codepen.io/
[jsbin]: https://jsbin.com/
[jsfiddle]: https://jsfiddle.net/
[plunker]: https://plnkr.co/edit
[runnable]: https://runnable.com/
[stackoverflow]: https://stackoverflow.com/
