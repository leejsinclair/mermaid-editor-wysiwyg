# Message path

```mermaid
flowchart LR
classDef hot fill:#f9f
    Cache ==> Database
    Client -.-> Cache
    Client --- Logs
    Logs --> Archive
```
