# OKP Quick Start Guide

Get started with Open Kitchen Protocol in 5 minutes.

## 1. Create Your Configuration

Create `open-kitchen.yaml` in your project root:

```yaml
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

## 2. Validate Your Configuration

### Using HeyChef (reference implementation)
```bash
heychef okp validate
```

### Using Python
```bash
pip install pyyaml jsonschema
./tools/okp-validate open-kitchen.yaml
```

### Using Node.js
```bash
npm install yaml ajv
node tools/okp-validate.js open-kitchen.yaml
```

### Using npx (no install)
```bash
npx ajv-cli validate -s schemas/okp.schema.json -d open-kitchen.yaml
```

## 3. Use With an Orchestrator

### HeyChef
```bash
# Install HeyChef
go install github.com/dimmoro/HeyChef/cmd/heychef@latest

# Initialize kitchen (reads open-kitchen.yaml)
heychef mise

# Submit a task
heychef order "Build a REST API for user management"

# Start cooking
heychef cook
```

### Custom Integration
```python
import yaml
from jsonschema import validate

# Load and validate
with open("open-kitchen.yaml") as f:
    config = yaml.safe_load(f)

with open("schemas/okp.schema.json") as f:
    schema = json.load(f)

validate(config, schema)

# Use the configuration
for agent in config["agents"]:
    print(f"Agent {agent['id']}: {agent['role']}")

for step in config["workflow"]:
    print(f"Step {step['id']}: {step['action']}")
```

## 4. Add to Version Control

```bash
git add open-kitchen.yaml
git commit -m "Add OKP configuration"
```

## 5. Editor Support

### VS Code
Add to `.vscode/settings.json`:
```json
{
  "yaml.schemas": {
    "./schemas/okp.schema.json": ["*open-kitchen.yaml", "okp.yaml"]
  }
}
```

### JetBrains IDEs
1. Settings → Languages & Frameworks → Schemas and DTDs → JSON Schema Mappings
2. Add mapping for `okp.schema.json` → `*open-kitchen.yaml`

## Next Steps

- Read the [full specification](../spec/OKP_SPEC.md)
- Browse [examples](../examples/)
- Check out [HeyChef](https://github.com/dimmoro/HeyChef) for a complete implementation
