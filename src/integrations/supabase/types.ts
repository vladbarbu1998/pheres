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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          country: string
          created_at: string
          first_name: string
          id: string
          is_default: boolean
          label: string | null
          last_name: string
          phone: string | null
          postal_code: string
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          country?: string
          created_at?: string
          first_name: string
          id?: string
          is_default?: boolean
          label?: string | null
          last_name: string
          phone?: string | null
          postal_code: string
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          country?: string
          created_at?: string
          first_name?: string
          id?: string
          is_default?: boolean
          label?: string | null
          last_name?: string
          phone?: string | null
          postal_code?: string
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          archived: boolean
          collection_type: Database["public"]["Enums"]["collection_type"]
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          archived?: boolean
          collection_type?: Database["public"]["Enums"]["collection_type"]
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          archived?: boolean
          collection_type?: Database["public"]["Enums"]["collection_type"]
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_archived: boolean
          is_read: boolean
          message: string
          name: string
          phone: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_archived?: boolean
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_archived?: boolean
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      couture_inquiries: {
        Row: {
          country: string
          created_at: string
          email: string
          id: string
          interested_in_viewing: boolean
          is_archived: boolean
          is_read: boolean
          message: string | null
          name: string
          phone: string | null
          preferred_contact: string
          product_id: string | null
          product_name: string
        }
        Insert: {
          country: string
          created_at?: string
          email: string
          id?: string
          interested_in_viewing?: boolean
          is_archived?: boolean
          is_read?: boolean
          message?: string | null
          name: string
          phone?: string | null
          preferred_contact: string
          product_id?: string | null
          product_name: string
        }
        Update: {
          country?: string
          created_at?: string
          email?: string
          id?: string
          interested_in_viewing?: boolean
          is_archived?: boolean
          is_read?: boolean
          message?: string | null
          name?: string
          phone?: string | null
          preferred_contact?: string
          product_id?: string | null
          product_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "couture_inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          content: string | null
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          is_published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          sku: string | null
          total_price: number
          unit_price: number
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          sku?: string | null
          total_price: number
          unit_price: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          sku?: string | null
          total_price?: number
          unit_price?: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string | null
          billing_address_line_1: string | null
          billing_address_line_2: string | null
          billing_city: string | null
          billing_country: string | null
          billing_first_name: string | null
          billing_last_name: string | null
          billing_postal_code: string | null
          billing_state: string | null
          carrier: string | null
          created_at: string
          currency: string
          customer_email: string | null
          customer_notes: string | null
          delivered_at: string | null
          discount_amount: number
          id: string
          order_number: string
          payment_method: string | null
          payment_status: string | null
          shipped_at: string | null
          shipping_address_line_1: string
          shipping_address_line_2: string | null
          shipping_amount: number
          shipping_city: string
          shipping_country: string
          shipping_first_name: string
          shipping_last_name: string
          shipping_phone: string | null
          shipping_postal_code: string
          shipping_state: string | null
          status: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent_id: string | null
          subtotal: number
          tax_amount: number
          total: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          billing_address_line_1?: string | null
          billing_address_line_2?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_first_name?: string | null
          billing_last_name?: string | null
          billing_postal_code?: string | null
          billing_state?: string | null
          carrier?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_notes?: string | null
          delivered_at?: string | null
          discount_amount?: number
          id?: string
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          shipped_at?: string | null
          shipping_address_line_1: string
          shipping_address_line_2?: string | null
          shipping_amount?: number
          shipping_city: string
          shipping_country: string
          shipping_first_name: string
          shipping_last_name: string
          shipping_phone?: string | null
          shipping_postal_code: string
          shipping_state?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent_id?: string | null
          subtotal: number
          tax_amount?: number
          total: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          billing_address_line_1?: string | null
          billing_address_line_2?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_first_name?: string | null
          billing_last_name?: string | null
          billing_postal_code?: string | null
          billing_state?: string | null
          carrier?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_notes?: string | null
          delivered_at?: string | null
          discount_amount?: number
          id?: string
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          shipped_at?: string | null
          shipping_address_line_1?: string
          shipping_address_line_2?: string | null
          shipping_amount?: number
          shipping_city?: string
          shipping_country?: string
          shipping_first_name?: string
          shipping_last_name?: string
          shipping_phone?: string | null
          shipping_postal_code?: string
          shipping_state?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tax_amount?: number
          total?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      press_articles: {
        Row: {
          created_at: string
          display_order: number
          external_url: string
          id: string
          is_active: boolean
          is_highlight: boolean
          outlet_id: string
          publish_date: string | null
          short_description: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          external_url: string
          id?: string
          is_active?: boolean
          is_highlight?: boolean
          outlet_id: string
          publish_date?: string | null
          short_description?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          external_url?: string
          id?: string
          is_active?: boolean
          is_highlight?: boolean
          outlet_id?: string
          publish_date?: string | null
          short_description?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "press_articles_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "press_outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      press_entries: {
        Row: {
          celebrity_name: string | null
          created_at: string
          description: string | null
          display_order: number
          event_date: string | null
          event_name: string | null
          external_link: string | null
          id: string
          image_url: string | null
          is_featured: boolean
          is_published: boolean
          jewelry_photo_url: string | null
          location: string | null
          notes: string | null
          section: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          celebrity_name?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          event_date?: string | null
          event_name?: string | null
          external_link?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          jewelry_photo_url?: string | null
          location?: string | null
          notes?: string | null
          section?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          celebrity_name?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          event_date?: string | null
          event_name?: string | null
          external_link?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          jewelry_photo_url?: string | null
          location?: string | null
          notes?: string | null
          section?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      press_outlets: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          logo_url: string
          name: string
          slug: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          logo_url: string
          name: string
          slug: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          logo_url?: string
          name?: string
          slug?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      product_collections: {
        Row: {
          collection_id: string
          created_at: string
          id: string
          product_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          id?: string
          product_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_collections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_primary: boolean
          product_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_primary?: boolean
          product_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_primary?: boolean
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_metals: {
        Row: {
          created_at: string
          display_order: number
          id: string
          metal_type: string
          metal_weight: string | null
          product_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          metal_type: string
          metal_weight?: string | null
          product_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          metal_type?: string
          metal_weight?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_metals_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_stones: {
        Row: {
          created_at: string
          display_order: number
          id: string
          product_id: string
          stone_carat: string | null
          stone_clarity: string | null
          stone_color: string | null
          stone_cut: string | null
          stone_type: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          product_id: string
          stone_carat?: string | null
          stone_clarity?: string | null
          stone_color?: string | null
          stone_cut?: string | null
          stone_type: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          product_id?: string
          stone_carat?: string | null
          stone_clarity?: string | null
          stone_color?: string | null
          stone_cut?: string | null
          stone_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_stones_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          price_adjustment: number
          product_id: string
          sku: string
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          price_adjustment?: number
          product_id: string
          sku: string
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          price_adjustment?: number
          product_id?: string
          sku?: string
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          archived: boolean
          base_price: number
          category_id: string | null
          certification: string | null
          compare_at_price: number | null
          created_at: string
          description: string | null
          gross_weight: string | null
          id: string
          is_active: boolean
          is_bestseller: boolean
          is_featured: boolean
          is_new: boolean
          metal_type: string | null
          metal_weight: string | null
          model_number: string | null
          name: string
          product_number: string | null
          product_type: Database["public"]["Enums"]["product_type"]
          short_description: string | null
          size: string | null
          sku: string | null
          slug: string
          stone_carat: string | null
          stone_clarity: string | null
          stone_color: string | null
          stone_cut: string | null
          stone_type: string | null
          updated_at: string
        }
        Insert: {
          archived?: boolean
          base_price: number
          category_id?: string | null
          certification?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          gross_weight?: string | null
          id?: string
          is_active?: boolean
          is_bestseller?: boolean
          is_featured?: boolean
          is_new?: boolean
          metal_type?: string | null
          metal_weight?: string | null
          model_number?: string | null
          name: string
          product_number?: string | null
          product_type?: Database["public"]["Enums"]["product_type"]
          short_description?: string | null
          size?: string | null
          sku?: string | null
          slug: string
          stone_carat?: string | null
          stone_clarity?: string | null
          stone_color?: string | null
          stone_cut?: string | null
          stone_type?: string | null
          updated_at?: string
        }
        Update: {
          archived?: boolean
          base_price?: number
          category_id?: string | null
          certification?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          gross_weight?: string | null
          id?: string
          is_active?: boolean
          is_bestseller?: boolean
          is_featured?: boolean
          is_new?: boolean
          metal_type?: string | null
          metal_weight?: string | null
          model_number?: string | null
          name?: string
          product_number?: string | null
          product_type?: Database["public"]["Enums"]["product_type"]
          short_description?: string | null
          size?: string | null
          sku?: string | null
          slug?: string
          stone_carat?: string | null
          stone_clarity?: string | null
          stone_color?: string | null
          stone_cut?: string | null
          stone_type?: string | null
          updated_at?: string
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
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      story_sections: {
        Row: {
          content: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          title?: string
          updated_at?: string
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
      app_role: "admin"
      collection_type: "couture" | "ready_to_wear"
      order_status:
        | "pending"
        | "paid"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      product_type: "couture" | "ready_to_wear"
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
      app_role: ["admin"],
      collection_type: ["couture", "ready_to_wear"],
      order_status: [
        "pending",
        "paid",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      product_type: ["couture", "ready_to_wear"],
    },
  },
} as const
