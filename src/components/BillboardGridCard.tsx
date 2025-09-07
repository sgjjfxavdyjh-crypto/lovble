import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Building, Eye } from 'lucide-react';
import { Billboard } from '@/types';
import { formatGregorianDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface BillboardGridCardProps {
  billboard: Billboard;
  onBooking?: (billboard: Billboard) => void;
  onViewDetails?: (billboard: Billboard) => void;
  showBookingActions?: boolean;
}

export const BillboardGridCard: React.FC<BillboardGridCardProps> = ({
  billboard,
  onBooking,
  onViewDetails,
  showBookingActions = true
}) => {
  const { isAdmin } = useAuth();
  const isAvailable = billboard.Status === 'متاح' || billboard.Status === 'available' || !billboard.Contract_Number;
  const isMaintenance = billboard.Status === 'صيانة' || billboard.Status === 'maintenance';
  const statusLabel = isAvailable ? 'متاح' : isMaintenance ? 'صيانة' : 'محجوز';
  const statusClass = isAvailable
    ? 'bg-green-500 hover:bg-green-600'
    : isMaintenance
    ? 'bg-amber-500 hover:bg-amber-600'
    : 'bg-red-500 hover:bg-red-600';

  // حساب الأيام المتبقية
  const getDaysRemaining = () => {
    if (!billboard.Rent_End_Date) return null;

    try {
      const endDate = new Date(billboard.Rent_End_Date);
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays > 0 ? diffDays : 0;
    } catch {
      return null;
    }
  };

  const daysRemaining = getDaysRemaining();
  const isNearExpiry = daysRemaining !== null && daysRemaining <= 20;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-border/50">
      <div className="relative">
        {/* صورة اللوحة */}
        <div className="aspect-video bg-muted relative overflow-hidden">
          {billboard.Image_URL ? (
            <img 
              src={billboard.Image_URL} 
              alt={billboard.Billboard_Name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/60">
              <Building className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {/* حجم اللوحة */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
              {billboard.Size}
            </Badge>
          </div>

          {/* حالة اللوحة */}
          <div className="absolute top-3 left-3">
            <Badge
              variant={isAvailable ? "default" : "destructive"}
              className={statusClass}
            >
              {statusLabel}
            </Badge>
          </div>

          {/* تحذير القريبة من الانتهاء */}
          {isNearExpiry && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="outline" className="bg-yellow-500/90 text-yellow-900 border-yellow-600">
                <Calendar className="h-3 w-3 mr-1" />
                {daysRemaining} يوم متبقي
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* معرف اللوحة */}
          <div className="mb-3">
            <h3 className="font-bold text-lg text-foreground">
              {billboard.Billboard_Name || `لوحة رقم ${billboard.ID}`}
            </h3>
          </div>

          {/* الموقع */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                {billboard.District && billboard.City 
                  ? `${billboard.District}, ${billboard.City}`
                  : billboard.Nearest_Landmark || 'غير محدد'
                }
              </span>
            </div>
            
            {billboard.Nearest_Landmark && billboard.District && (
              <div className="text-xs text-muted-foreground pr-6">
                {billboard.Nearest_Landmark}
              </div>
            )}
          </div>

          {/* معلومات إضافية */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
            <div>
              <span className="text-muted-foreground">المستوى:</span>
              <br />
              <span className="font-medium">{billboard.Level || 'عادي'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">الأوجه:</span>
              <br />
              <span className="font-medium">{billboard.Faces_Count || '1'}</span>
            </div>
          </div>

          {/* معلومات العقد - للمدير فقط */}
          {isAdmin && !isAvailable && billboard.Customer_Name && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-sm">
                <div className="font-medium text-foreground mb-1">
                  {billboard.Customer_Name}
                </div>
                {billboard.Rent_End_Date && (
                  <div className="text-muted-foreground">
                    ينتهي: {formatGregorianDate(billboard.Rent_End_Date, 'ar-LY')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* السعر */}
          <div className="mb-4">
            <div className="text-2xl font-bold text-primary">
              {billboard.Price || '0'} <span className="text-base font-semibold">د.ل</span>
            </div>
            <div className="text-sm text-muted-foreground">
              السعر حسب الفترة
            </div>
          </div>

          {/* أزرار الإجراءات */}
          {showBookingActions && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                variant={isAvailable ? "default" : "secondary"}
                onClick={() => onBooking?.(billboard)}
              >
                {isAvailable ? 'حجز سريع' : 'تفريغ'}
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  if (billboard.GPS_Link) {
                    window.open(billboard.GPS_Link, '_blank');
                  }
                }}
                disabled={!billboard.GPS_Link}
              >
                <MapPin className="h-4 w-4" />
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onViewDetails?.(billboard)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
};
