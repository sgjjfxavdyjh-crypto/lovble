import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Billboard } from '@/types';
import { fetchAllBillboards } from '@/services/supabaseService';
import { BillboardGridCard } from '@/components/BillboardGridCard';
import { BookingSummary } from '@/components/BookingSummary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, Filter, MapPin, Megaphone, Star, Play, ArrowDown, LogOut, User, BarChart3 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import heroBillboard from '@/assets/hero-billboard.jpg';

const Index = () => {
  const { user, logout, isAdmin } = useAuth();
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [selectedBillboards, setSelectedBillboards] = useState<Billboard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [myOnly, setMyOnly] = useState(false);

  useEffect(() => {
    loadBillboards();
  }, []);

  const loadBillboards = async () => {
    try {
      const data = await fetchAllBillboards();
      setBillboards(data);
    } catch (error) {
      toast({
        title: "خطأ في تحميل البيانات",
        description: "تعذر تحميل اللوحات الإعلانية",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredBillboards = billboards.filter(billboard => {
    const matchesSearch = billboard.Billboard_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         billboard.District?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         billboard.City?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSize = sizeFilter === 'all' || billboard.Size === sizeFilter;

    const isAvailable = billboard.Status === 'متاح' || billboard.Status === 'available' || !billboard.Contract_Number;
    const isBooked = billboard.Status === 'مؤجر' || billboard.Status === 'محجوز' || billboard.Status === 'booked' || !!billboard.Contract_Number;
    const isMaintenance = billboard.Status === 'صيانة' || billboard.Status === 'maintenance';

    // near expiry = within 20 days
    let isNearExpiry = false;
    if (billboard.Rent_End_Date) {
      try {
        const endDate = new Date(billboard.Rent_End_Date);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        isNearExpiry = diffDays <= 20 && diffDays > 0;
      } catch {
        isNearExpiry = false;
      }
    }

    let finalStatusMatch = false;
    if (isAdmin) {
      finalStatusMatch =
        statusFilter === 'all' ||
        (statusFilter === 'available' && isAvailable) ||
        (statusFilter === 'booked' && isBooked) ||
        (statusFilter === 'maintenance' && isMaintenance) ||
        (statusFilter === 'near-expiry' && isNearExpiry);
    } else {
      if (statusFilter === 'available') {
        finalStatusMatch = isAvailable;
      } else if (statusFilter === 'near-expiry') {
        finalStatusMatch = isNearExpiry;
      } else if (statusFilter === 'all') {
        finalStatusMatch = isAvailable || isNearExpiry;
      } else {
        // non-admins cannot view booked/maintenance
        finalStatusMatch = false;
      }
    }

    const allowed = Array.isArray((user as any)?.allowedCustomers)
      ? ((user as any).allowedCustomers as string[]).map((s) => String(s).trim().toLowerCase())
      : [];
    const customerName = String(billboard.Customer_Name ?? '').trim().toLowerCase();
    const matchesMyOnly = !myOnly || (allowed.length > 0 && allowed.includes(customerName));

    return matchesSearch && matchesSize && finalStatusMatch && matchesMyOnly;
  });

  const handleToggleSelect = (billboard: Billboard) => {
    setSelectedBillboards(prev => {
      const isSelected = prev.find(b => b.ID === billboard.ID);
      if (isSelected) {
        return prev.filter(b => b.ID !== billboard.ID);
      } else {
        return [...prev, billboard];
      }
    });
  };

  const handleRemoveBillboard = (billboardId: string) => {
    setSelectedBillboards(prev => prev.filter(b => b.ID.toString() !== billboardId));
  };

  const handleSubmitBooking = () => {
    toast({
      title: "تم إرسال طلب الحجز",
      description: `تم إرسال طلب حجز ${selectedBillboards.length} لوحة بنجاح`,
    });
    setSelectedBillboards([]);
  };

  const availableBillboards = billboards.filter(b => 
    b.Status === 'متاح' || b.Status === 'available' || !b.Contract_Number
  ).length;
  const uniqueSizes = [...new Set(billboards.map(b => b.Size))].filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">جاري تحميل اللوحات الإعلانية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark" dir="rtl">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBillboard})` }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-luxury opacity-80" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-full border border-primary/30 mb-4">
              <Megaphone className="h-5 w-5 text-primary" />
              <span className="text-primary text-sm font-medium">منصة حجز اللوحات الإعلانية</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">احجز</span>{' '}
            أفضل المواقع
            <br />
            <span className="text-primary">الإعلانية</span> في المدينة
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
            منصة متكاملة لحجز وإدارة اللوحات الإعلانية الطرقية
            <br />
            بأسعار تنافسية وخدمة مميزة على مدار الساعة
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-12">
            <Button size="lg" variant="hero" className="text-lg px-8 py-4 h-auto">
              ابدأ الحجز الآن
              <Play className="mr-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto border-white/30 text-white hover:bg-white/10">
              شاهد العروض
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-white/80">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{availableBillboards}+</div>
              <div className="text-sm">لوحة متاحة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm">خدمة العملاء</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">100%</div>
              <div className="text-sm">ضمان الجودة</div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ArrowDown className="h-6 w-6 text-primary" />
        </div>
      </section>

      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Megaphone className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  اللوحات المتاحة
                </h2>
                <p className="text-sm text-muted-foreground">اختر من بين أفضل المواقع الإعلانية</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-2">
                <Star className="h-4 w-4 text-primary" />
                {availableBillboards} لوحة متاحة
              </Badge>
              
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{user.name}</span>
                    {isAdmin && (
                      <Badge variant="secondary" className="text-xs">مدير</Badge>
                    )}
                  </div>
                  {isAdmin && (
                    <Link to="/dashboard">
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        لوحة التحكم
                      </Button>
                    </Link>
                  )}
                  <Button variant="outline" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    خروج
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button variant="outline">تسجيل الدخول</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8 shadow-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن اللوحات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <Select value={sizeFilter} onValueChange={setSizeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="حجم اللوحة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأحجام</SelectItem>
                  {uniqueSizes.map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="حالة اللوحة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="available">متاحة</SelectItem>
                  <SelectItem value="near-expiry">قريبة الانتهاء</SelectItem>
                  {isAdmin && (
                    <>
                      <SelectItem value="booked">محجوزة</SelectItem>
                      <SelectItem value="maintenance">صيانة</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>

              {user && (
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
                  <Switch id="my-only" checked={myOnly} onCheckedChange={setMyOnly} />
                  <Label htmlFor="my-only">لوحاتي</Label>
                </div>
              )}

              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                فلترة متقدمة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Billboards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBillboards.map((billboard) => (
            <BillboardGridCard
              key={billboard.ID}
              billboard={billboard}
              onBooking={handleToggleSelect}
            />
          ))}
        </div>

        {filteredBillboards.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا تو��د نتائج</h3>
            <p className="text-muted-foreground">جرب تعديل معايير البحث أو الفلترة</p>
          </div>
        )}
      </div>

      {/* Booking Summary */}
      <BookingSummary
        selectedBillboards={selectedBillboards}
        onRemoveBillboard={handleRemoveBillboard}
        onSubmitBooking={handleSubmitBooking}
        isOpen={selectedBillboards.length > 0}
      />
    </div>
  );
};

export default Index;
