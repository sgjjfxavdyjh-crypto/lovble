import { supabase } from '@/integrations/supabase/client';

export interface Contract {
  id: string;
  customer_name: string;
  ad_type?: string;
  start_date: string;
  end_date: string;
  rent_cost: number;
  created_at: string;
  updated_at: string;
}

export interface ContractCreate {
  customer_name: string;
  ad_type?: string;
  start_date: string;
  end_date: string;
  rent_cost: number;
  billboard_ids: string[];
}

// إنشاء عقد جديد مع ربطه بلوحات متعددة
export async function createContract(contractData: ContractCreate) {
  const { billboard_ids, ...contractPayload } = contractData;
  
  // إنشاء العقد
  const { data: contract, error: contractError } = await supabase
    .from('contracts')
    .insert(contractPayload)
    .select()
    .single();

  if (contractError) throw contractError;

  // ربط اللوحات بالعقد (واحدة تلو الأخرى لتجنب مشاكل الـ upsert)
  for (const billboard_id of billboard_ids) {
    const { error: billboardError } = await supabase
      .from('billboards')
      .update({
        contract_id: contract.id,
        start_date: contractData.start_date,
        end_date: contractData.end_date,
        customer_name: contractData.customer_name,
        Status: 'rented'
      })
      .eq('ID', Number(billboard_id));

    if (billboardError) throw billboardError;
  }

  return contract;
}

// جلب جميع العقود
export async function getContracts() {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// جلب عقد محدد مع اللوحات المرتبطة به
export async function getContractWithBillboards(contractId: string) {
  const { data: contract, error: contractError } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', contractId)
    .single();

  if (contractError) throw contractError;

  const { data: billboards, error: billboardError } = await supabase
    .from('billboards')
    .select('*')
    .eq('contract_id', contractId);

  if (billboardError) throw billboardError;

  return {
    ...contract,
    billboards
  };
}

// جلب جميع اللوحات المتاحة (غير محجوزة أو انتهى عقدها)
export async function getAvailableBillboards(): Promise<any[]> {
  // استخدام loadBillboards من billboardService للحصول على البيانات المعالجة
  try {
    const { loadBillboards } = await import('./billboardService');
    const allBillboards = await loadBillboards();
    
    // فلترة اللوحات المتاحة فقط
    return allBillboards.filter(billboard => 
      billboard.status === 'available' && 
      (!billboard.contractNumber || billboard.contractNumber.trim() === '')
    );
  } catch (error) {
    console.warn('خطأ في جلب اللوحات المتاحة:', error);
    return [];
  }
}

// تحرير اللوحات المنتهية الصلاحية
export async function releaseExpiredBillboards() {
  const { error } = await supabase.rpc('auto_release_expired_billboards');
  if (error) throw error;
}

// تحديث العقد
export async function updateContract(contractId: string, updates: Partial<Contract>) {
  const { data, error } = await supabase
    .from('contracts')
    .update(updates)
    .eq('id', contractId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// حذف العقد (سيحرر اللوحات تلقائياً بسبب ON DELETE SET NULL)
export async function deleteContract(contractId: string) {
  const { error } = await supabase
    .from('contracts')
    .delete()
    .eq('id', contractId);

  if (error) throw error;
}