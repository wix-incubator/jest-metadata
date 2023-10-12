# CONTRIBUTING

We welcome issues and pull requests from the community. :purple_heart:

## Issues

Open an issue on the [issue tracker].

There a few issue templates to choose from, where you will find instructions on how to report a bug or request a feature.

## Pull requests

There are no strict rules for pull requests, but we recommend the following:

* Open an issue first, and discuss your idea with the maintainers.
* Fork the repository and create a new branch for your changes.
* Make your changes and submit a pull request.
* Add tests for your changes.
* Update the documentation.

### Setup

This is a standard Node.js project. You'll need to have Node.js installed.

Fork this repository, clone and install dependencies:

```bash
npm install
```

### Running unit tests

```bash
npm test
```

### Running integration tests

```bash
npm run build # Build the library first

cd e2e
npm install
npm run build # Record snapshots
```

The last command will record snapshots (fixtures) for the integration tests.
Make sure they don't change unexpectedly.
If there are changes, review them and re-run unit tests:

```bash
cd ..
npm test -- -u # Update snapshots
```

### Checking your code

Before committing, run the linter and tests:

```bash
npm run lint
npm test
```

To create a commit, use [Commitizen]:

```bash
npx cz
```

and follow the instructions. We adhere to Angular's [commit message guidelines].

Thanks in advance for your contribution!

[commit message guidelines]: https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit
[issue tracker]: https://github.com/wix-incubator/jest-metadata/issues
[Commitizen]: https://github.com/commitizen/cz-cli
