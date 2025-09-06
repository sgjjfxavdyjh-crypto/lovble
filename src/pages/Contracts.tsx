import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { getPriceFor } from '@/data/pricing';

export default function Contracts() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // form
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);

  // created contracts list (local or from DB)
  const [contracts, setContracts] = useState<any[]>([]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        const mapped = data.map((r:any) => ({
          id: r.id,
          client: r.user_id || r.client || '—',
          billboards: Array.isArray(r.billboard_ids) ? r.billboard_ids : (r.billboards || []),
          startDate: r.start_date || r.startDate || '',
          endDate: r.end_date || r.endDate || '',
          amount: typeof r.total_price === 'number' ? r.total_price : Number(String(r.total_price || r.amount || 0).replace(/[^0-9.-]/g, '')) || 0,
          status: r.status || 'pending'
        }));
        setBookings(mapped);
      } else {
        setBookings([]);
      }
    } catch (e:any) {
      console.error(e);
      toast.error('فشل جلب الحجوزات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const filteredBookings = useMemo(() => bookings.filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    return String(b.client || '').toLowerCase().includes(q) || (b.billboards||[]).join(', ').toLowerCase().includes(q) || String(b.id).includes(q);
  }), [bookings, search]);

  useEffect(() => {
    // recalc final price when selected booking or discount changes
    const b = bookings.find(x => x.id === selectedBookingId);
    if (!b) { setFinalPrice(null); return; }
    const base = Number(b.amount) || 0;
    const discounted = base - (base * (discountPercent || 0) / 100);
    setFinalPrice(Math.max(0, Math.round(discounted)));
  }, [selectedBookingId, discountPercent, bookings]);

  const handleCreateContract = async () => {
    if (!selectedBookingId) { toast.error('اختر حجزًا أولاً'); return; }
    const booking = bookings.find(b => b.id === selectedBookingId);
    if (!booking) { toast.error('الحجز غير موجود'); return; }

    const payload = {
      booking_id: booking.id,
      client: booking.client,
      billboards: booking.billboards,
      start_date: booking.startDate,
      end_date: booking.endDate,
      base_price: booking.amount,
      discount_percent: discountPercent,
      final_price: finalPrice,
      created_at: new Date().toISOString()
    };

    try {
      // try to insert into contracts table if exists
      const { error } = await supabase.from('contracts').insert(payload);
      if (!error) {
        toast.success('تم إنشاء العقد وحفظه في قاعدة البيانات');
        setContracts(prev => [payload, ...prev]);
        return;
      }

      // if error, fallback to local only and show message
      console.warn('contracts insert error', error);
      toast.success('تم إنشاء العقد محلياً (الجدول غير موجود في DB)');
      setContracts(prev => [payload, ...prev]);
    } catch (e:any) {
      console.error(e);
      toast.error('فشل إنشاء العقد');
    }
  };

  const applyDiscount = (pct:number) => setDiscountPercent(Math.max(0, Math.min(100, pct)));

  // Booking builder state
  const [billboards, setBillboards] = useState<any[]>([]);
  const [selectedBillboards, setSelectedBillboards] = useState<string[]>([]);
  const [bookingStart, setBookingStart] = useState<string>('');
  const [bookingMonths, setBookingMonths] = useState<number>(1);
  const [customerType, setCustomerType] = useState<string>('عادي');
  const [discount, setDiscount] = useState<number>(0);

  // nicer options for months and customer types
  const monthsOptions = [
    { value: 1, label: '1 شهر' },
    { value: 2, label: '2 أشهر' },
    { value: 3, label: '3 أشهر' },
    { value: 6, label: '6 أشهر' },
    { value: 12, label: 'سنة كاملة' }
  ];
  const customerTypes = ['عادي','المدينة','مسوق','شركات'];

  // filters for municipality (city) and size
  const [sizesSelected, setSizesSelected] = useState<string[]>([]);
  const [citiesSelected, setCitiesSelected] = useState<string[]>([]);

  // paging for billboards (show max 20 per page)
  const PAGE_SIZE = 20;
  const [pageIndex, setPageIndex] = useState(0);

  // clients
  const [clients, setClients] = useState<{ id: string; name: string; email?: string; phone?: string }[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState<{ id?: string; name: string; email: string; phone: string }>({ name: '', email: '', phone: '' });

  const selectedAreaRef = useRef<HTMLDivElement | null>(null);
  const listTopRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: profiles } = await supabase.from('profiles').select('id,name,email,phone').eq('role', 'client');
        if (mounted && Array.isArray(profiles)) setClients(profiles.map((p:any)=>({ id: p.id, name: p.name || p.email || p.id, email: p.email, phone: p.phone })));
      } catch (e) {
        // ignore
      }
    })();

    (async () => {
      try {
        const data = await import('@/services/billboardService').then(m => m.loadBillboards());
        if (!mounted) return;
        setBillboards(data);

        // Try loading contracts CSV from public folder and map contract numbers to billboards
        try {
          const resp = await fetch('/contracts.csv');
          if (resp.ok) {
            const csvText = await resp.text();
            const lines = csvText.split('\n').filter(l=>l.trim());
            if (lines.length > 1) {
              const headers = lines[0].split(',').map(h=>h.trim().replace(/"/g,''));
              const parsed: any[] = [];
              for (let i=1;i<lines.length;i++){
                const line = lines[i];
                // simple CSV parse (handles no embedded commas)
                const values = [];
                let cur = '';
                let inQuotes = false;
                for (let j=0;j<line.length;j++){
                  const ch = line[j];
                  if (ch === '"') { inQuotes = !inQuotes; }
                  else if (ch === ',' && !inQuotes) { values.push(cur); cur=''; }
                  else { cur += ch; }
                }
                values.push(cur);
                const obj:any = {};
                headers.forEach((h, idx) => { obj[h] = (values[idx]||'').trim().replace(/^"|"$/g,''); });
                parsed.push(obj);
              }

              // create map by ad type (lowercased)
              const byAdType = new Map<string, any>();
              parsed.forEach(r => {
                const ad = (r['Ad Type'] || r['AdType'] || r['اد نوع'] || '').toString().trim().toLowerCase();
                if (ad) byAdType.set(ad, r);
              });

              // map to billboards: try match by adType then by name includes
              setBillboards(prev => prev.map(b => {
                const found = byAdType.get((b.adType||'').toString().toLowerCase()) || Array.from(byAdType.values()).find(r => (r['Ad Type']||'').toString().toLowerCase().includes((b.name||'').toString().toLowerCase()));
                if (found) {
                  return { ...b, contractNumber: found['Contract Number'] || found['Contract_Number'] || found['ContractNumber'] || b.contractNumber };
                }
                return b;
              }));

              // set contracts state
              const mappedContracts = parsed.map(r => ({
                contractNumber: r['Contract Number'] || r['Contract_Number'] || r['رقم العقد'] || '',
                customerName: r['Customer Name'] || r['Customer_Name'] || r['اسم الزبون'] || '',
                adType: r['Ad Type'] || r['AdType'] || '',
                startDate: r['Contract Date'] || r['Contract_Date'] || r['تاريخ العقد'] || '',
                endDate: r['End Date'] || r['End_Date'] || r['تاريخ انتهاء الايجار'] || '',
                total: r['Total'] || r['Total Rent'] || r['Total_Rent'] || r['السعر'] || ''
              }));

              setContracts(mappedContracts);
            }
          }
        } catch (e) {
          console.warn('No contracts CSV loaded', e);
        }

      } catch (e) {
        console.error('Failed to load billboards', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const allSizes = useMemo(() => Array.from(new Set(billboards.map(b => b.size).filter(Boolean))), [billboards]);
  const allCities = useMemo(() => Array.from(new Set(billboards.map(b => b.city).filter(Boolean))), [billboards]);

  const toggleSelect = (id: string) => {
    setSelectedBillboards(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      // after selecting, scroll selected area into view
      setTimeout(() => selectedAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      return next;
    });
  };

  const computedBase = useMemo(() => {
    return selectedBillboards.reduce((sum, id) => {
      const b = billboards.find(bb => bb.id === id);
      if (!b) return sum;
      // price per month times months
      const months = bookingMonths || 1;
      return sum + ((b.price || 0) * months);
    }, 0);
  }, [selectedBillboards, billboards, bookingMonths]);

  const filteredBillboards = useMemo(() => billboards.filter(b =>
    b.status === 'available' &&
    (search === '' || b.name.toLowerCase().includes(search.toLowerCase()) || b.city.toLowerCase().includes(search.toLowerCase())) &&
    (sizesSelected.length === 0 || sizesSelected.includes(b.size)) &&
    (citiesSelected.length === 0 || citiesSelected.includes(b.city))
  ), [billboards, search, sizesSelected, citiesSelected]);
  const totalPages = Math.max(1, Math.ceil(filteredBillboards.length / PAGE_SIZE));
  const visibleBillboards = filteredBillboards.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE);

  const computedFinal = useMemo(() => {
    const d = Math.max(0, Math.min(100, discount || 0));
    const after = computedBase - (computedBase * d / 100);
    return Math.round(after);
  }, [computedBase, discount]);

  const createBookingFromSelection = async () => {
    if (selectedBillboards.length === 0) { toast.error('اختر لوحة واحدة على الأقل'); return; }
    if (!bookingStart) { toast.error('اختر تاريخ البدء'); return; }

    const start = new Date(bookingStart);
    const end = new Date(start);
    end.setMonth(end.getMonth() + bookingMonths);

    const payload: any = {
      billboard_ids: selectedBillboards,
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
      total_price: computedFinal,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    if (selectedClientId) payload.user_id = selectedClientId;

    try {
      const { error } = await supabase.from('bookings').insert(payload);
      if (error) throw error;
      toast.success('تم إنشاء طلب الحجز');
      // clear selection
      setSelectedBillboards([]);
      setSelectedClientId(null);
      setBookingStart('');
      setBookingMonths(1);
      setDiscount(0);
      // refresh bookings and contracts lists
      fetchBookings();
    } catch (e:any) {
      toast.error(e?.message || 'فشل إنشاء الحجز');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* left: billboard gallery and selector (takes full width when contracts list present) */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-card border-0 shadow-card mb-4">
            <CardHeader>
              <CardTitle>حجز اللوحات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 mb-4">
                <Input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="ابحث عن لوحة أو المدينة..." />
                <Button onClick={() => { setSearch(''); setSizesSelected([]); setCitiesSelected([]); setPageIndex(0); }}>مسح</Button>
                <Select value={String(bookingMonths)} onValueChange={(v)=> setBookingMonths(Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="مدة (شهور)" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthsOptions.map(m => (
                      <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={customerType} onValueChange={(v)=> setCustomerType(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="نوع الزبو��" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerTypes.map(ct => <SelectItem key={ct} value={ct}>{ct}</SelectItem>)}
                  </SelectContent>
                </Select>

                <div className="flex flex-col">
                  <label className="text-xs text-muted-foreground mb-1">المقاسات</label>
                  <select multiple className="p-2 border rounded h-24" value={sizesSelected} onChange={(e:any)=>{ const opts = Array.from(e.target.selectedOptions).map((o:any)=>o.value); setSizesSelected(opts); setPageIndex(0); }}>
                    {allSizes.sort().map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-muted-foreground mb-1">البلديات</label>
                  <select multiple className="p-2 border rounded h-24" value={citiesSelected} onChange={(e:any)=>{ const opts = Array.from(e.target.selectedOptions).map((o:any)=>o.value); setCitiesSelected(opts); setPageIndex(0); }}>
                    {allCities.sort().map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* selected filter chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {sizesSelected.map(s => (
                  <button key={`sz-${s}`} onClick={()=>{ setSizesSelected(prev=>prev.filter(x=>x!==s)); setPageIndex(0); }} className="px-2 py-1 text-xs border rounded bg-muted">{s} ✕</button>
                ))}
                {citiesSelected.map(c => (
                  <button key={`ct-${c}`} onClick={()=>{ setCitiesSelected(prev=>prev.filter(x=>x!==c)); setPageIndex(0); }} className="px-2 py-1 text-xs border rounded bg-muted">{c} ✕</button>
                ))}
                {sizesSelected.length===0 && citiesSelected.length===0 && (<div className="text-xs text-muted-foreground">لا توجد فلاتر مفعّلة</div>)}
              </div>

              {/* Selected area (top) */}
              <div ref={selectedAreaRef} className="mb-4">
                <div className="text-sm text-muted-foreground mb-2">اللوحات المختارة ({selectedBillboards.length})</div>
                {selectedBillboards.length === 0 ? (
                  <div className="text-muted-foreground">لم يتم اختيار أي لوحات</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    {selectedBillboards.map(id => {
                      const b = billboards.find(bb => bb.id === id);
                      if (!b) return null;
                      return (
                        <div key={id} className="p-2 border rounded bg-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img src={b.image} className="w-16 h-12 object-cover rounded" alt={b.name} />
                            <div>
                              <div className="font-medium">{b.name}</div>
                              <div className="text-xs text-muted-foreground">{b.city} • {b.size}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold">{((b.price||0)*bookingMonths).toLocaleString()} د.ل</div>
                            <Button size="sm" variant="ghost" onClick={()=> toggleSelect(id)}>إزالة</Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Available billboards list (paged, max 20) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleBillboards.map(b => (
                  <div key={b.id} className={`p-3 border rounded bg-white/5 cursor-pointer ${selectedBillboards.includes(b.id) ? 'ring-2 ring-primary bg-white/3' : ''}`} onClick={() => toggleSelect(b.id)}>
                    <div className="flex items-center gap-3">
                      <img src={b.image} alt={b.name} className="w-20 h-14 object-cover rounded" />
                      <div className="flex-1">
                        <div className="font-medium">{b.name}</div>
                        <div className="text-xs text-muted-foreground">{b.city} • {b.size} • مستوى {b.level}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary">{(b.price || 0).toLocaleString()} د.ل / شهر</div>
                        <div className="text-xs text-muted-foreground">تنفيذ: {(b.installationPrice||0).toLocaleString()} د.ل</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">الصفحة {pageIndex+1} من {totalPages}</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPageIndex(p => Math.max(0, p-1))} disabled={pageIndex===0}>السابق</Button>
                  <Button variant="outline" size="sm" onClick={() => setPageIndex(p => Math.min(totalPages-1, p+1))} disabled={pageIndex>=totalPages-1}>التالي</Button>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* contracts list (existing) */}
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader>
              <CardTitle>قائمة العقود</CardTitle>
            </CardHeader>
            <CardContent>
              {contracts.length === 0 ? <div className="text-muted-foreground">لا توجد عقود بعد</div> : (
                <div className="overflow-auto max-h-64">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-right">رقم العقد</th>
                        <th className="p-2 text-right">العميل</th>
                        <th className="p-2 text-right">نوع الإعلان</th>
                        <th className="p-2 text-right">تاريخ العقد</th>
                        <th className="p-2 text-right">تاريخ الانتهاء</th>
                        <th className="p-2 text-right">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contracts.map((c, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-2 text-right">{c.contractNumber ? `#${c.contractNumber}` : (c.booking_id ? `#${c.booking_id}` : '-')}</td>
                          <td className="p-2 text-right">{c.customerName || c.client || '-'}</td>
                          <td className="p-2 text-right">{c.adType || (c.billboards ? (c.billboards||[]).join(', ') : '-')}</td>
                          <td className="p-2 text-right">{c.startDate || c.start_date || '-'}</td>
                          <td className="p-2 text-right">{c.endDate || c.end_date || '-'}</td>
                          <td className="p-2 text-right font-semibold">{Number(c.total || c.final_price || c.base_price || 0).toLocaleString()} د.ل</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* right column: price preview and discount */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader>
              <CardTitle>نموذج الحجز</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">العميل</div>
                  <div className="flex gap-2">
                    <select className="w-full p-2 border rounded" value={selectedClientId || ''} onChange={(e)=>{ setSelectedClientId(e.target.value || null); }}>
                      <option value="">-- اختر زبون --</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.email?` • ${c.email}`:''}</option>)}
                    </select>
                    <Button onClick={()=> setShowNewClient(v=>!v)} variant="outline">عميل جديد</Button>
                  </div>
                  {showNewClient && (
                    <div className="mt-2 space-y-2">
                      <Input placeholder="اسم العميل" value={newClient.name} onChange={(e)=> setNewClient(p=>({...p, name: e.target.value}))} />
                      <Input placeholder="البريد الإلكتروني" value={newClient.email} onChange={(e)=> setNewClient(p=>({...p, email: e.target.value}))} />
                      <Input placeholder="الهاتف" value={newClient.phone} onChange={(e)=> setNewClient(p=>({...p, phone: e.target.value}))} />
                      <div className="flex gap-2">
                        <Button onClick={async ()=>{
                          try {
                            // generate uuid for profile id
                            const id = (window.crypto && (window.crypto as any).randomUUID) ? (window.crypto as any).randomUUID() : `id-${Date.now()}`;
                            const payload = { id, name: newClient.name || null, email: newClient.email || null, phone: newClient.phone || null, role: 'client' };
                            const { error } = await supabase.from('profiles').insert(payload);
                            if (error) throw error;
                            setClients(prev => [ { id, name: newClient.name, email: newClient.email, phone: newClient.phone }, ...prev ]);
                            setSelectedClientId(id);
                            setShowNewClient(false);
                            setNewClient({ name: '', email: '', phone: '' });
                            toast.success('تم إنشاء العميل');
                          } catch (e:any) {
                            toast.error(e?.message || 'فشل إنشاء العميل');
                          }
                        }}>حفظ العميل</Button>
                        <Button variant="outline" onClick={()=> setShowNewClient(false)}>إلغاء</Button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">تاري�� البدء</div>
                  <Input type="date" value={bookingStart} onChange={(e)=> setBookingStart(e.target.value)} />
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">اللوحات المختارة ({selectedBillboards.length})</div>
                  <div className="text-sm text-muted-foreground">{(selectedBillboards||[]).map(id=>{ const b=billboards.find(bb=>bb.id===id); return b?b.name: id; }).join(', ')}</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">المدة (شهور)</div>
                  <Select value={String(bookingMonths)} onValueChange={(v)=> setBookingMonths(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="مدة (شهور)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 شهر</SelectItem>
                      <SelectItem value="2">2 أشهر</SelectItem>
                      <SelectItem value="3">3 أشهر</SelectItem>
                      <SelectItem value="6">6 أشهر</SelectItem>
                      <SelectItem value="12">سنة كاملة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">خصم (%)</div>
                  <Input type="number" value={discount} onChange={(e)=> setDiscount(Number(e.target.value||0))} />
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">السعر الأساسي</div>
                  <div className="text-2xl font-bold">{computedBase.toLocaleString()} د.ل</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">السعر بعد الخصم</div>
                  <div className="text-2xl font-bold">{computedFinal.toLocaleString()} د.ل</div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" onClick={createBookingFromSelection}>إنشاء طلب حجز</Button>
                  <Button variant="outline" onClick={()=>{ setSelectedBillboards([]); setBookingStart(''); setBookingMonths(1); setDiscount(0); setSelectedClientId(null); }}>مسح</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
