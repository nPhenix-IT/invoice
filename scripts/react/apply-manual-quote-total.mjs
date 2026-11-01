#!/usr/bin/env node
/**
 * Invoice Ninja React quote tasks: keep Hours, hide hourly Rate, edit Total.
 * Run from the Laravel fork: node scripts/react/apply-manual-quote-total.mjs /path/to/ui
 * The upstream UI checkout must match the pinned SHA documented in this repository.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { strict as assert } from 'node:assert';

const root = process.argv[2];
if (!root) {
  console.error('Usage: node scripts/react/apply-manual-quote-total.mjs /path/to/ui');
  process.exit(2);
}
const lines = (...parts) => parts.join('\n');

const patches = [
  ['src/common/interfaces/invoice-item.ts', [
    ['  cost: number;',
      lines('  cost: number;', '  /** Quote task total is entered independently from worked hours. */', '  manual_total?: boolean;', '  task_hours?: number;')],
  ]],
  ['src/pages/quotes/common/hooks.tsx', [
    ['            { ...blankLineItem(), type_id: typeId, quantity: 1 },',
      lines('            {', '              ...blankLineItem(),', '              type_id: typeId,', '              quantity: 1,',
        '              ...(typeId === InvoiceItemType.Task', '                ? { manual_total: true, task_hours: 0 }', '                : {}),',
        '            },')],
  ]],
  ...['src/pages/quotes/create/components/CreatePage.tsx',
    'src/pages/quotes/edit/Edit.tsx'].map((file) => [file, [
      ['  const taskColumns = useTaskColumns();',
        lines('  const taskColumns = useTaskColumns();',
          '  const manualTaskColumns = [',
          '    ...taskColumns.filter((column) =>',
          "      !['$task.rate', '$task.cost', '$task.line_total'].includes(column)",
          '    ),',
          "    '$task.line_total',",
          '  ];')],
      ['                  columns={taskColumns}',
        lines('                  columns={manualTaskColumns}', '                  manualTaskAmount')],
    ]]),
  ['src/pages/invoices/common/components/ProductsTable.tsx', [
    ['  shouldCreateInitialLineItem?: boolean;',
      lines('  shouldCreateInitialLineItem?: boolean;', '  manualTaskAmount?: boolean;')],
    ['    deleteLineItem: props.onDeleteRowClick,',
      lines('    deleteLineItem: props.onDeleteRowClick,', '    manualTaskAmount: props.manualTaskAmount,')],
    ['            {resolveTranslation(column)}',
      lines("            {props.manualTaskAmount && column === '$task.line_total'",
        "              ? t('total')", '              : resolveTranslation(column)}')],
  ]],
  ['src/pages/invoices/common/components/TasksTabLabel.tsx', [
    ['          return acc + item.quantity;',
      '          return acc + (item.manual_total ? (item.task_hours ?? 0) : item.quantity);'],
  ]],
  ['src/pages/invoices/common/hooks/useResolveInputField.tsx', [
    ['  deleteLineItem: (index: number) => unknown;',
      lines('  deleteLineItem: (index: number) => unknown;', '  manualTaskAmount?: boolean;')],
    ["      property !== 'is_amount_discount' &&",
      lines("      property !== 'is_amount_discount' &&", "      property !== 'manual_total' &&", "      property !== 'task_hours' &&")],
    ['    const property = resolveProperty(key);',
      lines('    const property = resolveProperty(key);', '',
        "    if (props.manualTaskAmount && props.type === 'task' &&",
        "        (key === '$task.hours' || key === '$task.line_total')) {",
        '      const item = resource.line_items[index];',
        '      const hours = item.manual_total ? (item.task_hours ?? 0) : item.quantity;',
        '      const amount = item.manual_total ? item.cost : item.cost * item.quantity;',
        "      const isHours = key === '$task.hours';",
        '',
        '      return (',
        '        <NumberInputField',
        "          id={isHours ? 'task_hours' : 'manual_task_total'}",
        '          precision={isHours ? 6 : (inputCurrencySeparators?.precision ?? 2)}',
        '          value={isHours ? hours : amount}',
        '          onValueChange={(value: string) => {',
        '            const parsed = Number(value);',
        "            if (!value.trim() || !Number.isFinite(parsed) || parsed < 0) return;",
        '            props.onLineItemChange(index, {',
        '              ...item,',
        '              quantity: 1,',
        '              cost: isHours ? amount : parsed,',
        '              task_hours: isHours ? parsed : hours,',
        '              manual_total: true,',
        '            });',
        '          }}',
        '        />',
        '      );',
        '    }')],
  ]],
];

let changed = 0;
for (const [relative, replacements] of patches) {
  const target = join(root, relative);
  assert(existsSync(target), 'Missing upstream file: ' + relative);
  const original = readFileSync(target, 'utf8');
  let updated = original;
  for (const [before, after] of replacements) {
    const occurrences = updated.split(before).length - 1;
    assert.equal(occurrences, 1,
      relative + ': expected precisely one matching anchor, got ' + occurrences + ': ' + before);
    updated = updated.replace(before, after);
  }
  assert.notEqual(updated, original, 'No changes in ' + relative);
  writeFileSync(target, updated);
  console.log('Updated: ' + relative);
  changed++;
}
assert.equal(changed, 7);
console.log('React quote manual-total modifications prepared (7 files).');
