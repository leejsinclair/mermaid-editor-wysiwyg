# Idea Research: Visual drag-and-drop Mermaid flowchart editor

- **Slug**: mermaid-editor-wysiwyg
- **Created**: 2026-10-21
- **Evidence confidence (overall)**: low

Method: read `intake.md`, `setup.md` and the repo's specs and git history; ran three web searches. No web pages were fetched, so external claims rest on search-result snippets only. No user interviews, usage data or tickets exist in the repo. Revised 2026-10-21 with the technical lead's statements. Their one recorded written answer (kept verbatim in Appendix A, because the original file is git-ignored) confirms that the purpose is LLM and code-assistant use. The requester and cognitive-load statements were given in the session and are not in that file. The saving itself is still unmeasured.

## Users & Demand

- **Requester and trigger.** The technical lead requested the app. Their stated purpose is to reduce the cognitive load for developers and business analysts, while taking advantage of the token efficiency of Mermaid diagrams — [source: technical lead's statement in session, 2026-10-21; only the LLM purpose is in the written answer, Appendix A; stated, not independently verified] (confidence: high that this is the stated motivation; low that the benefit is real)
- The requester is also the sponsor of the work, so this is a stakeholder-driven need. It is not demand observed from the target personas — [source: same statement; inference from it] (confidence: medium)
- Non-engineers can find Mermaid syntax a barrier. One G2 reviewer says the syntax has a learning curve "especially for non-engineers" and that this limits adoption beyond engineering — [source: g2.com review, via search snippet; not fetched] (confidence: low; a single anecdote)
- An Atlassian Community article says Confluence Mermaid apps focus on rendering rather than helping people create diagrams, and that mastering the syntax "can be a big challenge" — [source: community.atlassian.com, via search snippet; not fetched] (confidence: low; vendor-authored)
- Sources that disagree: the Mermaid project says non-programmers can create diagrams through the Mermaid Live Editor, and a Theodo review calls the syntax intuitive — [source: search snippets] (confidence: low)
- The user states that writing Mermaid by hand carries a very large cognitive load, so an easy-to-use GUI is very helpful. This is a stated view, with no task, measure or observed users behind it. It conflicts with sources that call the syntax quick to learn (see below), so the disagreement is unresolved — [source: user statement in session, 2026-10-21; stated, not independently verified] (confidence: medium that the user holds this view; low that it applies to the target personas)
- Direct demand from the stated personas (business analysts and developers) has not been observed. `setup.md` states the user story but records no requests, interviews or usage data — [source: `setup.md`] (confidence: high that it is absent)
- Later features suggest real use by developers. Feature 005 records that a developer with Mermaid in a README "cannot bring it into the editor" and must redraw it. This is the spec author's framing (the author is now known to be the technical lead, who is also the requester), not observed behaviour — [source: `specs/005-new-from-mermaid/spec.md`] (confidence: low)

## Prior Art

- **Internal.** The product has gone through five spec'd increments: 001 (archived v0), 002 visual diagram editor, 003 GitHub Pages publish, 004 canvas usability, 005 new-from-Mermaid import. Two PRs are merged (#1 for 002, #2 for 004) — [source: `git log`, `specs/`] (confidence: high)
- **Scope reversals.** Two scope exclusions in `setup.md` were later amended by the Business Analyst: persistence (constitution 1.2.0) and Mermaid import (constitution 1.3.0). Users or the author wanted the original "no persistence, no import" scope relaxed. This suggests the original excluded list was too tight, but it is not independent demand evidence — [source: `specs/002-visual-diagram-editor/spec.md` line 36 and line 270; `specs/005-new-from-mermaid/spec.md`] (confidence: medium)
- **Mermaid Chart (commercial, from the Mermaid author's company).** A third-party profile says its Visual Editor is click-and-drag, updates the code as you edit, and works alongside the code view. The same profile says it supports flowcharts and sequence diagrams, but it may be dated. Another listing says it has no drag-and-drop, so the two disagree — [source: pulse2.com profile; capterra and softwareadvice listings, via search snippets; not fetched] (confidence: low)
- **Obsidian plugins.** "Mermaid Flow" and "Mermaid GUI Editor" give drag-and-drop flowchart editing that generates Mermaid code. They target Obsidian users, not standalone web use — [source: community.obsidian.md, obsidianstats.com, via search snippets; not fetched] (confidence: medium)
- **Libraries.** `ngx-mermaid-canvas` is an Angular visual editor that outputs Mermaid. It describes itself as early-stage — [source: awesome.ecosyste.ms, via search snippet; not fetched] (confidence: low)
- Not checked: draw.io, Excalidraw's Mermaid conversion, and the Mermaid Live Editor's own features. Searches did not return a standalone web app for visual Mermaid flowchart editing, but absence from three searches is weak evidence.

## Market & Context

- Without this tool, users write Mermaid by hand in the Live Editor or an IDE, or use a general diagramming tool such as draw.io or Visio, which does not emit Mermaid — [source: ASSUMPTION; Visio appears as a Mermaid Chart comparison in the softwareadvice listing] (confidence: low)
- Mermaid renders natively on GitHub, so diagrams in READMEs and docs are common. That is the demand pool for a Mermaid-emitting editor — [source: search snippet listing GitHub as a native-render platform] (confidence: low)
- A G2 reviewer says auto-layout can be messy on large diagrams, which suggests value in manual positioning — [source: g2.com review, via search snippet] (confidence: low)
- Cost of doing nothing: users keep hand-writing syntax. For an individual developer this is small, since the syntax is described as quick to learn — [source: Theodo snippet; ASSUMPTION about cost] (confidence: low)

- Token efficiency is part of the stated rationale. The technical lead's written answer (Appendix A) confirms the LLM purpose and says that capturing product knowledge for code assistants and LLMs generally is important to the business; that giving diagrams to LLMs as text is the mechanism is the reading made here. A text-based Mermaid diagram is meant to be cheaper and easier for an LLM to consume than an image or a verbose diagram format — [source: technical lead's written answer, Appendix A; stated, not independently verified] (confidence: high that LLM use is the intent; low that Mermaid beats other text formats)
- The user states that the saving is large when Mermaid is compared with XML-based diagram formats such as BPMN. This is a stated claim, with no figures or sample diagrams attached — [source: user statement in session, 2026-10-21; stated, not independently verified] (confidence: medium that the direction is right, since XML is verbose and Mermaid is terse; low on the size)
- No measurement of the saving is recorded in the repo or in the answers, and no source was searched for one. The size of the saving, and how Mermaid compares with other text formats, remains unmeasured — [source: ASSUMPTION] (confidence: low)
- The LLM and code-assistant purpose points to a different primary consumer than the personas in `setup.md`. The editor's output (Mermaid text) is consumed by LLMs, while its input is people drawing diagrams. Whether this changes who the users are is a question for define, not decided here — [source: technical lead's written answer, Appendix A; inference] (confidence: medium)

## Data & Constraints

- Scope as recorded: flowchart first. Sequence and C4 appear later (feature 005 imports flowchart, sequence and C4). The visual model is the sole source of truth, and direct source editing stays excluded — [source: `setup.md`, `specs/005-new-from-mermaid/spec.md`] (confidence: high)
- Delivery: a client-only React 19 SPA published to GitHub Pages, with no server or cloud storage. Diagrams live in browser storage, which is per profile, typically a few MB, unencrypted, and lost if browser data is cleared — [source: `CLAUDE.md`, `specs/002-visual-diagram-editor/spec.md` line 371] (confidence: high)
- Size of existing build: about 8.8k lines of TypeScript under `app/` (rough `wc` of `app/**/*.ts`; shell glob may miss deeper directories) — [source: local `wc`] (confidence: low)
- No usage analytics or volume figures are recorded, and no compliance requirements beyond those below — [source: repo review] (confidence: high that they are absent)
- Established requirements, already decided in `specs/002-visual-diagram-editor/spec.md` (the intake listed accessibility, browsers and clipboard behaviour as unknown, which is now out of date): FR-019 keyboard operation and a non-drag alternative for every drag; FR-020 WCAG 2.2 AA; FR-021 supported browsers (current Chromium-based browsers and Firefox on desktop, later extended to Chrome on Android and Safari on iOS by feature 007 and constitution 1.4.0); FR-014 clipboard copy confirmed only after success, with failures explained. These are specified requirements, not evidence that the implementation meets them — [source: `specs/002-visual-diagram-editor/spec.md`] (confidence: high that they are specified)

## Evidence Against the Idea

- No evidence of validated demand from the personas. The need comes from the technical lead, who requested the app and wrote its specs; no interviews, tickets or usage data from developers or business analysts exist — [source: repo review; technical lead's statements] (confidence: high)
- The cognitive-load and token-efficiency benefits are asserted, not measured. Nothing compares the editor's workflow with hand-written Mermaid on effort or token cost — [source: technical lead's statements; ASSUMPTION] (confidence: low)
- The Mermaid project and its commercial arm already ship a Live Editor and a Visual Editor. Third-party Obsidian plugins also cover drag-and-drop. A free standalone editor would compete on convenience only — [source: search snippets, see Prior Art] (confidence: low)
- Mermaid is widely described as quick to learn, which weakens the premise that users cannot write the syntax — [source: Theodo, Mermaid project snippets] (confidence: low)
- The product design (read-only source, no source editing) removes the round-trip that Mermaid Chart's visual editor reportedly offers (code and visual views kept in sync). This may reduce appeal for developers, the persona most likely to use Mermaid — [source: pulse2.com snippet vs `setup.md` exclusions; ASSUMPTION about appeal] (confidence: low)
- The scope has already grown beyond the original brief (persistence, import, sequence, C4), which can signal either real pull or scope creep. The repo cannot tell which — [source: `specs/`] (confidence: medium)

## Gaps & Open Questions

- Resolved: who requested this and what triggered it. The technical lead requested it, to reduce cognitive load for developers and business analysts and to use Mermaid's token efficiency (see Users & Demand).
- Resolved: what "token efficiency" means. It means passing diagrams to LLMs and code assistants as text, in service of capturing product knowledge for them (see Market & Context).
- [NEEDS CLARIFICATION: Is there a measurement behind the claimed large saving of Mermaid over XML formats such as BPMN (for example, tokens per diagram on representative flowcharts)? The claim is stated but no figures or sample diagrams were given.]
- [NEEDS CLARIFICATION: How is "reduced cognitive load" to be judged? The user says hand-writing Mermaid has a very large load, but which tasks (creating, reading, reviewing diagrams), for whom, and what would count as evidence (for example, time to produce a diagram, error rate, user ratings)?]
- [NEEDS CLARIFICATION: Have any business analysts actually been asked about diagramming pain? Which tools do they use today?]
- [NEEDS CLARIFICATION: Which current Mermaid Chart Visual Editor features exist (diagram types, drag-and-drop, free tier)? The search snippets conflict and no primary source was read.]
- [NEEDS CLARIFICATION: Is this a personal or learning project, an internal tool, or a public product? The answer decides how much demand evidence is needed.]
- [NEEDS CLARIFICATION: Is any usage data available since publication to GitHub Pages?]
- [NEEDS CLARIFICATION: Do the remaining intake unknowns (shapes and subgraphs) need research? Accessibility, browsers and clipboard behaviour are already specified (see Data & Constraints), so the open question is whether the implementation meets them, not what they are.]

## Sources

- g2.com survey response "mermaid review 13401640" (host: g2.com, policy: search-result only, not fetched; host not on allowlist)
- community.atlassian.com "Powerful Mermaid Editor for Confluence" (host: community.atlassian.com, policy: search-result only, not fetched; host not on allowlist)
- pulse2.com "Mermaid Chart: How This Company Creates Complex Diagrams..." (host: pulse2.com, policy: search-result only, not fetched; host not on allowlist)
- softwareadvice.com, capterra.com and fitgap.com Mermaid Chart listings (host: various, policy: search-result only, not fetched; hosts not on allowlist)
- community.obsidian.md and obsidianstats.com, Mermaid Flow and Mermaid GUI Editor (host: various, policy: search-result only, not fetched; hosts not on allowlist)
- awesome.ecosyste.ms, ngx-mermaid-canvas (host: awesome.ecosyste.ms, policy: search-result only, not fetched; host not on allowlist)
- theodo.com, "mermaid-js" blip (host: theodo.com, policy: search-result only, not fetched; host not on allowlist)
- Internal: technical lead's written answer (Appendix A; the original `.speckit-companion/report-answers/idea-mermaid-editor-wysiwyg-research.md` is git-ignored), `setup.md`, `CLAUDE.md`, `specs/002-visual-diagram-editor/spec.md`, `specs/005-new-from-mermaid/spec.md`, `git log`

## Appendix A: Technical lead's written answer

Copied verbatim from `.speckit-companion/report-answers/idea-mermaid-editor-wysiwyg-research.md` (git-ignored, so not in the checkout), written 2026-10-21.

> ## Question
> What does "token efficiency" mean here (for example, passing diagrams to LLMs as text rather than images), and is there any measurement of the saving?
>
> ## Answer
> Yes for LLMs. the idea of capturing product knowledge to provide code assistants and LLMs generally is important to the business
