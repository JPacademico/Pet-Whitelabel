import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  /** Hide this column in the mobile card view (e.g. a column that's redundant with the card title). */
  hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  actions?: (row: T) => ReactNode;
  emptyState?: ReactNode;
}

// Tables with horizontal scroll on mobile are a UX trap — below md, rows collapse into stacked cards.
export function DataTable<T>({ columns, rows, rowKey, actions, emptyState }: DataTableProps<T>) {
  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div>
      <table className="hidden w-full border-collapse overflow-hidden rounded-2xl bg-white text-left md:table">
        <thead>
          <tr className="bg-cream-deep text-xs tracking-wide text-muted uppercase">
            {columns.map((col) => (
              <th key={col.key} className={cn('px-4 py-3 font-semibold', col.className)}>
                {col.header}
              </th>
            ))}
            {actions && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-cream-deep last:border-0">
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3 align-middle', col.className)}>
                  {col.render(row)}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">{actions(row)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <li key={rowKey(row)} className="rounded-2xl bg-white p-4 shadow-sm">
            <dl className="flex flex-col gap-2">
              {columns
                .filter((col) => !col.hideOnMobile)
                .map((col) => (
                  <div key={col.key} className="flex items-center justify-between gap-3">
                    <dt className="text-xs font-semibold tracking-wide text-muted uppercase">
                      {col.header}
                    </dt>
                    <dd className="text-right text-sm text-charcoal">{col.render(row)}</dd>
                  </div>
                ))}
            </dl>
            {actions && (
              <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-cream-deep pt-3">
                {actions(row)}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
