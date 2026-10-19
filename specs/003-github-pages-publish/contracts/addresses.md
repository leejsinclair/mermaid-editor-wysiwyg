# Contract: In-app addresses

Written against the page address `<base>` (for example `http://localhost:5173/` or
`https://leejsinclair.github.io/mermaid-editor-wysiwyg/`).

| View | Address | Notes |
|------|---------|-------|
| Start screen | `<base>#/` | Also what `<base>` alone shows |
| New flowchart or sequence diagram | `<base>#/new/<type>` | `<type>` is `flowchart` or `sequence` |
| New C4 diagram | `<base>#/new/c4/<kind>` | `<kind>` is one of the five C4 kinds |
| Saved diagram | `<base>#/d/<id>` | `<id>` as created by the editor |

Rules:

- Nothing before `#` varies between views, so a host that serves only real files needs no fallback rule.
- The build refers to its files relatively (DC-01), so `<base>` can be any folder.
- Old path-style addresses (`<base>d/<id>`) are not supported (EC-03).
- Moving between views, creating a diagram and opening a file change only the part after `#`.
