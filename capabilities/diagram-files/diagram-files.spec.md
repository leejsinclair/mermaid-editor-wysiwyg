# Diagram files — Living Spec

## Purpose

A diagram lives in this browser and in files a person saves. Without these rules a diagram can be lost silently, two tabs can overwrite each other, or a file from a newer version can be opened and damaged.

## Requirements

### A diagram is kept in this browser as it is edited [inferred]
<!-- touches: app/persistence/store.ts, app/editor/saveStatus.ts, app/editor/sessions.ts -->

Each change is written to browser storage. The save status shows whether the latest change has been written, is being written, or could not be written.

#### Scenario: browser storage is unavailable

- **WHEN** the browser refuses storage
- **THEN** the status says the browser storage is unavailable and suggests saving a file to keep a copy

### Only one tab edits a diagram at a time [inferred]
<!-- touches: app/persistence/lock.ts, app/editor/library.ts, app/rendering/shared/LockDialogs.tsx -->

A diagram open for editing in one tab cannot be edited in another. The second tab offers to take the editing over. The first tab then stops, and what it had saved stays saved.

#### Scenario: a second tab takes over the diagram

- **WHEN** the person chooses Edit here instead in a second tab
- **THEN** the second tab edits, and the first tab says that editing moved to another tab

#### Scenario: the first tab had a label half typed

- **WHEN** editing moves to another tab while a label is still being typed in the first tab
- **THEN** the typed label is not kept, and the message says so

### A page that closes or crashes releases its diagram [inferred]
<!-- touches: app/persistence/lock.ts -->

When a tab closes or crashes, its claim on the diagram ends with it, and the diagram can be opened for editing elsewhere.

#### Scenario: the tab is closed

- **WHEN** the person closes the tab that was editing a diagram
- **THEN** another tab can open the diagram for editing without being offered a takeover

### Saving a file names it from the diagram [inferred]
<!-- touches: app/persistence/fileIo.ts, app/persistence/fileName.ts -->

The file name keeps letters, digits, spaces, hyphens, underscores and full stops. Other characters become underscores. The name is trimmed and cut to 100 characters. A name with nothing left is saved as `diagram`.

#### Scenario: a name made only of symbols

- **WHEN** the diagram name contains no letters or digits
- **THEN** the file is named `diagram`

### Opening a file checks it before anything is shown [inferred]
<!-- touches: app/persistence/openFile.ts, app/persistence/codec.ts -->

A chosen file is checked in order: its size, whether it is text, whether it is JSON, whether it is a file from this editor, whether its version is one this editor knows, and whether its contents are a valid diagram. The first failure is named, and nothing is opened.

#### Scenario: a file from a newer version is opened

- **WHEN** the person opens a file saved by a newer version of the editor
- **THEN** the file is refused, nothing is opened, and the message says it was saved by a newer version

#### Scenario: a file is larger than 5 MB

- **WHEN** the person opens a file larger than 5 MB
- **THEN** the file is refused before its contents are read

#### Scenario: a file's contents are damaged

- **WHEN** the file is an editor file whose diagram content does not match its type
- **THEN** the file is refused and the message names the damaged part

### A file from an older version still opens [inferred]
<!-- touches: app/persistence/migrations.ts, app/persistence/codec.ts -->

A diagram saved by an earlier version of the editor is brought up to the current version when it is opened. Its item numbers continue after the highest one in use.

#### Scenario: a file from before item numbers existed

- **WHEN** the person opens a file saved before item numbers were kept
- **THEN** the diagram opens, and new items are numbered after the highest existing one

### Leaving with unsaved work asks first [inferred]
<!-- touches: app/editor/leavePage.ts -->

While saving has failed or is under way, or a label is still being typed, closing, reloading or leaving the page asks the person to confirm.

#### Scenario: a save has failed

- **WHEN** the person tries to close the page after a failed save
- **THEN** the browser asks them to confirm before the page closes

## Uncovered

- Nothing in this area is left without an owner.
