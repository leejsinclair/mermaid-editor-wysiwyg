# Contract: Generated Mermaid source

`generate(diagram) -> string` is a pure function of the Diagram. The text is derived output only: it is never
parsed back and never stored as editable state (FR-015).

## Shape

```text
flowchart TD
<node line>*
<connection line>*
```

- Lines end with a line feed; the text has no trailing blank line. An empty diagram generates exactly the header
  line `flowchart TD` followed by one line feed (FR-021).
- Each indented line uses four spaces.
- All nodes first in creation order, then all connections in creation order. Positions never appear (EC-07).
- Mermaid node id for node number `k` is `n<k>`.

## Node lines

`<id><open>"<label>"<close>` with the pair for each shape:

| Shape | Open | Close |
|-------|------|-------|
| rectangle | `[` | `]` |
| rounded | `(` | `)` |
| stadium | `([` | `])` |
| diamond | `{` | `}` |
| circle | `((` | `))` |
| parallelogram | `[/` | `/]` |
| cylinder | `[(` | `)]` |
| subroutine | `[[` | `]]` |
| hexagon | `{{` | `}}` |

## Connection lines

`<source id> <operator>[|"<label>"|] <target id>`; the label part is omitted when the label is empty.

| Style | forward | none | both |
|-------|---------|------|------|
| solid | `-->` | `---` | `<-->` |
| dotted | `-.->` | `-.-` | `<-.->` |
| thick | `==>` | `===` | `<==>` |

A self-loop is `n1 --> n1`. Duplicates and opposite directions are emitted as separate lines.

## Label escaping

Applied to node labels and connection labels, in this order, then wrapped in double quotes:

| Step | Replace | With |
|------|---------|------|
| 1 | `#` | `#35;` |
| 2 | `"` | `#quot;` |
| 3 | `<` | `#lt;` |
| 4 | `>` | `#gt;` |
| 5 | `&` | `#amp;` |
| 6 | backtick | `#96;` |
| 7 | `\r\n`, `\r`, `\n` | `<br/>` |

Step 7 runs last so the `<br/>` it inserts is not escaped by step 3. Brackets, parentheses, braces, pipes,
semicolons and arrows need no replacement inside the quotes.

## Guarantees checked by tests

1. The text is accepted by Mermaid's own parser for every Diagram built from the supported elements, including
   cycles, fan-in, fan-out, disconnected nodes, self-loops, duplicate and opposite connections (SC-002).
2. Mermaid's parsed result has exactly one vertex per node and one edge per connection, with the vertex shape,
   edge arrow type and edge stroke matching the model, and with the label text equal to the model's after the
   entities are decoded (SC-003, EC-01, EC-02).
3. Moving a node, or any change that leaves the logical content alike, leaves the text identical (EC-07).
4. The same Diagram always generates the same text.
