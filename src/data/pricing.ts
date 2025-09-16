// هذا الملف محدث ليستخدم قاعدة البيانات بدلاً من البيانات الثابتة
export { 
  getPriceFor, 
  getDailyPriceFor, 
  getCustomerCategories as CUSTOMERS,
  getAvailableSizes,
  getAvailableLevels,
  getAllPricing as PRICING
} from '@/services/pricingService';

export type { CustomerType, LevelType } from '@/services/pricingService';

// إعادة تصدير الدوال للتوافق مع الكود الموجود
import { getCustomerCategories } from '@/services/pricingService';

// تصدير فوري للفئات (للتوافق مع الكود الموجود)
export const CUSTOMERS = await getCustomerCategories().catch(() => ['عادي', 'المدينة', 'مسوق', 'شركات']);