import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface Permissions {
  can_view_unavailable?: boolean;
  can_manage_billboards?: boolean;
  can_manage_bookings?: boolean;
  can_view_reports?: boolean;
  can_manage_pricing?: boolean;
  can_manage_users?: boolean;
}

const defaultPermissions: Permissions = {
  can_view_unavailable: false,
  can_manage_billboards: false,
  can_manage_bookings: false,
  can_view_reports: false,
  can_manage_pricing: false,
  can_manage_users: false,
};

interface ProfileRow {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  assigned_client?: string | null;
  permissions?: Permissions | null;
  created_at: string | null;
}

export default function Users() {
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 40;
  const [savingId, setSavingId] = useState<string | null>(null);
  const [hasAssignedClient, setHasAssignedClient] = useState<boolean>(true);
  const [hasPermissions, setHasPermissions] = useState<boolean>(true);
  const [permOpenId, setPermOpenId] = useState<string | null>(null);

  const fetchPage = async (pageIndex: number) => {
    setLoading(true);
    setError(null);
    const from = (pageIndex - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    // حاول أولاً مع assigned_client، وإن لم يوجد العمود فfallback بدونه
    let resp = await supabase
      .from('profiles')
      .select('id,name,email,role,assigned_client,permissions,created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (resp.error && (resp.error.code === '42703' || /does not exist/i.test(resp.error.message))) {
      // probe which column missing by trying assigned_client then permissions separately
      // try without permissions
      let probe = await supabase
        .from('profiles')
        .select('id,name,email,role,assigned_client,created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (probe.error && (probe.error.code === '42703' || /does not exist/i.test(probe.error.message))) {
        setHasAssignedClient(false);
        // try without both
        resp = await supabase
          .from('profiles')
          .select('id,name,email,role,created_at', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);
      } else {
        resp = probe;
      }
      setHasPermissions(false);
    } else {
      setHasAssignedClient(true);
      setHasPermissions(true);
    }

    if (resp.error) {
      setError(resp.error.message);
      setRows([]);
      setCount(0);
    } else {
      setRows((resp.data as ProfileRow[]) || []);
      setCount(resp.count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const handleSave = async (row: ProfileRow) => {
    setSavingId(row.id);
    let payload: any = { role: row.role };
    if (hasAssignedClient) payload.assigned_client = row.assigned_client;
    if (hasPermissions) payload.permissions = row.permissions || defaultPermissions;

    let { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', row.id);

    if (error && (error.code === '42703' || /does not exist/i.test(error.message))) {
      // retry progressively
      if (hasPermissions) {
        let retry1 = await supabase
          .from('profiles')
          .update({ role: row.role, assigned_client: hasAssignedClient ? row.assigned_client : undefined })
          .eq('id', row.id);
        if (retry1.error && (retry1.error.code === '42703' || /does not exist/i.test(retry1.error.message))) {
          setHasAssignedClient(false);
          const retry2 = await supabase
            .from('profiles')
            .update({ role: row.role })
            .eq('id', row.id);
          error = retry2.error;
        } else {
          error = retry1.error;
        }
        setHasPermissions(false);
      } else if (hasAssignedClient) {
        const retry = await supabase
          .from('profiles')
          .update({ role: row.role })
          .eq('id', row.id);
        error = retry.error;
        setHasAssignedClient(false);
      }
    }

    if (error) {
      toast.error(`فشل حفظ التعديلات: ${error.message}`);
    } else {
      toast.success('تم حفظ التعديلات بنجاح');
      fetchPage(page);
    }
    setSavingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">المستخدمون</h1>
          <p className="text-muted-foreground">قائمة المستخدمين من قاعدة البيانات (Supabase)</p>
        </div>
      </div>

      <Card className="bg-gradient-card border-0 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">عدد المستخدمين: {count}</CardTitle>
          {!hasAssignedClient && (
            <div className="text-sm text-warning mt-2">حقل الزبون المخصص غير موجود في profiles. يمكن إضافته لاحقاً.</div>
          )}
          {!hasPermissions && (
            <div className="text-sm text-warning mt-1">حقل الصلاحيات غير موجود في profiles. يمكن إضافته لاحقاً.</div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">جاري التحميل...</div>
          ) : error ? (
            <div className="text-destructive">خطأ: {error}</div>
          ) : rows.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">لا يوجد مستخدمون</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>الدور</TableHead>
                    {hasAssignedClient && <TableHead>الزبون المخصص</TableHead>}
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead>المعرف</TableHead>
                    <TableHead>إجراءات</TableHead>
                    {hasPermissions && <TableHead>الصلاحيات</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name || '—'}</TableCell>
                      <TableCell>{r.email || '—'}</TableCell>
                      <TableCell className="min-w-[160px]">
                        <Select
                          value={r.role || ''}
                          onValueChange={(val) => setRows((prev) => prev.map((x) => x.id === r.id ? { ...x, role: val } : x))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الدور" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">مدير</SelectItem>
                            <SelectItem value="client">عميل</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      {hasAssignedClient && (
                        <TableCell className="min-w-[220px]">
                          <Input
                            value={r.assigned_client || ''}
                            placeholder="اسم الزبون المخصص"
                            onChange={(e) => setRows((prev) => prev.map((x) => x.id === r.id ? { ...x, assigned_client: e.target.value } : x))}
                          />
                        </TableCell>
                      )}
                      <TableCell>{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</TableCell>
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => handleSave(r)} disabled={savingId === r.id}>حفظ</Button>
                      </TableCell>
                      {hasPermissions && (
                        <TableCell>
                          <Dialog open={permOpenId === r.id} onOpenChange={(o) => setPermOpenId(o ? r.id : null)}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">تفاصيل الصلاحيات</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>صلاحيات: {r.name || r.email}</DialogTitle>
                              </DialogHeader>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                {Object.entries({
                                  can_view_unavailable: 'عرض غير المتاح/قرب الانتهاء',
                                  can_manage_billboards: 'إدارة اللوحات',
                                  can_manage_bookings: 'إدارة الحجوزات',
                                  can_view_reports: 'عرض التقارير',
                                  can_manage_pricing: 'إدارة الأسعار',
                                  can_manage_users: 'إدارة المستخدمين',
                                }).map(([key, label]) => (
                                  <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                                    <Label className="mr-3">{label}</Label>
                                    <Switch
                                      checked={Boolean((r.permissions || defaultPermissions)[key as keyof Permissions])}
                                      onCheckedChange={(val) =>
                                        setRows(prev => prev.map(x => x.id === r.id ? { ...x, permissions: { ...(x.permissions || {}), [key]: val } } : x))
                                      }
                                    />
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-end gap-2 mt-4">
                                <Button onClick={() => handleSave(r)} disabled={savingId === r.id}>حفظ</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {count > PAGE_SIZE && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={page === i + 1}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
