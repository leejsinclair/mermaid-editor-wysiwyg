# Feature Specification: Publish the Editor as a GitHub Page

**Feature Branch**: `feature/002-visual-diagram-editor` (no new branch was created; the spec directory and the branch are independent)

**Created**: 2026-10-19

**Status**: Draft

**Grilled on**: 2026-10-19

**Input**: User description: "publish as github page the static version of this website"

## Clarifications

### Session 2026-10-19

- Q: How must reloading or opening a deep link work on GitHub Pages, which only serves real files? → A: B. The editor's in-app addresses become hash-style (for example `/#/d/abc`), so every address resolves to the one real page and no hosting fallback is needed.
- Q: Should hash-style addresses apply to the app everywhere or only to the published build? → A: A. Everywhere: one addressing mode in the local app, the tests and the published site.
- Q: What does "main" mean while the editor is still on the 002 feature branch? → A: A. Publish from `main` only; merging the editor work into `main` is a prerequisite and the first publish happens at that merge.
- Q: Which browsers must pass the end-to-end tests before a publish? → A: A. Both Chromium and Firefox, the two supported browsers.
- Q: Should the 1-second timing test stay in the publish gate, given shared-runner speed varies? → A: B. No. The gate runs every end-to-end test except the timing test; it still runs locally.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Anyone can open the editor from a public web address (Priority: P1)

A visitor with no account and nothing installed opens the project's public GitHub Pages address in a
browser and gets the full editor, working exactly as it does when run locally: building a diagram,
seeing the generated Mermaid source, undoing, saving to the browser and to files.

**Why this priority**: This is the whole point of the feature. Without a reachable, working public copy,
nothing else matters.

**Independent Test**: Open the published address in a fresh browser profile and complete one create,
edit, undo and save round trip.

**Acceptance Scenarios**:

1. **Given** the site has been published, **When** a visitor opens its public address, **Then** the editor
   loads with no console errors and no failed requests for its own files (scripts, styles, fonts, images).
2. **Given** the editor is open on the published address, **When** the visitor runs the primary flows
   (add elements, connect them, edit labels, undo, redo, view generated source, save and open a file),
   **Then** behaviour matches the locally built app.
3. **Given** a visitor reloads the page or opens the address in a new tab, **When** the page loads,
   **Then** it shows the editor rather than a "404" page.

---

### User Story 2 - Publishing happens automatically from the main branch (Priority: P2)

The maintainer merges a change into `main`; the public site is rebuilt and replaced without any manual
step. A change that fails the project's quality gates is never published.

**Why this priority**: A manual publish drifts out of date and depends on one person's machine. It is
secondary to having a site at all.

**Independent Test**: Merge a visible change (for example a changed catalogue text) into `main` and
confirm that it appears at the public address, then merge a change that breaks a test and confirm that
the public site is left unchanged.

**Acceptance Scenarios**:

1. **Given** a change is merged into `main` and all checks pass, **When** the publish run finishes,
   **Then** the public address serves that change.
2. **Given** a change fails type checking, unit tests or end-to-end tests, **When** the publish run
   executes, **Then** the previously published version stays live and the failure is visible to the
   maintainer.
3. **Given** a change is on any branch other than `main`, **When** it is pushed, **Then** the public site
   is not changed.

---

### User Story 3 - Maintainer can publish on demand and see what is live (Priority: P3)

The maintainer can start a publish by hand without making a new commit (for example after changing the
repository's Pages settings) and can tell which version is currently live and where the address is.

**Why this priority**: Convenience and traceability; the site works without it.

**Independent Test**: Trigger a manual publish and confirm the run reports the public address and the
revision it published.

**Acceptance Scenarios**:

1. **Given** the maintainer starts a manual publish, **When** it completes, **Then** the site serves the
   current tip of `main`.
2. **Given** a publish has completed, **When** the maintainer reads the project's README, **Then** it
   states the public address and how publishing works.

---

### Edge Cases

- **EC-01**: The site is served from a sub-path of the host (`<owner>.github.io/<repository>/`) rather than the
  domain root; every file reference, internal link and deep link must still resolve.
- **EC-02**: A visitor opens or reloads an in-app address (such as a saved diagram, `/#/d/abc`); the editor must load
  that view, not a "404" page.
- **EC-03**: A visitor holds a bookmark or link in the old path style (`/d/abc`) from before this change; it is a
  path the host cannot serve, and the spec treats it as unsupported unless later clarified.
- **EC-04**: A visitor previously used the editor locally or on another address; browser-stored diagrams are
  per-address and are not shared, which must not cause errors.
- **EC-05**: Browser-stored data saved by an earlier published version must still open after a new version is
  published.
- **EC-06**: A publish run is started while another is still running; the newer one must win and the site must
  never be left half-updated.
- **EC-07**: Repository Pages setting is not enabled; the run must fail with a message telling the maintainer
  what to switch on, not silently succeed.
- **EC-08**: The visitor is offline after first load; no new promise is made (offline use is out of scope).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The editor MUST be available at a public, stable address on GitHub Pages without any
  login, install or server of the project's own.
- **FR-002**: The published site MUST consist of static files only and MUST contain no server component,
  consistent with the project's existing deliverable.
- **FR-003**: The published editor MUST offer the same features and behaviour as the locally built app;
  no feature is removed, disabled or changed for publication.
- **FR-004**: All of the site's files and internal links MUST resolve when served from the repository's
  sub-path address, and the locally run app MUST keep working at the domain root.
- **FR-005**: Opening or reloading any in-app address MUST show the editor at that view, not a hosting
  "404" page.
- **FR-006**: A merge into `main` MUST publish the new version automatically.
- **FR-007**: Publishing MUST run only after type checking, unit tests and end-to-end tests pass in both supported browsers (Chromium and Firefox) on
  the exact revision being published. The one test that times an edit against a fixed limit (100 elements,
  1 second) is not part of this gate, because a hosted runner's speed varies; it still runs locally; on any failure the live site MUST be left unchanged.
- **FR-008**: Pushes to branches other than `main` MUST NOT change the live site.
- **FR-009**: The maintainer MUST be able to start a publish manually; it always publishes the current tip
  of `main`, never another branch.
- **FR-010**: Each publish MUST leave the site fully on one revision, never partly updated, and a newer
  publish MUST supersede an older one still in progress.
- **FR-011**: A failed publish MUST be visible to the maintainer with a reason.
- **FR-012**: The published site MUST NOT collect, send or store visitor data on any server; diagrams stay
  in the visitor's browser and in files they save, as the constitution requires.
- **FR-013**: The README MUST state the public address and describe how publishing works and how to run
  the published build locally to check it before merging.
- **FR-014**: The published build MUST be checked for the base-path and deep-link requirements (FR-004,
  FR-005, FR-015) by an automated test run against the built output, not only against the development server.
- **FR-015**: The editor's in-app addresses MUST be hash-style (the view is named after `#`), so that every
  address resolves to the single published page and the host needs no redirect or fallback rule. This applies
  to the app everywhere (local run, tests and published site), so there is one addressing mode; the existing
  tests are updated to the new address style as a recorded expectation change.

### Key Entities

- **Published site**: The static files served at the public address; always corresponds to exactly one
  revision of `main`.
- **Publish run**: One automatic or manual execution that checks, builds and replaces the published site;
  has a revision, an outcome (published or failed) and a reason on failure.
- **Public address**: The stable web address visitors use; derived from the repository's owner and name.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor reaches a working editor from the public address in under 5 seconds on
  a typical broadband connection.
- **SC-002**: 100% of acceptance criteria AC1–AC17 in `setup.md` that apply to the running app pass
  against the published address.
- **SC-003**: A merged change is live within 10 minutes of the merge, with no manual step.
- **SC-004**: 0 broken-file or "404" responses are observed for the site's own files and for a reload of
  any in-app address during a full run through the primary flows.
- **SC-005**: In 100% of publish runs where a check fails, the live site remains on the previous version.
- **SC-006**: The maintainer can determine the live address and how publishing works from the README alone,
  in under 1 minute.

## Assumptions

- The repository `leejsinclair/mermaid-editor-wysiwyg` is, or will be made, public so that GitHub Pages is
  available on the maintainer's plan; the site is served from the default `github.io` address with no
  custom domain.
- Because it is a project site, the address is a sub-path (`/mermaid-editor-wysiwyg/`).
- The existing static build output is the "static version of this website"; no new editor features are added.
  The one visible change is the address style of in-app views (FR-015), chosen to fit a host that serves only
  real files; the views and their behaviour are unchanged.
- Publishing is driven by the repository's own hosted automation, using GitHub's built-in Pages deployment
  rather than a separate hosting account.
- Dependency: the editor (feature 002) is merged into `main` before the first publish; until then nothing is
  published, and no other branch can publish, including by manual start.
- The human still commits and pushes (per project rules); the automation acts only after a push or an
  explicit manual start.
- Preview deployments for pull requests, a custom domain, analytics, offline/installable behaviour and
  non-English content are out of scope.
- Enabling Pages in the repository settings is a one-time manual action by the maintainer.
