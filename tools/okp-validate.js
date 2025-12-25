#!/usr/bin/env node
/**
 * OKP Validator (Node.js) - Validate Open Kitchen Protocol configuration files.
 *
 * Usage:
 *   okp-validate <file>           Validate a single file
 *   okp-validate <file1> <file2>  Validate multiple files
 *   okp-validate --init           Create a starter template
 *   okp-validate --help           Show this help
 *
 * Requirements:
 *   npm install ajv yaml
 */

const fs = require('fs');
const path = require('path');

// Try to load optional dependencies
let Ajv, yaml;
try {
  Ajv = require('ajv');
} catch (e) {
  Ajv = null;
}
try {
  yaml = require('yaml');
} catch (e) {
  yaml = null;
}

const STARTER_TEMPLATE = `# Open Kitchen Protocol Configuration
# https://github.com/dimmoro/open-kitchen-protocol
okp: "1.0"

# Define your AI agents
agents:
  - id: planner
    provider: anthropic
    model: claude-sonnet-4-20250514
    role: planning
    capabilities:
      - task_decomposition
      - architecture_design

  - id: coder
    provider: openai
    model: gpt-4
    role: implementation
    capabilities:
      - code_generation
      - debugging

  - id: reviewer
    provider: anthropic
    model: claude-sonnet-4-20250514
    role: review
    capabilities:
      - code_review
      - security_audit

# Define how tasks flow between agents
workflow:
  - id: plan
    agent: planner
    action: decompose
    outputs: [plan, subtasks]

  - id: implement
    agent: coder
    depends_on: [plan]
    action: execute
    outputs: [code, tests]

  - id: review
    agent: reviewer
    depends_on: [implement]
    action: review
    outputs: [feedback]

# Define how context transfers between agents
handoff:
  mode: auto
  require_context: true
  context_fields:
    - task_description
    - acceptance_criteria
    - previous_output

# Optional: Task backend integration
tasks:
  backend: beads
  project_prefix: MY-PROJECT
`;

function getSchemaPath() {
  const scriptDir = path.dirname(__filename);
  const schemaPath = path.join(scriptDir, '..', 'schemas', 'okp.schema.json');
  if (fs.existsSync(schemaPath)) return schemaPath;
  if (fs.existsSync('schemas/okp.schema.json')) return 'schemas/okp.schema.json';
  return null;
}

function loadSchema() {
  const schemaPath = getSchemaPath();
  if (!schemaPath) {
    console.error('Error: Cannot find okp.schema.json');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
}

function validateFile(filepath, schema, ajv) {
  if (!fs.existsSync(filepath)) {
    return { valid: false, message: `File not found: ${filepath}` };
  }

  let content;
  try {
    content = fs.readFileSync(filepath, 'utf8');
  } catch (e) {
    return { valid: false, message: `Cannot read file: ${e.message}` };
  }

  let doc;
  try {
    if (filepath.endsWith('.yaml') || filepath.endsWith('.yml')) {
      if (!yaml) {
        return { valid: false, message: 'yaml not installed. Run: npm install yaml' };
      }
      doc = yaml.parse(content);
    } else {
      doc = JSON.parse(content);
    }
  } catch (e) {
    return { valid: false, message: `Parse error: ${e.message}` };
  }

  if (!doc) {
    return { valid: false, message: 'Empty document' };
  }

  if (!ajv) {
    // Basic validation
    if (!doc.okp) return { valid: false, message: "Missing required field: 'okp'" };
    if (!doc.agents) return { valid: false, message: "Missing required field: 'agents'" };
    return { valid: true, message: 'Valid (basic check - install ajv for full validation)' };
  }

  const validate = ajv.compile(schema);
  if (validate(doc)) {
    return { valid: true, message: 'Valid' };
  } else {
    const err = validate.errors[0];
    return { valid: false, message: `Validation error: ${err.instancePath} ${err.message}` };
  }
}

function printHelp() {
  console.log(`
OKP Validator - Validate Open Kitchen Protocol configuration files.

Usage:
  okp-validate <file>           Validate a single file
  okp-validate <file1> <file2>  Validate multiple files
  okp-validate --init           Create a starter template
  okp-validate --help           Show this help

Examples:
  okp-validate open-kitchen.yaml
  okp-validate examples/*.yaml
  okp-validate --init > my-kitchen.yaml
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  if (args.includes('--init')) {
    console.log(STARTER_TEMPLATE);
    process.exit(0);
  }

  const schema = loadSchema();
  const ajv = Ajv ? new Ajv({ allErrors: true }) : null;

  let allValid = true;
  for (const filepath of args) {
    const { valid, message } = validateFile(filepath, schema, ajv);
    const status = valid ? '✅' : '❌';
    console.log(`${status} ${filepath}: ${message}`);
    if (!valid) allValid = false;
  }

  process.exit(allValid ? 0 : 1);
}

main();
