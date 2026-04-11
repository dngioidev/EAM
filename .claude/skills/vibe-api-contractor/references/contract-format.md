# Contract Format

## Full Contract File Structure

```json
{
  "meta": { ... },
  "quick_facts": {
    "one_line": "What this contract defines",
    "contract_version": "1.0",
    "status_reason": "draft | approved | implemented | deprecated",
    "endpoint_count": 5,
    "last_change": "YYYY-MM-DD"
  },
  "content": {
    "title": "Module Name API Contract",
    "module": "module-name",
    "version": "1.0",
    "base_path": "/api/module-name",
    "endpoints": [...],
    "schemas": {...}
  },
  "approval": { ... }
}
```

---

## Endpoint Entry

```json
{
  "id": "GET /api/orders",
  "method": "GET",
  "path": "/api/orders",
  "description": "Return paginated list of orders for current user",
  "auth_required": true,
  "roles": ["cashier", "store-manager"],
  "query_params": {
    "page": "number (default: 1)",
    "limit": "number (default: 20, max: 100)",
    "status": "OrderStatus enum (optional)",
    "from": "ISO-8601 date (optional)",
    "to": "ISO-8601 date (optional)"
  },
  "request": null,
  "response": {
    "200": {
      "data": "[OrderListItem]",
      "meta": {
        "total": "number",
        "page": "number",
        "limit": "number",
        "timestamp": "ISO-8601"
      }
    }
  },
  "errors": {
    "400": "Invalid query params — page or limit out of range",
    "401": "Missing or expired JWT",
    "403": "Role not permitted to list orders"
  }
}
```

---

## Schema Entry

```json
{
  "OrderListItem": {
    "type": "object",
    "required": ["id", "status", "total", "createdAt"],
    "properties": {
      "id": { "type": "string", "format": "uuid" },
      "orderNumber": { "type": "string", "example": "ORD-2024-001234" },
      "status": { "$ref": "#/schemas/OrderStatus" },
      "total": { "type": "number", "description": "Total in VND, integer" },
      "createdAt": { "type": "string", "format": "date-time" }
    }
  },
  "OrderStatus": {
    "type": "string",
    "enum": ["pending", "paid", "cancelled", "refunded"]
  }
}
```

---

## Approval Workflow

```
Draft → PM/PO review → Backend feasibility → Frontend review → Approved
```

Status transitions:
- `"draft"` → can be edited freely
- `"approved"` → FROZEN. Only minor clarifications allowed. New version required for any shape change.
- `"implemented"` → Backend has shipped this version. Version bump needed for any change.
- `"deprecated"` → Being phased out. Include `"sunset_date"` field.

---

## Currency Representation

All monetary values in the response:
- Type: `number` (integer, not float)
- Unit: VND (Vietnamese Dong)
- Never use decimal for VND
- Frontend is responsible for formatting display as `1.234.567 ₫`
