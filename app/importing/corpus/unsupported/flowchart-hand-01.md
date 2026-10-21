# Decision flow

```mermaid
flowchart TD
classDef hot fill:#f9f
    Start[Start here] --> Check{Is it ready?}
    Check -->|Yes| Go(Go ahead)
    Check -->|No| Wait([Wait a while])
    Wait --> Check
```
