import { supabase } from '@/integrations/supabase/client';
import type { Billboard, Contract } from '@/types';

interface ContractData {
  customer_name: string;
  start_date: string;
  end_date: string;
  rent_cost: number;
  billboard_ids?: string[];
  ad_type?: string;
}

interface ContractCreate {
  customer_name: string;
  start_date: string;
  end_date: string;
  rent_cost: number;
  ad_type?: string;
  billboard_ids?: string[];
}

// إنشاء عقد جديد
export async function createContract(contractData: ContractData) {
  // فصل معرفات اللوحات عن بيانات العقد
  const { billboard_ids, ...contractPayload } = contractData;
  
  // إنشاء العقد
  const { data: contract, error: contractError } = await supabase
    .from('Contract')
    .insert({
      'Customer Name': contractPayload.customer_name,
      'Ad Type': contractPayload.ad_type || '',
      'Contract Date': contractPayload.start_date,
      'End Date': contractPayload.end_date,
      'Total Rent': contractPayload.rent_cost,
      'Contract Number': Date.now().toString(), // رقم عقد تلقائي
    })
    .select()
    .single();

  if (contractError) throw contractError;

  // تحديث اللوحات المرتبطة بالعقد
  if (billboard_ids && billboard_ids.length > 0) {
    for (const billboard_id of billboard_ids) {
      const { error: billboardError } = await supabase
        .from('billboards')
        .update({
          Contract_Number: contract['Contract Number'],
          Rent_Start_Date: contractData.start_date,
          Rent_End_Date: contractData.end_date,
          Customer_Name: contractData.customer_name,
          Status: 'rented'
        })
        .eq('ID', Number(billboard_id));

      if (billboardError) throw billboardError;
    }
  }

  return contract;
}

// جلب جميع العقود
export async function getContracts() {
  const { data, error } = await supabase
    .from('Contract')
    .select('*')
    .order('"Contract Date"', { ascending: false });

  if (error) throw error;
  return data;
}

// جلب عقد مع اللوحات المرتبطة به
export async function getContractWithBillboards(contractId: string): Promise<any> {
  try {
    // تجنب مشاكل النوع بالكامل باستخدام any للاستعلامات
    const contractQuery = (supabase as any)
      .from('Contract')
      .select('*')
      .eq('Contract_Number', contractId)
      .single();

    const contractResult = await contractQuery;

    if (contractResult.error) throw contractResult.error;

    // جلب اللوحات المرتبطة
    const billboardQuery = (supabase as any)
      .from('billboards')
      .select('*')
      .eq('Contract_Number', contractId);

    const billboardResult = await billboardQuery;

    return {
      ...contractResult.data,
      billboards: billboardResult.data || []
    };
  } catch (error) {
    throw error;
  }
}

// جلب اللوحات المتاحة
export async function getAvailableBillboards() {
  const { data, error } = await supabase
    .from('billboards')
    .select('*')
    .eq('Status', 'available')
    .order('ID', { ascending: true });

  if (error) throw error;
  return data;
}

// تحديث عقد
export async function updateContract(contractId: string, updates: any) {
  const result = await (supabase as any)
    .from('Contract')
    .update(updates)
    .eq('Contract_Number', contractId)
    .select()
    .single();

  if (result.error) throw result.error;
  return result.data;
}

// تحديث العقود المنتهية الصلاحية
export async function updateExpiredContracts() {
  const today = new Date().toISOString().split('T')[0];
  
  const { error } = await supabase
    .from('Contract')
    .update({ 'Print Status': 'expired' })
    .lt('End Date', today)
    .neq('Print Status', 'expired');

  if (error) throw error;
}

// إحصائيات العقود
export async function getContractsStats() {
  const { data: contracts, error } = await supabase
    .from('Contract')
    .select('*');

  if (error) throw error;
  
  const today = new Date();
  const stats = {
    total: contracts?.length || 0,
    active: contracts?.filter(c => c['End Date'] && new Date(c['End Date']) > today).length || 0,
    expired: contracts?.filter(c => c['End Date'] && new Date(c['End Date']) <= today).length || 0,
  };
  
  return stats;
}

// تحرير اللوحات المنتهية الصلاحية تلقائياً
export async function autoReleaseExpiredBillboards() {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: expiredContracts, error: fetchError } = await supabase
    .from('Contract')
    .select('"Contract Number", "End Date"')
    .lt('"End Date"', today);

  if (fetchError) throw fetchError;

  for (const contract of expiredContracts || []) {
    // تحديث اللوحات المرتبطة بهذا العقد
    await supabase
      .from('billboards')
      .update({
        Status: 'available',
        Contract_Number: null,
        Customer_Name: null,
        Rent_Start_Date: null,
        Rent_End_Date: null
      })
      .eq('Contract_Number', contract['Contract Number']);
  }
}

// حذف عقد
export async function deleteContract(contractNumber: string) {
  // تحرير اللوحات المرتبطة أولاً
  await supabase
    .from('billboards')
    .update({
      Status: 'available',
      Contract_Number: null,
      Customer_Name: null,
      Rent_Start_Date: null,
      Rent_End_Date: null
    })
    .eq('Contract_Number', contractNumber);

  // حذف العقد
  const result = await (supabase as any)
    .from('Contract')
    .delete()
    .eq('Contract_Number', contractNumber);

  if (result.error) throw result.error;
}

// Export types
export type { ContractData, ContractCreate };
export type { Contract } from '@/types';