export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      billboards: {
        Row: {
          "@IMAGE": string | null
          Ad_Type: string | null
          Billboard_Name: string | null
          Category_Level: string | null
          City: string | null
          contract_id: string | null
          Contract_Number: string | null
          customer_name: string | null
          Customer_Name: string | null
          Days_Count: string | null
          District: string | null
          end_date: string | null
          Faces_Count: string | null
          GPS_Coordinates: string | null
          GPS_Link: string | null
          GPS_Link_Click: string | null
          ID: number | null
          Image_URL: string | null
          Level: string | null
          Municipality: string | null
          Nearest_Landmark: string | null
          Order_Size: number | null
          Price: string | null
          Rent_End_Date: string | null
          Rent_Start_Date: string | null
          Review: string | null
          Size: string | null
          start_date: string | null
          Status: string | null
          "المقاس مع الدغاية": string | null
        }
        Insert: {
          "@IMAGE"?: string | null
          Ad_Type?: string | null
          Billboard_Name?: string | null
          Category_Level?: string | null
          City?: string | null
          contract_id?: string | null
          Contract_Number?: string | null
          customer_name?: string | null
          Customer_Name?: string | null
          Days_Count?: string | null
          District?: string | null
          end_date?: string | null
          Faces_Count?: string | null
          GPS_Coordinates?: string | null
          GPS_Link?: string | null
          GPS_Link_Click?: string | null
          ID?: number | null
          Image_URL?: string | null
          Level?: string | null
          Municipality?: string | null
          Nearest_Landmark?: string | null
          Order_Size?: number | null
          Price?: string | null
          Rent_End_Date?: string | null
          Rent_Start_Date?: string | null
          Review?: string | null
          Size?: string | null
          start_date?: string | null
          Status?: string | null
          "المقاس مع الدغاية"?: string | null
        }
        Update: {
          "@IMAGE"?: string | null
          Ad_Type?: string | null
          Billboard_Name?: string | null
          Category_Level?: string | null
          City?: string | null
          contract_id?: string | null
          Contract_Number?: string | null
          customer_name?: string | null
          Customer_Name?: string | null
          Days_Count?: string | null
          District?: string | null
          end_date?: string | null
          Faces_Count?: string | null
          GPS_Coordinates?: string | null
          GPS_Link?: string | null
          GPS_Link_Click?: string | null
          ID?: number | null
          Image_URL?: string | null
          Level?: string | null
          Municipality?: string | null
          Nearest_Landmark?: string | null
          Order_Size?: number | null
          Price?: string | null
          Rent_End_Date?: string | null
          Rent_Start_Date?: string | null
          Review?: string | null
          Size?: string | null
          start_date?: string | null
          Status?: string | null
          "المقاس مع الدغاية"?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billboards_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          billboard_ids: string[]
          created_at: string | null
          end_date: string
          id: string
          notes: string | null
          start_date: string
          status: string | null
          total_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billboard_ids: string[]
          created_at?: string | null
          end_date: string
          id?: string
          notes?: string | null
          start_date: string
          status?: string | null
          total_price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billboard_ids?: string[]
          created_at?: string | null
          end_date?: string
          id?: string
          notes?: string | null
          start_date?: string
          status?: string | null
          total_price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          ad_type: string | null
          created_at: string
          customer_name: string
          end_date: string
          id: string
          rent_cost: number
          start_date: string
          updated_at: string
        }
        Insert: {
          ad_type?: string | null
          created_at?: string
          customer_name: string
          end_date: string
          id?: string
          rent_cost?: number
          start_date: string
          updated_at?: string
        }
        Update: {
          ad_type?: string | null
          created_at?: string
          customer_name?: string
          end_date?: string
          id?: string
          rent_cost?: number
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing: {
        Row: {
          "2_Months": number | null
          "3_Months": number | null
          "6_Months": number | null
          Billboard_Level: string | null
          Customer_Category: string | null
          Full_Year: number | null
          id: number | null
          One_Day: number | null
          One_Month: string | null
          size: string | null
        }
        Insert: {
          "2_Months"?: number | null
          "3_Months"?: number | null
          "6_Months"?: number | null
          Billboard_Level?: string | null
          Customer_Category?: string | null
          Full_Year?: number | null
          id?: number | null
          One_Day?: number | null
          One_Month?: string | null
          size?: string | null
        }
        Update: {
          "2_Months"?: number | null
          "3_Months"?: number | null
          "6_Months"?: number | null
          Billboard_Level?: string | null
          Customer_Category?: string | null
          Full_Year?: number | null
          id?: number | null
          One_Day?: number | null
          One_Month?: string | null
          size?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allowed_clients: Json | null
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          password: string | null
          phone: string | null
          price_tier: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          allowed_clients?: Json | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          password?: string | null
          phone?: string | null
          price_tier?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          allowed_clients?: Json | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          password?: string | null
          phone?: string | null
          price_tier?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_set_profile_password: {
        Args: { p_password: string; p_user_id: string }
        Returns: undefined
      }
      auto_release_expired_billboards: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
