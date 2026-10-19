# Behaviour Checklist: 003-github-pages-publish

**Specification**: [spec.md](../spec.md) | **Verification Plan**: [plan.md](../plan.md#verification-plan) | **Tasks**: [tasks.md](../tasks.md)

## US1-AS1

> **Given** the site has been published, **When** a visitor opens its public address, **Then** the editor loads with no console errors and no failed requests for its own files (scripts, styles, fonts, images).

- **BI-001** Expresses: FR-001, FR-004, US1-AS1, SC-001, SC-004, EC-01. Verified by: VO-002, exemption FR-001.
  - **Given** the site has been published, at the public address or in a sub-folder of a host that serves only real files
  - **When** a visitor opens its public address
  - **Then** the editor loads
  - **And** the console shows no error
  - **And** every request for the site's own files (scripts, styles, fonts, images) is answered successfully

## US1-AS2

> **Given** the editor is open on the published address, **When** the visitor runs the primary flows (add elements, connect them, edit labels, undo, redo, view generated source, save and open a file), **Then** behaviour matches the locally built app.

- **BI-002** Expresses: FR-003, US1-AS2, SC-002. Verified by: VO-003, VO-004, MV-005.
  - **Given** the editor is open on the published address
  - **When** the visitor runs the primary flows (add elements, connect them, edit labels, undo, redo, view generated source, save and open a file)
  - **Then** behaviour matches the locally built app, for every diagram type

## US1-AS3

> **Given** a visitor reloads the page or opens the address in a new tab, **When** the page loads, **Then** it shows the editor rather than a "404" page.

- **BI-003** Expresses: FR-005, FR-015, US1-AS3, EC-02. Verified by: VO-001, VO-002.
  - **Given** a visitor has a diagram open at a saved view's address
  - **When** the visitor reloads the page or opens the address in a new tab
  - **Then** the page shows the editor at that view rather than a "404" page
  - **And** the view is named in the part of the address after `#`

## US2-AS1

> **Given** a change is merged into `main` and all checks pass, **When** the publish run finishes, **Then** the public address serves that change.

- **BI-004** Expresses: FR-006, US2-AS1, SC-003. Verified by: exemption US2-AS1, VO-005.
  - **Given** a change is merged into `main` and all checks pass
  - **When** the publish run finishes
  - **Then** the public address serves that change, with no manual step, within 10 minutes of the merge

## US2-AS2

> **Given** a change fails type checking, unit tests or end-to-end tests, **When** the publish run executes, **Then** the previously published version stays live and the failure is visible to the maintainer.

- **BI-005** Expresses: FR-007, FR-011, US2-AS2, SC-005. Verified by: VO-006, VO-008, MV-003.
  - **Given** a change fails type checking, unit tests or end-to-end tests in either supported browser (the one timing test is not part of the gate)
  - **When** the publish run executes
  - **Then** the previously published version stays live
  - **And** the failure is visible to the maintainer with a reason

## US2-AS3

> **Given** a change is on any branch other than `main`, **When** it is pushed, **Then** the public site is not changed.

- **BI-006** Expresses: FR-008, US2-AS3. Verified by: VO-005.
  - **Given** a change is on any branch other than `main`
  - **When** it is pushed
  - **Then** the public site is not changed

## US3-AS1

> **Given** the maintainer starts a manual publish, **When** it completes, **Then** the site serves the current tip of `main`.

- **BI-007** Expresses: FR-009, US3-AS1. Verified by: VO-005, MV-004.
  - **Given** the maintainer starts a manual publish, whichever branch is selected
  - **When** it completes
  - **Then** the site serves the current tip of `main`

## US3-AS2

> **Given** a publish has completed, **When** the maintainer reads the project's README, **Then** it states the public address and how publishing works.

- **BI-008** Expresses: FR-013, US3-AS2, SC-006. Verified by: VO-009.
  - **Given** a publish has completed
  - **When** the maintainer reads the project's README
  - **Then** it states the public address and how publishing works
  - **And** it says how to run the published build locally to check it before merging

## Other behaviours

- **BI-009** Expresses: FR-002, FR-012. Verified by: VO-003.
  - **Given** the published build
  - **When** its files are listed and a full session is run
  - **Then** the site consists of static files only and has no server component
  - **And** no request leaves the page's own origin, and the site sends or stores no visitor data on any server

- **BI-010** Expresses: FR-010, EC-06. Verified by: VO-007.
  - **Given** a publish run is started while another is still running
  - **When** the newer run is started
  - **Then** the newer one wins and the site is never left partly updated

- **BI-011** Expresses: FR-011, EC-07. Verified by: VO-008, MV-004.
  - **Given** the repository's Pages setting is not enabled
  - **When** a publish run executes
  - **Then** the run fails with a message telling the maintainer what to switch on
  - **And** it does not silently succeed

- **BI-012** Expresses: FR-014, FR-004, FR-005. Verified by: VO-002.
  - **Given** the built output, not the development server
  - **When** it is served from a sub-path
  - **Then** the base-path and in-app address requirements hold, as checked by an automated test run

- **BI-013** Expresses: EC-03. Verified by: exemption EC-03.
  - **Given** a link in the old path style
  - **When** a visitor opens it
  - **Then** it is unsupported unless later clarified

- **BI-014** Expresses: EC-04. Verified by: exemption EC-04.
  - **Given** a visitor previously used the editor locally or on another address
  - **When** the visitor opens the published site
  - **Then** browser-stored diagrams are per-address and are not shared, with no error

- **BI-015** Expresses: EC-05. Verified by: exemption EC-05.
  - **Given** browser-stored data saved by an earlier published version
  - **When** a new version is published
  - **Then** the stored data still opens

- **BI-016** Expresses: EC-08. Verified by: exemption EC-08.
  - **Given** the visitor is offline after first load
  - **When** the visitor continues to use the site
  - **Then** no new promise is made
