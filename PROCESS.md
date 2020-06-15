# Process

1. Select an [issue](https://github.com/sbb-design-systems/icon-library/issues) that you want to work on
2. Checkout master branch
3. Pull changes
4. Create new branch with appropriate name (prefix `feat-` for features or prefix `fix-` for fixes)
5. Do your changes
6. Commit your changes while following the [commit message guidelines](#commit)
7. Push your changes to [origin](https://github.com/sbb-design-systems/icon-library)
8. Create a pull request (PR) with your pushed branch (in [GitHub](https://github.com/sbb-design-systems/icon-library))
  8.1. Optionally select reviewers for your PR
9. When ok/accepted, `Squash and merge` the PR
10. Delete the branch


## <a name="commit"></a> Commit Message Guidelines
This project uses [Conventional Commits](https://www.conventionalcommits.org/) to generate the changelog.

### Commit Message Format
```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

Any line of the commit message cannot be longer than 100 characters! This allows the message to be easier
to read on GitHub as well as in various git tools.

### Type
Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes

### Scope
The scope could be anything specifying place of the commit change. For example
`kom`, `fpl`

### Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

### Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

### Footer
The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines.
The rest of the commit message is then used for this.

**Close issue**. Want to close some issue with the commit use the word `Closes` with a space and the issue number (e.g. Closes #39).