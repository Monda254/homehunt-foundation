# Incident Response Plan & Escalation Playbook

## Severity Levels

| Severity Level       | Response SLA | Examples                                                                                      | Escalation Target                    |
| :------------------- | :----------- | :-------------------------------------------------------------------------------------------- | :----------------------------------- |
| **SEV-1 (Critical)** | < 15 Mins    | Total system outage, database corruption, payment gateway failure affecting all transactions. | DevOps Lead, Principal Engineer, CTO |
| **SEV-2 (High)**     | < 1 Hour     | Degraded payment processing, email notification delays, single-region latencies.              | SRE Team, Backend Lead               |
| **SEV-3 (Medium)**   | < 4 Hours    | Non-critical UI glitch, individual analytics failure.                                         | Engineering Team                     |

## Incident Execution Flow

1. **Triage & Containment**: Inspect system metrics and `GET /api/v1/readiness` endpoint output.
2. **Communication**: Update status page / issue alert notification to affected users.
3. **Remediation**: Execute targeted patch or invoke `rollback-runbook.md`.
4. **Post-Mortem**: Document root cause, timeline, action items, and prevention measures within 48 hours.
