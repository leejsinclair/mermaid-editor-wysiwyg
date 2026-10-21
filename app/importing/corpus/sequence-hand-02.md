# Ping and pong

```mermaid
sequenceDiagram
    Alice->>Bob: Ping
    Bob--)Alice: Pong later
    Alice-xBob: Message lost
    Bob-->>Alice: Thanks
```
