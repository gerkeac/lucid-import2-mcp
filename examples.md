# Lucid Import MCP Server - Examples

This document provides detailed examples of using the MCP server to create various types of diagrams.

## Example 1: Simple Linear Process

Create a basic order processing workflow:

```json
{
  "tool": "lucid_create_process_map",
  "arguments": {
    "title": "Order Processing Workflow",
    "steps": [
      "Order Received",
      "Validate Order",
      "Check Inventory",
      "Process Payment",
      "Prepare Shipment",
      "Ship Order",
      "Order Complete"
    ],
    "product": "lucidchart"
  }
}
```

## Example 2: Decision Flow with Branches

Create a diagram with decision points:

```json
{
  "tool": "lucid_build_diagram_step_by_step",
  "arguments": {
    "pageTitle": "Approval Workflow",
    "shapes": [
      {
        "type": "start",
        "x": 300,
        "y": 50,
        "width": 100,
        "height": 50,
        "text": "Start",
        "fillColor": "#C5E0B4"
      },
      {
        "type": "process",
        "x": 250,
        "y": 150,
        "width": 200,
        "height": 60,
        "text": "Submit Request",
        "fillColor": "#FFFFFF"
      },
      {
        "type": "decision",
        "x": 250,
        "y": 260,
        "width": 200,
        "height": 100,
        "text": "Manager Approved?",
        "fillColor": "#FFE699"
      },
      {
        "type": "process",
        "x": 500,
        "y": 280,
        "width": 150,
        "height": 60,
        "text": "Reject Request",
        "fillColor": "#F8CBAD"
      },
      {
        "type": "decision",
        "x": 250,
        "y": 410,
        "width": 200,
        "height": 100,
        "text": "Finance Approved?",
        "fillColor": "#FFE699"
      },
      {
        "type": "process",
        "x": 250,
        "y": 560,
        "width": 200,
        "height": 60,
        "text": "Process Request",
        "fillColor": "#BDD7EE"
      },
      {
        "type": "end",
        "x": 300,
        "y": 670,
        "width": 100,
        "height": 50,
        "text": "End",
        "fillColor": "#C5E0B4"
      }
    ],
    "connectors": [
      { "from": 0, "to": 1 },
      { "from": 1, "to": 2 },
      { "from": 2, "to": 3, "text": "No" },
      { "from": 2, "to": 4, "text": "Yes" },
      { "from": 4, "to": 3, "text": "No" },
      { "from": 4, "to": 5, "text": "Yes" },
      { "from": 5, "to": 6 },
      { "from": 3, "to": 6 }
    ]
  }
}
```

## Example 3: Swimlane Process Map

Create a process map with different departments:

```json
{
  "tool": "lucid_build_diagram_step_by_step",
  "arguments": {
    "pageTitle": "Customer Support Process",
    "shapes": [
      {
        "type": "process",
        "x": 100,
        "y": 50,
        "width": 150,
        "height": 60,
        "text": "Customer\nSubmits Ticket",
        "fillColor": "#E2F0D9"
      },
      {
        "type": "process",
        "x": 300,
        "y": 50,
        "width": 150,
        "height": 60,
        "text": "Support\nReceives Ticket",
        "fillColor": "#BDD7EE"
      },
      {
        "type": "decision",
        "x": 500,
        "y": 30,
        "width": 150,
        "height": 100,
        "text": "Can Resolve?",
        "fillColor": "#FFE699"
      },
      {
        "type": "process",
        "x": 700,
        "y": 50,
        "width": 150,
        "height": 60,
        "text": "Resolve Issue",
        "fillColor": "#BDD7EE"
      },
      {
        "type": "process",
        "x": 500,
        "y": 200,
        "width": 150,
        "height": 60,
        "text": "Escalate to\nEngineering",
        "fillColor": "#F8CBAD"
      },
      {
        "type": "process",
        "x": 700,
        "y": 200,
        "width": 150,
        "height": 60,
        "text": "Engineering\nInvestigates",
        "fillColor": "#F8CBAD"
      },
      {
        "type": "process",
        "x": 900,
        "y": 50,
        "width": 150,
        "height": 60,
        "text": "Notify Customer",
        "fillColor": "#E2F0D9"
      },
      {
        "type": "end",
        "x": 975,
        "y": 200,
        "width": 100,
        "height": 50,
        "text": "Resolved",
        "fillColor": "#C5E0B4"
      }
    ],
    "connectors": [
      { "from": 0, "to": 1 },
      { "from": 1, "to": 2 },
      { "from": 2, "to": 3, "text": "Yes" },
      { "from": 2, "to": 4, "text": "No" },
      { "from": 4, "to": 5 },
      { "from": 5, "to": 3 },
      { "from": 3, "to": 6 },
      { "from": 6, "to": 7 }
    ]
  }
}
```

## Example 4: Custom JSON Document

Create a complete diagram using raw Standard Import JSON:

```json
{
  "tool": "lucid_create_custom_diagram",
  "arguments": {
    "title": "Software Development Lifecycle",
    "product": "lucidchart",
    "documentJson": "{\"version\":\"1.0\",\"pages\":[{\"id\":\"page-1\",\"title\":\"SDLC\",\"shapes\":[{\"id\":\"s1\",\"shapeType\":\"ellipse\",\"boundingBox\":{\"x\":200,\"y\":50,\"w\":100,\"h\":50},\"text\":\"Planning\",\"style\":{\"fill\":{\"color\":\"#C5E0B4\",\"type\":\"solid\"},\"stroke\":{\"color\":\"#000000\",\"width\":2,\"style\":\"solid\"}}},{\"id\":\"s2\",\"shapeType\":\"rectangle\",\"boundingBox\":{\"x\":200,\"y\":150,\"w\":100,\"h\":60},\"text\":\"Design\",\"style\":{\"fill\":{\"color\":\"#BDD7EE\",\"type\":\"solid\"},\"stroke\":{\"color\":\"#000000\",\"width\":2,\"style\":\"solid\"}}},{\"id\":\"s3\",\"shapeType\":\"rectangle\",\"boundingBox\":{\"x\":200,\"y\":260,\"w\":100,\"h\":60},\"text\":\"Development\",\"style\":{\"fill\":{\"color\":\"#FFE699\",\"type\":\"solid\"},\"stroke\":{\"color\":\"#000000\",\"width\":2,\"style\":\"solid\"}}},{\"id\":\"s4\",\"shapeType\":\"rectangle\",\"boundingBox\":{\"x\":200,\"y\":370,\"w\":100,\"h\":60},\"text\":\"Testing\",\"style\":{\"fill\":{\"color\":\"#F8CBAD\",\"type\":\"solid\"},\"stroke\":{\"color\":\"#000000\",\"width\":2,\"style\":\"solid\"}}},{\"id\":\"s5\",\"shapeType\":\"rectangle\",\"boundingBox\":{\"x\":200,\"y\":480,\"w\":100,\"h\":60},\"text\":\"Deployment\",\"style\":{\"fill\":{\"color\":\"#E2F0D9\",\"type\":\"solid\"},\"stroke\":{\"color\":\"#000000\",\"width\":2,\"style\":\"solid\"}}},{\"id\":\"s6\",\"shapeType\":\"ellipse\",\"boundingBox\":{\"x\":200,\"y\":590,\"w\":100,\"h\":50},\"text\":\"Maintenance\",\"style\":{\"fill\":{\"color\":\"#C5E0B4\",\"type\":\"solid\"},\"stroke\":{\"color\":\"#000000\",\"width\":2,\"style\":\"solid\"}}}],\"lines\":[{\"id\":\"l1\",\"endpoint1\":{\"x\":0,\"y\":0,\"shapeId\":\"s1\",\"position\":\"auto\"},\"endpoint2\":{\"x\":0,\"y\":0,\"shapeId\":\"s2\",\"position\":\"auto\"},\"style\":{\"stroke\":{\"color\":\"#000000\",\"width\":2,\"style\":\"solid\"}}},{\"id\":\"l2\",\"endpoint1\":{\"x\":0,\"y\":0,\"shapeId\":\"s2\",\"position\":\"auto\"},\"endpoint2\":{\"x\":0,\"y\":0,\"shapeId\":\"s3\",\"position\":\"auto\"},\"style\":{\"stroke\":{\"color\":\"#000000\",\"width\":2,\"style\":\"solid\"}}},{\"id\":\"l3\",\"endpoint1\":{\"x\":0,\"y\":0,\"shapeId\":\"s3\",\"position\":\"auto\"},\"endpoint2\":{\"x\":0,\"y\":0,\"shapeId\":\"s4\",\"position\":\"auto\"},\"style\":{\"stroke\":{\"color\":\"#000000\",\"width\":2,\"style\":\"solid\"}}},{\"id\":\"l4\",\"endpoint1\":{\"x\":0,\"y\":0,\"shapeId\":\"s4\",\"position\":\"auto\"},\"endpoint2\":{\"x\":0,\"y\":0,\"shapeId\":\"s5\",\"position\":\"auto\"},\"style\":{\"stroke\":{\"color\":\"#000000\",\"width\":2,\"style\":\"solid\"}}},{\"id\":\"l5\",\"endpoint1\":{\"x\":0,\"y\":0,\"shapeId\":\"s5\",\"position\":\"auto\"},\"endpoint2\":{\"x\":0,\"y\":0,\"shapeId\":\"s6\",\"position\":\"auto\"},\"style\":{\"stroke\":{\"color\":\"#000000\",\"width\":2,\"style\":\"solid\"}}}]}]}"
  }
}
```

## Example 5: Multi-Page Document

Build a document with multiple pages:

First, build each page separately using `lucid_build_diagram_step_by_step`, then combine them into a single document structure:

```json
{
  "version": "1.0",
  "pages": [
    {
      "id": "page-1",
      "title": "Overview",
      "shapes": [...],
      "lines": [...]
    },
    {
      "id": "page-2",
      "title": "Detailed Process",
      "shapes": [...],
      "lines": [...]
    }
  ]
}
```

Then use `lucid_import_diagram` to create the document.

## Common Color Schemes

### Professional Blues and Grays
- Primary: `#4472C4`
- Secondary: `#BDD7EE`
- Accent: `#2F5597`
- Background: `#F2F2F2`

### Process Flow Colors
- Start/End: `#C5E0B4` (Light Green)
- Process: `#FFFFFF` (White)
- Decision: `#FFE699` (Light Yellow)
- Error/Alert: `#F8CBAD` (Light Red)

### Status Colors
- Success: `#70AD47`
- Warning: `#FFC000`
- Error: `#C00000`
- Info: `#4472C4`

## Shape Positioning Tips

### Grid Layout
Use consistent spacing for clean layouts:
```javascript
const gridX = 200;  // Start position
const gridY = 100;  // Start position
const stepX = 150;  // Horizontal spacing between shapes
const stepY = 120;  // Vertical spacing between shapes

// Shape at grid position (0, 0)
{ x: gridX, y: gridY }

// Shape at grid position (1, 0)
{ x: gridX + stepX, y: gridY }

// Shape at grid position (0, 1)
{ x: gridX, y: gridY + stepY }
```

### Center Alignment
Center shapes horizontally:
```javascript
const pageWidth = 1200;
const shapeWidth = 120;
const centerX = (pageWidth - shapeWidth) / 2;  // 540

{ x: centerX, y: 100, width: shapeWidth, height: 60 }
```

## Standard Shape Sizes

### Process Boxes
- Default: 120x60
- Wide: 200x60
- Tall: 120x80

### Decision Diamonds
- Default: 120x80
- Wide: 150x100

### Start/End Ovals
- Default: 100x50
- Wide: 150x60

## Complete Workflow Example

Here's a complete authentication and document creation workflow:

### Step 1: Get Authorization URL
```json
{
  "tool": "lucid_get_auth_url",
  "arguments": {
    "state": "random_state_string"
  }
}
```

### Step 2: Exchange Code
After user authorizes, exchange the code:
```json
{
  "tool": "lucid_exchange_code",
  "arguments": {
    "code": "authorization_code_from_callback"
  }
}
```

### Step 3: Create Process Map
```json
{
  "tool": "lucid_create_process_map",
  "arguments": {
    "title": "My First Process Map",
    "steps": ["Start", "Process", "End"],
    "product": "lucidchart"
  }
}
```

## Tips and Best Practices

1. **Shape Placement**: Leave at least 120 pixels between shapes vertically for connectors
2. **Text Length**: Keep shape text concise (2-4 words) for readability
3. **Color Consistency**: Use a consistent color scheme throughout your diagram
4. **Connector Labels**: Add labels to decision branches ("Yes", "No", "Approved", etc.)
5. **Page Titles**: Use descriptive page titles for multi-page documents
6. **UUID Generation**: Let the builder generate UUIDs automatically
7. **Testing**: Build and test diagrams incrementally before creating large complex ones

## Troubleshooting Examples

### Issue: Shapes Overlap
**Solution**: Increase spacing between coordinates
```json
// Bad
{ "x": 100, "y": 100 }
{ "x": 150, "y": 120 }

// Good
{ "x": 100, "y": 100 }
{ "x": 250, "y": 100 }
```

### Issue: Connectors Not Visible
**Solution**: Ensure shape IDs match and coordinates are set correctly
```json
// Connector between shapes
{
  "from": 0,  // Must be valid index in shapes array
  "to": 1     // Must be valid index in shapes array
}
```

### Issue: Import Fails
**Solution**: Validate JSON structure before importing
```javascript
// Test JSON validity
try {
  JSON.parse(documentJson);
} catch (e) {
  console.error("Invalid JSON");
}
```
