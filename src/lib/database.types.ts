/**
 * Yoga Maps — Database Types
 *
 * Tipos TypeScript generados a partir del esquema de Supabase.
 * Estas definiciones se usarán con el cliente de Supabase para
 * obtener autocompletado y type-safety en todas las consultas.
 *
 * Regenerar con:  npx supabase gen types typescript --project-id gvjtospjcwjilvngsvty > src/lib/database.types.ts
 */

export type UserRole = "profesor" | "alumno";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          avatar_url: string | null;
          username: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name?: string | null;
          avatar_url?: string | null;
          username?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string | null;
          avatar_url?: string | null;
          username?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      teacher_details: {
        Row: {
          id: string;
          bio: string | null;
          specialties: string[] | null;
          latitude: number | null;
          longitude: number | null;
          address: string | null;
          average_price: number | null;
          teacher_type: string | null;
          cover_image: string | null;
          gallery: string[] | null;
          whatsapp_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          bio?: string | null;
          specialties?: string[] | null;
          latitude?: number | null;
          longitude?: number | null;
          address?: string | null;
          average_price?: number | null;
          teacher_type?: string | null;
          cover_image?: string | null;
          gallery?: string[] | null;
          whatsapp_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bio?: string | null;
          specialties?: string[] | null;
          latitude?: number | null;
          longitude?: number | null;
          address?: string | null;
          average_price?: number | null;
          teacher_type?: string | null;
          cover_image?: string | null;
          gallery?: string[] | null;
          whatsapp_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "teacher_details_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      classes: {
        Row: {
          id: string;
          teacher_id: string;
          title: string;
          description: string | null;
          price: number;
          scheduled_at: string;
          jitsi_room_link: string | null;
          style: string | null;
          instructor_name: string | null;
          capacity_presential: number | null;
          capacity_online: number | null;
          total_capacity: number | null;
          is_full: boolean | null;
          latitude: number | null;
          longitude: number | null;
          address: string | null;
          category: string | null;
          series_id: string | null;
          guest_teacher_ids: string[] | null;
          school_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          title: string;
          description?: string | null;
          price?: number;
          scheduled_at: string;
          jitsi_room_link?: string | null;
          style?: string | null;
          instructor_name?: string | null;
          capacity_presential?: number | null;
          capacity_online?: number | null;
          total_capacity?: number | null;
          is_full?: boolean | null;
          latitude?: number | null;
          longitude?: number | null;
          address?: string | null;
          category?: string | null;
          series_id?: string | null;
          guest_teacher_ids?: string[] | null;
          school_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          scheduled_at?: string;
          jitsi_room_link?: string | null;
          style?: string | null;
          instructor_name?: string | null;
          capacity_presential?: number | null;
          capacity_online?: number | null;
          total_capacity?: number | null;
          is_full?: boolean | null;
          latitude?: number | null;
          longitude?: number | null;
          address?: string | null;
          category?: string | null;
          series_id?: string | null;
          school_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "classes_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "teacher_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "classes_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      student_details: {
        Row: {
          id: string;
          bio: string | null;
          health_info: string | null;
        };
        Insert: {
          id: string;
          bio?: string | null;
          health_info?: string | null;
        };
        Update: {
          id?: string;
          bio?: string | null;
          health_info?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "student_details_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      class_reservations: {
        Row: {
          id: string;
          class_id: string;
          student_id: string | null;
          guest_name: string | null;
          modality: "presential" | "online";
          status: "pending" | "confirmed" | "cancelled";
          attendance: "none" | "present" | "absent";
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          student_id?: string | null;
          guest_name?: string | null;
          modality?: "presential" | "online";
          status?: "pending" | "confirmed" | "cancelled";
          attendance?: "none" | "present" | "absent";
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          student_id?: string | null;
          guest_name?: string | null;
          modality?: "presential" | "online";
          status?: "pending" | "confirmed" | "cancelled";
          attendance?: "none" | "present" | "absent";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "class_reservations_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_reservations_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      teacher_credits: {
        Row: {
          id: string;
          student_id: string;
          teacher_id: string;
          credits: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          teacher_id: string;
          credits?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          teacher_id?: string;
          credits?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "teacher_credits_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "teacher_credits_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      post_likes: {
        Row: {
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          content: string;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          content: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          title?: string;
          content?: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      credit_transactions: {
        Row: {
          id: string;
          student_id: string;
          teacher_id: string;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          teacher_id: string;
          amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          teacher_id?: string;
          amount?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "credit_transactions_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credit_transactions_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
}

// -------------------------------------------------------
// Helper types for convenience
// -------------------------------------------------------

/** Shortcut to a table's Row type */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

/** Shortcut to a table's Insert type */
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

/** Shortcut to a table's Update type */
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Convenience aliases
export type Profile = Tables<"profiles">;
export type TeacherDetail = Tables<"teacher_details">;
export type StudentDetail = Tables<"student_details">;
export type YogaClass = Tables<"classes">;
export type ClassReservation = Tables<"class_reservations">;
export type Post = Tables<"posts">;
export type PostLike = Tables<"post_likes">;
