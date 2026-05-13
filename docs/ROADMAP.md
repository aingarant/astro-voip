# Internal Development Roadmap

This internal roadmap tracks delivery toward practical feature parity with FS PBX, FusionPBX, and FreePBX, while keeping a modern Astro + React + Hono architecture.

## Source Parity Targets

- **FS PBX baseline:** modern dashboard architecture, service-provider multi-tenancy, advanced modules (hospitality, contact center, messaging, fax), Stripe/Ceretax billing, API-driven integrations.
- **FusionPBX baseline:** destination map, feature codes, voicemail TTS greetings, call recording transcription/summary, Event Guard style security controls, active-call/conference real-time telemetry.
- **FreePBX baseline:** complete day-to-day PBX controls (IVR, queues, ring groups, parking, paging/intercom, forwarding, follow me, conferencing, voicemail, trunks, recording, admin feature-code workflows).

## Backend Server Track

### Completed (rolling)
- [x] Hono API service with `/health`, `/ready`, OpenAPI JSON, and Swagger docs.
- [x] CRUD and validation patterns for core entities: accounts, domains, subscribers, extensions, DIDs, voicemail primitives.
- [x] Routing primitives implemented at API + DB level: IVR profiles, inbound routes, time conditions, routing policies.
- [x] Reporting endpoints for CDR/ACC/missed calls style query patterns.
- [x] Tenant scoping and tenant audit logging utilities integrated in routing modules.

### In Progress
- [ ] Extend IVR parity to full menu/version publishing workflows, prompt lifecycle, and production-safe rollout controls.
- [ ] Normalize outbound routing + destination map semantics across FreeSWITCH/Kamailio pathways.
- [ ] Harden routing policy behavior for failover, retries, and tenant-level overrides.

### Remaining for Parity
- [ ] **Core call handling:** ring groups, follow me, call forwarding, call parking, paging/intercom, conferencing administration.
- [ ] **Feature-code system:** day/night toggles, call control codes, voicemail/park/paging feature code parity.
- [ ] **Voicemail parity:** voicemail-to-email policy controls, greeting/TTS management, mailbox lifecycle automation.
- [ ] **Provisioning parity:** full endpoint/device profile APIs and template rendering pipeline.
- [ ] **Contact center parity:** queue configs, agent state machine, supervisor controls (listen/whisper/barge), queue analytics.
- [ ] **Hospitality parity:** PMS connector contracts, room state transitions, wake-up scheduler, check-in/check-out call logic.
- [ ] **Messaging/fax parity:** SMS/MMS abstraction layer plus e-fax ingest/delivery workflows.
- [ ] **AI parity:** call transcription, recording summary, AI speech/voice workflow orchestration.
- [ ] **Operations parity:** SQL query tool, SIP trace APIs, provisioning request log access, expanded diagnostics.

## Infrastructure Track

### Completed (rolling)
- [x] PostgreSQL schema and migration framework (Drizzle) for telecom domain entities.
- [x] Typed DB access and validation boundary patterns (Drizzle + Zod).
- [x] Local environment orchestration for Astro app + Worker API development.
- [x] API contract discoverability with generated OpenAPI output.

### In Progress
- [ ] Establish secure environment/profile conventions for local, staging, and production parity.
- [ ] Introduce deterministic migration + rollback strategy for production-safe deploys.
- [ ] Define canonical event transport for real-time call/conference telemetry.

### Remaining for Parity
- [ ] **Security hardening:** Event Guard-compatible controls, firewall policy automation, reputation filtering, TLS/SRTP enforcement, SBC-aware edge policy.
- [ ] **Observability:** centralized logs, structured traces, metrics dashboards, alerting and on-call runbooks.
- [ ] **Real-time infra:** durable WebSocket/event-stream layer for active calls, conferences, and queue telemetry.
- [ ] **Billing/tax infra:** production Stripe integration flows and Ceretax orchestration.
- [ ] **Recording/media infra:** cloud storage backends, retention lifecycle jobs, secure media access controls.
- [ ] **Service-provider operations:** tenant isolation guarantees, white-label controls, per-tenant quotas and limits.
- [ ] **Reliability:** backups, restore drills, HA/DR strategy, failover testing, incident playbooks.
- [ ] **CI/CD quality gates:** API schema checks, migration checks, contract tests, and environment promotion controls.

## UI / Frontend Track

UI work continues in parallel and remains tracked separately for design and interaction milestones.

## Architecture Notes

- **Frontend:** Astro + React + TypeScript.
- **API:** Hono service with OpenAPI-first contract exposure.
- **Data:** PostgreSQL with Drizzle ORM/migrations.
- **Validation:** Zod at API boundaries.
- **Integration direction:** Astro operates as BFF where needed, proxying securely to telecom services (FreeSWITCH/Kamailio and related subsystems).
