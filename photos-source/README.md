# Source photographs

Camera originals, straight off the card. **Not** served by the site and **not**
bundled by the build.

These are Fujifilm X100VI JPEGs at 7728×5152, 11–25MB each. They exist here as
the upload source for the image host — see `docs/IMAGES.md` for how they become
the variants the site actually requests.

## Rules

- Nothing in this directory is imported from `src/`. If you find an import
  reaching in here, it is a bug: the build would inline a 20MB file.
- Do not add more full-resolution originals. Git stores binaries in full on
  every revision with no delta compression, so each re-export permanently grows
  the repository. GitHub hard-rejects any single file over 100MB.
- These files were already committed before the teardown began, so they are in
  history regardless. Purging them is a separate, history-rewriting decision
  that has not been taken.
