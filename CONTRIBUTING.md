# 🤝 Contributing

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- 🐛 Reporting a bug
- 💡 Discussing the current state of the code
- 📝 Submitting a fix
- ✨ Proposing new features
- 📚 Becoming a maintainer

## 📋 Table of Contents

- [🌍 Open Development](#open-development--community-driven)
- [📜 Code of Conduct](#code-of-conduct)
- [🐛 Bug Reports](#bugs)
- [🔧 Prerequisites](#contribution-prerequisites)
- [🔄 Pull Request Process](#pull-request-process)
- [❓ Miscellaneous](#miscellaneous)

## 🌍 Open Development & Community Driven

This project is open-source under the [MIT license](LICENSE). All development happens here on GitHub. We welcome contributions from the community!

## 📜 Code of Conduct

This project and everyone participating in it are governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please read the [full text](CODE_OF_CONDUCT.md) to understand what behaviors are expected and which are not tolerated.

## 🐛 Bugs

We use [GitHub Issues](https://github.com/strapi-community/shopify/issues) to track public bugs. Before creating a new issue, please check if your problem has already been reported.

---

## 🔧 Contribution Prerequisites

Before you start contributing, ensure you have:

* [Node.js](https://nodejs.org/en/) v18.x.x or higher
* [Yarn](https://yarnpkg.com/en/) v1.22.19 or higher
* Basic knowledge of Git

> **Note:** This project uses Yarn as the package manager. Please use Yarn for all package installations.

## 🔄 Pull Request Process

Our team will review your pull request and either merge it, request changes, or close it.

### Before Submitting Your Pull Request

1. **Setup Your Environment**
   - Fork the repository and create your branch from `main`
   - Run `yarn install` in the repository root
   - Run `yarn prepare` in the repository root to install `pre-commit` hooks
   - For bug fixes or new features, add tests and link the corresponding issue
   - Ensure all tests pass: `yarn test:server`
   - Verify code quality: `yarn lint`

2. **Documentation**
   - Update the [README.md](README.md) with any interface changes
   - Include new environment variables, ports, file locations, or container parameters

3. **Commit Sign-off**
   - Sign-off all your commits using the following format:
   ```shell
   This is my commit message
   
   Signed-off-by: Your Name <your.email@example.com>
   ```
   - Or use Git's `-s` flag:
   ```shell
   git commit -s -m 'Your commit message'
   ```

4. **Review Process**
   - A maintainer will review your PR
   - They may suggest modifications
   - Once approved, they will merge and close your request

---

## ❓ Miscellaneous

### Reporting an Issue

Before submitting an issue, please ensure:

1. **Issue Validation**
   - You're experiencing a concrete technical issue with the plugin
   - You've searched for existing issues and found none open
   - Your issue title is clear, concise, and professional

2. **Reproduction Steps**
   - You can provide clear steps to reproduce the issue
   - You've tried the following troubleshooting steps:
     - Verified the correct application is running
     - Followed the [issue template](.github/ISSUE_TEMPLATE)
     - Formatted your issue properly using [GitHub Markdown](https://guides.github.com/features/mastering-markdown)
     - Restarted the Strapi server (CTRL+C and restart)
     - Cleaned your `node_modules`:
       ```shell
       rm -rf node_modules && npm cache clear && npm install
       ```
     - Verified no dependencies are linked
     - Confirmed no inline changes in `node_modules`
     - Checked for global dependency loops