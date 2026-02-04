# StopCriStudio - Design Choices & Specifications

## Project Overview
StopCriStudio is a clean, form-based OpenAPI editor that lets users create and modify APIs without seeing JSON/YAML code.

---

## Core Features

### 1. Create & Modify APIs

#### What Makes It Simple?
- **Clean user interface** - no special effects, functional design
- **Form-based editing only** - users never see JSON or YAML
- **No wizards, templates, or auto-generation** (for now)

#### User Capabilities
Users CAN:
- ✅ Add endpoints with fields:
  - Path (with `{pathParameters}`)
  - HTTP Method (GET, POST, PUT, DELETE, PATCH, etc.)
  - Description
  - Authorization (security scheme)
- ✅ Add query parameters (name, type, required/optional, description)
- ✅ Add path parameters (name, type, description)
- ✅ Add request body (content-type dropdown + schema)
- ✅ Add response body (status code + content-type + schema)
- ✅ Schema builder with common types:
  - Primitives: string, number, boolean, integer
  - Complex types: object (with properties), array (with item types)
  - Nested structures (objects within objects, arrays of objects, arrays of arrays)
- ✅ Define reusable models from schemas
- ✅ Use models inside requests or responses (references)

#### User Restrictions
Users CANNOT:
- ❌ See or edit JSON/YAML directly
- ❌ Use wizards or guided workflows
- ❌ Use pre-made templates
- ❌ Get auto-filled or suggested responses
- ❌ Auto-generate response examples

---

### 2. Save a Project

#### How It Works
- **Action**: Download button → downloads OpenAPI spec
- **Format**: JSON or YAML (user chooses)
  - JSON file (`.json` extension)
  - YAML file (`.yaml` extension)
- **Content**: Complete OpenAPI specification
- **Unsaved changes**: Warn user before navigating away

#### User Flow
1. User creates/modifies API in editor
2. Clicks "Download" button
3. Format selector appears (JSON or YAML)
4. User chooses format
5. Browser downloads `api-spec.json` or `api-spec.yaml` file
6. If user tries to leave with unsaved changes → warning popup appears

---

### 3. Import Existing Project

#### Import Method
- **File picker** (not drag & drop)
- **Validation**: Must be valid OpenAPI format
- **Behavior**: Overwrite current project (no merge)
- **Supported formats**: JSON & YAML
- **Confirmation**: Ask user if importing while project is being edited

#### User Flow
1. User clicks "Import" button
2. File picker opens
3. User selects JSON or YAML file
4. **If current project has unsaved changes:**
   - Show confirmation dialog
   - Options: "Import & Discard", "Cancel"
   - If user chooses "Cancel" → return to current project
5. **If no unsaved changes or user confirms:**
   - System validates OpenAPI format
   - If valid → loads into editor and overwrites current project
   - If invalid → shows error message with details

---

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - type safety
- **Vite** - build tool
- **ESLint** - code quality

### State Management
**Zustand** - Lightweight (~2KB), simple API, excellent TypeScript support

**Why Zustand:**
- Minimal boilerplate
- No prop drilling
- Built-in devtools for debugging
- Perfect for MVP approach
- Great documentation

**Store location:** `src/store/apiStore.ts`
**Type definitions:** `src/types/api.ts`

### UI Components
**Material-UI (MUI)** - Comprehensive component library with professional design

**Why Material-UI:**
- Comprehensive component suite (buttons, forms, modals, tables, etc.)
- Professional, polished aesthetic
- Excellent documentation
- Strong TypeScript support
- Great for data-heavy interfaces (forms, endpoint management)
- Material Design principles (familiar to users)
- Extensive customization via theming

**Key packages:**
- `@mui/material` - Core components
- `@mui/icons-material` - Icon library
- `@emotion/react`, `@emotion/styled` - Styling engine

### OpenAPI Validation
*(To be decided)*

---

## Data Structure (OpenAPI 3.0 Compliance)

### Supported Components
- **Schemas**: Reusable data models
- **Security Schemes**: Authorization definitions
- **Paths**: API endpoints
- **Parameters**: Query and path parameters
- **Request Bodies**: Input data definitions
- **Responses**: Output data definitions with status codes

### Not Supported Yet
- Webhooks
- Links
- Callbacks
- Examples (predefined responses)
- Deprecation markers
- Rate limiting info

---

## UI Layout (Final)

**Sidebar Tree View + Master-Detail Layout**

```
┌─────────────────────────────────────────────────┐
│ Header: StopCriStudio                           │
│ [Import] [Download] [⚠️ Unsaved Changes]        │
├──────────────────┬──────────────────────────────┤
│                  │                              │
│   Sidebar        │  Main Editor Panel           │
│   (Tree View)    │  (Detail View)               │
│                  │                              │
│ ▼ Endpoints      │ ┌──────────────────────────┐ │
│  GET /users ✓    │ │ Endpoint Editor          │ │
│  POST /users     │ │ ────────────────────────  │ │
│  GET /users/{id} │ │ Path: /users             │ │
│  PUT /users/{id} │ │ Method: [GET ▼]          │ │
│  DELETE /users/{id}                             │ │
│                  │ │ Description: ...         │ │
│ [+ Add Endpoint] │ │                          │ │
│                  │ │ Authorization: ...       │ │
│ ▼ Models         │ │ Query Parameters: ...    │ │
│  User ✓          │ │ Request Body: ...        │ │
│  Product         │ │ Responses: ...           │ │
│  Error           │ │                          │ │
│                  │ └──────────────────────────┘ │
│ [+ Add Model]    │                              │
│                  │                              │
└──────────────────┴──────────────────────────────┘
```

### Layout Features
- **Header**: Title, Import/Download buttons, unsaved changes indicator
- **Sidebar**: 
  - Expandable/collapsible tree view
  - Organized by Endpoints & Models sections
  - Selected item highlighted with checkmark (✓)
  - Quick add buttons for creating new items
  - Compact and scrollable
- **Main Panel**: 
  - Displays selected endpoint or model editor
  - Form-based editing interface
  - Plenty of space for complex forms
  - Empty state when nothing selected
- **Interaction**: Click sidebar items to select → view/edit in main panel

---

## Example Spec Structure

See `openapi-spec-example.json` for a complete working example that demonstrates:
- ✅ Reusable models (User, Product, Error)
- ✅ Authorization (Bearer Token)
- ✅ Path parameters (`{userId}`, `{productId}`)
- ✅ Query parameters (limit, offset, role, category, minPrice)
- ✅ Request bodies (application/json)
- ✅ Multiple responses per endpoint (200, 201, 204, 400, 401, 404)
- ✅ Model references via `$ref`

---

## Next Steps

### ✅ Completed
1. **React + Vite Project** - Initialized with TypeScript & ESLint
2. **State Management** - Zustand installed & configured with devtools
3. **UI Library** - Material-UI installed (@mui/material, @mui/icons-material, emotion)
4. **Core Data Types** - Complete TypeScript interfaces (`src/types/api.ts`)
5. **Zustand Store** - Full API store with 20+ actions (`src/store/apiStore.ts`)
6. **Design Documentation** - Design choices finalized (DESIGN_CHOICES.md)
7. **Component Architecture** - 28 components specified with props & MUI usage (COMPONENT_ARCHITECTURE.md)
8. **UI Layout** - Sidebar tree view + master-detail pattern designed
9. **UX Improvements** - Add buttons in section headers, inline delete with confirmation
10. **Build Verification** - Project compiles successfully (34 modules, 143.36 kB)

### 🚀 To Do (Prioritized)
1. **App.tsx & Main Layout** - Root component with Header, Sidebar, MainPanel structure
2. **Header Component** - Title, Import/Download buttons, unsaved indicator
3. **Sidebar Component** - EndpointsSection & ModelsSection with tree view
4. **EndpointItem & ModelItem** - Sidebar item components with selection & delete
5. **MainPanel & EmptyState** - Content area showing selected editor or empty state
6. **EndpointEditor** - Complete form for editing endpoint details (path, method, auth, etc.)
7. **ModelEditor** - Form for editing model name, description, and schema
8. **ParametersEditor** - Query and path parameter management UI
9. **ResponsesEditor** - Response status code and body editor
10. **SchemaBuilder** - Recursive UI for building complex types (primitives, objects, arrays)
11. **Import/Export Handlers** - File upload/download utilities for JSON & YAML
12. **OpenAPI Validation** - Validate imported specs and exported data
13. **Dialog Components** - ImportDialog, DownloadDialog, UnsavedChangesDialog, ConfirmDeleteDialog
14. **Polish & Testing** - Edge cases, error handling, user feedback

---

## Notes
- This is MVP (Minimum Viable Product) focused - all decisions favor simplicity
- No backend required - everything works in the browser
- Users own their data (download files locally)
- Future features can be added after MVP is validated
