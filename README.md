# Open Kitchen Protocol (OKP)

**An open standard for Multi-Agent Orchestration**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OKP Version](https://img.shields.io/badge/OKP-1.0-blue.svg)](spec/OKP_SPEC.md)

---

## What is OKP?

Open Kitchen Protocol (OKP) is a vendor-neutral specification for defining how AI agents coordinate to complete complex tasks. It provides a portable format for:

- **Agent definitions** - Who does the work
- **Workflows** - How tasks flow between agents
- **Handoffs** - How context transfers between agents
- **Task backends** - Where work items are tracked

## Quick Start

```yaml
# open-kitchen.yaml
okp: "1.0"

agents:
  - id: planner
    provider: anthropic
    model: claude-sonnet-4-20250514
    role: planning
    
  - id: coder
    provider: openai
    model: gpt-4
    role: implementation

workflow:
  - id: plan
    agent: planner
    action: decompose
    outputs: [plan]
    
  - id: implement
    agent: coder
    depends_on: [plan]
    action: execute

handoff:
  mode: auto
  require_context: true
```

## Documentation

| Document | Description |
|----------|-------------|
| [OKP Specification](spec/OKP_SPEC.md) | Complete protocol specification |
| [JSON Schema](schemas/okp.schema.json) | Machine-readable schema for validation |
| [Examples](examples/) | Sample OKP configuration files |

## Core Concepts

### Agents
Agents are AI models that perform work. Each agent has:
- **id** - Unique identifier
- **provider** - Model provider (anthropic, openai, google, etc.)
- **role** - Function in the workflow (planning, implementation, review)
- **capabilities** - What the agent does well

### Workflows
Workflows define how tasks flow between agents:
- **Steps** - Individual units of work
- **Dependencies** - Order of execution
- **Actions** - What each step does (decompose, execute, review)

### Handoffs
Handoffs define how context transfers between agents:
- **mode** - auto, manual, or hybrid
- **require_context** - Whether context is mandatory
- **fields** - What information must be passed

### Task Backends
OKP supports multiple task tracking systems:
- `beads` - Beads issue tracker
- `github` - GitHub Issues
- `jira` - Atlassian Jira
- `linear` - Linear
- `none` - No external tracking

## Implementations

| Tool | Status | Description |
|------|--------|-------------|
| [HeyChef](https://github.com/dimmoro/HeyChef) | Reference | Multi-agent kitchen orchestrator |

## File Naming

OKP configuration files use these conventions:

| Filename | Usage |
|----------|-------|
| `open-kitchen.yaml` | Primary (recommended) |
| `okp.yaml` | Short alias |
| `.okp.yaml` | Hidden configuration |

## Language Bindings

OKP is **language-agnostic**. Use any JSON Schema validator:

### Python
```python
import jsonschema
import yaml

schema = json.load(open("okp.schema.json"))
config = yaml.safe_load(open("open-kitchen.yaml"))
jsonschema.validate(config, schema)
```

### JavaScript/TypeScript
```javascript
import Ajv from "ajv";
import schema from "./okp.schema.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);
const valid = validate(config);
```

### Go
```go
import "github.com/xeipuuv/gojsonschema"

schemaLoader := gojsonschema.NewReferenceLoader("file://okp.schema.json")
documentLoader := gojsonschema.NewReferenceLoader("file://open-kitchen.yaml")
result, _ := gojsonschema.Validate(schemaLoader, documentLoader)
```

### CLI Tools
```bash
# Node.js (ajv-cli)
npx ajv validate -s schemas/okp.schema.json -d open-kitchen.yaml

# Python (check-jsonschema)
pip install check-jsonschema
check-jsonschema --schemafile okp.schema.json open-kitchen.yaml

# HeyChef (reference implementation)
heychef okp validate open-kitchen.yaml
```

### Editor Support
Add to `.vscode/settings.json` for auto-complete:
```json
{
  "yaml.schemas": {
    "https://raw.githubusercontent.com/dimmoro/open-kitchen-protocol/main/schemas/okp.schema.json": ["*open-kitchen.yaml", "okp.yaml"]
  }
}
```

## Validation

### Built-in Validator

OKP includes validator scripts in `tools/`:

```bash
# Python validator
pip install pyyaml jsonschema        # Install dependencies
./tools/okp-validate open-kitchen.yaml

# Node.js validator
npm install yaml ajv                 # Install dependencies
node tools/okp-validate.js open-kitchen.yaml

# Generate starter template
./tools/okp-validate --init > my-kitchen.yaml

# Validate multiple files
./tools/okp-validate examples/*.yaml
```

### Using External Tools

```bash
# Using ajv-cli
npx ajv validate -s schemas/okp.schema.json -d open-kitchen.yaml

# Using check-jsonschema
pip install check-jsonschema
check-jsonschema --schemafile schemas/okp.schema.json open-kitchen.yaml

# Using HeyChef
heychef okp validate open-kitchen.yaml
```

## Contributing

We welcome contributions! Please see:
- [Contributing Guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Open Kitchen Protocol** - Bringing order to multi-agent chaos.
