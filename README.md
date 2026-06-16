# Molecular Cell Biomechanics Laboratory — Published Site

This repository contains the **pre-built static output** of the lab website, served at
[mofradlab.github.io/website](https://mofradlab.github.io/website).

## Do not edit this repository directly

All files here are generated automatically. Every successful CI run in the source
repository overwrites this repo with a fresh build. Manual edits will be silently
discarded on the next publish.

## Source

The website source lives in the private `atamadon/atamadon.github.io` repository.
Changes to content, layout, or configuration must be made there and will propagate
to this repo through the three-stage CI/CD pipeline:

1. **Validate** — source validators and `bundle exec jekyll build` must pass on `develop`
2. **Deploy** — Jekyll source is fast-forwarded to `main` → serves `atamadon.github.io`
3. **Publish** — built `_site/` output is pushed here → serves `mofradlab.github.io/website`

## Contact

Molecular Cell Biomechanics Laboratory, UC Berkeley
