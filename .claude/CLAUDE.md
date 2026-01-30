# CLAUDE.md

This file contains guidelines for agentic coding assistants working in this repository.

## Build and Development Commands

```bash
# Build the project
pnpm build

# Run the CLI tool
pnpm start

# Type checking
pnpm type-check

# Format code
pnpm format

# Spell check
pnpm cspell
```

Note: This project does not have a test suite configured. No test commands are available.

## Code Style Guidelines

### Formatting

- Use **3 spaces** for indentation (not tabs)
- Use **single quotes** for strings
- Always use **semicolons**
- Add **trailing commas** where appropriate
- Line width: **100 characters**
- End of line: **lf** (Unix style)
- Format automatically with: `pnpm format`

### TypeScript Configuration

- Strict mode enabled
- Target: ES2020
- Module: CommonJS
- Always run `pnpm type-check` before committing

### Imports

- Use specific imports: `import { foo } from 'module'`
- Use barrel exports from index files for clean imports
- External dependencies go first, then local imports
- Sort imports alphabetically within groups

### Type Definitions

- Use **interface** for object shapes and public APIs
- Use **type** for unions, aliases, and primitive types
- Export types from `src/types/index.ts` when used across multiple modules
- Define complex types (like PackageJson, ViteConfig) with all possible fields

### Naming Conventions

- Functions and variables: **camelCase** (e.g., `newProject`, `targetDir`)
- Classes and types: **PascalCase** (e.g., `TemplateConfig`, `PackageManager`)
- Constants: **UPPER_SNAKE_CASE** (if any)
- File names: **kebab-case** or **camelCase** (consistent with directory)

### Error Handling

- Always wrap async/await operations in try/catch blocks
- Check errors with `instanceof Error` before accessing properties
- Use `showError()` from `@clack/prompts` for user-facing errors
- Exit with `process.exit(1)` for fatal errors
- Handle user cancellations with `isCancel()` checks

### File Organization

```
src/
├── commands/       # CLI command implementations (new, add, ls)
├── handler/        # Template-specific tool handlers
├── utils/          # Utility functions (file-ops, download, prompt)
├── types/          # TypeScript type definitions
├── templates-settings/  # Template configurations
├── project-settings/    # Project setting configurations
├── cli.ts          # CLI entry point
└── index.ts        # Library entry point
```

### Function Documentation

- Use JSDoc comments for exported functions
- Include `@param` and `@returns` tags
- Keep comments concise and clear

### Best Practices

- Use `execa` for running shell commands
- Use `fs-extra` for file system operations
- Use `chalk` for colored console output
- Use `@clack/prompts` for interactive CLI prompts
- Filter out `node_modules` and `.git` when copying directories
- Validate user input with regular expressions
- Show progress indicators for long-running operations

### Build Process

- Entry points: `src/cli.ts` and `src/index.ts`
- Output: `dist/` directory
- Format: CommonJS with TypeScript declarations
- Post-build: Copies `resources/` and `templates/` to `dist/`

### Important Notes

- No test framework is configured (add tests if implementing new features)
- Package manager: pnpm
- CLI tool name: `trw`
- Bin entry: `./dist/cli.js`
