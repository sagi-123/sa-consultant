export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          role: 'admin' | 'user'
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          role?: 'admin' | 'user'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          role?: 'admin' | 'user'
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          name: string
          rating: number
          message: string
          status: 'pending' | 'approved'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          rating: number
          message: string
          status?: 'pending' | 'approved'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          rating?: number
          message?: string
          status?: 'pending' | 'approved'
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          category: string
          description: string | null
          image_url: string | null
          live_url: string | null
          apk_url: string | null
          type: 'web' | 'mobile' | 'other'
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          category: string
          description?: string | null
          image_url?: string | null
          live_url?: string | null
          apk_url?: string | null
          type?: 'web' | 'mobile' | 'other'
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          category?: string
          description?: string | null
          image_url?: string | null
          live_url?: string | null
          apk_url?: string | null
          type?: 'web' | 'mobile' | 'other'
          color?: string | null
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          value: string
          updated_at: string
        }
        Insert: {
          id: string
          value: string
          updated_at?: string
        }
        Update: {
          id?: string
          value?: string
          updated_at?: string
        }
      }
      inquiries: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          message: string
          status: 'new' | 'read' | 'archived'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          message: string
          status?: 'new' | 'read' | 'archived'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          message?: string
          status?: 'new' | 'read' | 'archived'
          created_at?: string
        }
      }
      candidates: {
        Row: {
          id: string
          user_id: string | null
          name: string
          email: string | null
          phone: string | null
          job_title: string | null
          experience_years: string | null
          location: string | null
          skills: Json
          parsed_data: Json
          resume_url: string | null
          status: 'New' | 'Screened' | 'Interview' | 'Offer' | 'Rejected'
          applied_job_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          email?: string | null
          phone?: string | null
          job_title?: string | null
          experience_years?: string | null
          location?: string | null
          skills?: Json
          parsed_data: Json
          resume_url?: string | null
          status?: 'New' | 'Screened' | 'Interview' | 'Offer' | 'Rejected'
          applied_job_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          email?: string | null
          phone?: string | null
          job_title?: string | null
          experience_years?: string | null
          location?: string | null
          skills?: Json
          parsed_data?: Json
          resume_url?: string | null
          status?: 'New' | 'Screened' | 'Interview' | 'Offer' | 'Rejected'
          applied_job_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
