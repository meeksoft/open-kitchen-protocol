# Changelog

All notable changes to the Open Kitchen Protocol specification will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-12-10

### Added
- Initial OKP 1.0 specification release
- Core schema with agents, workflows, handoffs, and context
- JSON Schema for validation (`schemas/okp.schema.json`)
- Python validator script (`tools/okp-validate`)
- Node.js validator script (`tools/okp-validate.js`)
- Example configurations in `examples/`
- Complete specification document (`spec/OKP_SPEC.md`)
- Contributing guidelines

### Agents
- Support for multiple providers: anthropic, openai, google, github, local, custom
- Standard roles: planning, implementation, review, critique, testing, documentation, general
- Capability definitions for fine-grained control
- Rate limiting configuration

### Workflows
- Step-based workflow definition
- Dependency management with `depends_on`
- Standard actions: decompose, execute, review, test, document, merge, approve
- Input/output mappings between steps
- Conditional execution
- Timeout and retry configuration

### Handoffs
- Three modes: auto, manual, hybrid
- Required context fields
- Notification configuration

### Context
- Size limits
- Transfer modes: full, summary, selective
- Persistence levels: none, session, permanent

### Task Backends
- Support for: beads, github, jira, linear, none

### Extensions
- Vendor-specific extension mechanism
- Namespace isolation

---

## Version History

| Version | Date | Status |
|---------|------|--------|
| 1.0.0 | 2025-12-10 | Current |

---

[Unreleased]: https://github.com/dimmoro/open-kitchen-protocol/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/dimmoro/open-kitchen-protocol/releases/tag/v1.0.0
