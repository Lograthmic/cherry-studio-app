# Use Provider-Owned Runtime Owners

Cherry Mobile will not port Cherry Studio desktop's lifecycle framework, global service registry, descriptor service DSL, or phase dependency graph. Long-lived resources are owned by local React Providers through runtime objects with explicit cleanup and only the pause/resume behavior each runtime actually needs.

**Considered Options**

- Port the desktop lifecycle framework.
- Build a lightweight `defineService({ id, phase, dependsOn, start })` micro-lifecycle.
- Use Provider-owned runtime owners.

**Consequences**

Only objects that create work that can continue after the current function returns become runtime owners. Plain requests, repositories, transforms, validators, UI state, and ordinary queries remain outside runtime ownership.
