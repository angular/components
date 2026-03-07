# Disclosure

<a href="https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/" target="_blank">Disclosure ARIA pattern</a> <a href="api/aria/disclosure">Disclosure API Reference</a>

## Overview

A disclosure is a widget that enables content to be either collapsed (hidden) or expanded (visible). It provides a trigger button that controls the visibility of associated content, commonly used for FAQ sections, "read more" interactions, and collapsible panels.

### app.ts

```typescript
import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {DisclosureTrigger, DisclosureContent} from '@angular/aria/disclosure';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [DisclosureTrigger, DisclosureContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  devilFruits = [
    {
      id: 'gomu',
      name: 'Gomu Gomu no Mi',
      type: 'Paramecia',
      user: 'Monkey D. Luffy',
      description: 'Grants the user a body with the properties of rubber, making them immune to blunt attacks and electricity. Awakened as the mythical Hito Hito no Mi, Model: Nika.',
      expanded: signal(true),
    },
    {
      id: 'mera',
      name: 'Mera Mera no Mi',
      type: 'Logia',
      user: 'Sabo (formerly Portgas D. Ace)',
      description: 'Allows the user to create, control, and transform into fire at will. One of the most powerful Logia-type Devil Fruits.',
      expanded: signal(false),
    },
    {
      id: 'ope',
      name: 'Ope Ope no Mi',
      type: 'Paramecia',
      user: 'Trafalgar D. Water Law',
      description: 'Creates a spherical territory called "ROOM" where the user can manipulate anything within. Known as the "Ultimate Devil Fruit" for its ability to grant eternal youth.',
      expanded: signal(false),
    },
  ];
}
```

### app.html

```html
<h2>Devil Fruit Encyclopedia</h2>
<div class="fruit-list">
  @for (fruit of devilFruits; track fruit.id) {
    <div class="fruit-card">
      <button 
        ngDisclosureTrigger 
        #trigger="ngDisclosureTrigger"
        [(expanded)]="fruit.expanded"
        [controls]="'fruit-' + fruit.id"
        class="fruit-trigger"
      >
        <span class="fruit-icon">{{ fruit.expanded() ? '▼' : '▶' }}</span>
        <span class="fruit-name">{{ fruit.name }}</span>
        <span class="fruit-type" [attr.data-type]="fruit.type">{{ fruit.type }}</span>
      </button>
      
      <div 
        [id]="'fruit-' + fruit.id"
        ngDisclosureContent 
        [trigger]="trigger"
        class="fruit-details"
      >
        <p><strong>Current User:</strong> {{ fruit.user }}</p>
        <p>{{ fruit.description }}</p>
      </div>
    </div>
  }
</div>
```

### app.css

```css
.fruit-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 600px;
  font-family: system-ui, sans-serif;
}

.fruit-card {
  border: 2px solid var(--gray-300, #d1d5db);
  border-radius: 12px;
  overflow: hidden;
  background: var(--white, #ffffff);
}

.fruit-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--gray-50, #f9fafb);
  border: none;
  cursor: pointer;
  font-size: 1rem;
  text-align: left;
  transition: background-color 0.2s ease;
}

.fruit-trigger:hover {
  background: var(--gray-100, #f3f4f6);
}

.fruit-trigger:focus-visible {
  outline: 2px solid var(--vivid-pink, #f542a4);
  outline-offset: -2px;
}

.fruit-icon {
  font-size: 0.75rem;
  color: var(--gray-500, #6b7280);
}

.fruit-name {
  flex: 1;
  font-weight: 600;
}

.fruit-type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.fruit-type[data-type='Paramecia'] {
  background: #dbeafe;
  color: #1e40af;
}

.fruit-type[data-type='Logia'] {
  background: #fef3c7;
  color: #92400e;
}

.fruit-type[data-type='Zoan'] {
  background: #d1fae5;
  color: #065f46;
}

.fruit-details {
  padding: 16px;
  background: var(--white, #ffffff);
  border-top: 1px solid var(--gray-200, #e5e7eb);
}

.fruit-details p {
  margin: 0 0 8px 0;
  color: var(--gray-700, #374151);
  line-height: 1.6;
}

.fruit-details p:last-child {
  margin-bottom: 0;
}
```

## APIs

### DisclosureTrigger Directive

The `ngDisclosureTrigger` directive creates a button that toggles the visibility of associated content.

#### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| expanded | boolean | false | Whether the content is expanded |
| disabled | boolean | false | Disables the trigger |
| alwaysExpanded | boolean | false | Keeps content always visible, prevents collapsing |
| controls | string | - | ID of the controlled content element |
| id | string | auto-generated | Unique identifier for the trigger |

#### Signals

| Property | Type | Description |
|----------|------|-------------|
| expanded | ModelSignal\<boolean\> | Two-way bindable expanded state using [(expanded)] |

#### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| expand | none | Expands the content |
| collapse | none | Collapses the content (respects alwaysExpanded) |
| toggle | none | Toggles the expanded state |

### DisclosureContent Directive

The `ngDisclosureContent` directive marks an element as the content panel controlled by a trigger.

#### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| trigger | DisclosureTrigger | - | Reference to the controlling trigger |
| id | string | auto-generated | Unique identifier for the content |
| preserveContent | boolean | false | Whether to preserve DOM content when collapsed |

#### Signals

| Property | Type | Description |
|----------|------|-------------|
| hidden | Signal\<boolean\> | Whether the content is currently hidden |
| visible | Signal\<boolean\> | Whether the content is currently visible |

### Keyboard Interaction

| Key | Action |
|-----|--------|
| Enter | Toggles the disclosure |
| Space | Toggles the disclosure |

### ARIA Attributes

The directives automatically manage these accessibility attributes:

**Trigger element:**
- `role="button"` - Identifies as interactive button
- `aria-expanded` - `true` when expanded, `false` when collapsed
- `aria-controls` - References the content element's ID
- `aria-disabled` - `true` when disabled
- `tabindex` - `0` when enabled, `-1` when disabled

**Content element:**
- `id` - Unique identifier referenced by aria-controls
- `hidden` - Present when collapsed (removed when expanded)

## Deferred Content

For performance optimization, combine with `ngDeferredContent` to delay rendering until first expansion:

```html
<button ngDisclosureTrigger #trigger="ngDisclosureTrigger">
  Load Content
</button>

<div ngDisclosureContent [trigger]="trigger">
  <ng-template ngDeferredContent>
    <!-- Only rendered when first expanded -->
    <heavy-component></heavy-component>
  </ng-template>
</div>
```

Use `preserveContent="true"` to keep content in the DOM after collapsing:

```html
<div ngDisclosureContent [trigger]="trigger" [preserveContent]="true">
  <ng-template ngDeferredContent>
    <!-- Created once, preserved when collapsed -->
    <stateful-component></stateful-component>
  </ng-template>
</div>
```

## When to use Disclosure vs Accordion

### Key Differences

| Feature | Disclosure | Accordion |
|---------|------------|-----------|
| **Grouping** | Independent items | Grouped with `ngAccordionGroup` |
| **Keyboard navigation** | Enter/Space only | Arrow keys, Home/End between items |
| **Expansion mode** | Always independent | Configurable (`multiExpandable`) |
| **ARIA pattern** | Simple button + content | Full accordion with regions |
| **Focus management** | None | Roving tabindex |

### Use Disclosure when:

| Scenario | Example |
|----------|---------|
| **Simple show/hide** | "Read more" button, help tooltips |
| **Single expandable item** | One collapsible section |
| **No keyboard nav needed** | Users won't navigate between items with arrow keys |
| **Lightweight interaction** | Minimal ARIA overhead |

```html
<!-- Simple disclosure - Enter/Space to toggle -->
<button ngDisclosureTrigger [(expanded)]="showDetails">Details</button>
<div ngDisclosureContent [trigger]="trigger">...</div>
```

### Use Accordion when:

| Scenario | Example |
|----------|---------|
| **Grouped related content** | FAQ sections, settings categories |
| **Keyboard navigation needed** | Users navigate between items with arrow keys |
| **Single expansion mode** | Set `[multiExpandable]="false"` for one-at-a-time |
| **Complex panel management** | `expandAll()`, `collapseAll()` methods |

```html
<!-- Accordion - arrow key navigation, grouped management -->
<div ngAccordionGroup [multiExpandable]="false">
  <button ngAccordionTrigger panelId="p1">Panel 1</button>
  <div ngAccordionPanel panelId="p1">...</div>
  
  <button ngAccordionTrigger panelId="p2">Panel 2</button>
  <div ngAccordionPanel panelId="p2">...</div>
</div>
```

### Quick decision guide

```
Do you need keyboard navigation between items (arrow keys)?
├── YES → Use Accordion
└── NO → Is it a single item or independent items?
    ├── Single/Independent → Use Disclosure
    └── Grouped with shared control → Use Accordion
```

## Related patterns and directives

- **[Accordion](guide/aria/accordion)** - Grouped panels with keyboard navigation and optional single-expansion mode
- **[Tabs](guide/aria/tabs)** - Content organized into tabbed panels

Disclosure can combine with:

- **DeferredContent** - Lazy rendering of content until first expansion
