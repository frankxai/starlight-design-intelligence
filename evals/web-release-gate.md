# World-Class Web Release Gate

A flagship public surface passes only when all evidence exists:

- current desktop and mobile captures for a redesign, or host-context desktop and
  mobile captures for a greenfield route;
- exactly three distinct, content-addressed direction artifacts and a recorded selection;
- editorial score at least 18/20;
- typography score at least 15/16;
- visual score at least 28/30 using `evals/web-visual-quality-rubric.md`;
- shipped motion score at least 16/18, or a documented cut decision;
- shipped motion includes decoded, ordered, distinct desktop/mobile PNG frame
  sequences with CSS viewport/DPR metadata, at least 0.1% decoded-pixel change
  between adjacent frames, and a time-separated reduced-motion stability sample;
- applicable accessibility, performance, link, claim, privacy, and analytics checks;
- distinct maker, verifier, and approver;
- reviewed-copy hash, font provenance and computed-font proof;
- local, content-addressed accessibility, performance, link, claim, privacy,
  analytics, console, post-deploy, and rollback reports whose JSON contents match
  their manifest summaries;
- commit, preview, production URL, production commit, and exact rollback.

Remote evidence URLs cannot satisfy this gate. The validator also confirms the
owning Git remote, both Git commits, changed paths in the production commit, and a
distinct ancestor rollback target.

This is a post-deploy receipt, not a self-referential PR manifest. Generate the
bundle outside the production commit or record it in a later receipts commit. A
commit cannot truthfully contain its own SHA.

The manifest proves the process ran. It does not prove taste. The independent
verifier may block a numerically passing release.
