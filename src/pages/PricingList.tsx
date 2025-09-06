import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import MultiSelect from '@/components/ui/multi-select';
import { PRICING, CustomerType } from '@/data/pricing';

function normalize(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  const num = Number(String(val).replace(/[^\d.-]/g, ''));
  return isNaN(num) ? null : num;
}

export default function PricingList() {
  const [sizes, setSizes] = useState<string[]>([]);
  const [customers, setCustomers] = useState<CustomerType[]>([] as any);
  const [levelFilter, setLevelFilter] = useState<string[]>([]);
  const allSizes = useMemo(() => Array.from(new Set(PRICING.map(p => p['المقاس']))), []);
  const allCustomers = useMemo(() => Array.from(new Set(PRICING.map(p => p['الزبون'] as CustomerType))), []);
  const allLevels = useMemo(() => Array.from(new Set(PRICING.map(p => p['المستوى']))), []);

  const rows = PRICING.filter(r =>
    (sizes.length === 0 || sizes.includes(r['المقاس'])) &&
    (customers.length === 0 || customers.includes(r['الزبون'] as CustomerType)) &&
    (levelFilter.length === 0 || levelFilter.includes(r['المستوى']))
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-0 shadow-card">
        <CardHeader>
          <CardTitle>قائمة الأسعار</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <MultiSelect options={allSizes.map(s => ({label: s, value: s}))} value={sizes} onChange={setSizes} placeholder="المقاسات" />
            <MultiSelect options={allCustomers.map(s => ({label: s, value: s}))} value={customers as any} onChange={setCustomers as any} placeholder="نوع الزبون" />
            <MultiSelect options={allLevels.map(s => ({label: s, value: s}))} value={levelFilter} onChange={setLevelFilter} placeholder="المستوى" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-right">
                  <th className="p-2">المقاس</th>
                  <th className="p-2">المستوى</th>
                  <th className="p-2">الزبون</th>
                  <th className="p-2">شهر واحد</th>
                  <th className="p-2">2 أشهر</th>
                  <th className="p-2">3 أشهر</th>
                  <th className="p-2">6 أشهر</th>
                  <th className="p-2">سنة كاملة</th>
                  <th className="p-2">يوم واحد</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-background/50">
                    <td className="p-2 font-medium">{r['المقاس']}</td>
                    <td className="p-2">{r['المستوى']}</td>
                    <td className="p-2">{r['الزبون']}</td>
                    <td className="p-2">{normalize(r['شهر واحد'])?.toLocaleString() || '-'}</td>
                    <td className="p-2">{normalize(r['2 أشهر'])?.toLocaleString() || '-'}</td>
                    <td className="p-2">{normalize(r['3 أشهر'])?.toLocaleString() || '-'}</td>
                    <td className="p-2">{normalize(r['6 أشهر'])?.toLocaleString() || '-'}</td>
                    <td className="p-2">{normalize(r['سنة كاملة'])?.toLocaleString() || '-'}</td>
                    <td className="p-2">{normalize(r['يوم واحد'])?.toLocaleString() || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
