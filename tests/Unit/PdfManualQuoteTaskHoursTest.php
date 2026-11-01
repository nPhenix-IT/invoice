<?php

/**
 * Regression tests for manually-priced quote task hours in PDF output.
 */

namespace Tests\Unit;

use App\Services\Pdf\PdfBuilder;
use Tests\TestCase;

class PdfManualQuoteTaskHoursTest extends TestCase
{
    public function test_manual_quote_uses_actual_hours_not_billing_quantity(): void
    {
        $item = (object) [
            'type_id' => '2',
            'quantity' => 1,
            'cost' => 1735520,
            'task_hours' => 336,
            'manual_total' => true,
        ];

        $this->assertSame(336.0, PdfBuilder::taskHoursForPdf($item));
        $this->assertSame(1735520, $item->quantity * $item->cost);
    }

    public function test_legacy_hourly_task_keeps_original_hours(): void
    {
        $item = (object) [
            'type_id' => '2',
            'quantity' => 3,
            'cost' => 10000,
            'manual_total' => false,
            'task_hours' => 336,
        ];

        $this->assertSame(3.0, PdfBuilder::taskHoursForPdf($item));
        $this->assertSame(30000, $item->quantity * $item->cost);
    }

    public function test_manual_quote_allows_zero_hours_without_changing_amount(): void
    {
        $item = (object) [
            'type_id' => '2',
            'quantity' => 1,
            'cost' => 1735520,
            'task_hours' => 0,
            'manual_total' => true,
        ];

        $this->assertSame(0.0, PdfBuilder::taskHoursForPdf($item));
        $this->assertSame(1735520, $item->quantity * $item->cost);
    }
}
