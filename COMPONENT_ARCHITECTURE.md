# StopCriStudio - Component Architecture

## Component Hierarchy

```
App (Root)
│
├── Header
│   ├── AppBar (MUI)
│   ├── ImportButton
│   ├── DownloadButton
│   └── UnsavedIndicator
│
├── MainLayout (Box/Grid)
│   │
│   ├── Sidebar
│   │   ├── EndpointsSection
│   │   │   ├── Section Header with [+ Add] Button
│   │   │   └── EndpointsList
│   │   │       └── EndpointItem (repeating)
│   │   │           ├── Method Badge
│   │   │           ├── Path Text
│   │   │           └── [X] Delete Icon (inline)
│   │   │
│   │   └── ModelsSection
│   │       ├── Section Header with [+ Add] Button
│   │       └── ModelsList
│   │           └── ModelItem (repeating)
│   │               ├── Model Name
│   │               └── [X] Delete Icon (inline)
│   │
│   └── MainPanel
│       ├── EndpointEditor (when endpoint selected)
│       │   ├── BasicInfoForm
│       │   ├── AuthorizationSelector
│       │   ├── ParametersEditor
│       │   │   ├── QueryParametersSection
│       │   │   └── PathParametersSection
│       │   ├── RequestBodyEditor
│       │   └── ResponsesEditor
│       │       └── ResponseItem (repeating)
│       │
│       ├── ModelEditor (when model selected)
│       │   └── SchemaBuilder
│       │
│       └── EmptyState (nothing selected)
│
└── Dialogs (Modals)
    ├── ImportDialog
    ├── DownloadDialog
    ├── UnsavedChangesDialog
    └── ConfirmDeleteDialog
```

---

## Component Specifications

### 1. **App** (Root Component)
**Purpose:** Main application container, orchestrates layout

**File:** `src/App.tsx`

**Responsibilities:**
- Initialize Zustand store
- Set up main layout structure
- Handle unsaved changes warning on navigation
- Manage dialog visibility states

**Props:** None

**State Management:**
- `useApiStore()` - access entire store
- Local state for dialog visibility

**MUI Components Used:**
- `Box` - main container
- `CssBaseline` - normalize styles

---

### 2. **Header**
**Purpose:** Top navigation bar with title and action buttons

**File:** `src/components/Header.tsx`

**Responsibilities:**
- Display app title
- Render Import button
- Render Download button
- Show unsaved changes indicator

**Props:**
```typescript
interface HeaderProps {
  onImportClick: () => void
  onDownloadClick: () => void
}
```

**State Management:**
- Read `hasUnsavedChanges` from Zustand store

**MUI Components Used:**
- `AppBar`
- `Toolbar`
- `Box`
- `Button`
- `IconButton`
- `Chip` (for unsaved indicator)

**Child Components:**
- `ImportButton`
- `DownloadButton`
- `UnsavedIndicator`

---

### 3. **ImportButton**
**Purpose:** Trigger file import dialog

**File:** `src/components/buttons/ImportButton.tsx`

**Responsibilities:**
- Show file picker for JSON/YAML
- Validate OpenAPI format
- Update store with imported spec
- Handle errors

**Props:**
```typescript
interface ImportButtonProps {
  onClick?: () => void
}
```

**State Management:**
- `useApiStore().setSpec()` - load imported spec
- `useApiStore().resetSpec()` - clear on error

**MUI Components Used:**
- `Button`
- `CircularProgress` (while loading)

---

### 4. **DownloadButton**
**Purpose:** Export current spec as JSON or YAML

**File:** `src/components/buttons/DownloadButton.tsx`

**Responsibilities:**
- Show format selector (JSON/YAML)
- Export spec with chosen format
- Trigger browser download
- Mark changes as saved

**Props:**
```typescript
interface DownloadButtonProps {
  onClick?: () => void
}
```

**State Management:**
- `useApiStore().exportSpec()` - generate file content
- `useApiStore().markSavedChanges()` - clear unsaved flag

**MUI Components Used:**
- `Button`
- `Menu` or `Dialog` (format selector)

---

### 5. **UnsavedIndicator**
**Purpose:** Show warning when there are unsaved changes

**File:** `src/components/UnsavedIndicator.tsx`

**Responsibilities:**
- Display indicator only if changes exist
- Show visual warning (icon, color)
- Tooltip with message

**Props:**
```typescript
interface UnsavedIndicatorProps {
  visible: boolean
}
```

**State Management:**
- Read `hasUnsavedChanges` from store

**MUI Components Used:**
- `Chip`
- `Icon` or `Box`
- `Tooltip`

---

### 6. **MainLayout**
**Purpose:** Container for sidebar and main panel

**File:** `src/components/MainLayout.tsx`

**Responsibilities:**
- Create two-column layout
- Manage responsive sizing

**Props:** None

**MUI Components Used:**
- `Box`
- `Grid` or CSS Grid

**Child Components:**
- `Sidebar`
- `MainPanel`

---

### 7. **Sidebar**
**Purpose:** Navigation tree for endpoints and models

**File:** `src/components/Sidebar.tsx`

**Responsibilities:**
- Display endpoints and models
- Handle item selection
- Show add buttons

**Props:** None

**State Management:**
- Read `spec.paths`, `spec.models` from store
- `useApiStore().selectEndpoint()`
- `useApiStore().selectModel()`

**MUI Components Used:**
- `Box`
- `List`
- `TreeView` or custom tree structure
- `Button`
- `Icon`

**Child Components:**
- `EndpointsSection`
- `ModelsSection`

---

### 8. **EndpointsSection**
**Purpose:** Display and manage endpoints in sidebar

**File:** `src/components/sidebar/EndpointsSection.tsx`

**Responsibilities:**
- Display section header with "Endpoints" title and [+ Add] button (in header)
- List all endpoints grouped by path
- Show method color coding
- Handle selection
- Handle add endpoint dialog (local to component)
- Form collects: path, HTTP method (dropdown), description

**Props:**
```typescript
interface EndpointsSectionProps {
  // no props - reads from store
}
```

**State Management:**
- Read `spec.paths.endpoints` from store
- `useApiStore().selectEndpoint()` - on item click
- `useApiStore().addEndpoint()` - on form submit
- Local state for add dialog visibility
- Local state for form inputs: path, method, description

**MUI Components Used:**
- `Box` (container)
- `Stack` (header with title and button)
- `Typography` (section title)
- `Button` (add button in header)
- `List` (endpoints container)
- `Dialog` (add endpoint form)
- `TextField` (path, description inputs)
- `Select` (method dropdown)

**Child Components:**
- `EndpointItem` (for each endpoint)

---

### 9. **EndpointItem**
**Purpose:** Single endpoint in sidebar list

**File:** `src/components/sidebar/EndpointItem.tsx`

**Responsibilities:**
- Display endpoint method (GET/POST/PUT/DELETE/PATCH) and path
- Show selection state (highlight when selected)
- Handle click to select endpoint
- Display inline delete button (always visible)
- Handle delete confirmation (show ConfirmDeleteDialog)

**Props:**
```typescript
interface EndpointItemProps {
  endpoint: Endpoint
  isSelected: boolean
  onSelect: (id: string) => void
}
```

**State Management:**
- `useApiStore().selectEndpoint()` - on click
- `useApiStore().deleteEndpoint()` - on confirm delete
- Local state for delete confirmation dialog visibility

**MUI Components Used:**
- `ListItem` (clickable container)
- `Box` (layout container)
- `Chip` (method badge with color)
- `Typography` (path text)
- `IconButton` (delete button, always visible)
- `DeleteIcon` (delete icon)

**Child Components:**
- `ConfirmDeleteDialog` (for delete confirmation)

---

### 10. **AddEndpointButton**
**Purpose:** Quick add button for new endpoints

**File:** `src/components/sidebar/AddEndpointButton.tsx`

**Responsibilities:**
- Show dialog/form to create endpoint
- Collect path and method
- Create new endpoint in store

**Props:**
```typescript
interface AddEndpointButtonProps {
  onAdded?: () => void
}
```

**State Management:**
- `useApiStore().addEndpoint()`

**MUI Components Used:**
- `Button`
- `Dialog` (form inside)
- `TextField`
- `Select`

---

### 11. **ModelsSection**
**Purpose:** Display and manage models in sidebar

**File:** `src/components/sidebar/ModelsSection.tsx`

**Responsibilities:**
- Display section header with "Models" title and [+ Add] button (in header)
- List all models with name and description
- Handle selection
- Handle add model dialog (local to component)
- Form collects: name, description

**Props:**
```typescript
interface ModelsSectionProps {
  // no props - reads from store
}
```

**State Management:**
- Read `spec.models` from store
- `useApiStore().selectModel()` - on item click
- `useApiStore().addModel()` - on form submit
- Local state for add dialog visibility
- Local state for form inputs: name, description

**MUI Components Used:**
- `Box` (container)
- `Stack` (header with title and button)
- `Typography` (section title)
- `Button` (add button in header)
- `List` (models container)
- `Dialog` (add model form)
- `TextField` (name, description inputs)

**Child Components:**
- `ModelItem` (for each model)

---

### 12. **ModelItem**
**Purpose:** Single model in sidebar list

**File:** `src/components/sidebar/ModelItem.tsx`

**Responsibilities:**
- Display model name and description
- Show selection state (highlight when selected)
- Handle click to select model
- Display inline delete button (always visible)
- Handle delete confirmation (show ConfirmDeleteDialog)

**Props:**
```typescript
interface ModelItemProps {
  model: Model
  isSelected: boolean
  onSelect: (id: string) => void
}
```

**State Management:**
- `useApiStore().selectModel()` - on click
- `useApiStore().deleteModel()` - on confirm delete
- Local state for delete confirmation dialog visibility

**MUI Components Used:**
- `ListItem` (clickable container)
- `Box` (layout container)
- `Typography` (name and description text)
- `IconButton` (delete button, always visible)
- `DeleteIcon` (delete icon)

**Child Components:**
- `ConfirmDeleteDialog` (for delete confirmation)
- Delete confirmation dialog (internal)

---

### 13. **AddModelButton**
**Purpose:** Quick add button for new models

**File:** `src/components/sidebar/AddModelButton.tsx`

**Responsibilities:**
- Show dialog/form to create model
- Collect model name
- Create new model in store

**Props:**
```typescript
interface AddModelButtonProps {
  onAdded?: () => void
}
```

**State Management:**
- `useApiStore().addModel()`

**MUI Components Used:**
- `Button`
- `Dialog` (form inside)
- `TextField`

---

### 14. **MainPanel**
**Purpose:** Display editor for selected endpoint or model

**File:** `src/components/MainPanel.tsx`

**Responsibilities:**
- Show correct editor based on selection
- Handle empty state
- Manage editor layout

**Props:** None

**State Management:**
- Read `selectedEndpointId`, `selectedModelId` from store

**MUI Components Used:**
- `Box`
- `Paper` (container)

**Child Components:**
- `EndpointEditor`
- `ModelEditor`
- `EmptyState`

---

### 15. **EndpointEditor**
**Purpose:** Full form for editing endpoint details

**File:** `src/components/editors/EndpointEditor.tsx`

**Responsibilities:**
- Display endpoint form
- Handle form submission
- Update store on changes
- Manage nested editors (parameters, request, responses)

**Props:**
```typescript
interface EndpointEditorProps {
  endpoint: Endpoint
}
```

**State Management:**
- `useApiStore().updateEndpoint()`
- `useApiStore().markUnsavedChanges()`

**MUI Components Used:**
- `Box`
- `Paper`
- `TextField`
- `Select`
- `Tabs` or `Accordion` (for sections)

**Child Components:**
- `BasicInfoForm`
- `AuthorizationSelector`
- `ParametersEditor`
- `RequestBodyEditor`
- `ResponsesEditor`

---

### 16. **BasicInfoForm**
**Purpose:** Edit endpoint path, method, description

**File:** `src/components/editors/BasicInfoForm.tsx`

**Responsibilities:**
- Display basic endpoint fields
- Handle value changes
- Update store

**Props:**
```typescript
interface BasicInfoFormProps {
  endpoint: Endpoint
  onUpdate: (updates: Partial<Endpoint>) => void
}
```

**MUI Components Used:**
- `TextField`
- `Select`
- `Box`
- `Typography`

---

### 17. **AuthorizationSelector**
**Purpose:** Select/configure security schemes for endpoint

**File:** `src/components/editors/AuthorizationSelector.tsx`

**Responsibilities:**
- Show available security schemes
- Allow selection
- Handle none/multiple selections

**Props:**
```typescript
interface AuthorizationSelectorProps {
  endpoint: Endpoint
  availableSchemes: SecurityScheme[]
  onUpdate: (schemes: SecurityScheme[]) => void
}
```

**MUI Components Used:**
- `FormControl`
- `FormLabel`
- `Checkbox`
- `FormGroup`

---

### 18. **ParametersEditor**
**Purpose:** Edit query and path parameters

**File:** `src/components/editors/ParametersEditor.tsx`

**Responsibilities:**
- Display parameter lists
- Allow add/edit/delete
- Separate query and path params

**Props:**
```typescript
interface ParametersEditorProps {
  endpoint: Endpoint
  onUpdate: (parameters: Parameter[]) => void
}
```

**State Management:**
- Local component state for form
- Update parent on save

**MUI Components Used:**
- `Accordion`
- `Table`
- `TextField`
- `Checkbox`
- `Button`
- `IconButton`

**Child Components:**
- `ParameterRow`
- `AddParameterButton`

---

### 19. **ParameterRow**
**Purpose:** Single parameter in parameters table

**File:** `src/components/editors/ParameterRow.tsx`

**Responsibilities:**
- Edit parameter fields
- Delete parameter
- Handle type selection

**Props:**
```typescript
interface ParameterRowProps {
  parameter: Parameter
  onUpdate: (updated: Parameter) => void
  onDelete: () => void
}
```

**MUI Components Used:**
- `TableRow`
- `TableCell`
- `TextField`
- `Select`
- `Checkbox`
- `IconButton`

---

### 20. **RequestBodyEditor**
**Purpose:** Configure request body with schema

**File:** `src/components/editors/RequestBodyEditor.tsx`

**Responsibilities:**
- Toggle request body presence
- Select content-type
- Open schema builder
- Display schema summary

**Props:**
```typescript
interface RequestBodyEditorProps {
  endpoint: Endpoint
  onUpdate: (body: RequestBody | undefined) => void
}
```

**MUI Components Used:**
- `FormControlLabel`
- `Switch`
- `Select`
- `Box`
- `Button`

**Child Components:**
- `SchemaBuilder` (opened in dialog)

---

### 21. **ResponsesEditor**
**Purpose:** Manage endpoint responses

**File:** `src/components/editors/ResponsesEditor.tsx`

**Responsibilities:**
- Display list of responses
- Add new responses
- Edit/delete responses
- Each response has status code, description, content-type, schema

**Props:**
```typescript
interface ResponsesEditorProps {
  endpoint: Endpoint
  onUpdate: (responses: Response[]) => void
}
```

**MUI Components Used:**
- `Box`
- `Table`
- `Button`
- `IconButton`

**Child Components:**
- `ResponseRow`
- `AddResponseButton`

---

### 22. **ResponseRow**
**Purpose:** Single response in responses table

**File:** `src/components/editors/ResponseRow.tsx`

**Responsibilities:**
- Edit response status code
- Edit description
- Select content-type
- Open schema builder
- Delete response

**Props:**
```typescript
interface ResponseRowProps {
  response: Response
  onUpdate: (updated: Response) => void
  onDelete: () => void
}
```

**MUI Components Used:**
- `TableRow`
- `TableCell`
- `TextField`
- `Select`
- `IconButton`
- `Button`

**Child Components:**
- `SchemaBuilder` (opened in dialog)

---

### 23. **ModelEditor**
**Purpose:** Create and edit models/schemas

**File:** `src/components/editors/ModelEditor.tsx`

**Responsibilities:**
- Display model name
- Open schema builder
- Update store on changes

**Props:**
```typescript
interface ModelEditorProps {
  model: Model
}
```

**State Management:**
- `useApiStore().updateModel()`
- `useApiStore().markUnsavedChanges()`

**MUI Components Used:**
- `Box`
- `TextField`
- `Paper`
- `Button`

**Child Components:**
- `SchemaBuilder`

---

### 24. **SchemaBuilder**
**Purpose:** Visual builder for schemas

**File:** `src/components/schema/SchemaBuilder.tsx`

**Responsibilities:**
- Build/edit schema recursively
- Support primitives, objects, arrays
- Handle nested structures
- Reference reusable models
- Show schema summary

**Props:**
```typescript
interface SchemaBuilderProps {
  schema: Schema
  onUpdate: (schema: Schema) => void
  availableModels: Model[]
}
```

**MUI Components Used:**
- `Box`
- `Card`
- `TextField`
- `Select`
- `Button`
- `IconButton`
- `Accordion`

**Child Components:**
- `SchemaBuilderField` (recursive)
- `PrimitiveTypeSelector`
- `ModelReferenceSelector`

---

### 25. **SchemaBuilderField**
**Purpose:** Single schema field in builder

**File:** `src/components/schema/SchemaBuilderField.tsx`

**Responsibilities:**
- Edit field properties
- Add/remove nested fields
- Handle type changes
- Recursive for nested objects/arrays

**Props:**
```typescript
interface SchemaBuilderFieldProps {
  schema: Schema
  onUpdate: (schema: Schema) => void
  onDelete: () => void
  availableModels: Model[]
  depth: number // for indentation
}
```

**MUI Components Used:**
- `Box`
- `TextField`
- `Select`
- `Button`
- `IconButton`
- `Checkbox`

---

### 26. **EmptyState**
**Purpose:** Show when nothing is selected

**File:** `src/components/EmptyState.tsx`

**Responsibilities:**
- Display helpful message
- Encourage user to select or create item

**Props:** None

**MUI Components Used:**
- `Box`
- `Typography`
- `Icon`

---

### 27. **ImportDialog**
**Purpose:** Modal for importing OpenAPI spec

**File:** `src/components/dialogs/ImportDialog.tsx`

**Responsibilities:**
- File input for JSON/YAML
- Validate format
- Show errors
- Trigger import

**Props:**
```typescript
interface ImportDialogProps {
  open: boolean
  onClose: () => void
}
```

**State Management:**
- `useApiStore().setSpec()` - load file
- Local state for error messages

**MUI Components Used:**
- `Dialog`
- `DialogTitle`
- `DialogContent`
- `DialogActions`
- `Button`
- `input` (file)
- `Alert` (errors)

---

### 28. **DownloadDialog**
**Purpose:** Modal for choosing export format

**File:** `src/components/dialogs/DownloadDialog.tsx`

**Responsibilities:**
- Show format options (JSON/YAML)
- Trigger download
- Handle file generation

**Props:**
```typescript
interface DownloadDialogProps {
  open: boolean
  onClose: () => void
}
```

**State Management:**
- `useApiStore().exportSpec()` - generate content
- `useApiStore().markSavedChanges()` - clear unsaved flag

**MUI Components Used:**
- `Dialog`
- `DialogTitle`
- `DialogContent`
- `DialogActions`
- `RadioGroup`
- `FormControlLabel`
- `Radio`
- `Button`

---

### 29. **UnsavedChangesDialog**
**Purpose:** Warn before losing unsaved changes

**File:** `src/components/dialogs/UnsavedChangesDialog.tsx`

**Responsibilities:**
- Confirm navigation
- Allow save or discard
- Cancel action

**Props:**
```typescript
interface UnsavedChangesDialogProps {
  open: boolean
  onDiscard: () => void
  onSave: () => void
  onCancel: () => void
}
```

**MUI Components Used:**
- `Dialog`
- `DialogTitle`
- `DialogContent`
- `DialogActions`
- `Button`
- `Typography`

---

### 28. **ConfirmDeleteDialog**
**Purpose:** Confirmation dialog for deleting endpoints or models

**File:** `src/components/dialogs/ConfirmDeleteDialog.tsx`

**Responsibilities:**
- Show confirmation message with item name
- Handle delete confirmation
- Allow cancel action
- Support both endpoint and model deletion

**Props:**
```typescript
interface ConfirmDeleteDialogProps {
  open: boolean
  itemType: 'endpoint' | 'model'
  itemName: string
  onConfirm: () => void
  onCancel: () => void
}
```

**State Management:**
- `useApiStore().deleteEndpoint()` or `useApiStore().deleteModel()` (called by parent)

**MUI Components Used:**
- `Dialog`
- `DialogTitle`
- `DialogContent`
- `DialogActions`
- `Button`
- `Typography`
- `Alert` (warning style)

---

## File Structure

```
src/
├── App.tsx (root)
│
├── components/
│   ├── Header.tsx
│   ├── MainLayout.tsx
│   ├── Sidebar.tsx
│   ├── MainPanel.tsx
│   ├── EmptyState.tsx
│   │
│   ├── buttons/
│   │   ├── ImportButton.tsx
│   │   ├── DownloadButton.tsx
│   │   └── UnsavedIndicator.tsx
│   │
│   ├── sidebar/
│   │   ├── EndpointsSection.tsx (includes add dialog)
│   │   ├── EndpointItem.tsx (includes delete confirmation)
│   │   ├── ModelsSection.tsx (includes add dialog)
│   │   └── ModelItem.tsx (includes delete confirmation)
│   │
│   ├── editors/
│   │   ├── EndpointEditor.tsx
│   │   ├── BasicInfoForm.tsx
│   │   ├── AuthorizationSelector.tsx
│   │   ├── ParametersEditor.tsx
│   │   ├── ParameterRow.tsx
│   │   ├── RequestBodyEditor.tsx
│   │   ├── ResponsesEditor.tsx
│   │   ├── ResponseRow.tsx
│   │   └── ModelEditor.tsx
│   │
│   ├── schema/
│   │   ├── SchemaBuilder.tsx
│   │   └── SchemaBuilderField.tsx
│   │
│   └── dialogs/
│       ├── ImportDialog.tsx
│       ├── DownloadDialog.tsx
│       ├── UnsavedChangesDialog.tsx
│       └── ConfirmDeleteDialog.tsx
│
├── store/
│   └── apiStore.ts
│
├── types/
│   └── api.ts
│
├── utils/
│   ├── validation.ts (OpenAPI validation)
│   └── export.ts (file export helpers)
│
└── index.css
```

---

## Zustand Store Integration

### Store Actions Used by Components

| Component | Actions Used |
|-----------|--------------|
| App | `useApiStore()` all |
| ImportButton | `setSpec()`, `resetSpec()` |
| DownloadButton | `exportSpec()`, `markSavedChanges()` |
| EndpointItem | `selectEndpoint()`, `deleteEndpoint()` |
| ModelItem | `selectModel()`, `deleteModel()` |
| EndpointEditor | `updateEndpoint()`, `markUnsavedChanges()` |
| ModelEditor | `updateModel()`, `markUnsavedChanges()` |
| ParametersEditor | `updateEndpoint()`, `markUnsavedChanges()` |
| ResponsesEditor | `updateEndpoint()`, `markUnsavedChanges()` |
| AuthorizationSelector | `updateEndpoint()`, `markUnsavedChanges()` |
| SchemaBuilder | `updateEndpoint()` or `updateModel()`, `markUnsavedChanges()` |

---

## Notes

- All components use TypeScript for type safety
- Components are as independent as possible
- Zustand store is the single source of truth
- MUI provides consistent styling
- Components follow React best practices (functional, hooks-based)
- Error handling in dialogs and import/export operations
