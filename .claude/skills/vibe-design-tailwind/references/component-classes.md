# Component Class Patterns

## Page Layout

```tsx
// Full-height split layout (sidebar + content)
<div className="flex min-h-screen bg-background">
  <aside className="w-64 shrink-0 border-r px-4 py-6">
    {/* navigation */}
  </aside>
  <main className="flex-1 overflow-y-auto p-6">
    {/* page content */}
  </main>
</div>
```

## Card Pattern

```tsx
<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
  <h3 className="text-base font-semibold leading-none">{title}</h3>
  <p className="text-sm text-muted-foreground mt-1">{description}</p>
</div>
```

## Table Container

```tsx
<div className="rounded-md border">
  <Table>
    <TableHeader>
      <TableRow className="bg-muted/50">
        <TableHead className="w-[120px]">Mã đơn</TableHead>
        <TableHead className="text-right">Tổng tiền</TableHead>
        <TableHead className="w-[100px]">Trạng thái</TableHead>
      </TableRow>
    </TableHeader>
    {/* ... */}
  </Table>
</div>
```

## Form Layout

```tsx
<div className="space-y-6 max-w-lg">
  <div className="space-y-4">
    {/* FormFields here */}
  </div>
  <div className="flex gap-2 justify-end">
    <Button variant="outline" type="button" onClick={onCancel}>Hủy</Button>
    <Button type="submit" disabled={isPending}>Lưu</Button>
  </div>
</div>
```

## Utility Class Rules

| Rule | Correct | Wrong |
|---|---|---|
| Use semantic vars | `text-foreground` | `text-gray-900` |
| Use `muted` for secondary text | `text-muted-foreground` | `text-gray-500` |
| Use `border` var | `border-border` or just `border` | `border-gray-200` |
| VND in table | `text-right font-mono tabular-nums` | `text-left` |
| Status colors | from `status.*` config | raw hex |
