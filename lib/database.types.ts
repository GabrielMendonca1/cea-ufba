export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          id: string
          research_opportunity_id: string
          status: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          research_opportunity_id: string
          status?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          research_opportunity_id?: string
          status?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_research_opportunity_id_fkey"
            columns: ["research_opportunity_id"]
            isOneToOne: false
            referencedRelation: "research_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          id: string
          content_markdown: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content_markdown: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content_markdown?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      research_opportunities: {
        Row: {
          contact_email: string
          created_at: string
          deadline: string
          description: string
          duration: string
          expected_results: string[]
          id: string
          is_active: boolean | null
          methodology: string
          monthly_value: string
          objectives: string[]
          requirements: string[]
          research_area: string
          scholarship_type: string
          start_date: string
          supervisor_id: string
          title: string
          updated_at: string
          vacancies: number
          workload: string
        }
        Insert: {
          contact_email: string
          created_at?: string
          deadline: string
          description: string
          duration: string
          expected_results: string[]
          id?: string
          is_active?: boolean | null
          methodology: string
          monthly_value: string
          objectives: string[]
          requirements: string[]
          research_area: string
          scholarship_type: string
          start_date: string
          supervisor_id: string
          title: string
          updated_at?: string
          vacancies?: number
          workload: string
        }
        Update: {
          contact_email?: string
          created_at?: string
          deadline?: string
          description?: string
          duration?: string
          expected_results?: string[]
          id?: string
          is_active?: boolean | null
          methodology?: string
          monthly_value?: string
          objectives?: string[]
          requirements?: string[]
          research_area?: string
          scholarship_type?: string
          start_date?: string
          supervisor_id?: string
          title?: string
          updated_at?: string
          vacancies?: number
          workload?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_opportunities_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scientific_outreach: {
        Row: {
          id: string
          professor_id: string
          post_id: string
          title: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          professor_id: string
          post_id: string
          title: string
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          professor_id?: string
          post_id?: string
          title?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scientific_outreach_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scientific_outreach_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          course: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string | null
          has_completed_onboarding: boolean | null
          id: string
          is_profile_complete: boolean | null
          lattes_url: string | null
          phone: string | null
          research_area: string | null
          student_id: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
          account_status: Database["public"]["Enums"]["account_status"] | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          course?: string | null
          created_at?: string
          department?: string | null
          email: string
          full_name?: string | null
          has_completed_onboarding?: boolean | null
          id: string
          is_profile_complete?: boolean | null
          lattes_url?: string | null
          phone?: string | null
          research_area?: string | null
          student_id?: string | null
          updated_at?: string
          user_type: Database["public"]["Enums"]["user_type"]
          account_status?: Database["public"]["Enums"]["account_status"] | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          course?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string | null
          has_completed_onboarding?: boolean | null
          id?: string
          is_profile_complete?: boolean | null
          lattes_url?: string | null
          phone?: string | null
          research_area?: string | null
          student_id?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          account_status?: Database["public"]["Enums"]["account_status"] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type: "student" | "professor" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Enums = {
  account_status: "pending" | "approved" | "rejected"
}

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          id: string
          research_opportunity_id: string
          status: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          research_opportunity_id: string
          status?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          research_opportunity_id?: string
          status?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_research_opportunity_id_fkey"
            columns: ["research_opportunity_id"]
            isOneToOne: false
            referencedRelation: "research_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          id: string
          content_markdown: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content_markdown: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content_markdown?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      research_opportunities: {
        Row: {
          contact_email: string
          created_at: string
          deadline: string
          description: string
          duration: string
          expected_results: string[]
          id: string
          is_active: boolean | null
          methodology: string
          monthly_value: string
          objectives: string[]
          requirements: string[]
          research_area: string
          scholarship_type: string
          start_date: string
          supervisor_id: string
          title: string
          updated_at: string
          vacancies: number
          workload: string
        }
        Insert: {
          contact_email: string
          created_at?: string
          deadline: string
          description: string
          duration: string
          expected_results: string[]
          id?: string
          is_active?: boolean | null
          methodology: string
          monthly_value: string
          objectives: string[]
          requirements: string[]
          research_area: string
          scholarship_type: string
          start_date: string
          supervisor_id: string
          title: string
          updated_at?: string
          vacancies?: number
          workload: string
        }
        Update: {
          contact_email?: string
          created_at?: string
          deadline?: string
          description?: string
          duration?: string
          expected_results?: string[]
          id?: string
          is_active?: boolean | null
          methodology?: string
          monthly_value?: string
          objectives?: string[]
          requirements?: string[]
          research_area?: string
          scholarship_type?: string
          start_date?: string
          supervisor_id?: string
          title?: string
          updated_at?: string
          vacancies?: number
          workload?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_opportunities_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scientific_outreach: {
        Row: {
          id: string
          professor_id: string
          post_id: string
          title: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          professor_id: string
          post_id: string
          title: string
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          professor_id?: string
          post_id?: string
          title?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scientific_outreach_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scientific_outreach_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          course: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string | null
          has_completed_onboarding: boolean | null
          id: string
          is_profile_complete: boolean | null
          lattes_url: string | null
          phone: string | null
          research_area: string | null
          student_id: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
          account_status: Database["public"]["Enums"]["account_status"] | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          course?: string | null
          created_at?: string
          department?: string | null
          email: string
          full_name?: string | null
          has_completed_onboarding?: boolean | null
          id: string
          is_profile_complete?: boolean | null
          lattes_url?: string | null
          phone?: string | null
          research_area?: string | null
          student_id?: string | null
          updated_at?: string
          user_type: Database["public"]["Enums"]["user_type"]
          account_status?: Database["public"]["Enums"]["account_status"] | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          course?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string | null
          has_completed_onboarding?: boolean | null
          id?: string
          is_profile_complete?: boolean | null
          lattes_url?: string | null
          phone?: string | null
          research_area?: string | null
          student_id?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          account_status?: Database["public"]["Enums"]["account_status"] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type: "student" | "professor" | "admin"
      account_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_type: ["student", "professor", "admin"],
      account_status: ["pending", "approved", "rejected"],
    },
  },
} as const
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_type: ["student", "professor", "admin"],
      account_status: ["pending", "approved", "rejected"],
    },
  },
} as const
