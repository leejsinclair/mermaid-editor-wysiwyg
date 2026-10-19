# Contract: Generated Mermaid source

`generate(diagram) -> { source: string, notices: Notice[] }` is a pure, deterministic function of the model
(constitution II, DC-03). Target: Mermaid 12.x, checked against the installed 12.2.0 parser (FR-013, SC-002).
Lines are joined with `\n`; statements are indented by two spaces; there is no trailing comment, no `%%` line,
no style or layout statement (FR-035), and nothing that is not in the model.

## Escaping (all types, research R2)

`esc(text)`: first normalise CRLF, CR, U+2028 and U+2029 to LF and split into lines. Then, per line, each of `# " < > & ; % $ \` backtick `{ } [ ] ( ) | , : ' * _ ~ = - /` becomes
`#<decimal code>;`; any leading or trailing white space character (space, tab, NBSP and other Unicode white space) becomes its decimal entity (`#32;`, `#9;`, `#160;`); lines are joined with `<br/>`. Every other
character, including all non-ASCII text and emoji, is written as is. Escaping then decoding (Mermaid
placeholders and `<br>`) returns the original exactly (SC-003).

## Flowchart

```text
flowchart TD
  n1["<esc label>"]                      rectangle
  n2("…")  n3(["…"])  n4{"…"}  n5(("…"))  rounded, stadium, diamond, circle
  n6[/"…"/]  n7[("…")]  n8[["…"]]  n9{{"…"}}  parallelogram, cylinder, subroutine, hexagon
  n1 --> n2      solid arrow     n1 --- n2   solid plain     n1 <--> n2  solid both
  n1 -.-> n2     dotted arrow    n1 -.- n2   dotted plain    n1 <-.-> n2 dotted both
  n1 ==> n2      thick arrow     n1 === n2   thick plain     n1 <==> n2  thick both
  n1 -->|"<esc label>"| n2       labelled connection (label omitted when empty)
```

Nodes in creation order, then connections in creation order. Positions are never written (FR-003).
Empty diagram: `flowchart TD`.

## Sequence

```text
sequenceDiagram
  participant p1 as <esc label>
  actor p2 as <esc label>
  p1->>p2: <esc text>     solid arrow       p1-->>p2: …   dashed arrow
  p1->p2: …               solid open        p1-->p2: …    dashed open
  p1-xp2: …               solid cross       p1--xp2: …    dashed cross
  p1-)p2: …               solid async       p1--)p2: …    dashed async
```

Declarations in participant order, then messages in message order (FR-030). Empty diagram: `sequenceDiagram`.

## C4

```text
C4Context | C4Container | C4Component | C4Dynamic | C4Deployment
  title <esc title>                                   only when the title is not empty
  Person(e1, "<esc>", "<esc description>")            Person_Ext, System, System_Ext, SystemDb, SystemDb_Ext,
                                                      SystemQueue, SystemQueue_Ext
  Container(e2, "<esc>", "<esc technology>", "<esc description>")
                                                      ContainerDb, ContainerQueue, Component, ComponentDb,
                                                      ComponentQueue, each with _Ext
  Enterprise_Boundary(b1, "<esc>") {   System_Boundary   Container_Boundary   Boundary (generic)
    …children, in order…
  }
  Deployment_Node(d1, "<esc>", "<esc technology>", "<esc description>") {
    …children, in order…
  }
  Rel(e1, e2, "<esc label>", "<esc technology>")      one-way
  BiRel(e1, e2, "<esc label>", "<esc technology>")    two-way
  RelIndex(<n>, e1, e2, "<esc label>", "<esc technology>")
                                                      one-way in Dynamic; n = 1 + position (FR-033)
```

- The tree is written depth first in order, then relationships in order. Optional trailing arguments that are
  empty are omitted; an empty argument before a non-empty one is written `""`.
- Dynamic two-way relationships are written `BiRel` at their position, without a literal number
  (Clarification (plan)); Mermaid numbers it by position.
- Empty diagram: the header, then the `title` line if the title is set (FR-013).

## Notices (research R6)

| Notice | When | Text (catalogue) |
|--------|------|------------------|
| `c4-empty` | C4, no items and empty title | Mermaid cannot draw an empty C4 diagram. Add an element or a title. |
| `c4-empty-container` | C4, any boundary or Deployment node with no children (one per item) | Mermaid cannot draw an empty boundary: <label>. Add an element to it or delete it. |

With a notice, the source is still shown and copyable; the copy feedback includes the notice. Without notices,
every generated source is accepted by Mermaid's parser and the parser's reading matches the model (R8).

## Copy actions

- **Copy Source**: the source exactly. When the source check is `invalid` or generation throws, the copy is refused with an explanation and the clipboard is not written (decision OQ-4). A source that only carries a notice (`c4-empty`, `c4-empty-container`) is valid and is copied.
- **Copy for Markdown**: ```` ```mermaid ```` + `\n` + source + `\n` + ```` ``` ```` (FR-014).
