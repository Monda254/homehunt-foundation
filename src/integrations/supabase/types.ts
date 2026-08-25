export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          after_data: Json | null;
          before_data: Json | null;
          created_at: string;
          id: string;
          ip_address: unknown;
          request_id: string | null;
          resource_id: string | null;
          resource_type: string;
          user_agent: string | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          after_data?: Json | null;
          before_data?: Json | null;
          created_at?: string;
          id?: string;
          ip_address?: unknown;
          request_id?: string | null;
          resource_id?: string | null;
          resource_type: string;
          user_agent?: string | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          after_data?: Json | null;
          before_data?: Json | null;
          created_at?: string;
          id?: string;
          ip_address?: unknown;
          request_id?: string | null;
          resource_id?: string | null;
          resource_type?: string;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          first_name: string | null;
          last_name: string | null;
          display_name: string | null;
          bio: string | null;
          phone_number: string | null;
          preferred_county: string | null;
          county: string | null;
          town: string | null;
          preferred_language: string;
          onboarding_completed: boolean;
          status: Database["public"]["Enums"]["account_status"];
          last_login_at: string | null;
          deleted_at: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          display_name?: string | null;
          bio?: string | null;
          phone_number?: string | null;
          preferred_county?: string | null;
          county?: string | null;
          town?: string | null;
          preferred_language?: string;
          onboarding_completed?: boolean;
          status?: Database["public"]["Enums"]["account_status"];
          last_login_at?: string | null;
          deleted_at?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          display_name?: string | null;
          bio?: string | null;
          phone_number?: string | null;
          preferred_county?: string | null;
          county?: string | null;
          town?: string | null;
          preferred_language?: string;
          onboarding_completed?: boolean;
          status?: Database["public"]["Enums"]["account_status"];
          last_login_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          granted_by: string | null;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          granted_by?: string | null;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          granted_by?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          permission_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          permission_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          permission_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      verification_tokens: {
        Row: {
          id: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token_hash?: string;
          expires_at?: string;
          used_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      password_reset_tokens: {
        Row: {
          id: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token_hash?: string;
          expires_at?: string;
          used_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          session_token_hash: string;
          created_at: string;
          expires_at: string;
          last_seen_at: string;
          revoked_at: string | null;
          ip_address: unknown;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_token_hash: string;
          created_at?: string;
          expires_at: string;
          last_seen_at?: string;
          revoked_at?: string | null;
          ip_address?: unknown;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_token_hash?: string;
          created_at?: string;
          expires_at?: string;
          last_seen_at?: string;
          revoked_at?: string | null;
          ip_address?: unknown;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          property_type: Database["public"]["Enums"]["property_type"];
          name: string;
          description: string | null;
          status: Database["public"]["Enums"]["property_status"];
          owner_user_id: string;
          created_by_user_id: string;
          country: string;
          county: string;
          town: string;
          neighborhood: string | null;
          estate: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          landmark_description: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          property_type: Database["public"]["Enums"]["property_type"];
          name: string;
          description?: string | null;
          status?: Database["public"]["Enums"]["property_status"];
          owner_user_id: string;
          created_by_user_id: string;
          country?: string;
          county: string;
          town: string;
          neighborhood?: string | null;
          estate?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          landmark_description?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          property_type?: Database["public"]["Enums"]["property_type"];
          name?: string;
          description?: string | null;
          status?: Database["public"]["Enums"]["property_status"];
          owner_user_id?: string;
          created_by_user_id?: string;
          country?: string;
          county?: string;
          town?: string;
          neighborhood?: string | null;
          estate?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          landmark_description?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      buildings: {
        Row: {
          id: string;
          property_id: string;
          name: string;
          description: string | null;
          floors: number | null;
          year_built: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          name: string;
          description?: string | null;
          floors?: number | null;
          year_built?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          name?: string;
          description?: string | null;
          floors?: number | null;
          year_built?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      units: {
        Row: {
          id: string;
          property_id: string;
          building_id: string | null;
          unit_number: string;
          unit_type: Database["public"]["Enums"]["unit_type"];
          floor: number | null;
          bedrooms: number;
          bathrooms: number;
          area: number | null;
          status: Database["public"]["Enums"]["unit_status"];
          description: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          property_id: string;
          building_id?: string | null;
          unit_number: string;
          unit_type: Database["public"]["Enums"]["unit_type"];
          floor?: number | null;
          bedrooms?: number;
          bathrooms?: number;
          area?: number | null;
          status?: Database["public"]["Enums"]["unit_status"];
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          property_id?: string;
          building_id?: string | null;
          unit_number?: string;
          unit_type?: Database["public"]["Enums"]["unit_type"];
          floor?: number | null;
          bedrooms?: number;
          bathrooms?: number;
          area?: number | null;
          status?: Database["public"]["Enums"]["unit_status"];
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      property_amenities: {
        Row: {
          id: string;
          property_id: string;
          amenity: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          amenity: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          amenity?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      unit_amenities: {
        Row: {
          id: string;
          unit_id: string;
          amenity: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          unit_id: string;
          amenity: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          unit_id?: string;
          amenity?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      property_parties: {
        Row: {
          id: string;
          property_id: string;
          user_id: string;
          relationship_type: Database["public"]["Enums"]["relationship_type"];
          status: Database["public"]["Enums"]["relationship_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          user_id: string;
          relationship_type: Database["public"]["Enums"]["relationship_type"];
          status?: Database["public"]["Enums"]["relationship_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          user_id?: string;
          relationship_type?: Database["public"]["Enums"]["relationship_type"];
          status?: Database["public"]["Enums"]["relationship_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          property_id: string;
          unit_id: string | null;
          title: string;
          description: string | null;
          listing_type: Database["public"]["Enums"]["listing_type"];
          status: Database["public"]["Enums"]["listing_status"];
          price: number;
          currency: string;
          billing_period: Database["public"]["Enums"]["billing_period"];
          deposit_amount: number | null;
          availability_date: string;
          published_at: string | null;
          expires_at: string | null;
          created_by_user_id: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          property_id: string;
          unit_id?: string | null;
          title: string;
          description?: string | null;
          listing_type?: Database["public"]["Enums"]["listing_type"];
          status?: Database["public"]["Enums"]["listing_status"];
          price: number;
          currency?: string;
          billing_period?: Database["public"]["Enums"]["billing_period"];
          deposit_amount?: number | null;
          availability_date: string;
          published_at?: string | null;
          expires_at?: string | null;
          created_by_user_id: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          property_id?: string | null;
          unit_id?: string | null;
          title?: string;
          description?: string | null;
          listing_type?: Database["public"]["Enums"]["listing_type"];
          status?: Database["public"]["Enums"]["listing_status"];
          price?: number;
          currency?: string;
          billing_period?: Database["public"]["Enums"]["billing_period"];
          deposit_amount?: number | null;
          availability_date?: string;
          published_at?: string | null;
          expires_at?: string | null;
          created_by_user_id?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      property_media: {
        Row: {
          id: string;
          property_id: string | null;
          unit_id: string | null;
          listing_id: string | null;
          media_type: Database["public"]["Enums"]["media_type"];
          url: string;
          storage_key: string | null;
          caption: string | null;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id?: string | null;
          unit_id?: string | null;
          listing_id?: string | null;
          media_type?: Database["public"]["Enums"]["media_type"];
          url: string;
          storage_key?: string | null;
          caption?: string | null;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string | null;
          unit_id?: string | null;
          listing_id?: string | null;
          media_type?: Database["public"]["Enums"]["media_type"];
          url?: string;
          storage_key?: string | null;
          caption?: string | null;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_user_roles: {
        Args: never;
        Returns: Database["public"]["Enums"]["app_role"][];
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_platform_admin: { Args: { _user_id: string }; Returns: boolean };
    };
    Enums: {
      app_role: "tenant" | "landlord" | "agent" | "property_manager" | "verifier" | "admin" | "super_admin";
      account_status: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION" | "DEACTIVATED" | "LOCKED";
      user_status: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
      property_status: "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";
      property_type:
        | "APARTMENT"
        | "HOUSE"
        | "BEDSITTER"
        | "STUDIO"
        | "MAISONETTE"
        | "TOWNHOUSE"
        | "VILLA"
        | "BUNGALOW"
        | "ROOM"
        | "SHARED_ACCOMMODATION"
        | "OTHER";
      unit_status: "DRAFT" | "AVAILABLE" | "RESERVED" | "OCCUPIED" | "MAINTENANCE" | "UNAVAILABLE" | "ARCHIVED";
      unit_type:
        | "BEDSITTER"
        | "STUDIO"
        | "ONE_BEDROOM"
        | "TWO_BEDROOM"
        | "THREE_BEDROOM"
        | "FOUR_PLUS_BEDROOM"
        | "ROOM"
        | "SHARED"
        | "HOUSE"
        | "OTHER";
      listing_status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "PAUSED" | "EXPIRED" | "ARCHIVED";
      listing_type: "FOR_RENT" | "FOR_SALE";
      billing_period: "MONTHLY" | "WEEKLY" | "DAILY" | "YEARLY";
      relationship_type: "OWNER" | "AGENT" | "PROPERTY_MANAGER";
      relationship_status: "ACTIVE" | "PENDING" | "REVOKED";
      media_type: "IMAGE" | "VIDEO" | "FLOOR_PLAN" | "DOCUMENT";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["tenant", "landlord", "agent", "property_manager", "verifier", "admin", "super_admin"],
      account_status: ["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION", "DEACTIVATED", "LOCKED"],
      user_status: ["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION"],
      property_status: ["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"],
      property_type: [
        "APARTMENT",
        "HOUSE",
        "BEDSITTER",
        "STUDIO",
        "MAISONETTE",
        "TOWNHOUSE",
        "VILLA",
        "BUNGALOW",
        "ROOM",
        "SHARED_ACCOMMODATION",
        "OTHER",
      ],
      unit_status: ["DRAFT", "AVAILABLE", "RESERVED", "OCCUPIED", "MAINTENANCE", "UNAVAILABLE", "ARCHIVED"],
      unit_type: [
        "BEDSITTER",
        "STUDIO",
        "ONE_BEDROOM",
        "TWO_BEDROOM",
        "THREE_BEDROOM",
        "FOUR_PLUS_BEDROOM",
        "ROOM",
        "SHARED",
        "HOUSE",
        "OTHER",
      ],
      listings_status: ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "PAUSED", "EXPIRED", "ARCHIVED"],
      listing_type: ["FOR_RENT", "FOR_SALE"],
      billing_period: ["MONTHLY", "WEEKLY", "DAILY", "YEARLY"],
      relationship_type: ["OWNER", "AGENT", "PROPERTY_MANAGER"],
      relationship_status: ["ACTIVE", "PENDING", "REVOKED"],
      media_type: ["IMAGE", "VIDEO", "FLOOR_PLAN", "DOCUMENT"],
    },
  },
} as const;
