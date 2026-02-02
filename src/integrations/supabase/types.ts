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
      bike_listings: {
        Row: {
          admin_notes: string | null
          category: string
          contact_email: string | null
          contact_phone: string
          created_at: string
          description: string | null
          engine: string | null
          id: string
          images: string[] | null
          location: string
          name: string
          notes: string | null
          power: string | null
          price_per_day: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          category: string
          contact_email?: string | null
          contact_phone: string
          created_at?: string
          description?: string | null
          engine?: string | null
          id?: string
          images?: string[] | null
          location: string
          name: string
          notes?: string | null
          power?: string | null
          price_per_day?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          category?: string
          contact_email?: string | null
          contact_phone?: string
          created_at?: string
          description?: string | null
          engine?: string | null
          id?: string
          images?: string[] | null
          location?: string
          name?: string
          notes?: string | null
          power?: string | null
          price_per_day?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bikes: {
        Row: {
          available: boolean | null
          category: string
          created_at: string
          description: string | null
          engine: string | null
          id: string
          image: string | null
          name: string
          power: string | null
          price: number
          rating: number | null
          reviews_count: number | null
          seats: number | null
          updated_at: string
        }
        Insert: {
          available?: boolean | null
          category: string
          created_at?: string
          description?: string | null
          engine?: string | null
          id?: string
          image?: string | null
          name: string
          power?: string | null
          price?: number
          rating?: number | null
          reviews_count?: number | null
          seats?: number | null
          updated_at?: string
        }
        Update: {
          available?: boolean | null
          category?: string
          created_at?: string
          description?: string | null
          engine?: string | null
          id?: string
          image?: string | null
          name?: string
          power?: string | null
          price?: number
          rating?: number | null
          reviews_count?: number | null
          seats?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      booking_gear: {
        Row: {
          booking_id: string | null
          created_at: string
          gear_id: string | null
          id: string
          price_per_day: number
          quantity: number
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          gear_id?: string | null
          id?: string
          price_per_day: number
          quantity?: number
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          gear_id?: string | null
          id?: string
          price_per_day?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_gear_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_gear_gear_id_fkey"
            columns: ["gear_id"]
            isOneToOne: false
            referencedRelation: "gear_items"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          bike_id: string | null
          bike_name: string | null
          created_at: string
          discount_amount: number | null
          gear_total: number | null
          id: string
          notes: string | null
          pickup_date: string
          pickup_location: string
          promo_code: string | null
          return_date: string
          reviewed: boolean | null
          status: string
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bike_id?: string | null
          bike_name?: string | null
          created_at?: string
          discount_amount?: number | null
          gear_total?: number | null
          id?: string
          notes?: string | null
          pickup_date: string
          pickup_location: string
          promo_code?: string | null
          return_date: string
          reviewed?: boolean | null
          status?: string
          total_price?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bike_id?: string | null
          bike_name?: string | null
          created_at?: string
          discount_amount?: number | null
          gear_total?: number | null
          id?: string
          notes?: string | null
          pickup_date?: string
          pickup_location?: string
          promo_code?: string | null
          return_date?: string
          reviewed?: boolean | null
          status?: string
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_bike_id_fkey"
            columns: ["bike_id"]
            isOneToOne: false
            referencedRelation: "bikes"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          name: string
          phone: string
          relationship: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          name: string
          phone: string
          relationship?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string
          relationship?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fleet_maintenance: {
        Row: {
          bike_id: string | null
          bike_name: string
          completed_date: string | null
          cost: number | null
          created_at: string
          description: string | null
          id: string
          maintenance_type: string
          mileage: number | null
          next_service_mileage: number | null
          notes: string | null
          priority: string
          scheduled_date: string
          status: string
          technician: string | null
          updated_at: string
        }
        Insert: {
          bike_id?: string | null
          bike_name: string
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          maintenance_type: string
          mileage?: number | null
          next_service_mileage?: number | null
          notes?: string | null
          priority?: string
          scheduled_date: string
          status?: string
          technician?: string | null
          updated_at?: string
        }
        Update: {
          bike_id?: string | null
          bike_name?: string
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          maintenance_type?: string
          mileage?: number | null
          next_service_mileage?: number | null
          notes?: string | null
          priority?: string
          scheduled_date?: string
          status?: string
          technician?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleet_maintenance_bike_id_fkey"
            columns: ["bike_id"]
            isOneToOne: false
            referencedRelation: "bikes"
            referencedColumns: ["id"]
          },
        ]
      }
      gear_items: {
        Row: {
          active: boolean | null
          category: string
          created_at: string
          description: string | null
          id: string
          image: string | null
          name: string
          price_per_day: number
          quantity_available: number
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name: string
          price_per_day: number
          quantity_available?: number
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          price_per_day?: number
          quantity_available?: number
          updated_at?: string
        }
        Relationships: []
      }
      guided_tours: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          difficulty: string | null
          duration_hours: number
          id: string
          images: string[] | null
          includes: string[] | null
          max_participants: number | null
          meeting_point: string
          price_per_person: number
          requirements: string[] | null
          route_highlights: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_hours: number
          id?: string
          images?: string[] | null
          includes?: string[] | null
          max_participants?: number | null
          meeting_point: string
          price_per_person: number
          requirements?: string[] | null
          route_highlights?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_hours?: number
          id?: string
          images?: string[] | null
          includes?: string[] | null
          max_participants?: number | null
          meeting_point?: string
          price_per_person?: number
          requirements?: string[] | null
          route_highlights?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          created_at: string
          id: string
          lifetime_points: number
          tier: string
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lifetime_points?: number
          tier?: string
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lifetime_points?: number
          tier?: string
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      maintenance_progress: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          photo_url: string | null
          service_id: string
          stage: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          photo_url?: string | null
          service_id: string
          stage: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          photo_url?: string | null
          service_id?: string
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_progress_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          subscribed: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          subscribed?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          subscribed?: boolean | null
        }
        Relationships: []
      }
      parts_requests: {
        Row: {
          admin_notes: string | null
          bike_make: string
          bike_model: string
          bike_year: number | null
          contact_email: string | null
          contact_phone: string
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          part_name: string
          part_number: string | null
          quantity: number | null
          quoted_price: number | null
          status: string
          supplier_notes: string | null
          updated_at: string
          urgency: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          bike_make: string
          bike_model: string
          bike_year?: number | null
          contact_email?: string | null
          contact_phone: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          part_name: string
          part_number?: string | null
          quantity?: number | null
          quoted_price?: number | null
          status?: string
          supplier_notes?: string | null
          updated_at?: string
          urgency?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          bike_make?: string
          bike_model?: string
          bike_year?: number | null
          contact_email?: string | null
          contact_phone?: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          part_name?: string
          part_number?: string | null
          quantity?: number | null
          quoted_price?: number | null
          status?: string
          supplier_notes?: string | null
          updated_at?: string
          urgency?: string | null
          user_id?: string
        }
        Relationships: []
      }
      points_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          points: number
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          points: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          active: boolean | null
          code: string
          created_at: string
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          max_uses: number | null
          min_order_value: number | null
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string
          current_uses?: number | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          max_uses?: number | null
          min_order_value?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          max_uses?: number | null
          min_order_value?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          id: string
          min_tier: string | null
          name: string
          points_required: number
          quantity_available: number | null
          reward_type: string
          reward_value: number
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          min_tier?: string | null
          name: string
          points_required: number
          quantity_available?: number | null
          reward_type: string
          reward_value: number
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          min_tier?: string | null
          name?: string
          points_required?: number
          quantity_available?: number | null
          reward_type?: string
          reward_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      self_guided_routes: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          difficulty: string | null
          distance_km: number
          end_point: string
          estimated_hours: number
          gpx_file_url: string | null
          id: string
          images: string[] | null
          map_url: string | null
          points_of_interest: Json | null
          start_point: string
          terrain_type: string[] | null
          tips: string[] | null
          title: string
          updated_at: string
          waypoints: Json | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          distance_km: number
          end_point: string
          estimated_hours: number
          gpx_file_url?: string | null
          id?: string
          images?: string[] | null
          map_url?: string | null
          points_of_interest?: Json | null
          start_point: string
          terrain_type?: string[] | null
          tips?: string[] | null
          title: string
          updated_at?: string
          waypoints?: Json | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          distance_km?: number
          end_point?: string
          estimated_hours?: number
          gpx_file_url?: string | null
          id?: string
          images?: string[] | null
          map_url?: string | null
          points_of_interest?: Json | null
          start_point?: string
          terrain_type?: string[] | null
          tips?: string[] | null
          title?: string
          updated_at?: string
          waypoints?: Json | null
        }
        Relationships: []
      }
      services: {
        Row: {
          actual_completion: string | null
          assigned_technician: string | null
          bike: string
          cost_breakdown: Json | null
          created_at: string
          estimated_completion: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          preferred_date: string
          progress_photos: string[] | null
          progress_stage: string | null
          services: Json
          status: string
          technician_notes: Json | null
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_completion?: string | null
          assigned_technician?: string | null
          bike: string
          cost_breakdown?: Json | null
          created_at?: string
          estimated_completion?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          preferred_date: string
          progress_photos?: string[] | null
          progress_stage?: string | null
          services?: Json
          status?: string
          technician_notes?: Json | null
          total_price?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_completion?: string | null
          assigned_technician?: string | null
          bike?: string
          cost_breakdown?: Json | null
          created_at?: string
          estimated_completion?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          preferred_date?: string
          progress_photos?: string[] | null
          progress_stage?: string | null
          services?: Json
          status?: string
          technician_notes?: Json | null
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sos_requests: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          emergency_type: string
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          name: string
          notes: string | null
          phone: string
          resolved_at: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          emergency_type: string
          id?: string
          latitude?: number | null
          location: string
          longitude?: number | null
          name: string
          notes?: string | null
          phone: string
          resolved_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          emergency_type?: string
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          name?: string
          notes?: string | null
          phone?: string
          resolved_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tour_bookings: {
        Row: {
          admin_notes: string | null
          contact_phone: string
          created_at: string
          id: string
          participants: number | null
          payment_status: string | null
          special_requests: string | null
          status: string
          total_price: number
          tour_date: string
          tour_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          contact_phone: string
          created_at?: string
          id?: string
          participants?: number | null
          payment_status?: string | null
          special_requests?: string | null
          status?: string
          total_price: number
          tour_date: string
          tour_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          contact_phone?: string
          created_at?: string
          id?: string
          participants?: number | null
          payment_status?: string | null
          special_requests?: string | null
          status?: string
          total_price?: number
          tour_date?: string
          tour_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_bookings_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "guided_tours"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          reward_code: string
          reward_id: string | null
          status: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          reward_code: string
          reward_id?: string | null
          status?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          reward_code?: string
          reward_id?: string | null
          status?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
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
      vehicle_sales: {
        Row: {
          admin_notes: string | null
          brand: string
          color: string | null
          condition: string
          contact_email: string | null
          contact_phone: string
          created_at: string
          description: string | null
          engine: string | null
          features: string[] | null
          id: string
          images: string[] | null
          listing_type: string
          location: string
          mileage: number | null
          model: string
          negotiable: boolean | null
          power: string | null
          price: number
          status: string
          title: string
          updated_at: string
          user_id: string | null
          vehicle_type: string
          views_count: number | null
          year: number | null
        }
        Insert: {
          admin_notes?: string | null
          brand: string
          color?: string | null
          condition: string
          contact_email?: string | null
          contact_phone: string
          created_at?: string
          description?: string | null
          engine?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          listing_type?: string
          location: string
          mileage?: number | null
          model: string
          negotiable?: boolean | null
          power?: string | null
          price: number
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
          vehicle_type: string
          views_count?: number | null
          year?: number | null
        }
        Update: {
          admin_notes?: string | null
          brand?: string
          color?: string | null
          condition?: string
          contact_email?: string | null
          contact_phone?: string
          created_at?: string
          description?: string | null
          engine?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          listing_type?: string
          location?: string
          mileage?: number | null
          model?: string
          negotiable?: boolean | null
          power?: string | null
          price?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
          vehicle_type?: string
          views_count?: number | null
          year?: number | null
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
      app_role: "user" | "supervisor" | "admin"
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
      app_role: ["user", "supervisor", "admin"],
    },
  },
} as const
