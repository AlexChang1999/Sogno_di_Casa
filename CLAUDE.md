# Sogno di Casa — Claude Instructions

## Project Context

**Project: Sogno di Casa**

- Stack: Java Spring Boot backend + vanilla JavaScript/HTML/CSS frontend
- When modifying backend entities, always update: Entity → DTO → Repository → Service → Controller (full CRUD stack)
- After backend changes, verify compilation with `mvn compile` (not mvnw - wrapper may not exist)
- Frontend is served via `npx serve` which strips .html extensions - use hash fragments (#) for routing, not query strings (?id=1)

## Workflow Preferences

When fixing bugs or adding features, implement the fix within the session rather than ending at the investigation/diagnosis phase. Prioritize applying changes over exhaustive exploration.

## Testing & Verification

After making backend changes (entities, controllers, security config), always run `mvn compile` to verify compilation before moving to frontend work.

## Common Pitfalls

- **Spring Security**: When adding new API endpoints, always check SecurityConfig to ensure the path is permitted. Admin endpoints use `/api/admin/**` pattern. Watch for CORS preflight (OPTIONS) blocking and role name mismatches (`ROLE_` prefix).
- **Branch merging**: When merging code from worktrees or branches, verify that API endpoint paths match what the frontend expects before committing (e.g., `/api/orders/all` vs `/api/orders/admin/all`).
