// Supabase 자동 생성 타입의 수동 임시 버전.
// 실제 사용 시: supabase gen types typescript --local > types/database.ts

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          student_id: string;
          name: string;
          grade: number;
          avatar_url: string | null;
          xp: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          student_id: string;
          name: string;
          grade: number;
          avatar_url?: string | null;
          xp?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          name?: string;
          grade?: number;
          avatar_url?: string | null;
          xp?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
