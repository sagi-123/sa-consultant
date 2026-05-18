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
      jobs: {
        Row: {
          id: string
          title: string
          department: string | null
          location: string | null
          employment_type: string | null
          description: string | null
          salary_range: string | null
          status: 'Open' | 'Closed' | 'On Hold'
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          department?: string | null
          location?: string | null
          employment_type?: string | null
          description?: string | null
          salary_range?: string | null
          status?: 'Open' | 'Closed' | 'On Hold'
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          department?: string | null
          location?: string | null
          employment_type?: string | null
          description?: string | null
          salary_range?: string | null
          status?: 'Open' | 'Closed' | 'On Hold'
          created_at?: string
        }
      }
      vendor_candidates: {
        Row: {
          id: string
          vendor_id: string
          vendor_company_name: string
          name: string
          email: string | null
          phone: string | null
          skills: Json
          experience_years: string | null
          location: string | null
          salary_expectation: string | null
          availability: string | null
          work_authorization: string | null
          resume_url: string | null
          parsed_data: Json | null
          status: 'Available' | 'Submitted to Jobs' | 'Interviewing' | 'Offered' | 'Placed'
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          vendor_company_name: string
          name: string
          email?: string | null
          phone?: string | null
          skills?: Json
          experience_years?: string | null
          location?: string | null
          salary_expectation?: string | null
          availability?: string | null
          work_authorization?: string | null
          resume_url?: string | null
          parsed_data?: Json | null
          status?: 'Available' | 'Submitted to Jobs' | 'Interviewing' | 'Offered' | 'Placed'
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          vendor_company_name?: string
          name?: string
          email?: string | null
          phone?: string | null
          skills?: Json
          experience_years?: string | null
          location?: string | null
          salary_expectation?: string | null
          availability?: string | null
          work_authorization?: string | null
          resume_url?: string | null
          parsed_data?: Json | null
          status?: 'Available' | 'Submitted to Jobs' | 'Interviewing' | 'Offered' | 'Placed'
          created_at?: string
        }
      }
      job_matches: {
        Row: {
          id: string
          candidate_id: string
          job_id: string
          vendor_id: string
          company_name: string
          job_role: string
          match_percentage: number
          salary_fit: string | null
          location_fit: string | null
          partner_approved: boolean
          status: 'Pending Partner Approval' | 'Approved / Submitted' | 'Interview' | 'Offered' | 'Placed' | 'Rejected'
          interview_schedule: string | null
          interview_feedback: string | null
          offered_salary: string | null
          joining_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          job_id: string
          vendor_id: string
          company_name: string
          job_role: string
          match_percentage?: number
          salary_fit?: string | null
          location_fit?: string | null
          partner_approved?: boolean
          status?: 'Pending Partner Approval' | 'Approved / Submitted' | 'Interview' | 'Offered' | 'Placed' | 'Rejected'
          interview_schedule?: string | null
          interview_feedback?: string | null
          offered_salary?: string | null
          joining_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string
          job_id?: string
          vendor_id?: string
          company_name?: string
          job_role?: string
          match_percentage?: number
          salary_fit?: string | null
          location_fit?: string | null
          partner_approved?: boolean
          status?: 'Pending Partner Approval' | 'Approved / Submitted' | 'Interview' | 'Offered' | 'Placed' | 'Rejected'
          interview_schedule?: string | null
          interview_feedback?: string | null
          offered_salary?: string | null
          joining_date?: string | null
          created_at?: string
        }
      }
      revenue_shares: {
        Row: {
          id: string
          match_id: string
          vendor_id: string
          candidate_name: string
          company_name: string
          placement_fee: number
          partner_share: number
          payment_status: 'Pending' | 'Paid'
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          vendor_id: string
          candidate_name: string
          company_name: string
          placement_fee?: number
          partner_share?: number
          payment_status?: 'Pending' | 'Paid'
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          vendor_id?: string
          candidate_name?: string
          company_name?: string
          placement_fee?: number
          partner_share?: number
          payment_status?: 'Pending' | 'Paid'
          paid_at?: string | null
          created_at?: string
        }
      }
      partner_messages: {
        Row: {
          id: string
          vendor_id: string
          sender_id: string
          sender_name: string
          sender_role: string
          candidate_id: string | null
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          sender_id: string
          sender_name: string
          sender_role: string
          candidate_id?: string | null
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          sender_id?: string
          sender_name?: string
          sender_role?: string
          candidate_id?: string | null
          message?: string
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          client_name: string
          client_email: string
          client_phone: string
          slot_1: string
          slot_2: string
          slot_3: string
          status: 'pending' | 'confirmed' | 'cancelled'
          selected_slot: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_name: string
          client_email: string
          client_phone: string
          slot_1: string
          slot_2: string
          slot_3: string
          status?: 'pending' | 'confirmed' | 'cancelled'
          selected_slot?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_name?: string
          client_email?: string
          client_phone?: string
          slot_1?: string
          slot_2?: string
          slot_3?: string
          status?: 'pending' | 'confirmed' | 'cancelled'
          selected_slot?: string | null
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
