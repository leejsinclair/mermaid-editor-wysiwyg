# Corpus sources

Each document in this folder is a Markdown file with one Mermaid block. The corpus test (`app/importing/corpus.test.ts`) reads every file here, except this one, and holds the expectation for each: thirty documents in all, of flowchart, sequence and C4 types, that use only supported constructs.

## Documents from the Mermaid documentation (MIT)

Taken from `mermaid-js/mermaid`, `packages/mermaid/src/docs/syntax/` (flowchart.md), under the MIT licence of that repository. Only the blocks that use supported constructs are kept here:

| File | Source |
|------|--------|
| `flowchart-02.md` | flowchart.md, the first block that links A and B to C and D |
| `flowchart-06.md` | flowchart.md, the block with `-- text -->` edge labels and a `%%` comment |

The other blocks from the same file use unsupported constructs (`@{...}` shapes, edge ids, animation, curves). They are kept in `unsupported/` for the second corpus (VO-055). The sequence block from `sequenceDiagram.md` uses `link` lines and is kept there too.

## Hand-written documents (this repository)

The files below were written for this repository. Their content is invented and is licensed under the same terms as this repository.

- **C4** (`c4-*.md`), 22 documents. They use only the C4 macros the import reads. They cover the five kinds the editor offers:

  | Kind | Files |
  |------|-------|
  | context | `c4-context-01.md` to `c4-context-05.md` |
  | container | `c4-container-01.md` to `c4-container-05.md` |
  | component | `c4-component-01.md` to `c4-component-04.md` |
  | dynamic | `c4-dynamic-01.md` to `c4-dynamic-04.md` |
  | deployment | `c4-deployment-01.md` to `c4-deployment-04.md` |

  Deployment documents use plain `Container` elements only. The editor's deployment kind has no database or queue type, so those elements are written as containers.

- **Flowchart and sequence** (`flowchart-hand-*.md`, `sequence-hand-*.md`), 6 documents. The spec asks for documents lifted from the Mermaid repositories, and hand-writing only where too few are found. Only two supported flowchart blocks were found in the Mermaid documentation and none for sequence diagrams, so these were written here. The Mermaid repositories' test and demo files (and `mermaid-js/mermaid-cli`'s `test-positive`) have not yet been searched for more; that is open for review.

## Not yet covered

- The second corpus (VO-055) needs the same documents with unsupported constructs added. The `unsupported/` folder holds the Mermaid-sourced material for it.
