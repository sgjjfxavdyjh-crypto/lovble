import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MultiSelect from '@/components/ui/multi-select';
import { MapPin, DollarSign, Filter, Plus, Search, Eye, Edit } from 'lucide-react';
import { Billboard } from '@/types';
import { loadBillboards } from '@/services/billboardService';

export default function Billboards() {
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  useEffect(() => {
    const fetchBillboards = async () => {
      try {
        const data = await loadBillboards();
        setBillboards(data);
      } catch (error) {
        console.error('خطأ في تحميل اللوحات:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBillboards();
  }, []);

  const getStatusBadge = (status: Billboard['status']) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-success text-success-foreground border-success">متاح</Badge>;
      case 'rented':
        return <Badge className="bg-warning text-warning-foreground border-warning">مؤجر</Badge>;
      case 'maintenance':
        return <Badge className="bg-destructive text-destructive-foreground border-destructive">صيانة</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const cities = [...new Set(billboards.map(b => b.city))];
  const filteredBillboards = billboards.filter((billboard) => {
    const matchesSearch = billboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         billboard.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(billboard.status);
    const matchesCity = selectedCities.length === 0 || selectedCities.includes(billboard.city);
    
    return matchesSearch && matchesStatus && matchesCity;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل اللوحات الإعلانية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* العنوان والأزرار */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة اللوحات الإعلانية</h1>
          <p className="text-muted-foreground">عرض وإدارة جميع اللوحات الإعلانية مع إمكانية التعديل والصيانة</p>
        </div>
        <Button className="bg-gradient-primary text-white shadow-elegant hover:shadow-glow transition-smooth">
          <Plus className="h-4 w-4 ml-2" />
          إضافة معلن
        </Button>
      </div>

      {/* أدوات التصفية والبحث */}
      <Card className="bg-gradient-card border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-primary" />
            البحث في اللوحات...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن اللوحات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <MultiSelect
              options={[
                { label: 'متاح', value: 'available' },
                { label: 'مؤجر', value: 'rented' },
                { label: 'صيانة', value: 'maintenance' },
              ]}
              value={selectedStatuses}
              onChange={setSelectedStatuses}
              placeholder="الحالة (متعدد)"
            />

            <MultiSelect
              options={cities.map(c => ({ label: c, value: c }))}
              value={selectedCities}
              onChange={setSelectedCities}
              placeholder="جميع المدن"
            />

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                سنة كاملة
              </Button>
              <Button variant="outline" className="px-3">
                6 أشهر
              </Button>
              <Button variant="outline" className="px-3">
                3 أشهر
              </Button>
              <Button variant="default" className="px-3 bg-primary">
                شهر واحد
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* عرض اللوحات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBillboards.map((billboard) => (
          <Card key={billboard.id} className="bg-gradient-card border-0 shadow-card hover:shadow-elegant transition-smooth overflow-hidden">
            <div className="relative">
              <img
                src={billboard.image || "/placeholder.svg"}
                alt={billboard.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4">
                {getStatusBadge(billboard.status)}
              </div>
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary text-primary-foreground border-primary">
                  {billboard.size}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-1">{billboard.name}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{billboard.location}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">السعر الشهري:</span>
                    <span className="font-semibold text-primary">{billboard.price?.toLocaleString()} د.ل/شهر</span>
                  </div>
                  {billboard.installationPrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">سعر التركيب:</span>
                      <span className="font-semibold text-muted-foreground">{billboard.installationPrice?.toLocaleString()} د.ل</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 ml-1" />
                    Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 ml-1" />
                    تعديل
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBillboards.length === 0 && (
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardContent className="p-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد لوحات</h3>
            <p className="text-muted-foreground">لم يتم العثور على لوحات تطابق معايير البحث المحددة</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
