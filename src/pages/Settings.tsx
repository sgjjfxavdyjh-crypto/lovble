import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Settings() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-0 shadow-card">
        <CardHeader>
          <CardTitle>الإعدادات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">إعدادات النظام ولوحة التحكم.</div>
        </CardContent>
      </Card>
    </div>
  );
}
