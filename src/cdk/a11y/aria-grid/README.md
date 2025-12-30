# ARIA Grid with CDK Table Integration

This module provides ARIA grid directives that work seamlessly with Angular CDK Table, solving the DI tree issue that occurs when using templates and portals.

## The Problem

When using ARIA grid directives with CDK table, the `ngGridCell` directive fails to find the `GRID_ROW` provider because CDK table renders cells through templates and portals, which breaks the normal Angular DI tree.

## The Solution

This implementation provides multiple approaches to solve the DI issue:

### 1. Simple Row Provider (Recommended)

Use the `cdkGridRowProvider` directive on your table rows:

```typescript
@Component({
  imports: [CdkTableModule, Grid, GridRow, GridCell, CdkGridRowProvider],
  template: `
    <table ngGrid cdk-table [dataSource]="data">
      @for (column of columns; track column) {
        <ng-container [cdkColumnDef]="column">
          <th ngGridCell cdk-header-cell *cdkHeaderCellDef>{{ column }}</th>
          <td ngGridCell cdk-cell *cdkCellDef="let row">{{ row[column] }}</td>
        </ng-container>
      }
      <tr ngGridRow cdkGridRowProvider cdk-header-row *cdkHeaderRowDef="columns"></tr>
      <tr ngGridRow cdkGridRowProvider cdk-row *cdkRowDef="let row; columns: columns"></tr>
    </table>
  `
})
export class MyTable {
  data = [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 }
  ];
  columns = ['name', 'age'];
}
```

### 2. DOM-based Fallback

The `GridCell` directive automatically falls back to DOM traversal when DI fails, so it works without additional configuration in most cases.

## Key Features

- **Automatic DI Fallback**: GridCell automatically searches the DOM hierarchy when DI fails
- **CDK Table Integration**: Seamless integration with existing CDK table implementations  
- **Minimal Code Changes**: Only requires adding `cdkGridRowProvider` to row elements
- **Performance Optimized**: Uses efficient DOM traversal and caching
- **Type Safe**: Full TypeScript support with proper typing

## API Reference

### Directives

- `Grid` - Main grid container (`[ngGrid]`)
- `GridRow` - Grid row (`[ngGridRow]`) 
- `GridCell` - Grid cell (`[ngGridCell]`)
- `CdkGridRowProvider` - CDK table row provider (`[cdkGridRowProvider]`)

### Tokens

- `GRID_ROW` - Injection token for grid row instances

## Migration Guide

To migrate existing CDK tables to use ARIA grid:

1. Add `ngGrid` to your table element
2. Add `ngGridRow` to your row templates  
3. Add `ngGridCell` to your cell templates
4. Add `cdkGridRowProvider` to CDK row templates
5. Import the required directives in your component

The solution is backward compatible and doesn't affect existing CDK table functionality.