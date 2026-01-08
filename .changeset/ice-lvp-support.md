---
'@chainlink/ice-adapter': minor
---

Add Last Value Persistence (LVP) support for off-market hours. The adapter now emits heartbeat events at configurable intervals (LVP_HEARTBEAT_INTERVAL, default 30s) to extend cache TTLs for active subscriptions, ensuring cached prices remain available when no price updates are received from the data provider.
