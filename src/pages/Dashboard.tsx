import { StatCard } from '@/components/Dashboard/StatCard';
import { RecentActivity } from '@/components/Dashboard/RecentActivity';
import { FileText, MapPin, Clock, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    {
      title: 'العقود النشطة',
      value: '4',
      description: 'العقود الجاري تنفيذها',
      icon: FileText,
      trend: { value: '12.5%+', isPositive: true }
    },
    {
      title: 'اللوحات المتاحة',
      value: '1',
      description: 'جاهزة للحجز الفوري',
      icon: MapPin,
      trend: { value: '5+', isPositive: true }
    },
    {
      title: 'الحجوزات المعلقة',
      value: '1',
      description: 'تحتاج إلى مراجعة وتأكيد',
      icon: Clock
    },
    {
      title: 'إجمالي الإيرادات',
      value: '406,800 د.ل',
      description: 'جميع الإيرادات المؤكدة هذا الشهر',
      icon: DollarSign,
      trend: { value: '12.5%+', isPositive: true }
    }
  ];

  return (
    <div className="space-y-8">
      {/* العنوان والترحيب */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">الرئيسية</h1>
          <p className="text-muted-foreground">لوحة شاملة للوحات الإعلانية</p>
        </div>
        <div className="text-left">
          <p className="text-sm text-muted-foreground">مرحباً بعودتك،</p>
          <h2 className="text-xl font-semibold text-foreground">مدير النظام</h2>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* قسم النشاطات الأخيرة */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <RecentActivity />
      </div>
    </div>
  );
}