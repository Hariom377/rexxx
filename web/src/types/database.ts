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
          email: string
          full_name: string
          date_of_birth: string | null
          gender: string | null
          nationality: string
          state: string | null
          district: string | null
          country_of_residence: string
          social_category: string
          is_pwbd: boolean
          pwbd_disability_type: string | null
          is_ex_serviceman: boolean
          additional_relaxations: string[]
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      candidate_education: {
        Row: {
          id: string
          candidate_id: string
          highest_qualification: string
          degree_name: string | null
          stream: string | null
          institution: string | null
          is_institution_recognized: boolean
          graduation_year: number | null
          expected_graduation_date: string | null
          cgpa_or_percentage: number | null
          has_active_backlogs: boolean
          gate_score: number | null
          gate_year: number | null
          has_net_jrf: boolean
          net_subject: string | null
          work_experience_years: number
          research_experience_months: number
          certifications: string[]
          created_at: string
          updated_at: string
        }
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      candidate_preferences: {
        Row: {
          id: string
          candidate_id: string
          preferred_categories: string[]
          preferred_states: string[]
          willing_to_relocate: boolean
          willing_to_work_anywhere_in_india: boolean
          max_application_fee_budget: number | null
          career_interests: string[]
          notification_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      examinations: {
        Row: {
          id: string
          organisation_id: string | null
          source_id: string | null
          name: string
          title: string | null
          slug: string
          category: string
          status: string
          overview: string
          vacancies: number | null
          salary_or_pay_scale: string | null
          location: string
          official_notification_url: string | null
          notification_url: string | null
          official_application_url: string
          application_url: string | null
          source_url: string
          last_verified_at: string
          last_crawled_at: string | null
          is_official_source: boolean
          is_confirmed: boolean
          is_central_government: boolean
          state: string | null
          selection_procedure: string | null
          exam_pattern: string | null
          application_instructions: string | null
          uncertain_fields: string[]
          created_at: string
          updated_at: string
        }
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      examination_dates: {
        Row: {
          id: string
          examination_id: string
          notification_date: string | null
          application_opening_date: string | null
          application_closing_date: string | null
          fee_payment_deadline: string | null
          correction_window_start: string | null
          correction_window_end: string | null
          admit_card_release_date: string | null
          examination_start_date: string | null
          prelims_date: string | null
          examination_end_date: string | null
          result_date: string | null
          is_tentative: boolean
          created_at: string
          updated_at: string
        }
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      eligibility_rules: {
        Row: {
          id: string
          examination_id: string
          min_age: number
          max_age: number
          age_cutoff_date: string | null
          category_age_relaxations: Json
          educational_qualifications: string[]
          eligible_branches: string[]
          eligible_streams: string[]
          min_percentage: number | null
          nationality: string
          gender_requirements: string
          work_experience_requirement: string
          required_documents: string[]
          fee_general: number | null
          fee_exemptions: string
          extracted_rule_text: string | null
          created_at: string
        }
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      organisations: {
        Row: {
          id: string
          name: string
          slug: string | null
          short_name: string | null
          organisation_type: string
          parent_ministry: string | null
          state: string | null
          website_url: string | null
          logo_url: string | null
          created_at: string
        }
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      saved_examinations: {
        Row: {
          id: string
          candidate_id: string
          examination_id: string
          notes: string | null
          saved_at: string | null
          created_at: string
        }
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      candidate_applications: {
        Row: {
          id: string
          candidate_id: string
          examination_id: string
          stage: string
          status: string
          application_number: string | null
          roll_number: string | null
          applied_at: string | null
          applied_date: string | null
          scheduled_exam_date: string | null
          notes: string | null
          personal_notes: string | null
          checklist_completed: Json
          completed_checklist: string[]
          created_at: string
          updated_at: string
        }
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      notifications: {
        Row: {
          id: string
          candidate_id: string
          examination_id: string | null
          type: string
          notification_type: string
          title: string
          body: string | null
          message: string
          official_source_url: string | null
          is_read: boolean
          read_at: string | null
          sent_at: string | null
          data: Json
          delivered_via_fcm: boolean
          created_at: string
        }
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      candidate_matches: {
        Row: {
          id: string
          candidate_id: string
          examination_id: string
          match_status: string
          status: string
          is_eligible: boolean
          match_score: number | null
          reasons: Json
          evaluated_at: string
        }
        Insert: Record<string, any>
        Update: Record<string, any>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
