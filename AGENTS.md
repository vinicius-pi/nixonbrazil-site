# nixonbrazil: public publication

This repository intentionally stays PUBLIC. It hosts https://nixonbrazil.page/.
Do not infer that privacy of the editorial source makes the website private.
The current account cannot host Pages from a private repository.

Only verified generated files belong in site/. Keep editorial drafts, private
reports, books, credentials and source history out of this repository.
The editorial project is vinicius-pi/nixon-brasil; main there is the sole release
source. Preserve the release source SHA, build identity and per-file hashes.

Run node scripts/verify-package.mjs before publication. Main pushes verify only;
a manual publish.yml dispatch publishes. A release is complete only after
unauthenticated HTTPS and the actual pages/assets have been checked. A 404,
valid certificate alone, queued workflow or synchronized commit is not success.
