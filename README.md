# Foundry

Deterministic repository creation for platform teams.

A GitHub Action that uses Octokit to create new repositories with consistent, reproducible configurations.

## Features

- Create repositories for users or organizations
- Support for template repositories
- Configurable privacy settings
- Auto-initialization with README, .gitignore, and LICENSE
- Deterministic and hermetic builds using Make
- Pre-commit hooks for linting and formatting with Husky
- TypeScript with GTS (Google TypeScript Style)

## Usage

### Basic Example

```yaml
name: Create Repository
on:
  workflow_dispatch:
    inputs:
      repo-name:
        description: 'Repository name'
        required: true

jobs:
  create-repo:
    runs-on: ubuntu-latest
    steps:
      - name: Create Repository
        uses: your-username/foundry@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          repository-name: ${{ github.event.inputs.repo-name }}
          repository-description: 'My new repository'
          repository-private: 'false'
```

### Create from Template

```yaml
- name: Create Repository from Template
  uses: your-username/foundry@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    repository-name: 'my-new-repo'
    repository-template: 'owner/template-repo'
    organization: 'my-org'
```

### Full Configuration

```yaml
- name: Create Repository
  uses: your-username/foundry@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    repository-name: 'my-new-repo'
    repository-description: 'A new repository'
    repository-private: 'true'
    organization: 'my-org'
    auto-init: 'true'
    gitignore-template: 'Node'
    license-template: 'mit'
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `github-token` | GitHub token for authentication | Yes | - |
| `repository-name` | Name of the repository to create | Yes | - |
| `repository-description` | Description of the repository | No | `''` |
| `repository-private` | Whether the repository should be private | No | `false` |
| `repository-template` | Template repository to use (format: owner/repo) | No | `''` |
| `organization` | Organization to create the repository in | No | `''` |
| `auto-init` | Initialize repository with README | No | `true` |
| `gitignore-template` | Gitignore template to use | No | `''` |
| `license-template` | License template to use | No | `''` |

## Outputs

| Output | Description |
|--------|-------------|
| `repository-url` | URL of the created repository |
| `repository-name` | Full name of the created repository (owner/repo) |
| `repository-id` | ID of the created repository |

## Development

### Prerequisites

- Node.js 20+
- Make
- npm

### Setup

```bash
# Install dependencies
make install

# Run linting and formatting
make lint
make format

# Build the action
make build

# Package for distribution
make package

# Run all checks (recommended before committing)
make all
```

### Deterministic Builds

This project uses Make for deterministic and hermetic builds:

```bash
# Clean build from scratch
make hermetic-build

# CI checks (formatting check without auto-fix)
make check-ci
```

### Pre-commit Hooks

Husky is configured to run linting and formatting checks before each commit. Install the hooks:

```bash
npm install
```

The pre-commit hook will automatically run `npm run format` and `npm run lint` before each commit.

## License

MIT

## Contributing

Contributions are welcome! Please ensure all checks pass before submitting a PR:

```bash
make all
```