# Git Commit Guidelines

## 1. Create a Branch

Always create a separate branch for your work, named after yourself or your feature.

```bash
git checkout -b yourname/feature-description
```

Example:

```bash
git checkout -b prithvi/add-login-button
```

## 2. Create a GitHub Issue

Before you start working, create a GitHub Issue for the task you are working on. Include a clear description of what you plan to do.

Example: `Implement a shared button component`

## 3. Commit Messages

Use clear, structured commit messages. Include the type of change, a short description, and the GitHub Issue number.

### Commit Types:

* `[feat]` - New feature
* `[bug]` - Bug fix
* `[docs]` - Documentation changes
* `[refactor]` - Code refactoring
* `[test]` - Adding or updating tests

### Format:

```
[type] Short description #IssueNumber
```

### Example:

```
[feat] Added a shared button component #12
[bug] Fixed login crash on empty password #15
[docs] Updated README with setup instructions #18
```

## 4. Push Your Changes

```bash
git add .
git commit -m "[feat] Added a shared button component #12"
git push origin yourname/feature-description
```

