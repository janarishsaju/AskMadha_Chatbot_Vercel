# Git Commit — Grouped Commits

Take all local changes in the working tree and commit them as **multiple logically-grouped commits**, never one giant commit.

## Steps

1. **Inspect the changes**
   - Run `git status` to see all modified, added, deleted, and untracked files.
   - Run `git diff` (and `git diff --staged` if anything is staged) to read the actual content of every change.
   - For untracked files, read them so you understand what they introduce.

2. **Understand and group**
   - Read each change and figure out *what* it does and *why*.
   - Group related changes into separate commits by intent, e.g.:
     - one feature → one commit
     - a bug fix → its own commit
     - config / tooling / dependency changes → separate from feature code
     - docs → separate from code
     - refactor / rename → separate from behavior changes
   - A single file may contain hunks that belong to different groups — split with `git add -p` when that happens.
   - Do **not** mix unrelated changes in the same commit.

3. **Stage and commit each group**
   - Stage only the files/hunks for that group (`git add <files>` or `git add -p`).
   - Commit with a clear message, then move to the next group.
   - Repeat until `git status` is clean.

## Commit message format

Structure (Conventional Commits, matches this repo's history):

```
type(scope): description
                              <-- blank line
<Body: explain WHAT changed and WHY, wrapped at ~72 chars>

Resolves: #<issue>          <-- optional footer
```

Where:
- **type** — the kind of change (`feat`, `fix`, `chore`, `refactor`, `docs`, `test`).
- **scope** — *optional* area of the codebase (module, feature, or folder), in parentheses, e.g. `feat(auth):`, `fix(chat):`. Omit if not useful: `feat: ...`.
- **description** — short, imperative, lowercase, ≤50 chars, no trailing period.

### Specify the type of commit

- `feat` — a new feature you're adding to the application.
- `fix` — a bug fix.
- `style` — features and updates related to styling.
- `refactor` — refactoring a specific section of the codebase.
- `test` — everything related to testing.
- `docs` — everything related to documentation.
- `chore` — regular code maintenance.

(You can also use emojis to represent commit types, e.g. ✨ `feat`, 🐛 `fix`, 📝 `docs`.)

### Rules for a great commit message

1. **Separate the subject from the body with a blank line.**
2. **Limit the subject line to 50 characters.**
3. **The commit message should contain no whitespace errors.**
4. **Remove unnecessary punctuation marks.**
5. **Do not end the subject line with a period.**
6. **Keep the description lowercase** (per this repo's convention); **capitalize each paragraph** of the body.
7. **Use the imperative mood** in the subject — "Add feature", not "Added" or "Adds". Test: the subject should complete *"If applied, this commit will ___"*.
8. **Wrap the body at ~72 characters.**
9. **Use the body to explain what changes you made and why you made them** — not *how*.
10. **Do not assume the reviewer understands the original problem** — add that context.
11. **Do not assume your code is self-explanatory** — explain it anyway.

### Extra rules
- One commit = one logical change.
- Add a body only when the "why" is not obvious from the subject.
- Reference the issue tracker in a footer when applicable: `Resolves: #123`.

## Rules

- **Do not** `git push` unless explicitly asked.
- **Do not** run `git add .` blindly — stage per group.
- **Do not** amend or rewrite existing commits.
- **Never add a co-author** — no `Co-Authored-By` trailer in any commit message.
- If a change is ambiguous or risky to group, ask before committing.
- After all commits, show the result with `git log --oneline -n <count>`.

## Example

Working tree has: a new prayer feature, a fix to the chat API, and an updated `.nvmrc`.
Produce **three** commits:

```
feat(prayer): add prayer request submission
fix(chat): correct gemini chat api endpoint
chore(config): pin node version to 24.16.0 via nvmrc
```
