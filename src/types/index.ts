// ===== 用户与认证 =====
export type UserStatus = 'active' | 'disabled' | 'deleted';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type Degree = 'high_school' | 'associate' | 'bachelor' | 'master' | 'doctor' | 'other';

export interface User {
  id: number;
  phone: string;
  phone_verified: boolean;
  name: string | null;
  avatar_url: string | null;
  identity_verified: boolean;
  education_verified: boolean;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface IdentityVerification {
  id: number;
  user_id: number;
  real_name: string;
  id_number_hash: string;
  face_verified: boolean;
  status: VerificationStatus;
  result_message: string | null;
  verified_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EducationVerification {
  id: number;
  user_id: number;
  school_name: string;
  major: string | null;
  degree: Degree | null;
  graduation_year: number | null;
  verification_source: string | null;
  status: VerificationStatus;
  result_message: string | null;
  verified_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResumeUpload {
  id: number;
  user_id: number;
  file_url: string;
  file_type: 'pdf' | 'word' | 'image';
  parse_status: 'pending' | 'parsing' | 'completed' | 'failed';
  parse_result: any;
  created_at: string;
}

// ===== 名片 =====
export type CardStatus = 'draft' | 'published' | 'offline';
export type Visibility = 'public' | 'hidden' | 'cert_only';

export interface CardTemplate {
  id: number;
  name: string;
  industry_tag: string | null;
  primary_color: string;
  secondary_color: string;
  avatar_style: string | null;
  preview_image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Card {
  id: number;
  user_id: number;
  card_id: string;
  template_id: number | null;
  title: string | null;
  position: string | null;
  company: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  custom_theme: any;
  status: CardStatus;
  created_at: string;
  updated_at: string;
}

// ===== 经历与成就 =====
export type ExperienceType = 'work' | 'education';
export type ExperienceSource = 'manual' | 'resume_parse' | 'ai_suggest';
export type AchievementType = 'certificate' | 'award' | 'medal';

export interface Experience {
  id: number;
  user_id: number;
  type: ExperienceType;
  organization: string;
  role: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  achievements: string | null;
  key_decisions: string | null;
  skills: string[];
  visibility: Visibility;
  source: ExperienceSource;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: number;
  user_id: number;
  type: AchievementType;
  title: string;
  issuer: string | null;
  issue_date: string | null;
  description: string | null;
  file_url: string | null;
  file_type: string | null;
  visibility: Visibility;
  ai_parsed: boolean;
  created_at: string;
  updated_at: string;
}

// ===== AI分身 =====
export type AvatarStatus = 'not_created' | 'training' | 'ready' | 'reviewing' | 'approved' | 'rejected';
export type PersonalityStyle = 'professional' | 'friendly' | 'concise';

export interface AiAvatar {
  id: number;
  user_id: number;
  personality_style: PersonalityStyle;
  training_data_snapshot: any;
  training_version: number;
  status: AvatarStatus;
  trained_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiReview {
  id: number;
  user_id: number;
  avatar_id: number;
  review_type: 'initial' | 're_review';
  ai_result: 'pass' | 'flag' | 'fail';
  risk_level: 'low' | 'medium' | 'high';
  risk_details: any;
  manual_review_status: 'pending' | 'approved' | 'rejected' | null;
  manual_reviewer_id: number | null;
  manual_review_comment: string | null;
  manual_reviewed_at: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface AvatarDebugSession {
  id: number;
  user_id: number;
  avatar_id: number;
  message_count: number;
  flagged_items: any;
  created_at: string;
  ended_at: string | null;
}

// ===== 分享与访问 =====
export type AccessCodeStatus = 'active' | 'expired' | 'revoked' | 'exhausted';

export interface AccessCode {
  id: number;
  user_id: number;
  code: string;
  card_id: string;
  max_uses: number | null;
  current_uses: number;
  expires_at: string;
  status: AccessCodeStatus;
  created_at: string;
  updated_at: string;
}

export interface AccessLog {
  id: number;
  access_code_id: number;
  visitor_ip: string | null;
  visitor_ua: string | null;
  accessed_at: string;
}

export interface Conversation {
  id: number;
  access_code_id: number;
  access_log_id: number | null;
  user_id: number;
  started_at: string;
  ended_at: string | null;
  message_count: number;
  created_at: string;
}

export type MessageRole = 'visitor' | 'ai_avatar' | 'system';
export type SourceTag = 'certified' | 'self_reported' | 'ai_inferred';

export interface ConversationMessage {
  id: number;
  conversation_id: number;
  role: MessageRole;
  content: string;
  source_tag: SourceTag | null;
  created_at: string;
}

export interface ConversationSummary {
  id: number;
  conversation_id: number;
  core_skills: string[];
  project_highlights: string[];
  source_stats: any;
  summary_text: string | null;
  generated_at: string;
}

// ===== 管理端 =====
export interface AdminRole {
  id: number;
  name: string;
  display_name: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  real_name: string | null;
  role_id: number;
  status: 'active' | 'disabled';
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OperationLog {
  id: number;
  admin_user_id: number;
  action: string;
  target_type: string | null;
  target_id: number | null;
  detail: any;
  ip_address: string | null;
  created_at: string;
}

export interface SiteConfig {
  id: number;
  config_key: string;
  config_value: string;
  description: string | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface SensitiveWord {
  id: number;
  word: string;
  category: string | null;
  severity: 'low' | 'medium' | 'high';
  is_active: boolean;
  created_at: string;
}

// ===== 通用 =====
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  page_size: number;
}
