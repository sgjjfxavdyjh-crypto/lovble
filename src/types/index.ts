export interface Billboard {
  ID: number;
  Billboard_Name: string;
  City: string;
  District: string;
  Municipality?: string;
  Size: string;
  Status: string;
  Price: string;
  Level: string;
  Image_URL: string;
  GPS_Coordinates: string;
  GPS_Link: string;
  Nearest_Landmark: string;
  Faces_Count: string;
  Contract_Number?: string;
  Customer_Name?: string;
  Rent_Start_Date?: string;
  Rent_End_Date?: string;
  Days_Count?: string;
  Review?: string;
  Category_Level?: string;
  Ad_Type?: string;
  Order_Size?: number;
  '@IMAGE'?: string;
  GPS_Link_Click?: string;
  'المقاس مع الدغاية'?: string;
}

export interface Contract {
  id?: number;
  'Contract Number': string;
  'Customer Name': string;
  'Contract Date': string;
  Duration?: string;
  'End Date': string;
  'Ad Type': string;
  'Total Rent': number;
  'Installation Cost': number;
  Total: string;
  'Payment 1'?: string;
  'Payment 2'?: string;
  'Payment 3'?: string;
  'Total Paid'?: string;
  Remaining?: string;
  Level?: string;
  Phone?: string;
  Company?: string;
  'Print Status'?: string;
  Discount?: number;
  'Renewal Status'?: string;
  'Actual 3% Fee'?: string;
  '3% Fee'?: string;
}

export interface Pricing {
  id?: number;
  size: string;
  Billboard_Level: string;
  Customer_Category: string;
  One_Day: number;
  One_Month: number;
  '2_Months': number;
  '3_Months': number;
  '6_Months': number;
  Full_Year: number;
}

export interface BookingRequest {
  id: string;
  userId: string;
  billboards: Billboard[];
  totalPrice: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
}

export interface PricingConfig {
  rentPrices: Record<string, number>;
  installationPrices: Record<string, number>;
}