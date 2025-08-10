---
type: "agent_requested"
description: "A workflow to follow when working alongside multiple agents"
---
# Workflow: /multi-agent-sync

Synchronize multi-agent alignment by checking shared logs periodically. Invoke with `/multi-agent-sync [interval_minutes]` (default: 10) or run on triggers like phase starts.

1. **Check Shared Logs**
   - Scan persistent logs or channels for recent claims, handoffs, and plan updates from other agents.
   - Identify conflicts (e.g., duplicate phase claims) or pending notifications.

2. **Verify Own State**
   - Compare local state (phase/task status) against shared logs.
   - If mismatch (e.g., another agent claimed your phase): Pause, log "Conflict detected: [details]", and query user.

3. **Broadcast Status**
   - Log and broadcast current agent status: "Agent [agent_id] sync: Phase [phase_id] at [status] (e.g., claimed/completed)."
   - Notify if plan changes detected: Trigger reset per rules.

4. **Handle Updates**
   - If new plan updates found: Reset state, re-claim phases, and notify all agents.
   - Load checkpoints if reversion needed based on logs.

5. **Report and Schedule Next**
   - Append sync results to logs: Timestamps, findings, actions.
   - If no issues: Proceed with current task.
   - Schedule next sync (e.g., after [interval_minutes]).

Repeat periodically to maintain cascade integrity.