import { supabase } from '@/integrations/supabase/client';
import { Billboard, Contract, Pricing } from '@/types';

// جلب جميع اللوحات
export const fetchAllBillboards = async (): Promise<Billboard[]> => {
  try {
    const { data, error } = await supabase
      .from('billboards')
      .select('*');

    if (error) {
      console.error('Error fetching billboards:', (error as any)?.message || JSON.stringify(error));
      return [];
    }

    // إزالة التكرار وتحديد الحالة
    const uniqueBillboards = new Map<number, any>();
    (data || []).forEach((billboard: any) => {
      if (!uniqueBillboards.has(billboard.ID)) {
        uniqueBillboards.set(billboard.ID, {
          ...billboard,
          Status: billboard.Contract_Number ? 'مؤجر' : 'متاح'
        });
      }
    });

    const processedData = Array.from(uniqueBillboards.values());
    console.log('Fetched unique billboards:', processedData.length);
    return processedData;
  } catch (error) {
    console.error('Error in fetchAllBillboards:', (error as any)?.message || JSON.stringify(error));
    return [];
  }
};

// جلب العقود
export const fetchContracts = async (): Promise<Contract[]> => {
  try {
    const { data, error } = await supabase
      .from('Contract')
      .select('*')
      .order('"Contract Number"', { ascending: false });

    if (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }

    console.log('Fetched contracts:', (data || []).length);
    return data || [];
  } catch (error) {
    console.error('Error in fetchContracts:', error);
    throw error;
  }
};

// جلب أسعار اللوحات
export const fetchPricing = async (): Promise<Pricing[]> => {
  try {
    const { data, error } = await supabase
      .from('pricing')
      .select('*');

    if (error) {
      console.error('Error fetching pricing:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchPricing:', error);
    throw error;
  }
};

// إنشاء عقد جديد
export const createContract = async (contractData: any): Promise<Contract> => {
  try {
    const { data, error } = await supabase
      .from('Contract')
      .insert([contractData])
      .select()
      .single();

    if (error) {
      console.error('Error creating contract:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createContract:', error);
    throw error;
  }
};

// تحديث حالة اللوحة
export const updateBillboardStatus = async (
  billboardId: number, 
  updates: Partial<Billboard>
): Promise<Billboard> => {
  try {
    const { data, error } = await supabase
      .from('billboards')
      .update(updates)
      .eq('ID', billboardId)
      .select()
      .single();

    if (error) {
      console.error('Error updating billboard:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateBillboardStatus:', error);
    throw error;
  }
};

// جلب الإحصائيات
export const fetchDashboardStats = async () => {
  try {
    const [billboards, contracts] = await Promise.all([
      fetchAllBillboards(),
      fetchContracts()
    ]);

    const availableBillboards = billboards.filter(b => 
      b.Status === 'متاح' || b.Status === 'available' || !b.Contract_Number
    );

    const rentedBillboards = billboards.filter(b => 
      b.Status === 'مؤجر' || b.Status === 'rented' || b.Contract_Number
    );

    // حساب اللوحات القريبة من الانتهاء (20 يوم أو أقل)
    const nearExpiry = rentedBillboards.filter(billboard => {
      if (!billboard.Rent_End_Date) return false;
      
      try {
        const endDate = new Date(billboard.Rent_End_Date);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays <= 20 && diffDays > 0;
      } catch {
        return false;
      }
    });

    const totalRevenue = contracts.reduce((sum, contract) => {
      const total = parseFloat(contract['Total Rent']?.toString() || '0');
      return sum + (isNaN(total) ? 0 : total);
    }, 0);

    return {
      totalBillboards: billboards.length,
      availableBillboards: availableBillboards.length,
      rentedBillboards: rentedBillboards.length,
      nearExpiryBillboards: nearExpiry.length,
      totalContracts: contracts.length,
      totalRevenue,
      availableBillboardsList: availableBillboards,
      nearExpiryBillboardsList: nearExpiry
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};
