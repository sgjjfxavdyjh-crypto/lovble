import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface PaymentRow {
  id: string;
  customer_id: string | null;
  customer_name: string;
  contract_number: string | null;
  amount: number | null;
  method: string | null;
  reference: string | null;
  notes: string | null;
  paid_at: string | null;
  entry_type: string | null;
}

export default function Customers() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [search, setSearch] = useState('');
  const [customer, setCustomer] = useState<string>('all');

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('customer_payments')
        .select('id,customer_id,customer_name,contract_number,amount,method,reference,notes,paid_at,entry_type')
        .order('paid_at', { ascending: false });
      if (!error) setRows((data || []) as any);
    })();
  }, []);

  const customers = useMemo(() => Array.from(new Set(rows.map(r => r.customer_name).filter(Boolean))), [rows]);

  const filtered = rows.filter(r => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [r.customer_name, r.contract_number, r.reference, r.notes].some(v => String(v || '').toLowerCase().includes(q));
    const matchesCustomer = customer === 'all' || r.customer_name === customer;
    return matchesSearch && matchesCustomer;
  });

  const totals = useMemo(() => {
    const byCustomer = new Map<string, number>();
    for (const r of rows) {
      const key = r.customer_name || '—';
      const prev = byCustomer.get(key) || 0;
      byCustomer.set(key, prev + (Number(r.amount) || 0));
    }
    return byCustomer;
  }, [rows]);

  const totalAll = Array.from(totals.values()).reduce((s,n)=>s+n,0);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-0 shadow-card">
        <CardHeader>
          <CardTitle>الزبائن — المدفوعات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <Input placeholder="ابحث بالزبون/العقد/مرجع" value={search} onChange={(e)=>setSearch(e.target.value)} />
            <Select value={customer} onValueChange={setCustomer}>
              <SelectTrigger><SelectValue placeholder="اختر الزبون" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الزبائن</SelectItem>
                {customers.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm text-muted-foreground">إجمالي المدفوعات: {totalAll.toLocaleString('ar-LY')} د.ل</div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الزبون</TableHead>
                  <TableHead>رقم العقد</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الطريقة</TableHead>
                  <TableHead>المرجع</TableHead>
                  <TableHead>تاريخ السداد</TableHead>
                  <TableHead>ملاحظات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.customer_name}</TableCell>
                    <TableCell>{r.contract_number || '—'}</TableCell>
                    <TableCell>{(Number(r.amount) || 0).toLocaleString('ar-LY')} د.ل</TableCell>
                    <TableCell>{r.method || '—'}</TableCell>
                    <TableCell>{r.reference || '—'}</TableCell>
                    <TableCell>{r.paid_at ? new Date(r.paid_at).toLocaleString('ar-LY') : '—'}</TableCell>
                    <TableCell className="max-w-[360px] truncate">{r.notes || '—'}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-6">لا توجد بيانات</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
