# Adopter's Guide

How to implement Open Kitchen Protocol in your multi-agent orchestrator.

## Overview

OKP is a **specification**, not a library. You implement it by:

1. **Parsing** `open-kitchen.yaml` files
2. **Validating** against the JSON Schema
3. **Interpreting** the configuration in your orchestrator

## Implementation Levels

### Level 1: Basic (Minimum Viable)

- Parse OKP files
- Validate required fields (`okp`, `agents`, `workflow`)
- Map agents to your internal representations
- Execute workflows in dependency order

### Level 2: Standard

Everything in Level 1, plus:
- Full JSON Schema validation
- Handoff protocol support
- Context transfer between steps
- Input/output mappings

### Level 3: Complete

Everything in Level 2, plus:
- Expression evaluation (`${{ }}`)
- Conditional execution
- Timeout and retry handling
- Task backend integration
- Extension support

## Step-by-Step Implementation

### 1. Parse OKP Files

```go
// Go example
import (
    "gopkg.in/yaml.v3"
    "os"
)

type OKPConfig struct {
    OKP      string   `yaml:"okp"`
    Agents   []Agent  `yaml:"agents"`
    Workflow []Step   `yaml:"workflow"`
    Handoff  *Handoff `yaml:"handoff,omitempty"`
}

func LoadOKP(path string) (*OKPConfig, error) {
    data, _ := os.ReadFile(path)
    var config OKPConfig
    yaml.Unmarshal(data, &config)
    return &config, nil
}
```

### 2. Validate Configuration

```go
import "github.com/xeipuuv/gojsonschema"

func ValidateOKP(config interface{}) error {
    schemaLoader := gojsonschema.NewReferenceLoader(
        "https://raw.githubusercontent.com/dimmoro/open-kitchen-protocol/main/schemas/okp.schema.json",
    )
    docLoader := gojsonschema.NewGoLoader(config)
    result, _ := gojsonschema.Validate(schemaLoader, docLoader)
    
    if !result.Valid() {
        return fmt.Errorf("validation failed: %v", result.Errors())
    }
    return nil
}
```

### 3. Map Agents

```go
func MapAgent(okpAgent Agent) *YourAgent {
    return &YourAgent{
        ID:       okpAgent.ID,
        Provider: mapProvider(okpAgent.Provider),
        Model:    okpAgent.Model,
        Role:     mapRole(okpAgent.Role),
    }
}

func mapProvider(p string) Provider {
    switch p {
    case "anthropic": return ProviderAnthropic
    case "openai":    return ProviderOpenAI
    case "google":    return ProviderGoogle
    default:          return ProviderCustom
    }
}
```

### 4. Build Execution Graph

```go
func BuildGraph(workflow []Step) *ExecutionGraph {
    graph := NewGraph()
    
    for _, step := range workflow {
        node := graph.AddNode(step.ID, step)
        for _, dep := range step.DependsOn {
            graph.AddEdge(dep, step.ID)
        }
    }
    
    return graph.TopologicalSort()
}
```

### 5. Execute Workflow

```go
func Execute(graph *ExecutionGraph, agents map[string]*Agent) error {
    for _, step := range graph.Steps {
        agent := agents[step.Agent]
        
        // Handle inputs
        inputs := resolveInputs(step.Inputs)
        
        // Execute action
        outputs, err := agent.Execute(step.Action, inputs)
        if err != nil {
            return handleFailure(step, err)
        }
        
        // Store outputs
        storeOutputs(step.ID, outputs)
        
        // Handle handoff
        if nextStep := graph.Next(step.ID); nextStep != nil {
            performHandoff(step, nextStep, outputs)
        }
    }
    return nil
}
```

## Validation Requirements

Your implementation MUST validate:

| Check | Required |
|-------|----------|
| `okp` version present | ✅ |
| `agents` array non-empty | ✅ |
| `workflow` array non-empty | ✅ |
| Agent IDs unique | ✅ |
| Step IDs unique | ✅ |
| Agent references exist | ✅ |
| No circular dependencies | ✅ |

## Extension Handling

```go
func HandleExtensions(config OKPConfig) {
    if ext, ok := config.Extensions["your_tool"]; ok {
        // Process your tool's extension
        yourConfig := parseYourExtension(ext)
        applyYourConfig(yourConfig)
    }
    // Ignore unknown extensions (MUST)
}
```

## Testing Your Implementation

Use the examples in `examples/` to test:

```bash
# These should all validate successfully
your-tool validate examples/simple.open-kitchen.yaml
your-tool validate examples/multi-agent.open-kitchen.yaml

# These should be executable
your-tool run examples/simple.open-kitchen.yaml
```

## Claiming Conformance

Once your implementation passes validation tests, you can claim OKP conformance:

> "This tool supports Open Kitchen Protocol 1.0"

Add to your README:
```markdown
[![OKP 1.0](https://img.shields.io/badge/OKP-1.0-blue.svg)](https://github.com/dimmoro/open-kitchen-protocol)
```

## Reference Implementation

See [HeyChef](https://github.com/dimmoro/HeyChef) for a complete Go implementation.
