import type { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type CandidateEducation = Database['public']['Tables']['candidate_education']['Row']
export type CandidatePreferences = Database['public']['Tables']['candidate_preferences']['Row']
export type Examination = Database['public']['Tables']['examinations']['Row']
export type ExaminationDates = Database['public']['Tables']['examination_dates']['Row']
export type EligibilityRules = Database['public']['Tables']['eligibility_rules']['Row']
export type Organisation = Database['public']['Tables']['organisations']['Row']
export type SavedExamination = Database['public']['Tables']['saved_examinations']['Row']
export type CandidateApplication = Database['public']['Tables']['candidate_applications']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type CandidateMatch = Database['public']['Tables']['candidate_matches']['Row']

export type ExaminationWithDetails = Examination & {
  organisations?: Organisation | null
  examination_dates?: ExaminationDates | null
  eligibility_rules?: EligibilityRules | null
}

export type ExaminationCategory =
  | 'Government Recruitment'
  | 'PSU Recruitment'
  | 'Entrance Examinations'
  | 'University Admissions'
  | 'Scholarships & Fellowships'
  | 'Research & Internships'
  | 'Private Jobs'
  | 'Professional Certifications'

export const EXAMINATION_CATEGORIES: ExaminationCategory[] = [
  'Government Recruitment',
  'PSU Recruitment',
  'Entrance Examinations',
  'University Admissions',
  'Scholarships & Fellowships',
  'Research & Internships',
  'Private Jobs',
  'Professional Certifications',
]

export const APPLICATION_STAGES = [
  { value: 'interested', label: 'Interested', color: 'blue' },
  { value: 'preparingDocuments', label: 'Preparing Documents', color: 'orange' },
  { value: 'readyToApply', label: 'Ready to Apply', color: 'yellow' },
  { value: 'applied', label: 'Applied', color: 'green' },
  { value: 'admitCardReleased', label: 'Admit Card Released', color: 'green' },
  { value: 'examCompleted', label: 'Exam Completed', color: 'purple' },
  { value: 'resultDeclared', label: 'Result Declared', color: 'orange' },
  { value: 'selected', label: 'Selected', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'muted' },
] as const

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
]

export const QUALIFICATIONS = [
  '10th / Matriculation',
  '12th / Intermediate',
  'Diploma',
  'B.Tech / B.E.',
  "Bachelor's",
  "Master's",
  'Ph.D',
]

export const SOCIAL_CATEGORIES = ['General', 'OBC-NCL', 'SC', 'ST', 'EWS']
