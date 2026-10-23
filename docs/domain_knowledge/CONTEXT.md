# Mermaid Editor (WYSIWYG): Domain Context

Canonical terms for this project. The business rules and acceptance criteria are in [setup.md](../../setup.md).

## Canonical terms and key concepts

- **Appearance**: one complete visual scheme of the editor (colours, type faces, spacing), chosen by the user.
  Blueprint Studio is the default appearance and Light the other. Blueprint Studio names an appearance, not the
  application, which is called "Mermaid diagram editor". _Avoid_: theme, skin, mode (Mermaid uses "theme" for
  its own drawing options).

## Domain boundaries

- An appearance changes only how the editor looks; it never changes the diagram, the generated Mermaid source, copied
  output or saved files. Mermaid's own drawings inside the editor follow the appearance (blueprint colours in
  Blueprint Studio, Mermaid's default look in Light).

## Related documents

- [ADR 0001: Two appearances with a switch](adr/0001-two-appearances-with-switch.md)
- [ADR 0002: Mobile browser support](adr/0002-mobile-browser-support.md)
