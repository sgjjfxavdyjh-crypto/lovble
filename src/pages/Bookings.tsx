import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Calendar, User, Filter, Plus, Search, Check, X, Eye, Edit } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';

const bookings = [
  {
    id: '1',
    client: 'محمد علي الحولة',
    company: 'شركة جرين للإعلان',
    billboards: ['لوحة 2'],
    startDate: '2025-01-01',
    endDate: '27-12-2025',
    amount: '86,400 د.ل',
    status: 'confirmed' as const,
    phone: '91-1234567 218+'
  },
  {
    id: '2',
    client: 'علي عمار',
    company: 'شركة بريد',
    billboards: ['لوحة 3'],
    startDate: '2025-05-24',
    endDate: '19-05-2026',
    amount: '132,000 د.ل',
    status: 'confirmed' as const,
    phone: '92-7654321 218+'
  },
  {
    id: '3',
    client: 'محمد البحلاق',
    company: '',
    billboards: ['لوحة 2'],
    startDate: '2025-02-01',
    endDate: '27-01-2026',
    amount: '75,600 د.ل',
    status: 'confirmed' as const,
    phone: '94-5555555 218+'
  },
  {
    id: '4',
    client: 'أحمد المصباحي',
    company: '',
    billboards: ['لوحة 2'],
    startDate: '2025-07-19',
    endDate: '15-01-2026',
    amount: '47,700 د.ل',
    status: 'pending' as const,
    phone: '93-9876543 218+'
  },
  {
    id: '5',
    client: 'إيهاب الجحادي',
    company: '',
    billboards: ['لوحة 2'],
    startDate: '2024-10-15',
    endDate: '10-10-2025',
    amount: '60,000 د.ل',
    status: 'confirmed' as const,
    phone: '95-1111111 218+'
  },
  {
    id: '6',
    client: 'عامر محمد سويد',
    company: '',
    billboards: ['لوحة 2'],
    startDate: '2025-08-05',
    endDate: '31-07-2026',
    amount: '52,800 د.ل',
    status: 'confirmed' as const,
    phone: '96-2222222 218+'
  }
];

const statistics = [
  { title: 'الإيرادات الشهرية', value: '406,800 د.ل', icon: DollarSign, color: 'text-primary' },
  { title: 'في الانتظار', value: '1', icon: Calendar, color: 'text-warning' },
  { title: 'حجوزات مؤكدة', value: '5', icon: Check, color: 'text-success' },
  { title: 'إجمالي الحجوزات', value: '6', icon: User, color: 'text-foreground' }
];

export default function Bookings() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-success/10 text-success border-success/20">مؤكد</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning border-warning/20">في الانتظار</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">مرفوض</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [viewing, setViewing] = useState<any | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<any>({ client: '', company: '', billboards: '', startDate: '', endDate: '', amount: '', status: 'pending', phone: '' });

  // contracts parsed from public CSV
  const [contracts, setContracts] = useState<any[]>([]);
  const [linking, setLinking] = useState<{ booking?: any; open: boolean }>({ open: false });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map((r: any) => ({
          id: r.id,
          client: r.user_id || r.client || '—',
          company: r.company || '',
          billboards: Array.isArray(r.billboard_ids) ? r.billboard_ids : (r.billboards || []),
          startDate: r.start_date || r.startDate || '',
          endDate: r.end_date || r.endDate || '',
          amount: typeof r.total_price === 'number' ? `${r.total_price.toLocaleString()} د.ل` : (r.total_price || r.amount || '—'),
          status: r.status || 'pending',
          phone: r.phone || ''
        }));
        setBookings(mapped);
      } else {
        setBookings([
          { id: '1', client: 'محمد علي الحولة', company: 'شركة جرين للإعلان', billboards: ['لوحة 2'], startDate: '2025-01-01', endDate: '27-12-2025', amount: '86,400 د.ل', status: 'confirmed', phone: '91-1234567 218+'},
          { id: '2', client: 'علي عمار', company: 'شركة بريد', billboards: ['لوحة 3'], startDate: '2025-05-24', endDate: '19-05-2026', amount: '132,000 د.ل', status: 'confirmed', phone: '92-7654321 218+'},
          { id: '3', client: 'محمد ال��حلاق', company: '', billboards: ['لوحة 2'], startDate: '2025-02-01', endDate: '27-01-2026', amount: '75,600 د.ل', status: 'confirmed', phone: '94-5555555 218+'},
          { id: '4', client: 'أحمد المصباحي', company: '', billboards: ['لوحة 2'], startDate: '2025-07-19', endDate: '15-01-2026', amount: '47,700 د.ل', status: 'pending', phone: '93-9876543 218+'},
          { id: '5', client: 'إيهاب الجحادي', company: '', billboards: ['لوحة 2'], startDate: '2024-10-15', endDate: '10-10-2025', amount: '60,000 د.ل', status: 'confirmed', phone: '95-1111111 218+'},
          { id: '6', client: 'عامر محمد سويد', company: '', billboards: ['لوحة 2'], startDate: '2025-08-05', endDate: '31-07-2026', amount: '52,800 د.ل', status: 'confirmed', phone: '96-2222222 218+'}
        ]);
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'خطأ', description: 'فشل في جلب الحجوزات', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); loadContractsCsv(); }, []);

  const loadContractsCsv = async () => {
    try {
      const resp = await fetch('/contracts.csv');
      if (!resp.ok) return;
      const text = await resp.text();
      const lines = text.split('\n').filter(l=>l.trim());
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map(h=>h.trim().replace(/"/g,''));
      const parsed:any[] = [];
      for (let i=1;i<lines.length;i++){
        const line = lines[i];
        const values:any[] = [];
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
      setContracts(parsed.map(r=>({ contractNumber: r['Contract Number']||r['Contract_Number']||'', customerName: r['Customer Name']||'', adType: r['Ad Type']||'', startDate: r['Contract Date']||'', endDate: r['End Date']||'', total: r['Total']||r['Total Rent']||'' })));
    } catch (e) {
      console.warn('No contracts csv', e);
    }
  };

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(String(b.client || '').toLowerCase().includes(q) || String(b.company || '').toLowerCase().includes(q) || (b.billboards || []).join(', ').toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [bookings, search, statusFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    switch (sortBy) {
      case 'date-desc': return copy.sort((a,b) => (b.startDate || '').localeCompare(a.startDate || ''));
      case 'date-asc': return copy.sort((a,b) => (a.startDate || '').localeCompare(b.startDate || ''));
      case 'amount-desc': return copy.sort((a,b) => Number(String(b.amount).replace(/[^0-9]/g, '')) - Number(String(a.amount).replace(/[^0-9]/g, '')));
      case 'amount-asc': return copy.sort((a,b) => Number(String(a.amount).replace(/[^0-9]/g, '')) - Number(String(b.amount).replace(/[^0-9]/g, '')));
      default: return copy;
    }
  }, [filtered, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPageSafe = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPageSafe-1)*PAGE_SIZE, currentPageSafe*PAGE_SIZE);

  const approveBooking = async (id: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', id);
      if (error) throw error;
      toast.success('تم قبول الحجز');
      fetchBookings();
    } catch (e: any) {
      toast.error(e?.message || 'فشل تحديث الحالة');
    }
  };

  const rejectBooking = async (id: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ status: 'rejected' }).eq('id', id);
      if (error) throw error;
      toast.success('تم رفض الحجز');
      fetchBookings();
    } catch (e: any) {
      toast.error(e?.message || 'فشل تحديث الحالة');
    }
  };

  // Generate printable contract and open print dialog
  const printContract = (b: any) => {
    try {
      const wnd = window.open('', '_blank', 'noopener,noreferrer');
      if (!wnd) {
        toast.error('فشل فتح نافذة الطباعة');
        return;
      }
      const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>عقد الحجز #${b.id}</title>
          <style>
            body{font-family: Arial, Helvetica, sans-serif; padding:20px; color:#111}
            h1{font-size:20px}
            .section{margin-bottom:16px}
            table{width:100%; border-collapse:collapse}
            td,th{padding:8px; border:1px solid #ddd}
          </style>
        </head>
        <body>
          <h1>عقد حجز رقم #${b.id}</h1>
          <div class="section"><strong>العميل:</strong> ${b.client || '-'} <br/> <strong>الشركة:</strong> ${b.company || '-'}</div>
          <div class="section"><strong>الفترة:</strong> ${b.startDate || '-'} إلى ${b.endDate || '-'}</div>
          <div class="section"><strong>اللوحات:</strong>
            <ul>${(b.billboards || []).map((bb:any)=>`<li>${bb}</li>`).join('')}</ul>
          </div>
          <div class="section"><strong>المبلغ:</strong> ${b.amount || '-'}</div>
          <div class="section"><strong>التوقيع:</strong><br/><br/>_______________________</div>
        <script>window.onload = function(){ setTimeout(()=>{ window.print(); }, 300); };</script>
        </body>
      </html>`;
      wnd.document.write(html);
      wnd.document.close();
    } catch (e:any) {
      toast.error(e?.message || 'فشل في تجهيز العقد للطباعة');
    }
  };

  // Send contract summary via WhatsApp (opens wa.me or web.whatsapp)
  const sendWhatsApp = (b: any) => {
    try {
      const phoneRaw = String(b.phone || '').replace(/[^0-9]/g, '');
      const phone = phoneRaw || '';
      const parts = [`عقد الحجز رقم #${b.id}`,
        `العميل: ${b.client || '-'}`,
        `الفترة: ${b.startDate || '-'} إلى ${b.endDate || '-'}`,
        `اللوحات: ${(b.billboards||[]).join(', ')}`,
        `المبلغ: ${b.amount || '-'}`
      ];
      const text = parts.join('%0A');
      if (phone) {
        // use wa.me link
        const url = `https://wa.me/${phone}?text=${text}`;
        window.open(url, '_blank');
      } else {
        // open web whatsapp with message only
        const url = `https://web.whatsapp.com/send?text=${text}`;
        window.open(url, '_blank');
      }
    } catch (e:any) {
      toast.error(e?.message || 'فشل فتح واتساب');
    }
  };

  return (
    <div className="space-y-6">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">الحجوزات</h1>
          <p className="text-muted-foreground">إدارة شاملة للوحات الإعلانية</p>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statistics.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-gradient-card border-0 shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* أدوات البحث والتصفية */}
      <Card className="bg-gradient-card border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            البحث في الحجوزات...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="ا��بحث في الحجوزات..." className="pr-10" />
            </div>

            <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="ترتيب بالتاريخ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">الأحدث أولاً</SelectItem>
                <SelectItem value="date-asc">الأقدم أولاً</SelectItem>
                <SelectItem value="amount-desc">المبلغ (الأعلى)</SelectItem>
                <SelectItem value="amount-asc">المبلغ (ا��أقل)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="confirmed">مؤكد</SelectItem>
                <SelectItem value="pending">في الانتظار</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSearch(''); setStatusFilter('all'); setSortBy('date-desc'); setPage(1); }}>مسح</Button>
              <Button size="sm" className="bg-gradient-primary text-white" onClick={() => navigate('/admin/contracts')}>
                <Plus className="h-4 w-4 ml-1" />
                جديد
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* قائمة الحجوزات */}
      <Card className="bg-gradient-card border-0 shadow-card">
        <CardHeader>
          <CardTitle>قائمة الحجوزات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-right">
                  <th className="text-right p-3 text-muted-foreground font-medium">الإجراءات</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">الحالة</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">المبلغ</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">التاريخ</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">اللوحات</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">العقد</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">العميل</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">رقم الحجز</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((booking) => (
                  <tr key={booking.id} className="border-b border-border/50 hover:bg-background/50 transition-smooth">
                    <td className="p-3">
                      <div className="flex gap-1 justify-start">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewing(booking)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(booking); setEditForm({ client: booking.client, company: booking.company, billboards: (booking.billboards||[]).join(', '), startDate: booking.startDate, endDate: booking.endDate, amount: booking.amount, status: booking.status, phone: booking.phone }); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {booking.status === 'pending' && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:text-success" onClick={() => approveBooking(booking.id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => rejectBooking(booking.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-3">{getStatusBadge(booking.status)}</td>
                    <td className="p-3">
                      <span className="font-semibold text-primary">{booking.amount}</span>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <div>{booking.startDate}</div>
                        <div className="text-muted-foreground text-xs">إلى {booking.endDate}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{(booking.billboards||[]).join(', ')}</span>
                    </td>
                    <td className="p-3">
                      {/* contract column: try find contract matching booking */}
                      <div>
                        {(() => {
                          const found = contracts.find(c => {
                            if (!c) return false;
                            const ad = (c.adType||'').toString().toLowerCase();
                            const bstr = (booking.billboards||[]).join(' ').toLowerCase();
                            if (ad && bstr.includes(ad)) return true;
                            if (c.customerName && c.customerName === booking.client) return true;
                            return false;
                          });
                          if (found) return <div className="text-sm font-medium text-primary">#{found.contractNumber} - {found.adType}</div>;
                          return <div className="text-xs text-muted-foreground">غير مرتبط <button className="ml-2 text-xs underline" onClick={() => setLinking({ open: true, booking })}>ربط بعقد</button></div>;
                        })()}
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{booking.client}</div>
                        {booking.company && (
                          <div className="text-sm text-muted-foreground">{booking.company}</div>
                        )}
                        <div className="text-xs text-muted-foreground">{booking.phone}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-sm text-primary">#{booking.id}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">إظهار {((currentPageSafe-1)*PAGE_SIZE)+1} - {Math.min(currentPageSafe*PAGE_SIZE, sorted.length)} من {sorted.length}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={currentPageSafe===1}>السابق</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={currentPageSafe===totalPages}>التالي</Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => { if (!o) setViewing(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تفاصيل الحجز</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3">
              <div><strong>العميل:</strong> {viewing.client}</div>
              <div><strong>اللوحات:</strong> {(viewing.billboards||[]).join(', ')}</div>
              <div><strong>الفترة:</strong> {viewing.startDate} إلى {viewing.endDate}</div>
              <div><strong>المبلغ:</strong> {viewing.amount}</div>
              <div><strong>الحالة:</strong> {getStatusBadge(viewing.status)}</div>
            </div>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setViewing(null)}>إغلاق</Button>
            <Button onClick={() => printContract(viewing)}>طباعة العقد</Button>
            <Button onClick={() => sendWhatsApp(viewing)}>إرسال عبر واتساب</Button>
            {viewing?.status === 'pending' && (
              <>
                <Button onClick={() => { approveBooking(viewing.id); setViewing(null); }}>قبول</Button>
                <Button variant="destructive" onClick={() => { rejectBooking(viewing.id); setViewing(null); }}>رفض</Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) { setEditing(null); setEditForm(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الحجز</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-3">
              <Input value={editForm.client} onChange={(e) => setEditForm((p:any)=>({ ...p, client: e.target.value }))} placeholder="اسم العميل" />
              <Input value={editForm.company} onChange={(e) => setEditForm((p:any)=>({ ...p, company: e.target.value }))} placeholder="اسم الشركة" />
              <Input value={editForm.billboards} onChange={(e) => setEditForm((p:any)=>({ ...p, billboards: e.target.value }))} placeholder="اللوحات مفصولة بفواصل" />
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={editForm.startDate} onChange={(e) => setEditForm((p:any)=>({ ...p, startDate: e.target.value }))} />
                <Input type="date" value={editForm.endDate} onChange={(e) => setEditForm((p:any)=>({ ...p, endDate: e.target.value }))} />
              </div>
              <Input value={editForm.amount} onChange={(e) => setEditForm((p:any)=>({ ...p, amount: e.target.value }))} placeholder="المبلغ" />
              <Select value={editForm.status} onValueChange={(v)=> setEditForm((p:any)=>({ ...p, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="confirmed">مؤكد</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setEditing(null); setEditForm(null); }}>إلغاء</Button>
            <Button onClick={async () => {
              if (!editing) return;
              try {
                const payload: any = {
                  start_date: editForm.startDate,
                  end_date: editForm.endDate,
                  status: editForm.status,
                  phone: editForm.phone || null
                };
                // parse amount numeric
                const num = Number(String(editForm.amount).replace(/[^0-9.\-]/g, ''));
                if (!isNaN(num)) payload.total_price = num;
                // billboards array
                payload.billboard_ids = editForm.billboards ? editForm.billboards.split(',').map((s:string)=>s.trim()).filter(Boolean) : [];

                const { error } = await supabase.from('bookings').update(payload).eq('id', editing.id);
                if (error) throw error;
                toast.success('تم حفظ التعديلات');
                setEditing(null);
                setEditForm(null);
                fetchBookings();
              } catch (e:any) {
                toast.error(e?.message || 'فشل الحفظ');
              }
            }}>حفظ</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link contract dialog */}
      <Dialog open={linking.open} onOpenChange={(o) => { if (!o) setLinking({ open: false }); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ربط بالحساب/العقد</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm">اختر عقد لربطه بالحجز #{linking.booking?.id || ''}</div>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-auto">
              {contracts.map((c:any) => (
                <div key={c.contractNumber} className="p-2 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">#{c.contractNumber} {c.adType ? `- ${c.adType}` : ''}</div>
                    <div className="text-xs text-muted-foreground">{c.customerName}</div>
                  </div>
                  <div>
                    <Button onClick={async ()=>{
                      try {
                        if (!linking.booking) return;
                        // attempt to update booking in DB with contract_number field
                        const payload:any = { contract_number: c.contractNumber };
                        const { error } = await supabase.from('bookings').update(payload).eq('id', linking.booking.id);
                        if (error) {
                          // if update fails because column doesn't exist, just update locally
                          console.warn('update booking contract failed', error);
                          setBookings(prev => prev.map(b => b.id === linking.booking.id ? { ...b, contract_number: c.contractNumber } : b));
                        } else {
                          // refresh
                          fetchBookings();
                        }
                        toast.success('تم ربط العقد');
                        setLinking({ open: false });
                      } catch (e:any) {
                        console.error(e);
                        toast.error(e?.message || 'فشل الربط');
                      }
                    }}>ربط</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setLinking({ open: false })}>إلغاء</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create dialog */}
      <Dialog open={creating} onOpenChange={(o) => { if (!o) setCreating(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة حجز جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={createForm.client} onChange={(e)=> setCreateForm((p:any)=>({ ...p, client: e.target.value }))} placeholder="اسم العميل" />
            <Input value={createForm.company} onChange={(e)=> setCreateForm((p:any)=>({ ...p, company: e.target.value }))} placeholder="اسم الشركة" />
            <Input value={createForm.billboards} onChange={(e)=> setCreateForm((p:any)=>({ ...p, billboards: e.target.value }))} placeholder="اللوحات مفصولة بفواصل" />
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={createForm.startDate} onChange={(e)=> setCreateForm((p:any)=>({ ...p, startDate: e.target.value }))} />
              <Input type="date" value={createForm.endDate} onChange={(e)=> setCreateForm((p:any)=>({ ...p, endDate: e.target.value }))} />
            </div>
            <Input value={createForm.amount} onChange={(e)=> setCreateForm((p:any)=>({ ...p, amount: e.target.value }))} placeholder="المبلغ" />
            <Select value={createForm.status} onValueChange={(v)=> setCreateForm((p:any)=>({ ...p, status: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">في الانتظار</SelectItem>
                <SelectItem value="confirmed">مؤكد</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreating(false)}>إلغاء</Button>
            <Button onClick={async () => {
              try {
                const payload: any = {
                  start_date: createForm.startDate,
                  end_date: createForm.endDate,
                  status: createForm.status,
                  phone: createForm.phone || null
                };
                const num = Number(String(createForm.amount).replace(/[^0-9.\-]/g, ''));
                if (!isNaN(num)) payload.total_price = num;
                payload.billboard_ids = createForm.billboards ? createForm.billboards.split(',').map((s:string)=>s.trim()).filter(Boolean) : [];
                // if client is a user id try to assign user_id, else leave null
                // attempt insert
                const { error } = await supabase.from('bookings').insert(payload);
                if (error) throw error;
                toast.success('تم إنشاء الحجز');
                setCreating(false);
                setCreateForm({ client: '', company: '', billboards: '', startDate: '', endDate: '', amount: '', status: 'pending', phone: '' });
                fetchBookings();
              } catch (e:any) {
                toast.error(e?.message || 'ف��ل إنشاء الحجز');
              }
            }}>إنشاء</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
