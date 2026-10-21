# Report pipeline

```mermaid
flowchart LR
classDef hot fill:#f9f
    Input[/Read input/] --> Parse[[Parse]]
    Parse --> Store[(Store)]
    Store --> Report((Report))
    Report --> Done{{Finish}}
```
