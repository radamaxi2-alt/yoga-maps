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
          created_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string | null;
          avatar_url?: string | null;
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
          max_capacity: number | null;
          is_full: boolean | null;
          latitude: number | null;
          longitude: number | null;
          address: string | null;
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
          max_capacity?: number | null;
          is_full?: boolean | null;
          latitude?: number | null;
          longitude?: number | null;
          address?: string | null;
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
          max_capacity?: number | null;
          is_full?: boolean | null;
          latitude?: number | null;
          longitude?: number | null;
          address?: string | null;
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
export type YogaClass = Tables<"classes">;
export type Post = Tables<"posts">;
