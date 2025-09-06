import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import MultiSelect from '@/components/ui/multi-select';
import { PRICING, CustomerType } from '@/data/pricing';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

type SourceRow = Record<string, any> & { id: number | string };

function normalize(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  const num = Number(String(val).replace(/[^0-9.\-]/g, ''));
  return isNaN(num) ? null : num;
}

export default function PricingList() {
  const [sizes, setSizes] = useState<string[]>([]);
  const [customers, setCustomers] = useState<CustomerType[]>([] as any);
  const [levelFilter, setLevelFilter] = useState<string[]>([]);
  const [dbPricing, setDbPricing] = useState<SourceRow[] | null>(null);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editedRow, setEditedRow] = useState<Record<string, any> | null>(null);
  const [loadingSave, setLoadingSave] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data, error } = await supabase.from('pricing').select('*');
        if (!mounted) return;
        if (!error && data && Array.isArray(data) && data.length > 0) {
          setDbPricing(data as SourceRow[]);
        }
      } catch (e) {
        // ignore
      }
    };
    load();
    return () => { mounted = false };
  }, []);

  const source = dbPricing || (PRICING as any[]);

  const allSizes = useMemo(() => Array.from(new Set(source.map(p => p['size'] || p['المقاس']))).filter(Boolean), [source]);
  const allCustomers = useMemo(() => Array.from(new Set(source.map(p => p['Customer_Category'] || p['الزبون']))).filter(Boolean) as CustomerType[], [source]);
  const allLevels = useMemo(() => Array.from(new Set(source.map(p => p['Billboard_Level'] || p['المستوى']))).filter(Boolean), [source]);

  const rows = source.filter(r =>
    (sizes.length === 0 || sizes.includes(r['size'] || r['المقاس'])) &&
    (customers.length === 0 || customers.includes((r['Customer_Category'] || r['الزبون']) as CustomerType)) &&
    (levelFilter.length === 0 || levelFilter.includes(r['Billboard_Level'] || r['المستوى']))
  );

  // group by size -> level
  const grouped = useMemo(() => {
    const map = new Map<string, Map<string, SourceRow[]>>();
    rows.forEach(r => {
      const size = (r['size'] || r['المقاس'] || '—') as string;
      const level = (r['Billboard_Level'] || r['المستوى'] || '—') as string;
      if (!map.has(size)) map.set(size, new Map());
      const levelMap = map.get(size)!;
      if (!levelMap.has(level)) levelMap.set(level, []);
      levelMap.get(level)!.push(r);
    });
    return map;
  }, [rows]);

  const startEdit = (row: SourceRow) => {
    setEditingId(row.id);
    setEditedRow({ ...row });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditedRow(null);
  };

  const handleSave = async () => {
    if (!editedRow || editingId == null) return;
    setLoadingSave(true);
    try {
      // Prepare payload by mapping expected DB columns
      const payload: Record<string, any> = {};
      // try to map keys from editedRow (accept both local and db naming)
      const numericKeys = ['One_Month','2_Months','3_Months','6_Months','Full_Year','One_Day','شهر واحد','2 أشهر','3 أشهر','6 أشهر','سنة كاملة','يوم واحد'];
      Object.keys(editedRow).forEach(k => {
        if (numericKeys.includes(k)) {
          payload[k] = normalize(editedRow[k]);
        } else if (['size','Billboard_Level','Customer_Category'].includes(k)) {
          payload[k] = editedRow[k];
        }
      });

      // If using DB source, perform update
      if (dbPricing) {
        const { error } = await supabase.from('pricing').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('تم حفظ الأسعار');
        // refresh
        const { data } = await supabase.from('pricing').select('*');
        setDbPricing(data as SourceRow[]);
      } else {
        // when using static PRICING fallback, just update local state
        setDbPricing((prev) => {
          const copy = (prev || PRICING as any[]).map(r => r.id === editingId ? { ...r, ...editedRow } : r);
          return copy as SourceRow[];
        });
        toast.success('تم تعديل السعر محلياً (لا توجد قاعدة بيانات)');
      }
    } catch (e: any) {
      toast.error(e?.message || 'فشل الحفظ');
    } finally {
      setLoadingSave(false);
      cancelEdit();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-0 shadow-card">
        <CardHeader>
          <CardTitle>قائمة الأسعار (منظمة)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
            <MultiSelect options={allSizes.map(s => ({ label: s, value: s }))} value={sizes} onChange={setSizes} placeholder="المقاسات" />
            <MultiSelect options={allCustomers.map(s => ({ label: s, value: s }))} value={customers as any} onChange={setCustomers as any} placeholder="نوع الزبون" />
            <MultiSelect options={allLevels.map(s => ({ label: s, value: s }))} value={levelFilter} onChange={setLevelFilter} placeholder="المستوى" />
          </div>

          {Array.from(grouped.entries()).map(([size, levelMap]) => (
            <div key={size} className="mb-4">
              <h3 className="text-lg font-semibold mb-2">المقاس: {size}</h3>
              {Array.from(levelMap.entries()).map(([level, entries]) => (
                <div key={level} className="mb-3 border rounded-lg p-3 bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">المستوى: {level}</div>
                    <div className="text-sm text-muted-foreground">{entries.length} بند</div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-right">
                          <th className="p-2 text-right">الزبون</th>
                          <th className="p-2">شهر</th>
                          <th className="p-2">2 أشهر</th>
                          <th className="p-2">3 أشهر</th>
                          <th className="p-2">6 أشهر</th>
                          <th className="p-2">سنة</th>
                          <th className="p-2">يوم</th>
                          <th className="p-2">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map(row => (
                          <tr key={row.id} className="border-b hover:bg-background/50">
                            <td className="p-2 font-medium text-right">{row['Customer_Category'] || row['الزبون']}</td>
                            <td className="p-2">
                              {editingId === row.id ? (
                                <Input value={editedRow?.['One_Month'] ?? editedRow?.['شهر واحد'] ?? normalize(row['One_Month'] ?? row['شهر واحد']) ?? ''}
                                  onChange={(e) => setEditedRow(prev => ({ ...(prev || {}), ['One_Month']: e.target.value }))} />
                              ) : (normalize(row['One_Month'] ?? row['شهر واحد'])?.toLocaleString() || '-')}
                            </td>
                            <td className="p-2">
                              {editingId === row.id ? (
                                <Input value={editedRow?.['2_Months'] ?? editedRow?.['2 أشهر'] ?? normalize(row['2_Months'] ?? row['2 أشهر']) ?? ''}
                                  onChange={(e) => setEditedRow(prev => ({ ...(prev || {}), ['2_Months']: e.target.value }))} />
                              ) : (normalize(row['2_Months'] ?? row['2 أشهر'])?.toLocaleString() || '-')}
                            </td>
                            <td className="p-2">
                              {editingId === row.id ? (
                                <Input value={editedRow?.['3_Months'] ?? editedRow?.['3 أشهر'] ?? normalize(row['3_Months'] ?? row['3 أشهر']) ?? ''}
                                  onChange={(e) => setEditedRow(prev => ({ ...(prev || {}), ['3_Months']: e.target.value }))} />
                              ) : (normalize(row['3_Months'] ?? row['3 أشهر'])?.toLocaleString() || '-')}
                            </td>
                            <td className="p-2">
                              {editingId === row.id ? (
                                <Input value={editedRow?.['6_Months'] ?? editedRow?.['6 أشهر'] ?? normalize(row['6_Months'] ?? row['6 أشهر']) ?? ''}
                                  onChange={(e) => setEditedRow(prev => ({ ...(prev || {}), ['6_Months']: e.target.value }))} />
                              ) : (normalize(row['6_Months'] ?? row['6 أشهر'])?.toLocaleString() || '-')}
                            </td>
                            <td className="p-2">
                              {editingId === row.id ? (
                                <Input value={editedRow?.['Full_Year'] ?? editedRow?.['سنة كاملة'] ?? normalize(row['Full_Year'] ?? row['سنة كاملة']) ?? ''}
                                  onChange={(e) => setEditedRow(prev => ({ ...(prev || {}), ['Full_Year']: e.target.value }))} />
                              ) : (normalize(row['Full_Year'] ?? row['سنة كاملة'])?.toLocaleString() || '-')}
                            </td>
                            <td className="p-2">
                              {editingId === row.id ? (
                                <Input value={editedRow?.['One_Day'] ?? editedRow?.['يوم واحد'] ?? normalize(row['One_Day'] ?? row['يوم واحد']) ?? ''}
                                  onChange={(e) => setEditedRow(prev => ({ ...(prev || {}), ['One_Day']: e.target.value }))} />
                              ) : (normalize(row['One_Day'] ?? row['يوم واحد'])?.toLocaleString() || '-')}
                            </td>
                            <td className="p-2">
                              {editingId === row.id ? (
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={handleSave} disabled={loadingSave}>حفظ</Button>
                                  <Button size="sm" variant="outline" onClick={cancelEdit}>إلغاء</Button>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => startEdit(row)}>تعديل</Button>
                                  <Button size="sm" variant="ghost" onClick={() => {
                                    // quick duplicate to new editable row
                                    startEdit(row);
                                  }}>نسخ</Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {rows.length === 0 && (
            <div className="text-muted-foreground">لا توجد أسعار مطابقة للفلتر</div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
