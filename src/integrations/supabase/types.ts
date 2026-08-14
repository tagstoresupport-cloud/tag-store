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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      banners: {
        Row: {
          button_text: string
          button_url: string
          created_at: string
          description: string
          end_date: string | null
          id: string
          image_path: string | null
          is_active: boolean
          mobile_image_path: string | null
          sort_order: number
          start_date: string | null
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          button_text?: string
          button_url?: string
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          image_path?: string | null
          is_active?: boolean
          mobile_image_path?: string | null
          sort_order?: number
          start_date?: string | null
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Update: {
          button_text?: string
          button_url?: string
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          image_path?: string | null
          is_active?: boolean
          mobile_image_path?: string | null
          sort_order?: number
          start_date?: string | null
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          image_path: string | null
          is_visible: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_path?: string | null
          is_visible?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_path?: string | null
          is_visible?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_enabled: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      nav_items: {
        Row: {
          created_at: string
          id: string
          is_visible: boolean
          label: string
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible?: boolean
          label?: string
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_visible?: boolean
          label?: string
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_name: string
          email: string
          id: string
          items: Json
          notes: string | null
          order_number: string
          payment_account: string
          payment_method: string
          payment_screenshot_path: string | null
          phone: string
          status: string
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          email: string
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          payment_account?: string
          payment_method?: string
          payment_screenshot_path?: string | null
          phone: string
          status?: string
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          email?: string
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          payment_account?: string
          payment_method?: string
          payment_screenshot_path?: string | null
          phone?: string
          status?: string
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_name: string
          account_number: string
          created_at: string
          id: string
          instructions: string
          is_enabled: boolean
          logo_path: string | null
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          account_name?: string
          account_number?: string
          created_at?: string
          id?: string
          instructions?: string
          is_enabled?: boolean
          logo_path?: string | null
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          created_at?: string
          id?: string
          instructions?: string
          is_enabled?: boolean
          logo_path?: string | null
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          best_seller_order: number
          category_id: string | null
          created_at: string
          description: string
          featured_order: number
          id: string
          images: Json
          is_best_seller: boolean
          is_featured: boolean
          is_visible: boolean
          main_image: string | null
          name: string
          slug: string
          sort_order: number
          updated_at: string
          variants: Json
        }
        Insert: {
          best_seller_order?: number
          category_id?: string | null
          created_at?: string
          description?: string
          featured_order?: number
          id?: string
          images?: Json
          is_best_seller?: boolean
          is_featured?: boolean
          is_visible?: boolean
          main_image?: string | null
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
          variants?: Json
        }
        Update: {
          best_seller_order?: number
          category_id?: string | null
          created_at?: string
          description?: string
          featured_order?: number
          id?: string
          images?: Json
          is_best_seller?: boolean
          is_featured?: boolean
          is_visible?: boolean
          main_image?: string | null
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          variants?: Json
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          button_text: string
          button_url: string
          created_at: string
          description: string
          id: string
          image_path: string | null
          is_enabled: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          button_text?: string
          button_url?: string
          created_at?: string
          description?: string
          id?: string
          image_path?: string | null
          is_enabled?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Update: {
          button_text?: string
          button_url?: string
          created_at?: string
          description?: string
          id?: string
          image_path?: string | null
          is_enabled?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          icon: string
          id: string
          is_enabled: boolean
          platform: string
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          is_enabled?: boolean
          platform?: string
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          is_enabled?: boolean
          platform?: string
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          address: string
          favicon_path: string | null
          favicon_url: string | null
          footer_text: string
          id: number
          logo_path: string | null
          logo_url: string | null
          og_image_path: string | null
          social_links: Json
          store_description: string
          store_name: string
          support_email: string
          support_phone: string
          updated_at: string
          vodafone_number: string
          working_hours: string
        }
        Insert: {
          address?: string
          favicon_path?: string | null
          favicon_url?: string | null
          footer_text?: string
          id?: number
          logo_path?: string | null
          logo_url?: string | null
          og_image_path?: string | null
          social_links?: Json
          store_description?: string
          store_name?: string
          support_email?: string
          support_phone?: string
          updated_at?: string
          vodafone_number?: string
          working_hours?: string
        }
        Update: {
          address?: string
          favicon_path?: string | null
          favicon_url?: string | null
          footer_text?: string
          id?: number
          logo_path?: string | null
          logo_url?: string | null
          og_image_path?: string | null
          social_links?: Json
          store_description?: string
          store_name?: string
          support_email?: string
          support_phone?: string
          updated_at?: string
          vodafone_number?: string
          working_hours?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
