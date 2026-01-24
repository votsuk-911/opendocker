# opencode agent guidelines

## Build/Test Commands

- **Install**: `bun install`
- **Run**: `bun run --conditions=browser ./src/index.ts`
- **Typecheck**: `bun run typecheck` (npm run typecheck)

## Code Style

- **Runtime**: Bun with TypeScript ESM modules
- **Imports**: Use relative imports for local modules, named imports preferred
- **Types**: Zod schemas for validation, TypeScript interfaces for structure
- **Naming**: camelCase for variables/functions, PascalCase for classes/namespaces
- **Error handling**: Use Result patterns, avoid throwing exceptions in tools
- **File structure**: Namespace-based organization (e.g., `Tool.define()`, `Session.create()`)

## Architecture

- **Tools**: Implement `Tool.Info` interface with `execute()` method
- **Context**: Pass `sessionID` in tool context, use `App.provide()` for DI
- **Validation**: All inputs validated with Zod schemas
- **Logging**: Use `Log.create({ service: "name" })` pattern
- **Storage**: Use `Storage` namespace for persistence

# Zod Usage

Zod is our foundational validation library. All external inputs, tool parameters, API payloads, and data models use Zod schemas.

## Core Patterns

**Schema + Type Inference** (single source of truth):

```ts
export const Info = z.object({
  name: z.string(),
  description: z.string(),
})
export type Info = z.infer<typeof Info>
```

**Tool Parameter Schemas**:

```ts
Tool.define({
  name: "example",
  parameters: z.object({
    filePath: z.string().describe("Path to file"),
    limit: z.coerce.number().optional(),
  }),
  execute: async (args, ctx) => {
    // args is automatically typed from schema
  },
})
```

**Runtime Validation**:

```ts
// Throwing validation
const result = schema.parse(data)

// Safe validation
const result = schema.safeParse(data)
if (!result.success) {
  // handle result.error
}
```

**Schema Composition**:

```ts
const Base = z.object({ id: z.string() })
const Extended = Base.extend({ name: z.string() })
```

**Discriminated Unions** (for message types, events):

```ts
const Part = z.discriminatedUnion("type", [SnapshotPart, TextPart, ToolCallPart])
```

## Guidelines

- Use `.describe()` for all schema fields (generates OpenAPI docs and AI tool descriptions)
- Use `z.coerce.number()` for numeric parameters that may arrive as strings
- Prefer `safeParse()` for user input, `parse()` for internal validation
- Define custom error formatting with `formatValidationError()` in tool definitions
- Use `.meta({ ref: "TypeName" })` for schema registry (errors, events, messages)
- Avoid `any` when working with Zod - use `z.ZodType` or specific schema types

## Common Locations

- **Tools**: All parameter schemas in `src/tool/*.ts`
- **API Routes**: Request/response validation in `src/server/routes/*.ts`
- **Data Models**: Domain objects in `src/session/`, `src/project/`, `src/config/`
- **Errors**: Type-safe errors in `packages/util/src/error.ts`
- **Events**: Event definitions in `src/bus/bus-event.ts`

## SolidJS Store Patterns (TUI)

### Store Initialization

- Always use `const [store, setStore] = createStore<Type>(initialState)`
- Initialize all fields explicitly (no undefined fields)
- Use TypeScript types for store structure
- Initialize arrays as `[]` and objects as `{}`

### Context Pattern

```typescript
export const { use: useContext, provider: ContextProvider } = createSimpleContext({
  name: "Context",
  init: () => {
    const [store, setStore] = createStore<State>(initialState)

    return {
      get status() {
        return store.status
      }, // Reactive getter
      data() {
        return store.field
      }, // Method returning data
      set(value: string) {
        // Setter method
        setStore("field", value)
      },
    }
  },
})
```

### Store Updates

- **Simple updates**: `setStore("field", value)`
- **Nested updates**: `setStore("nested", "key", value)`
- **Array mutations**: Use `produce()` - `setStore(produce((draft) => { draft.array.push(item) }))`
- **Object replacement**: Use `reconcile()` - `setStore("config", reconcile(newConfig))`
- **Batch updates**: Wrap in `batch(() => { ... })`
- **Never mutate store directly**: Always use `setStore()`

### File Persistence

- Use `Bun.file()` for file operations
- Load in `onMount()` with `.catch(() => {})` (no try/catch)
- JSON for snapshots: `Bun.write(file, JSON.stringify(store, null, 2))`
- JSONL for append-only logs: `appendFile(file, JSON.stringify(entry) + "\n")`

### Reactivity

- Use `createMemo()` for derived values from store
- Use `createEffect()` for side effects based on store changes
- Use `batch()` for multiple related updates

### Common Patterns

- **Loading state**: `{ ready: false, data: [] }` - set `ready: true` after load
- **Pending save**: Track pending flag if save attempted before ready
- **Index tracking**: Wrap around with modulo for cycling through items
- **Binary search**: Use `Binary.search()` for sorted arrays by ID

### Anti-Patterns

- ❌ Don't mutate store directly: `store.array.push(item)`
- ❌ Don't use `let` for store state
- ❌ Don't leave fields undefined in initialization
- ❌ Don't use try/catch (prefer `.catch(() => {})`)
- ✓ Always use `setStore()` for mutations
- ✓ Use `const` for store declarations
- ✓ Initialize all fields explicitly

### Store Naming Conventions

- **Default name**: Use `store` for single stores in a scope
- **Multiple stores**: Use descriptive names (`agentStore`, `modelStore`) when needed
- **Expose as `data`**: When external access needed, expose as `data` property (e.g., `sync.data`, `route.data`)
- **Context names**: Match their purpose (`useTheme`, `useSync`, `useLocal`, `useRoute`)

### Main Application Contexts

- **`sync`** - Global application state (providers, sessions, messages, config, permissions, todos, LSP/MCP status, VCS info)
  - Access: `sync.data.config`, `sync.data.session`, `sync.data.provider`
  - Methods: `sync.session.get(id)`, `sync.session.sync(id)`, `sync.bootstrap()`
- **`theme`** - Theme configuration and colors
- **`kv`** - Persistent key-value store for user preferences
- **`local`** - Local UI state (current agent, model selection)
- **`route`** - Current route (home vs session view)
- **`keybind`** - Keybinding configuration
