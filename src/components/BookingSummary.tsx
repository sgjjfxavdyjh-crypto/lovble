import { Billboard } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X, ShoppingCart, Calculator } from 'lucide-react';

interface BookingSummaryProps {
  selectedBillboards: Billboard[];
  onRemoveBillboard: (billboardId: string) => void;
  onSubmitBooking: () => void;
  isOpen: boolean;
}

export function BookingSummary({ 
  selectedBillboards, 
  onRemoveBillboard, 
  onSubmitBooking,
  isOpen 
}: BookingSummaryProps) {
  const totalCost = selectedBillboards.reduce((sum, billboard) => {
    const price = parseFloat(billboard.Price) || 0;
    return sum + price;
  }, 0);

  if (!isOpen || selectedBillboards.length === 0) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-[70vh] overflow-hidden shadow-luxury border-primary/20 bg-card/95 backdrop-blur-sm z-50">
      <CardHeader className="bg-gradient-primary text-primary-foreground pb-3">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          ملخص الحجز ({selectedBillboards.length} لوحة)
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 max-h-64 overflow-y-auto">
        <div className="space-y-3">
          {selectedBillboards.map((billboard) => (
            <div key={billboard.ID} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex-1">
                <div className="font-medium text-sm">{billboard.Billboard_Name || `لوحة ${billboard.ID}`}</div>
                <div className="text-xs text-muted-foreground">
                  {billboard.Size} - {billboard.District || billboard.City}
                </div>
                <div className="text-xs text-primary font-medium">
                  {billboard.Price || '0'} د.ل
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemoveBillboard(billboard.ID.toString())}
                className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>

      <Separator />

      <div className="p-4 space-y-3">
        <div className="flex justify-between text-lg font-bold text-primary">
          <span className="flex items-center gap-1">
            <Calculator className="h-4 w-4" />
            الإجمالي:
          </span>
          <span>{totalCost.toLocaleString()} د.ل</span>
        </div>
        
        <Button 
          onClick={onSubmitBooking}
          variant="hero"
          className="w-full font-semibold"
        >
          إرسال طلب الحجز
        </Button>
      </div>
    </Card>
  );
}