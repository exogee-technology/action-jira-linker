# Jira Linker

Figures out the Jira Issue link for a PR then comments with a link to it.

Heavily inspired by [Action Jira Linter](https://github.com/jira-tools/action-jira-linker) and adapted for our use case. Thanks!

## Installation

To make `action-jira-linker` a part of your workflow, just add a
`action-jira-linker.yml` file in your `.github/workflows/` directory in your
GitHub repository.

```yml
name: action-jira-linker
on: [pull_request]

jobs:
  action-jira-linter:
    runs-on: ubuntu-latest
    steps:
      - uses: exogee-technology/action-jira-linker@v1.0.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          jira-user: ${{ secrets.JIRA_USER }}
          jira-token: ${{ secrets.JIRA_TOKEN }}
          jira-base-url: https://your-domain.atlassian.net
```

It can also be used as part of an existing workflow by adding it as a step. More
information about the [options here](#options).

## Features

### PR Comment

`action-jira-linker` will add a comment to any PR that it can find an issue for in JIRA.

A full example with all available options and example values is provided below.

```yml
- uses: exogee-technology/action-jira-linker@v1.0.0
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    jira-user: ${{ secrets.JIRA_USER }}
    jira-token: ${{ secrets.JIRA_TOKEN }}
    jira-base-url: https://your-domain.atlassian.net
    comment-header: |
      ## JIRA Information
      ---
      Stuff and things
    comment-trailer: |
      If you cannot access the link above contact [admin@testcompany.com](mailto:admin@testcompany.com) for more information.
    fail-on-error: true
```

| Key               | Description                                                                                                                                                             | Required | Default |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- |
| `github-token`    | Token used to update PR description. `GITHUB_TOKEN` is already available [when you use GitHub actions][ghtoken], so all that is required is to pass it as a param here. | x        | `null`  |
| `jira-token`      | Token used to fetch Jira Issue information. Check [below](#jira-token) for more details on how to generate the token.                                                   | x        | `null`  |
| `jira-user`       | The email address of the user that generated the `jira-token`.                                                                                                          | x        | `null`  |
| `jira-base-url`   | The subdomain of JIRA cloud that you use to access it. Ex: `https://your-domain.atlassian.net`.                                                                         | x        | `null`  |
| `comment-header`  | A markdown formatted message which will get added to top of the comments the bot makes.                                                                                 |          | `''`    |
| `comment-trailer` | A markdown formatted message which will get added to bottom of the comments the bot makes.                                                                              |          | `''`    |
| `fail-on-error`   | A `Boolean` which, if set to `true`, fails the GitHub Action when an error occurs.                                                                                      |          | `false` |

**Special note on `jira-token`:** Since tokens are private, we suggest adding
them as [GitHub secrets][secrets].

The Jira token is used to fetch issue information via the Jira REST API. To get
the token you need to:

1. Generate an [API token via JIRA][generate-jira-token].
2. Add the generated token as the secret `JIRA_TOKEN` in your GitHub project.

Note: The user needs to have the [required permissions (mentioned under GET
Issue)][jira-permissions].
