# Mermaid import — Living Spec

## Purpose

Import lets a person bring existing Mermaid text into the editor. Without it, any diagram written elsewhere must be drawn again by hand, and what the editor cannot keep would be lost without a word.

## Requirements

### Pasted or dropped Mermaid text is shown before anything is created [inferred]
<!-- touches: app/importing/**, app/rendering/import/**, app/editor/mermaidParser.ts, app/editor/mermaidSnapshot.ts -->
<!-- aligns: mermaid-text-safety#Mermaid text is never run, fetched or followed -->

The New from Mermaid dialog reads the text as it is pasted or dropped and shows its picture, the diagram type it detected, and the report. Nothing is created until the person chooses Import.

#### Scenario: text is pasted but not imported

- **WHEN** the person pastes Mermaid text and closes the dialog without choosing Import
- **THEN** no diagram is created

#### Scenario: a file is dropped on the dialog

- **WHEN** the person drops a text file on the dialog
- **THEN** its text is read the same way as pasted text

### A name is needed before a diagram is imported [inferred]
<!-- touches: app/rendering/import/ImportDialog.tsx -->

The name starts as the document's own name and can be changed. Import is refused while the name is blank.

#### Scenario: the name is cleared

- **WHEN** the person clears the name and chooses Import
- **THEN** the import is refused and the dialog asks for a name

### Constructs the editor cannot keep are reported with their line [inferred]
<!-- touches: app/importing/scan.ts, app/importing/report.ts, app/rendering/import/ImportReport.tsx -->

The import report lists each construct the editor does not hold, in one of three groups: dropped, approximated, or ignored. Each entry names its line and says why it changed. Nothing is removed without an entry.

#### Scenario: a style class is in the text

- **WHEN** the text contains a style class
- **THEN** the report lists it under dropped, with its line and the reason the editor does not keep it

#### Scenario: a second diagram block follows the first

- **WHEN** a Markdown file has a second Mermaid block
- **THEN** the second block is not imported and the report lists it under ignored, with its start

### Text the editor cannot read is refused with the reason [inferred]
<!-- touches: app/importing/readDocument.ts, app/importing/outcome.ts -->

Text that Mermaid rejects is refused, and the error names its line and column. A C4 document whose kind cannot be found, or that mixes kinds, is refused and names the kinds it found. A document nested deeper than the editor holds is refused.

#### Scenario: text is not valid Mermaid

- **WHEN** the person imports text that Mermaid rejects
- **THEN** the dialog shows the line and column of the error and creates nothing

#### Scenario: a C4 document mixes two kinds

- **WHEN** the document contains context and container elements together
- **THEN** the import is refused, and the message names both kinds

### Files over 5 MB are not loaded [inferred]
<!-- touches: app/rendering/import/readFile.ts, app/model/limits.ts -->

A file larger than 5 MB is not read, whether it is chosen or dropped.

#### Scenario: a large file is dropped

- **WHEN** the person drops a file larger than 5 MB
- **THEN** the file is not loaded and the dialog says it is larger than 5 MB

### Compare shows the original beside the generated source [inferred]
<!-- touches: app/rendering/import/CompareView.tsx, app/importing/compare.ts -->

Compare sets the original text beside the generated source, line by line, and marks the words that differ.

#### Scenario: the texts already match

- **WHEN** the person opens Compare and the generated text equals the original
- **THEN** the view says the original already matches the generated text

### An imported diagram is an ordinary diagram [inferred]
<!-- touches: app/importing/readDocument.ts, app/importing/flowchart.ts, app/importing/sequence.ts, app/importing/c4.ts, app/importing/layout.ts -->

Once imported, the diagram opens in the editor and is edited, saved and copied like one drawn by hand, in the same type.

#### Scenario: an imported flowchart is edited

- **WHEN** the person imports a flowchart and adds a node
- **THEN** the node is added to the imported diagram like any other

### A diagram that cannot be saved is not created [inferred]
<!-- touches: app/rendering/import/ImportDialog.tsx, app/editor/library.ts -->

If the browser cannot store the new diagram, the dialog says so and nothing is created.

#### Scenario: browser storage refuses the save

- **WHEN** the person chooses Import and storage refuses the write
- **THEN** the dialog says the diagram could not be saved and that nothing was created

## Uncovered

- Nothing in this area is left without an owner.
