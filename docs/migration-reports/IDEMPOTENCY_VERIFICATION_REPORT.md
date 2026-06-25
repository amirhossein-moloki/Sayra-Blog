# Idempotency Verification Report

All entity IDs are generated using a deterministic hashing algorithm:
`ID = "c" + md5(entityType + ":" + sourceId).substring(0, 24)`

## Sample Deterministic Mappings
| Entity | Source ID | Deterministic ID |
| --- | --- | --- |
| User | AnonymousUser | cdf7b6afecee2e45d805a4326 |
| Post | mission-free-bar-my-0 | c69e1b09c8b20db77697a069b |

**Verification:** Running the migration multiple times will result in identical IDs, preventing duplicate records and maintaining stable relations.
