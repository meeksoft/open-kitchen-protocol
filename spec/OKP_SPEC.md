# Open Kitchen Protocol (OKP) Specification

**Version:** 1.0.0  
**Status:** Draft  
**Created:** 2025-12-10  
**Authors:** HeyChef Team

---

## Abstract

Open Kitchen Protocol (OKP) is an open standard for Multi-Agent Orchestration. It defines a portable, vendor-neutral format for specifying how AI agents coordinate to complete complex tasks through workflows, handoffs, and context transfer.

OKP enables interoperability between different multi-agent systems while providing a clear, structured approach to agent collaboration.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Terminology](#2-terminology)
3. [File Format](#3-file-format)
4. [Schema Overview](#4-schema-overview)
5. [Agents](#5-agents)
6. [Workflows](#6-workflows)
7. [Handoffs](#7-handoffs)
8. [Context](#8-context)
9. [Task Backends](#9-task-backends)
10. [Extensions](#10-extensions)
11. [Validation](#11-validation)
12. [Examples](#12-examples)
13. [Versioning](#13-versioning)
14. [Security Considerations](#14-security-considerations)

---

## 1. Introduction

### 1.1 Purpose

OKP provides a standardized way to define multi-agent orchestration configurations that can be:

- **Portable** - Move between different orchestration tools
- **Versionable** - Track changes in version control
- **Validatable** - Check correctness before execution
- **Extensible** - Add tool-specific features without breaking compatibility

### 1.2 Goals

1. Define a clear schema for multi-agent workflows
2. Standardize handoff protocols between agents
3. Enable context transfer across agent boundaries
4. Support multiple task management backends
5. Allow vendor-specific extensions

### 1.3 Non-Goals

- Defining agent implementation details
- Specifying prompt engineering patterns
- Mandating specific AI providers
- Replacing existing workflow engines

### 1.4 Conformance

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119.

---

## 2. Terminology

| Term | Definition |
|------|------------|
| **Agent** | An AI system capable of executing tasks (e.g., Claude, GPT-4, Gemini) |
| **Workflow** | A sequence of steps executed by agents |
| **Step** | A single unit of work within a workflow |
| **Handoff** | Transfer of work from one agent to another |
| **Context** | Information passed between steps or agents |
| **Provider** | The company/service providing the AI agent (e.g., Anthropic, OpenAI) |
| **Task Backend** | External system for task/project management (e.g., Beads, GitHub Issues) |

---

## 3. File Format

### 3.1 File Names

OKP files MUST use one of the following names:

- `open-kitchen.yaml` (RECOMMENDED)
- `open-kitchen.yml`
- `okp.yaml`
- `okp.yml`

Implementations MUST recognize all four variants as valid OKP files.

### 3.2 Encoding

OKP files MUST be valid YAML 1.2 encoded in UTF-8.

### 3.3 Structure

```yaml
# Required: OKP version
okp: "1.0"

# Required: Agent definitions
agents:
  - id: string
    provider: string
    # ... additional fields

# Required: Workflow definition
workflow:
  - id: string
    agent: string
    # ... additional fields

# Optional: Handoff configuration
handoff:
  mode: string
  # ... additional fields

# Optional: Context configuration
context:
  # ... fields

# Optional: Task backend
task_backend: string

# Optional: Vendor extensions
extensions:
  # ... vendor-specific fields
```

---

## 4. Schema Overview

### 4.1 Root Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `okp` | string | Yes | OKP version (e.g., "1.0") |
| `agents` | array | Yes | List of agent definitions |
| `workflow` | array | Yes | List of workflow steps |
| `handoff` | object | No | Handoff configuration |
| `context` | object | No | Context management settings |
| `task_backend` | string | No | Task management backend |
| `extensions` | object | No | Vendor-specific extensions |

### 4.2 Version Format

The `okp` field MUST be a string in the format `MAJOR.MINOR` (e.g., "1.0", "1.1", "2.0").

- MAJOR version changes indicate breaking changes
- MINOR version changes indicate backward-compatible additions

---

## 5. Agents

### 5.1 Agent Object

Each agent in the `agents` array MUST have the following structure:

```yaml
agents:
  - id: string           # Required: Unique identifier
    provider: string     # Required: Provider name
    model: string        # Optional: Specific model
    role: string         # Required: Agent's role
    capabilities: [...]  # Optional: List of capabilities
    rate_limit:          # Optional: Rate limiting
      requests_per_minute: int
      tokens_per_day: int
    metadata: {}         # Optional: Additional metadata
```

### 5.2 Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the agent. MUST be unique within the file. |
| `provider` | string | Provider name (see 5.3) |
| `role` | string | Agent's role (see 5.4) |

### 5.3 Provider Names

Standard provider names:

| Provider | Value |
|----------|-------|
| Anthropic | `anthropic` |
| OpenAI | `openai` |
| Google | `google` |
| Microsoft/GitHub | `github` |
| Local/Ollama | `local` |
| Custom | `custom` |

Implementations MAY support additional providers.

### 5.4 Standard Roles

| Role | Description |
|------|-------------|
| `planning` | Decomposes tasks, creates plans |
| `implementation` | Executes code, creates content |
| `review` | Reviews work, provides feedback |
| `critique` | Heavy negative feedback, finds flaws and security issues |
| `testing` | Tests implementations |
| `documentation` | Creates documentation |
| `general` | General-purpose agent |

Implementations MAY define additional roles.

### 5.5 Capabilities

Capabilities describe what an agent can do:

```yaml
capabilities:
  - decomposition      # Can break down complex tasks
  - coding             # Can write code
  - testing            # Can write/run tests
  - documentation      # Can write docs
  - code-review        # Can review code
  - architecture       # Can design systems
  - debugging          # Can debug issues
```

### 5.6 Rate Limiting

```yaml
rate_limit:
  requests_per_minute: 60
  tokens_per_day: 100000
  cooldown_seconds: 5
```

---

## 6. Workflows

### 6.1 Workflow Step Object

```yaml
workflow:
  - id: string           # Required: Unique step identifier
    agent: string        # Required: Agent ID reference
    action: string       # Required: Action to perform
    depends_on: [...]    # Optional: Step dependencies
    inputs: {}           # Optional: Input mappings
    outputs: [...]       # Optional: Output names
    condition: string    # Optional: Execution condition
    timeout: string      # Optional: Step timeout
    retry:               # Optional: Retry configuration
      max_attempts: int
      backoff: string
    on_success: string   # Optional: Next step on success
    on_failure: string   # Optional: Next step on failure
```

### 6.2 Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique step identifier |
| `agent` | string | Reference to agent ID |
| `action` | string | Action to perform (see 6.3) |

### 6.3 Standard Actions

| Action | Description |
|--------|-------------|
| `decompose` | Break task into subtasks |
| `execute` | Execute/implement the task |
| `review` | Review previous step's output |
| `test` | Test implementation |
| `document` | Create documentation |
| `merge` | Merge outputs from parallel steps |
| `approve` | Human approval gate |

### 6.4 Dependencies

Dependencies define execution order:

```yaml
workflow:
  - id: plan
    agent: planner
    action: decompose
    
  - id: implement
    agent: coder
    action: execute
    depends_on: [plan]    # Waits for 'plan' to complete
    
  - id: test
    agent: tester
    action: test
    depends_on: [implement]
```

### 6.5 Inputs and Outputs

Steps can pass data via inputs/outputs:

```yaml
workflow:
  - id: plan
    agent: planner
    action: decompose
    outputs: [task_plan]
    
  - id: implement
    agent: coder
    action: execute
    depends_on: [plan]
    inputs:
      plan: ${{ steps.plan.outputs.task_plan }}
    outputs: [code, tests]
```

### 6.6 Expression Syntax

OKP uses a simple expression syntax for references:

```
${{ steps.<step_id>.outputs.<output_name> }}
${{ context.<key> }}
${{ env.<variable> }}
```

### 6.7 Conditional Execution

```yaml
- id: hotfix
  agent: coder
  action: execute
  condition: ${{ context.priority == 'critical' }}
```

### 6.8 Timeout and Retry

```yaml
- id: long_task
  agent: coder
  action: execute
  timeout: "30m"
  retry:
    max_attempts: 3
    backoff: "exponential"  # or "linear", "constant"
```

---

## 7. Handoffs

### 7.1 Handoff Object

```yaml
handoff:
  mode: string           # Required: auto, manual, or hybrid
  require_context: bool  # Optional: Require context transfer
  fields: [...]          # Optional: Required handoff fields
  timeout: string        # Optional: Handoff timeout
  notification:          # Optional: Notification settings
    enabled: bool
    channels: [...]
```

### 7.2 Handoff Modes

| Mode | Description |
|------|-------------|
| `auto` | Automatic handoff when step completes |
| `manual` | Requires explicit handoff command |
| `hybrid` | Auto for simple, manual for complex |

### 7.3 Required Fields

When `require_context: true`, handoffs MUST include:

```yaml
handoff:
  require_context: true
  fields:
    - what_done       # Summary of completed work
    - what_pending    # Remaining work
    - blockers        # Optional: blocking issues
    - notes           # Optional: additional context
```

### 7.4 Handoff Protocol

When a step completes and hands off to another agent:

1. Completing agent MUST provide `what_done`
2. Completing agent SHOULD provide `what_pending`
3. Receiving agent MUST acknowledge receipt
4. Context MUST be transferred if `require_context: true`

---

## 8. Context

### 8.1 Context Object

```yaml
context:
  max_size: string       # Optional: Maximum context size
  transfer_mode: string  # Optional: full, summary, or selective
  persistence: string    # Optional: none, session, or permanent
  includes: [...]        # Optional: Always include these
  excludes: [...]        # Optional: Never include these
```

### 8.2 Transfer Modes

| Mode | Description |
|------|-------------|
| `full` | Transfer complete context |
| `summary` | Transfer summarized context |
| `selective` | Transfer only specified fields |

### 8.3 Context Size

```yaml
context:
  max_size: "50KB"  # Limit context size
```

Implementations SHOULD warn when context approaches max_size.

---

## 9. Task Backends

### 9.1 Supported Backends

```yaml
task_backend: beads      # Beads PM
task_backend: github     # GitHub Issues
task_backend: jira       # Jira
task_backend: linear     # Linear
task_backend: none       # No external backend
```

### 9.2 Backend Configuration

```yaml
task_backend: beads
task_backend_config:
  project: "my-project"
  auto_create: true
  sync_status: true
```

---

## 10. Extensions

### 10.1 Extension Format

Vendor-specific extensions go under the `extensions` key:

```yaml
extensions:
  heychef:
    kitchen_name: "My Kitchen"
    flair_enabled: true
    beads_dir: ".beads"
  
  other_tool:
    custom_setting: value
```

### 10.2 Extension Rules

1. Extensions MUST NOT override standard fields
2. Extensions SHOULD be namespaced by tool name
3. Implementations MUST ignore unknown extensions
4. Extensions SHOULD be documented by the vendor

---

## 11. Validation

### 11.1 Required Validation

Implementations MUST validate:

1. `okp` version is present and valid
2. `agents` array is present and non-empty
3. `workflow` array is present and non-empty
4. All agent IDs are unique
5. All step IDs are unique
6. All agent references in workflow exist
7. No circular dependencies in workflow

### 11.2 Recommended Validation

Implementations SHOULD validate:

1. Provider names are recognized
2. Role names are recognized
3. Dependencies reference existing steps
4. Timeout values are parseable
5. Expression syntax is valid

### 11.3 Validation Errors

Validation errors MUST include:

- Error type (required_field, invalid_reference, etc.)
- Location (field path)
- Message (human-readable description)

---

## 12. Examples

### 12.1 Minimal Example

```yaml
okp: "1.0"

agents:
  - id: assistant
    provider: anthropic
    model: claude-sonnet-4-20250514
    role: general

workflow:
  - id: task
    agent: assistant
    action: execute
```

### 12.2 Multi-Agent Example

```yaml
okp: "1.0"

agents:
  - id: planner
    provider: anthropic
    model: claude-sonnet-4-20250514
    role: planning
    capabilities: [decomposition, architecture]
    
  - id: coder
    provider: openai
    model: gpt-4
    role: implementation
    capabilities: [coding, testing]
    
  - id: reviewer
    provider: google
    model: gemini-pro
    role: review
    capabilities: [code-review]

workflow:
  - id: plan
    agent: planner
    action: decompose
    outputs: [task_plan]
    
  - id: implement
    agent: coder
    action: execute
    depends_on: [plan]
    inputs:
      plan: ${{ steps.plan.outputs.task_plan }}
    outputs: [code]
    
  - id: review
    agent: reviewer
    action: review
    depends_on: [implement]
    inputs:
      code: ${{ steps.implement.outputs.code }}

handoff:
  mode: auto
  require_context: true
  fields:
    - what_done
    - what_pending

task_backend: beads
```

### 12.3 With Extensions

```yaml
okp: "1.0"

agents:
  - id: head_chef
    provider: anthropic
    model: claude-sonnet-4-20250514
    role: planning

workflow:
  - id: plan
    agent: head_chef
    action: decompose

extensions:
  heychef:
    kitchen_name: "Production Kitchen"
    station: head
    flair_enabled: true
```

---

## 13. Versioning

### 13.1 Version Strategy

OKP follows Semantic Versioning:

- **1.0** - Initial stable release
- **1.x** - Backward-compatible additions
- **2.0** - Breaking changes

### 13.2 Compatibility

- Implementations MUST support the specified major version
- Implementations SHOULD support older minor versions
- Unknown fields MUST be ignored (forward compatibility)

### 13.3 Deprecation

Deprecated features:
1. Will be announced at least one minor version in advance
2. Will continue working for at least one major version
3. Will log warnings when used

---

## 14. Security Considerations

### 14.1 Secrets

OKP files MUST NOT contain:
- API keys
- Passwords
- Access tokens
- Private keys

Use environment variables or secret management:

```yaml
agents:
  - id: assistant
    provider: anthropic
    model: ${{ env.ANTHROPIC_MODEL }}
```

### 14.2 Validation

Implementations SHOULD:
- Validate all inputs before execution
- Sanitize outputs before display
- Limit context size to prevent DoS
- Log security-relevant events

### 14.3 Execution

Implementations MUST:
- Not execute arbitrary code from OKP files
- Validate agent references before dispatch
- Respect rate limits

---

## Appendix A: JSON Schema

The complete JSON Schema for OKP is available at:
- `schemas/okp.schema.json`
- https://openkitchen.dev/schema/v1.0/okp.schema.json (future)

---

## Appendix B: MIME Type

The recommended MIME type for OKP files is:
- `application/vnd.okp+yaml`

---

## Appendix C: Changelog

### Version 1.0.0 (2025-12-10)
- Initial release
- Core agent and workflow definitions
- Handoff protocol
- Context management
- Extension mechanism

---

## License

This specification is released under the Apache License 2.0.

Copyright 2025 HeyChef Team.
