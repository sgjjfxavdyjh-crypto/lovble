import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Billboard } from '@/types';
import { CustomerType, CUSTOMERS, getPriceFor } from '@/data/pricing';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items: Billboard[];
  monthsById: Record<string, number>;
  customerById: Record<string, CustomerType>;
};

function format(n: number | null | undefined) {
  return (n ?? 0).toLocaleString();
}

function buildInvoiceHtml(props: Props) {
  const { items, monthsById, customerById } = props;
  const rows = items.map((b) => {
    const months = monthsById[b.id] || 1;
    const customer = customerById[b.id] || CUSTOMERS[0];
    const unit = getPriceFor(b.size, (b as any).level, customer, months) ?? 0;
    const total = unit; // الأسعار لدينا حسب الباقة كاملة
    return { b, months, customer, unit, total };
  });
  const grand = rows.reduce((s, r) => s + r.total, 0);

  const rowsHtml = rows.map(({ b, months, customer, unit, total }) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${b.id}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right"><img src="${b.image || '/placeholder.svg'}" alt="${b.name}" style="height:64px;border-radius:8px" /></td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${b.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${b.size}${(b as any).level ? ' / ' + (b as any).level : ''}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${months}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${format(unit)} د.ل</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${format(total)} د.ل</td>
    </tr>
  `).join('');

  return `<!doctype html>
  <html lang="ar" dir="rtl"><head>
    <meta charset="utf-8" />
    <title>فاتورة اللوحات</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body{font-family:'Cairo','Tajawal',system-ui,sans-serif;color:#111}
      .container{max-width:960px;margin:24px auto;padding:16px}
      .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
      .title{font-weight:700;font-size:20px}
      table{width:100%;border-collapse:collapse}
      th{background:#f7f7f7;padding:8px;text-align:right;border-bottom:1px solid #eee}
      tfoot td{font-weight:700}
      .meta{color:#666;font-size:12px}
      .actions{margin-top:16px}
    </style>
  </head><body>
    <div class="container">
      <div class="header">
        <div class="title">فاتورة اللوحات المختارة</div>
        <div class="meta">التاريخ: ${new Date().toLocaleDateString('ar-LY')}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>الكود</th>
            <th>الصورة</th>
            <th>الوصف</th>
            <th>المقاس/المستوى</th>
            <th>الباقة (أشهر)</th>
            <th>السعر</th>
            <th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="6" style="padding:8px;text-align:left">الإجمالي الكلي</td>
            <td style="padding:8px;text-align:right">${format(grand)} د.ل</td>
          </tr>
        </tfoot>
      </table>
      <div class="actions">
        <button onclick="window.print()" style="padding:8px 16px;border:1px solid #ddd;border-radius:8px;background:#111;color:#fff">طباعة</button>
      </div>
    </div>
  </body></html>`;
}

export default function InvoiceDialog(props: Props) {
  const { open, onOpenChange, items } = props;
  const grand = items.reduce((s, b) => s + 0, 0);
  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(buildInvoiceHtml(props));
    win.document.close();
    win.focus();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>فاتورة اللوحات المختارة</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto">
          <div className="text-sm text-muted-foreground mb-3">راجع تفاصيل اللوحات ثم اطبع الفاتورة.</div>
          <Button onClick={handlePrint} className="bg-primary text-primary-foreground">طباعة</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
