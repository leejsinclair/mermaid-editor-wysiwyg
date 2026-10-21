# Report pipeline

```mermaid
flowchart LR
    Input[/Read input/] --> Parse[[Parse]]
    Parse --> Store[(Store)]
    Store --> Report((Report))
    Report --> Done{{Finish}}
```
