# Message path

```mermaid
flowchart LR
    Cache ==> Database
    Client -.-> Cache
    Client --- Logs
    Logs --> Archive
```
