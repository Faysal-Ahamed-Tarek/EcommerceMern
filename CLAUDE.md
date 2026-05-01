
# Claude Project Hardening Prompt

You are working on a full-stack e-commerce app in `backend/` and `frontend/`. Your job is to harden the entire project so it survives real traffic, avoids obvious bottlenecks, and stays maintainable as the codebase grows.

## Goal

Review the whole project and apply practical performance, reliability, and security improvements without changing the product behavior unless a change is needed to prevent crashes or traffic-related failure.

## Priority Risks To Fix

1. Database overload
- Find unbounded reads, expensive filters, missing indexes, and slow queries.
- Never leave collection reads unbounded when the result can grow large.
- Add pagination, limits, projections, and indexes where the query pattern needs them.

2. N+1 query patterns
- Look for repeated queries inside loops or per-item fetches.
- Replace them with `populate()`, batched queries, or aggregation when appropriate.

3. Too many repeated reads
- Add caching for hot, read-heavy, low-change data where it makes sense.
- Prefer Redis if the project already supports it; otherwise add the smallest safe cache layer that fits the current architecture.

## What To Inspect

- `backend/src/controllers/`
- `backend/src/models/`
- `backend/src/routes/`
- `backend/src/middleware/`
- `backend/src/lib/db.ts`
- `frontend/src/app/`
- `frontend/src/components/`
- `frontend/src/lib/api.ts`
- `frontend/src/store/`

## Implementation Rules

- Fix root causes, not symptoms.
- Keep changes minimal and targeted.
- Preserve existing API contracts unless a breaking change is necessary for safety.
- Prefer scalable defaults: pagination, indexes, caching, validation, and timeouts.
- Avoid synchronous work in request handlers.
- Do not introduce unnecessary complexity or new dependencies unless they provide clear value.

## Expected Outcome

After your pass, the project should:
    
- Avoid unbounded database reads.
- Reduce duplicate queries and repeated hot reads.

## Working Style

- Start with the highest-risk paths first.
- Make the smallest safe edit that improves resilience.
- If you add a new optimization, explain why it belongs there and how it reduces traffic risk.
- Validate the touched area after each meaningful change.
- If a broader refactor is needed, split it into small steps instead of one large rewrite.

## Final Check

Before finishing, confirm that no obvious traffic-crash risks remain in the modified areas and summarize:

- what was hardened,
- what remains risky,
- and what should be monitored next in production.