# Astro VoIP Portal

## Introduction

Astro VoIP Portal is a modern, enterprise-grade VoIP and unified communications dashboard built to interface with FreeSWITCH®, Kamailio, and RTPEngine. Inspired by the robust foundations of platforms like FusionPBX and FreePBX, this portal is redesigned from the ground up with a focus on speed, modern web technologies (Astro, React, Vite, TypeScript), and a premium "EtherLine Elite" flat design aesthetic. 

Our goal is to maintain compatibility with proven VoIP architectures while delivering a cleaner interface, vastly improved performance, and advanced features that meet the demands of today's telecom providers, enterprises, and high-end professional clients.

## Why Astro VoIP Portal?

- **Modern Dashboard:** A fresh, streamlined UI designed for speed, clarity, and an enterprise-grade user experience, moving away from cluttered traditional VoIP interfaces.
- **Service Provider Ready:** Multi-tenant architecture, white-label branding capabilities, and advanced zero-touch provisioning support for popular SIP phone vendors.
- **Advanced Modules:** Built-in support for Contact Center operations, Hospitality/PMS integrations, SMS/MMS routing, E-Fax, cloud recording storage, and AI integrations.
- **Scalable & Flexible:** Engineered to efficiently support small offices, large enterprises, and full-scale VoIP carriers alike.

## Backend Server (Public Feature Status)

This rolling list tracks back-end parity targets against FS PBX, FusionPBX, and FreePBX.

### ✅ Completed
- API foundation with `Hono`, health/readiness probes, and OpenAPI + Swagger docs.
- Core multi-tenant data models and APIs for accounts/domains, DIDs, extensions, subscribers, voicemail, trust, and routing support tables.
- Routing-focused APIs for IVR profiles, inbound routes, time conditions, and routing policies.
- Telephony reporting endpoints for CDR/ACC/missed-calls style data access.
- Tenant-scoped validation and tenant audit logging for back-end configuration changes.

### 🚧 In Progress / Next
- Outbound routing parity: destination maps, dialplan tools, feature codes, and full day/night toggles.
- Advanced call handling parity: ring groups, follow me, call forwarding, call parking, paging/intercom, conference controls.
- Contact center parity: queue strategy controls, agent state APIs, supervisor actions (listen/whisper/barge), and wallboard event streams.
- Provisioning parity: zero-touch device provisioning workflows (Yealink, Polycom, Fanvil, Cisco, Algo) and provisioning diagnostics.
- Messaging and fax parity: SMS/MMS provider abstraction and virtual e-fax pipelines.
- Hospitality parity: PMS connectors, room status automation, wake-up scheduling, and check-in/check-out workflows.
- AI parity: call transcription, summary generation, and AI-assisted voice flows.
- Admin tooling parity: global SQL query tooling, advanced diagnostics, and richer telecom operations APIs.

## Infrastructure (Public Feature Status)

This rolling list tracks platform and deployment parity requirements for telecom-grade operation.

### ✅ Completed
- PostgreSQL-backed schema and migration foundation for core PBX and routing entities.
- Typed server-side data access with Drizzle ORM.
- Local full-stack development workflow for Astro + Worker API services.
- Baseline API contract visibility via generated OpenAPI docs.

### 🚧 In Progress / Next
- Telecom security hardening parity: Event Guard integrations, IP reputation controls, firewall automation, and TLS/SRTP enforcement.
- Real-time infrastructure parity: WebSocket event pipelines for active calls, active conferences, and system telemetry.
- Service provider readiness parity: strict tenant isolation controls, white-label controls, and account-level policy guardrails.
- Billing and tax parity: production Stripe billing flows and Ceretax compliance integration.
- Recording and media parity: cloud recording storage tiers, retention controls, and secure retrieval APIs.
- Observability parity: centralized logs, metrics, traces, and alerting for API + media path reliability.
- Deployment parity: CI/CD validation, rollback-safe migrations, backup/restore automation, and HA/DR runbooks.

---

## UI Roadmap

This section tracks the public progress of our user interface and front-end development, specifically focusing on our premium "EtherLine Elite" design system.

### ✅ Completed
- Project initialization with Astro, React, and Tailwind CSS.
- Implementation of the core "EtherLine Elite" flat design language (removal of unnecessary shadows and glassmorphism).
- Navigation transition from traditional sidebars to a sophisticated pill-navigation top bar.
- Refactored core management modules (Numbers, Extensions, Infrastructure Nodes) using React Hook Form and Zod validation.
- Standardized UI components including Modals, Drawers, and interactive data tables.
- Enhanced Data Visualization with robust mock data, charts, status indicators, and trend cards.
- Refined dark/light mode toggle with persistent theme state to prevent styling flashes.

### 🚧 To Be Completed
- **Live WebSocket Integrations:** Hooking up the real-time React dashboard components to live backend SIP statistics.
- **Visual Dialplan Builder:** A drag-and-drop interface for configuring IVRs and call flows.
- **Advanced Provisioning UI:** Interactive wizards for setting up bulk SIP devices and assigning templates.
- **Contact Center Wallboard:** Full screen, auto-refreshing UI tailored specifically for live call center monitoring.
- **Billing Dashboard:** UI modules for invoice management, tax reporting, and Stripe checkout flows.
- **Comprehensive Mobile Responsiveness:** Finalizing the responsive experience for complex data tables and management drawers on small viewports.
