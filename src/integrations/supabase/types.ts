export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
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
      blocks: {
        Row: {
          blocked_id: string;
          blocker_id: string;
          created_at: string;
          id: string;
        };
        Insert: {
          blocked_id: string;
          blocker_id: string;
          created_at?: string;
          id?: string;
        };
        Update: {
          blocked_id?: string;
          blocker_id?: string;
          created_at?: string;
          id?: string;
        };
        Relationships: [];
      };
      buildings: {
        Row: {
          created_at: string;
          description: string | null;
          floors: number | null;
          id: string;
          name: string;
          property_id: string;
          updated_at: string;
          year_built: number | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          floors?: number | null;
          id?: string;
          name: string;
          property_id: string;
          updated_at?: string;
          year_built?: number | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          floors?: number | null;
          id?: string;
          name?: string;
          property_id?: string;
          updated_at?: string;
          year_built?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "buildings_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["property_id"];
          },
          {
            foreignKeyName: "buildings_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      communication_reports: {
        Row: {
          conversation_id: string | null;
          created_at: string;
          description: string;
          id: string;
          reason: string;
          reported_id: string;
          reporter_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          conversation_id?: string | null;
          created_at?: string;
          description: string;
          id?: string;
          reason: string;
          reported_id: string;
          reporter_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          conversation_id?: string | null;
          created_at?: string;
          description?: string;
          id?: string;
          reason?: string;
          reported_id?: string;
          reporter_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "communication_reports_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          created_at: string;
          id: string;
          listing_id: string;
          property_id: string;
          provider_id: string;
          seeker_id: string;
          status: string;
          unit_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          listing_id: string;
          property_id: string;
          provider_id: string;
          seeker_id: string;
          status?: string;
          unit_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          listing_id?: string;
          property_id?: string;
          provider_id?: string;
          seeker_id?: string;
          status?: string;
          unit_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["listing_id"];
          },
          {
            foreignKeyName: "conversations_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["property_id"];
          },
          {
            foreignKeyName: "conversations_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["unit_id"];
          },
          {
            foreignKeyName: "conversations_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
        ];
      };
      favorites: {
        Row: {
          created_at: string;
          id: string;
          listing_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          listing_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          listing_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["listing_id"];
          },
        ];
      };
      listing_reports: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          listing_id: string;
          reason: string;
          reporter_id: string;
          resolution: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          status: Database["public"]["Enums"]["report_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          listing_id: string;
          reason: string;
          reporter_id: string;
          resolution?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          listing_id?: string;
          reason?: string;
          reporter_id?: string;
          resolution?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listing_reports_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "listing_reports_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["listing_id"];
          },
        ];
      };
      listings: {
        Row: {
          availability_confirmed_at: string | null;
          availability_date: string;
          billing_period: Database["public"]["Enums"]["billing_period"];
          created_at: string;
          created_by_user_id: string;
          currency: string;
          deleted_at: string | null;
          deposit_amount: number | null;
          description: string | null;
          expires_at: string | null;
          freshness_status: Database["public"]["Enums"]["listing_freshness_status"];
          id: string;
          last_verified_at: string | null;
          listing_type: Database["public"]["Enums"]["listing_type"];
          price: number;
          price_confirmed_at: string | null;
          property_id: string;
          published_at: string | null;
          status: Database["public"]["Enums"]["listing_status"];
          title: string;
          unit_id: string | null;
          updated_at: string;
          verification_status: Database["public"]["Enums"]["verification_status"];
        };
        Insert: {
          availability_confirmed_at?: string | null;
          availability_date: string;
          billing_period?: Database["public"]["Enums"]["billing_period"];
          created_at?: string;
          created_by_user_id: string;
          currency?: string;
          deleted_at?: string | null;
          deposit_amount?: number | null;
          description?: string | null;
          expires_at?: string | null;
          freshness_status?: Database["public"]["Enums"]["listing_freshness_status"];
          id?: string;
          last_verified_at?: string | null;
          listing_type?: Database["public"]["Enums"]["listing_type"];
          price: number;
          price_confirmed_at?: string | null;
          property_id: string;
          published_at?: string | null;
          status?: Database["public"]["Enums"]["listing_status"];
          title: string;
          unit_id?: string | null;
          updated_at?: string;
          verification_status?: Database["public"]["Enums"]["verification_status"];
        };
        Update: {
          availability_confirmed_at?: string | null;
          availability_date?: string;
          billing_period?: Database["public"]["Enums"]["billing_period"];
          created_at?: string;
          created_by_user_id?: string;
          currency?: string;
          deleted_at?: string | null;
          deposit_amount?: number | null;
          description?: string | null;
          expires_at?: string | null;
          freshness_status?: Database["public"]["Enums"]["listing_freshness_status"];
          id?: string;
          last_verified_at?: string | null;
          listing_type?: Database["public"]["Enums"]["listing_type"];
          price?: number;
          price_confirmed_at?: string | null;
          property_id?: string;
          published_at?: string | null;
          status?: Database["public"]["Enums"]["listing_status"];
          title?: string;
          unit_id?: string | null;
          updated_at?: string;
          verification_status?: Database["public"]["Enums"]["verification_status"];
        };
        Relationships: [
          {
            foreignKeyName: "listings_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["property_id"];
          },
          {
            foreignKeyName: "listings_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "listings_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["unit_id"];
          },
          {
            foreignKeyName: "listings_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          message_type: string;
          sender_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          message_type?: string;
          sender_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          message_type?: string;
          sender_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      moderation_appeals: {
        Row: {
          created_at: string;
          id: string;
          notes: string | null;
          reason: string;
          resolved_at: string | null;
          resolved_by: string | null;
          status: Database["public"]["Enums"]["appeal_status"];
          target_id: string;
          target_type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          reason: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: Database["public"]["Enums"]["appeal_status"];
          target_id: string;
          target_type: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          reason?: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: Database["public"]["Enums"]["appeal_status"];
          target_id?: string;
          target_type?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          channel: string;
          created_at: string;
          enabled: boolean;
          id: string;
          notification_type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          channel: string;
          created_at?: string;
          enabled?: boolean;
          id?: string;
          notification_type: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          channel?: string;
          created_at?: string;
          enabled?: boolean;
          id?: string;
          notification_type?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          is_read: boolean;
          notification_type: string;
          payload: Json;
          title: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          notification_type: string;
          payload?: Json;
          title: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          notification_type?: string;
          payload?: Json;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      password_reset_tokens: {
        Row: {
          created_at: string;
          expires_at: string;
          id: string;
          token_hash: string;
          used_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          expires_at: string;
          id?: string;
          token_hash: string;
          used_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          token_hash?: string;
          used_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          agent_verified: boolean;
          avatar_url: string | null;
          bio: string | null;
          county: string | null;
          created_at: string;
          deleted_at: string | null;
          display_name: string | null;
          first_name: string | null;
          full_name: string | null;
          id: string;
          identity_verified: boolean;
          last_login_at: string | null;
          last_name: string | null;
          onboarding_completed: boolean;
          phone_number: string | null;
          preferred_county: string | null;
          preferred_language: string;
          status: Database["public"]["Enums"]["account_status"];
          town: string | null;
          updated_at: string;
        };
        Insert: {
          agent_verified?: boolean;
          avatar_url?: string | null;
          bio?: string | null;
          county?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          display_name?: string | null;
          first_name?: string | null;
          full_name?: string | null;
          id: string;
          identity_verified?: boolean;
          last_login_at?: string | null;
          last_name?: string | null;
          onboarding_completed?: boolean;
          phone_number?: string | null;
          preferred_county?: string | null;
          preferred_language?: string;
          status?: Database["public"]["Enums"]["account_status"];
          town?: string | null;
          updated_at?: string;
        };
        Update: {
          agent_verified?: boolean;
          avatar_url?: string | null;
          bio?: string | null;
          county?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          display_name?: string | null;
          first_name?: string | null;
          full_name?: string | null;
          id?: string;
          identity_verified?: boolean;
          last_login_at?: string | null;
          last_name?: string | null;
          onboarding_completed?: boolean;
          phone_number?: string | null;
          preferred_county?: string | null;
          preferred_language?: string;
          status?: Database["public"]["Enums"]["account_status"];
          town?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          address: string | null;
          country: string;
          county: string;
          created_at: string;
          created_by_user_id: string;
          deleted_at: string | null;
          description: string | null;
          estate: string | null;
          id: string;
          landmark_description: string | null;
          latitude: number | null;
          longitude: number | null;
          name: string;
          neighborhood: string | null;
          owner_user_id: string;
          property_type: Database["public"]["Enums"]["property_type"];
          status: Database["public"]["Enums"]["property_status"];
          town: string;
          updated_at: string;
          verification_status: Database["public"]["Enums"]["verification_status"];
        };
        Insert: {
          address?: string | null;
          country?: string;
          county: string;
          created_at?: string;
          created_by_user_id: string;
          deleted_at?: string | null;
          description?: string | null;
          estate?: string | null;
          id?: string;
          landmark_description?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          name: string;
          neighborhood?: string | null;
          owner_user_id: string;
          property_type: Database["public"]["Enums"]["property_type"];
          status?: Database["public"]["Enums"]["property_status"];
          town: string;
          updated_at?: string;
          verification_status?: Database["public"]["Enums"]["verification_status"];
        };
        Update: {
          address?: string | null;
          country?: string;
          county?: string;
          created_at?: string;
          created_by_user_id?: string;
          deleted_at?: string | null;
          description?: string | null;
          estate?: string | null;
          id?: string;
          landmark_description?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          name?: string;
          neighborhood?: string | null;
          owner_user_id?: string;
          property_type?: Database["public"]["Enums"]["property_type"];
          status?: Database["public"]["Enums"]["property_status"];
          town?: string;
          updated_at?: string;
          verification_status?: Database["public"]["Enums"]["verification_status"];
        };
        Relationships: [];
      };
      property_amenities: {
        Row: {
          amenity: string;
          created_at: string;
          id: string;
          property_id: string;
        };
        Insert: {
          amenity: string;
          created_at?: string;
          id?: string;
          property_id: string;
        };
        Update: {
          amenity?: string;
          created_at?: string;
          id?: string;
          property_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_amenities_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["property_id"];
          },
          {
            foreignKeyName: "property_amenities_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      property_claims: {
        Row: {
          created_at: string;
          id: string;
          property_id: string;
          rejection_reason: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          status: Database["public"]["Enums"]["claim_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          property_id: string;
          rejection_reason?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: Database["public"]["Enums"]["claim_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          property_id?: string;
          rejection_reason?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: Database["public"]["Enums"]["claim_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_claims_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["property_id"];
          },
          {
            foreignKeyName: "property_claims_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      property_media: {
        Row: {
          caption: string | null;
          created_at: string;
          id: string;
          is_primary: boolean;
          listing_id: string | null;
          media_type: Database["public"]["Enums"]["media_type"];
          property_id: string | null;
          sort_order: number;
          storage_key: string | null;
          unit_id: string | null;
          url: string;
        };
        Insert: {
          caption?: string | null;
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          listing_id?: string | null;
          media_type?: Database["public"]["Enums"]["media_type"];
          property_id?: string | null;
          sort_order?: number;
          storage_key?: string | null;
          unit_id?: string | null;
          url: string;
        };
        Update: {
          caption?: string | null;
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          listing_id?: string | null;
          media_type?: Database["public"]["Enums"]["media_type"];
          property_id?: string | null;
          sort_order?: number;
          storage_key?: string | null;
          unit_id?: string | null;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_media_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_media_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["listing_id"];
          },
          {
            foreignKeyName: "property_media_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["property_id"];
          },
          {
            foreignKeyName: "property_media_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_media_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["unit_id"];
          },
          {
            foreignKeyName: "property_media_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
        ];
      };
      property_parties: {
        Row: {
          created_at: string;
          id: string;
          property_id: string;
          relationship_type: Database["public"]["Enums"]["relationship_type"];
          status: Database["public"]["Enums"]["relationship_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          property_id: string;
          relationship_type: Database["public"]["Enums"]["relationship_type"];
          status?: Database["public"]["Enums"]["relationship_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          property_id?: string;
          relationship_type?: Database["public"]["Enums"]["relationship_type"];
          status?: Database["public"]["Enums"]["relationship_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_parties_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["property_id"];
          },
          {
            foreignKeyName: "property_parties_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      recommendation_feedback: {
        Row: {
          created_at: string | null;
          feedback_type: string;
          id: string;
          listing_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          feedback_type: string;
          id?: string;
          listing_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          feedback_type?: string;
          id?: string;
          listing_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recommendation_feedback_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recommendation_feedback_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["listing_id"];
          },
        ];
      };
      recommendation_history: {
        Row: {
          clicked_at: string | null;
          hidden_at: string | null;
          id: string;
          listing_id: string;
          saved_at: string | null;
          shown_at: string | null;
          user_id: string;
        };
        Insert: {
          clicked_at?: string | null;
          hidden_at?: string | null;
          id?: string;
          listing_id: string;
          saved_at?: string | null;
          shown_at?: string | null;
          user_id: string;
        };
        Update: {
          clicked_at?: string | null;
          hidden_at?: string | null;
          id?: string;
          listing_id?: string;
          saved_at?: string | null;
          shown_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recommendation_history_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recommendation_history_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["listing_id"];
          },
        ];
      };
      risk_flags: {
        Row: {
          created_at: string;
          id: string;
          resolved_at: string | null;
          resolved_by: string | null;
          risk_type: string;
          severity: Database["public"]["Enums"]["risk_severity"];
          status: Database["public"]["Enums"]["risk_status"];
          subject_id: string;
          subject_type: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          risk_type: string;
          severity?: Database["public"]["Enums"]["risk_severity"];
          status?: Database["public"]["Enums"]["risk_status"];
          subject_id: string;
          subject_type: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          risk_type?: string;
          severity?: Database["public"]["Enums"]["risk_severity"];
          status?: Database["public"]["Enums"]["risk_status"];
          subject_id?: string;
          subject_type?: string;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          created_at: string;
          id: string;
          permission_name: string;
          role: Database["public"]["Enums"]["app_role"];
        };
        Insert: {
          created_at?: string;
          id?: string;
          permission_name: string;
          role: Database["public"]["Enums"]["app_role"];
        };
        Update: {
          created_at?: string;
          id?: string;
          permission_name?: string;
          role?: Database["public"]["Enums"]["app_role"];
        };
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_name_fkey";
            columns: ["permission_name"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["name"];
          },
        ];
      };
      saved_searches: {
        Row: {
          created_at: string;
          filters: Json;
          id: string;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          filters: Json;
          id?: string;
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          filters?: Json;
          id?: string;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      search_analytics_events: {
        Row: {
          created_at: string;
          event_type: string;
          id: string;
          payload: Json;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          event_type: string;
          id?: string;
          payload: Json;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          event_type?: string;
          id?: string;
          payload?: Json;
          user_id?: string | null;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          created_at: string;
          expires_at: string;
          id: string;
          ip_address: unknown;
          last_seen_at: string;
          revoked_at: string | null;
          session_token_hash: string;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          expires_at: string;
          id?: string;
          ip_address?: unknown;
          last_seen_at?: string;
          revoked_at?: string | null;
          session_token_hash: string;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          ip_address?: unknown;
          last_seen_at?: string;
          revoked_at?: string | null;
          session_token_hash?: string;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      unit_amenities: {
        Row: {
          amenity: string;
          created_at: string;
          id: string;
          unit_id: string;
        };
        Insert: {
          amenity: string;
          created_at?: string;
          id?: string;
          unit_id: string;
        };
        Update: {
          amenity?: string;
          created_at?: string;
          id?: string;
          unit_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "unit_amenities_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["unit_id"];
          },
          {
            foreignKeyName: "unit_amenities_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
        ];
      };
      units: {
        Row: {
          area: number | null;
          bathrooms: number;
          bedrooms: number;
          building_id: string | null;
          created_at: string;
          deleted_at: string | null;
          description: string | null;
          floor: number | null;
          id: string;
          property_id: string;
          status: Database["public"]["Enums"]["unit_status"];
          unit_number: string;
          unit_type: Database["public"]["Enums"]["unit_type"];
          updated_at: string;
        };
        Insert: {
          area?: number | null;
          bathrooms?: number;
          bedrooms?: number;
          building_id?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          floor?: number | null;
          id?: string;
          property_id: string;
          status?: Database["public"]["Enums"]["unit_status"];
          unit_number: string;
          unit_type: Database["public"]["Enums"]["unit_type"];
          updated_at?: string;
        };
        Update: {
          area?: number | null;
          bathrooms?: number;
          bedrooms?: number;
          building_id?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          floor?: number | null;
          id?: string;
          property_id?: string;
          status?: Database["public"]["Enums"]["unit_status"];
          unit_number?: string;
          unit_type?: Database["public"]["Enums"]["unit_type"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "units_building_id_fkey";
            columns: ["building_id"];
            isOneToOne: false;
            referencedRelation: "buildings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "units_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["property_id"];
          },
          {
            foreignKeyName: "units_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      user_preferences: {
        Row: {
          amenities: Json | null;
          bathrooms: number | null;
          bathrooms_rule: string | null;
          bedrooms: number | null;
          bedrooms_rule: string | null;
          created_at: string | null;
          furnishing_preference: string | null;
          id: string;
          max_budget: number | null;
          min_budget: number | null;
          move_in_date: string | null;
          preferred_budget: number | null;
          preferred_locations: Json | null;
          priority_weights: Json | null;
          property_types: string[] | null;
          updated_at: string | null;
          use_behavioral_personalization: boolean | null;
          user_id: string;
        };
        Insert: {
          amenities?: Json | null;
          bathrooms?: number | null;
          bathrooms_rule?: string | null;
          bedrooms?: number | null;
          bedrooms_rule?: string | null;
          created_at?: string | null;
          furnishing_preference?: string | null;
          id?: string;
          max_budget?: number | null;
          min_budget?: number | null;
          move_in_date?: string | null;
          preferred_budget?: number | null;
          preferred_locations?: Json | null;
          priority_weights?: Json | null;
          property_types?: string[] | null;
          updated_at?: string | null;
          use_behavioral_personalization?: boolean | null;
          user_id: string;
        };
        Update: {
          amenities?: Json | null;
          bathrooms?: number | null;
          bathrooms_rule?: string | null;
          bedrooms?: number | null;
          bedrooms_rule?: string | null;
          created_at?: string | null;
          furnishing_preference?: string | null;
          id?: string;
          max_budget?: number | null;
          min_budget?: number | null;
          move_in_date?: string | null;
          preferred_budget?: number | null;
          preferred_locations?: Json | null;
          priority_weights?: Json | null;
          property_types?: string[] | null;
          updated_at?: string | null;
          use_behavioral_personalization?: boolean | null;
          user_id?: string;
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
      verification_evidence: {
        Row: {
          created_at: string;
          evidence_type: string;
          id: string;
          review_notes: string | null;
          status: Database["public"]["Enums"]["evidence_status"];
          storage_reference: string;
          submitted_at: string;
          submitted_by: string;
          updated_at: string;
          verification_id: string;
        };
        Insert: {
          created_at?: string;
          evidence_type: string;
          id?: string;
          review_notes?: string | null;
          status?: Database["public"]["Enums"]["evidence_status"];
          storage_reference: string;
          submitted_at?: string;
          submitted_by: string;
          updated_at?: string;
          verification_id: string;
        };
        Update: {
          created_at?: string;
          evidence_type?: string;
          id?: string;
          review_notes?: string | null;
          status?: Database["public"]["Enums"]["evidence_status"];
          storage_reference?: string;
          submitted_at?: string;
          submitted_by?: string;
          updated_at?: string;
          verification_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "verification_evidence_verification_id_fkey";
            columns: ["verification_id"];
            isOneToOne: false;
            referencedRelation: "verifications";
            referencedColumns: ["id"];
          },
        ];
      };
      verification_history: {
        Row: {
          changed_by: string | null;
          created_at: string;
          id: string;
          notes: string | null;
          status: Database["public"]["Enums"]["verification_status"];
          verification_id: string;
        };
        Insert: {
          changed_by?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          status: Database["public"]["Enums"]["verification_status"];
          verification_id: string;
        };
        Update: {
          changed_by?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          status?: Database["public"]["Enums"]["verification_status"];
          verification_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "verification_history_verification_id_fkey";
            columns: ["verification_id"];
            isOneToOne: false;
            referencedRelation: "verifications";
            referencedColumns: ["id"];
          },
        ];
      };
      verification_tokens: {
        Row: {
          created_at: string;
          expires_at: string;
          id: string;
          token_hash: string;
          used_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          expires_at: string;
          id?: string;
          token_hash: string;
          used_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          token_hash?: string;
          used_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      verifications: {
        Row: {
          created_at: string;
          expires_at: string | null;
          id: string;
          rejection_reason: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          revocation_reason: string | null;
          status: Database["public"]["Enums"]["verification_status"];
          subject_id: string;
          subject_type: string;
          submitted_at: string;
          updated_at: string;
          verification_type: Database["public"]["Enums"]["verification_type"];
        };
        Insert: {
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          revocation_reason?: string | null;
          status?: Database["public"]["Enums"]["verification_status"];
          subject_id: string;
          subject_type: string;
          submitted_at?: string;
          updated_at?: string;
          verification_type: Database["public"]["Enums"]["verification_type"];
        };
        Update: {
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          revocation_reason?: string | null;
          status?: Database["public"]["Enums"]["verification_status"];
          subject_id?: string;
          subject_type?: string;
          submitted_at?: string;
          updated_at?: string;
          verification_type?: Database["public"]["Enums"]["verification_type"];
        };
        Relationships: [];
      };
      viewing_availabilities: {
        Row: {
          created_at: string;
          day_of_week: number;
          end_time: string;
          id: string;
          listing_id: string | null;
          provider_id: string;
          start_time: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          day_of_week: number;
          end_time: string;
          id?: string;
          listing_id?: string | null;
          provider_id: string;
          start_time: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          day_of_week?: number;
          end_time?: string;
          id?: string;
          listing_id?: string | null;
          provider_id?: string;
          start_time?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "viewing_availabilities_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "viewing_availabilities_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["listing_id"];
          },
        ];
      };
      viewings: {
        Row: {
          confirmed_end: string | null;
          confirmed_start: string | null;
          conversation_id: string | null;
          created_at: string;
          id: string;
          listing_id: string;
          notes: string | null;
          property_id: string;
          provider_id: string;
          requested_end: string;
          requested_start: string;
          seeker_id: string;
          status: string;
          unit_id: string | null;
          updated_at: string;
        };
        Insert: {
          confirmed_end?: string | null;
          confirmed_start?: string | null;
          conversation_id?: string | null;
          created_at?: string;
          id?: string;
          listing_id: string;
          notes?: string | null;
          property_id: string;
          provider_id: string;
          requested_end: string;
          requested_start: string;
          seeker_id: string;
          status?: string;
          unit_id?: string | null;
          updated_at?: string;
        };
        Update: {
          confirmed_end?: string | null;
          confirmed_start?: string | null;
          conversation_id?: string | null;
          created_at?: string;
          id?: string;
          listing_id?: string;
          notes?: string | null;
          property_id?: string;
          provider_id?: string;
          requested_end?: string;
          requested_start?: string;
          seeker_id?: string;
          status?: string;
          unit_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "viewings_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "viewings_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "viewings_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["listing_id"];
          },
          {
            foreignKeyName: "viewings_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["property_id"];
          },
          {
            foreignKeyName: "viewings_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "viewings_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["unit_id"];
          },
          {
            foreignKeyName: "viewings_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
        ];
      };
      application_requirements: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          is_required: boolean;
          listing_id: string | null;
          name: string;
          order_index: number;
          property_id: string;
          type: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          is_required?: boolean;
          listing_id?: string | null;
          name: string;
          order_index?: number;
          property_id: string;
          type?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          is_required?: boolean;
          listing_id?: string | null;
          name?: string;
          order_index?: number;
          property_id?: string;
          type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_requirements_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_requirements_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["listing_id"];
          },
          {
            foreignKeyName: "application_requirements_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_requirements_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["property_id"];
          },
        ];
      };
      rental_applications: {
        Row: {
          id: string;
          application_number: string | null;
          listing_id: string;
          property_id: string;
          unit_id: string | null;
          applicant_id: string;
          provider_id: string;
          status: string;
          rent_snapshot: number;
          currency_snapshot: string;
          billing_period_snapshot: string;
          deposit_snapshot: number;
          preferred_move_in_date: string | null;
          preferred_lease_months: number | null;
          personal_info: Json;
          employment_info: Json;
          household_info: Json;
          created_at: string;
          updated_at: string;
          submitted_at: string | null;
          decided_at: string | null;
          decided_by: string | null;
          rejection_reason: string | null;
          rejection_notes: string | null;
        };
        Insert: {
          id?: string;
          application_number?: string | null;
          listing_id: string;
          property_id: string;
          unit_id?: string | null;
          applicant_id: string;
          provider_id: string;
          status?: string;
          rent_snapshot: number;
          currency_snapshot?: string;
          billing_period_snapshot?: string;
          deposit_snapshot: number;
          preferred_move_in_date?: string | null;
          preferred_lease_months?: number | null;
          personal_info?: Json;
          employment_info?: Json;
          household_info?: Json;
          created_at?: string;
          updated_at?: string;
          submitted_at?: string | null;
          decided_at?: string | null;
          decided_by?: string | null;
          rejection_reason?: string | null;
          rejection_notes?: string | null;
        };
        Update: {
          id?: string;
          application_number?: string | null;
          listing_id?: string;
          property_id?: string;
          unit_id?: string | null;
          applicant_id?: string;
          provider_id?: string;
          status?: string;
          rent_snapshot?: number;
          currency_snapshot?: string;
          billing_period_snapshot?: string;
          deposit_snapshot?: number;
          preferred_move_in_date?: string | null;
          preferred_lease_months?: number | null;
          personal_info?: Json;
          employment_info?: Json;
          household_info?: Json;
          created_at?: string;
          updated_at?: string;
          submitted_at?: string | null;
          decided_at?: string | null;
          decided_by?: string | null;
          rejection_reason?: string | null;
          rejection_notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "rental_applications_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rental_applications_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["listing_id"];
          },
          {
            foreignKeyName: "rental_applications_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rental_applications_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["property_id"];
          },
          {
            foreignKeyName: "rental_applications_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rental_applications_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "listings_search_view";
            referencedColumns: ["unit_id"];
          },
        ];
      };
      application_documents: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          status: string;
          rejection_reason: string | null;
          requirement_id: string | null;
          application_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          status?: string;
          rejection_reason?: string | null;
          requirement_id?: string | null;
          application_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          file_path?: string;
          file_size?: number;
          mime_type?: string;
          status?: string;
          rejection_reason?: string | null;
          requirement_id?: string | null;
          application_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "rental_applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_documents_requirement_id_fkey";
            columns: ["requirement_id"];
            isOneToOne: false;
            referencedRelation: "application_requirements";
            referencedColumns: ["id"];
          },
        ];
      };
      application_requests: {
        Row: {
          created_at: string;
          due_date: string | null;
          id: string;
          message: string;
          recipient_id: string;
          requester_id: string;
          requirement_id: string | null;
          application_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          due_date?: string | null;
          id?: string;
          message: string;
          recipient_id: string;
          requester_id: string;
          requirement_id?: string | null;
          application_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          due_date?: string | null;
          id?: string;
          message?: string;
          recipient_id?: string;
          requester_id?: string;
          requirement_id?: string | null;
          application_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_requests_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "rental_applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_requests_requirement_id_fkey";
            columns: ["requirement_id"];
            isOneToOne: false;
            referencedRelation: "application_requirements";
            referencedColumns: ["id"];
          },
        ];
      };
      application_reviews: {
        Row: {
          created_at: string;
          id: string;
          notes: string | null;
          recommendation: string;
          reviewer_id: string;
          application_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          recommendation: string;
          reviewer_id: string;
          application_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          recommendation?: string;
          reviewer_id?: string;
          application_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_reviews_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "rental_applications";
            referencedColumns: ["id"];
          },
        ];
      };
      application_status_history: {
        Row: {
          changed_by: string | null;
          created_at: string;
          id: string;
          new_status: string;
          notes: string | null;
          application_id: string;
          previous_status: string | null;
        };
        Insert: {
          changed_by?: string | null;
          created_at?: string;
          id?: string;
          new_status: string;
          notes?: string | null;
          application_id: string;
          previous_status?: string | null;
        };
        Update: {
          changed_by?: string | null;
          created_at?: string;
          id?: string;
          new_status?: string;
          notes?: string | null;
          application_id?: string;
          previous_status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "rental_applications";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      listings_search_view: {
        Row: {
          address: string | null;
          area: number | null;
          availability_confirmed_at: string | null;
          availability_date: string | null;
          bathrooms: number | null;
          bedrooms: number | null;
          billing_period: Database["public"]["Enums"]["billing_period"] | null;
          county: string | null;
          currency: string | null;
          deposit_amount: number | null;
          estate: string | null;
          floor: number | null;
          landmark_description: string | null;
          latitude: number | null;
          listing_created_at: string | null;
          listing_deleted_at: string | null;
          listing_description: string | null;
          listing_freshness_status: Database["public"]["Enums"]["listing_freshness_status"] | null;
          listing_id: string | null;
          listing_last_verified_at: string | null;
          listing_status: Database["public"]["Enums"]["listing_status"] | null;
          listing_title: string | null;
          listing_type: Database["public"]["Enums"]["listing_type"] | null;
          listing_verification_status: Database["public"]["Enums"]["verification_status"] | null;
          longitude: number | null;
          neighborhood: string | null;
          owner_agent_verified: boolean | null;
          owner_identity_verified: boolean | null;
          price: number | null;
          price_confirmed_at: string | null;
          primary_image_url: string | null;
          property_amenities: string[] | null;
          property_id: string | null;
          property_name: string | null;
          property_type: Database["public"]["Enums"]["property_type"] | null;
          property_verification_status: Database["public"]["Enums"]["verification_status"] | null;
          published_at: string | null;
          town: string | null;
          unit_id: string | null;
          unit_status: Database["public"]["Enums"]["unit_status"] | null;
          unit_type: Database["public"]["Enums"]["unit_type"] | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      current_user_roles: {
        Args: never;
        Returns: Database["public"]["Enums"]["app_role"][];
      };
      has_permission: {
        Args: { _permission: string; _user_id: string };
        Returns: boolean;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_active_property_party: {
        Args: { _property_id: string; _user_id: string };
        Returns: boolean;
      };
      is_platform_admin: { Args: { _user_id: string }; Returns: boolean };
    };
    Enums: {
      account_status: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED" | "LOCKED";
      app_role:
        "tenant" | "landlord" | "agent" | "property_manager" | "verifier" | "admin" | "super_admin";
      appeal_status: "APPEAL_SUBMITTED" | "UNDER_REVIEW" | "UPHELD" | "REVERSED";
      billing_period: "MONTHLY" | "WEEKLY" | "DAILY" | "YEARLY";
      claim_status: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";
      evidence_status: "PENDING" | "APPROVED" | "REJECTED";
      listing_freshness_status: "CURRENT" | "STALE" | "REQUIRES_REVALIDATION" | "EXPIRED";
      listing_status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "PAUSED" | "EXPIRED" | "ARCHIVED";
      listing_type: "FOR_RENT" | "FOR_SALE";
      media_type: "IMAGE" | "VIDEO" | "FLOOR_PLAN" | "DOCUMENT";
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
      relationship_status: "ACTIVE" | "PENDING" | "REVOKED";
      relationship_type: "OWNER" | "AGENT" | "PROPERTY_MANAGER";
      report_status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED" | "ESCALATED";
      risk_severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      risk_status: "OPEN" | "RESOLVED" | "DISMISSED";
      unit_status:
        | "DRAFT"
        | "AVAILABLE"
        | "RESERVED"
        | "OCCUPIED"
        | "MAINTENANCE"
        | "UNAVAILABLE"
        | "ARCHIVED";
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
      verification_status:
        "UNVERIFIED" | "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "EXPIRED" | "REVOKED";
      verification_type:
        | "IDENTITY"
        | "PROPERTY_OWNERSHIP"
        | "PROPERTY_EXISTENCE"
        | "LISTING"
        | "CONTACT"
        | "AGENT"
        | "LANDLORD";
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
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
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
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
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
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
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
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_status: ["PENDING_VERIFICATION", "ACTIVE", "SUSPENDED", "DEACTIVATED", "LOCKED"],
      app_role: [
        "tenant",
        "landlord",
        "agent",
        "property_manager",
        "verifier",
        "admin",
        "super_admin",
      ],
      appeal_status: ["APPEAL_SUBMITTED", "UNDER_REVIEW", "UPHELD", "REVERSED"],
      billing_period: ["MONTHLY", "WEEKLY", "DAILY", "YEARLY"],
      claim_status: ["PENDING", "APPROVED", "REJECTED", "WITHDRAWN"],
      evidence_status: ["PENDING", "APPROVED", "REJECTED"],
      listing_freshness_status: ["CURRENT", "STALE", "REQUIRES_REVALIDATION", "EXPIRED"],
      listing_status: ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "PAUSED", "EXPIRED", "ARCHIVED"],
      listing_type: ["FOR_RENT", "FOR_SALE"],
      media_type: ["IMAGE", "VIDEO", "FLOOR_PLAN", "DOCUMENT"],
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
      relationship_status: ["ACTIVE", "PENDING", "REVOKED"],
      relationship_type: ["OWNER", "AGENT", "PROPERTY_MANAGER"],
      report_status: ["OPEN", "UNDER_REVIEW", "RESOLVED", "DISMISSED", "ESCALATED"],
      risk_severity: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      risk_status: ["OPEN", "RESOLVED", "DISMISSED"],
      unit_status: [
        "DRAFT",
        "AVAILABLE",
        "RESERVED",
        "OCCUPIED",
        "MAINTENANCE",
        "UNAVAILABLE",
        "ARCHIVED",
      ],
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
      verification_status: [
        "UNVERIFIED",
        "PENDING",
        "UNDER_REVIEW",
        "VERIFIED",
        "REJECTED",
        "EXPIRED",
        "REVOKED",
      ],
      verification_type: [
        "IDENTITY",
        "PROPERTY_OWNERSHIP",
        "PROPERTY_EXISTENCE",
        "LISTING",
        "CONTACT",
        "AGENT",
        "LANDLORD",
      ],
    },
  },
} as const;
