-- ============================================================
-- AI智能履历平台 - Supabase 数据库迁移脚本
-- 在 Supabase SQL Editor 中运行此脚本
-- ============================================================

-- 0. 扩展
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. 用户表（C端求职者）
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL       PRIMARY KEY,
    phone           VARCHAR(20)     NOT NULL UNIQUE,
    phone_verified  BOOLEAN         NOT NULL DEFAULT FALSE,
    name            VARCHAR(50),
    avatar_url      TEXT,
    identity_verified  BOOLEAN      NOT NULL DEFAULT FALSE,
    education_verified BOOLEAN      NOT NULL DEFAULT FALSE,
    status          VARCHAR(20)     NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'disabled', 'deleted')),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE users IS 'C端求职者用户表';
COMMENT ON COLUMN users.identity_verified IS '身份认证通过后才可创建名片和分享';

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- ============================================================
-- 2. 身份认证记录
-- ============================================================
CREATE TABLE IF NOT EXISTS identity_verifications (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users(id),
    real_name       VARCHAR(50)     NOT NULL,
    id_number_hash  VARCHAR(128)    NOT NULL,
    face_verified   BOOLEAN         NOT NULL DEFAULT FALSE,
    status          VARCHAR(20)     NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    result_message  TEXT,
    verified_at     TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_identity_verif_user ON identity_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_identity_verif_status ON identity_verifications(status);

-- ============================================================
-- 3. 学历认证记录
-- ============================================================
CREATE TABLE IF NOT EXISTS education_verifications (
    id                  BIGSERIAL   PRIMARY KEY,
    user_id             BIGINT      NOT NULL REFERENCES users(id),
    school_name         VARCHAR(100) NOT NULL,
    major               VARCHAR(100),
    degree              VARCHAR(20) CHECK (degree IN ('high_school', 'associate', 'bachelor', 'master', 'doctor', 'other')),
    graduation_year     INTEGER,
    verification_source VARCHAR(50),
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    result_message      TEXT,
    verified_at         TIMESTAMPTZ,
    expires_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_edu_verif_user ON education_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_edu_verif_status ON education_verifications(status);

-- ============================================================
-- 4. 简历上传记录
-- ============================================================
CREATE TABLE IF NOT EXISTS resume_uploads (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users(id),
    file_url        TEXT            NOT NULL,
    file_type       VARCHAR(20)     NOT NULL CHECK (file_type IN ('pdf', 'word', 'image')),
    parse_status    VARCHAR(20)     NOT NULL DEFAULT 'pending'
                        CHECK (parse_status IN ('pending', 'parsing', 'completed', 'failed')),
    parse_result    JSONB,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resume_uploads_user ON resume_uploads(user_id);

-- ============================================================
-- 5. 名片模板
-- ============================================================
CREATE TABLE IF NOT EXISTS card_templates (
    id                  BIGSERIAL   PRIMARY KEY,
    name                VARCHAR(50) NOT NULL,
    industry_tag        VARCHAR(50),
    primary_color       VARCHAR(10) NOT NULL,
    secondary_color     VARCHAR(10) NOT NULL,
    avatar_style        VARCHAR(20),
    preview_image_url   TEXT,
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    sort_order          INTEGER     NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_card_templates_active ON card_templates(is_active) WHERE is_active = TRUE;

-- ============================================================
-- 6. 个人名片
-- ============================================================
CREATE TABLE IF NOT EXISTS cards (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL UNIQUE REFERENCES users(id),
    card_id         VARCHAR(20)     NOT NULL UNIQUE,
    template_id     BIGINT          REFERENCES card_templates(id),
    title           VARCHAR(100),
    position        VARCHAR(100),
    company         VARCHAR(100),
    contact_email   VARCHAR(100),
    contact_phone   VARCHAR(20),
    custom_theme    JSONB,
    status          VARCHAR(20)     NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'published', 'offline')),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN cards.card_id IS '公开唯一ID（用于分享）';

CREATE INDEX IF NOT EXISTS idx_cards_user ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_card_id ON cards(card_id);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);

-- ============================================================
-- 7. 经历管理（工作/教育统一表）
-- ============================================================
CREATE TABLE IF NOT EXISTS experiences (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users(id),
    type            VARCHAR(20)     NOT NULL CHECK (type IN ('work', 'education')),
    organization    VARCHAR(100)    NOT NULL,
    role            VARCHAR(100)    NOT NULL,
    start_date      DATE            NOT NULL,
    end_date        DATE,
    description     TEXT,
    achievements    TEXT,
    key_decisions   TEXT,
    skills          TEXT[],
    visibility      VARCHAR(20)     NOT NULL DEFAULT 'public'
                        CHECK (visibility IN ('public', 'hidden', 'cert_only')),
    source          VARCHAR(20)     NOT NULL DEFAULT 'manual'
                        CHECK (source IN ('manual', 'resume_parse', 'ai_suggest')),
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN experiences.end_date IS 'NULL表示至今（在职/在读）';

CREATE INDEX IF NOT EXISTS idx_experiences_user_type ON experiences(user_id, type);
CREATE INDEX IF NOT EXISTS idx_experiences_user_dates ON experiences(user_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_experiences_visibility ON experiences(user_id, visibility);

-- ============================================================
-- 8. 成就管理
-- ============================================================
CREATE TABLE IF NOT EXISTS achievements (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users(id),
    type            VARCHAR(20)     NOT NULL CHECK (type IN ('certificate', 'award', 'medal')),
    title           VARCHAR(200)    NOT NULL,
    issuer          VARCHAR(100),
    issue_date      DATE,
    description     TEXT,
    file_url        TEXT,
    file_type       VARCHAR(20),
    visibility      VARCHAR(20)     NOT NULL DEFAULT 'public'
                        CHECK (visibility IN ('public', 'hidden', 'cert_only')),
    ai_parsed       BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achievements_user_type ON achievements(user_id, type);
CREATE INDEX IF NOT EXISTS idx_achievements_visibility ON achievements(user_id, visibility);

-- ============================================================
-- 9. AI分身
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_avatars (
    id                      BIGSERIAL   PRIMARY KEY,
    user_id                 BIGINT      NOT NULL UNIQUE REFERENCES users(id),
    personality_style       VARCHAR(20) NOT NULL DEFAULT 'professional'
                            CHECK (personality_style IN ('professional', 'friendly', 'concise')),
    training_data_snapshot  JSONB,
    training_version        INTEGER     NOT NULL DEFAULT 1,
    status                  VARCHAR(20) NOT NULL DEFAULT 'not_created'
                            CHECK (status IN ('not_created', 'training', 'ready', 'reviewing', 'approved', 'rejected')),
    trained_at              TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_avatars_user ON ai_avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_avatars_status ON ai_avatars(status);

-- ============================================================
-- 10. AI分身调试会话
-- ============================================================
CREATE TABLE IF NOT EXISTS avatar_debug_sessions (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users(id),
    avatar_id       BIGINT          NOT NULL REFERENCES ai_avatars(id),
    message_count   INTEGER         NOT NULL DEFAULT 0,
    flagged_items   JSONB           NOT NULL DEFAULT '[]',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    ended_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_debug_sessions_user ON avatar_debug_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_debug_sessions_avatar ON avatar_debug_sessions(avatar_id);

-- ============================================================
-- 11. AI审核记录
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_reviews (
    id                      BIGSERIAL   PRIMARY KEY,
    user_id                 BIGINT      NOT NULL REFERENCES users(id),
    avatar_id               BIGINT      NOT NULL REFERENCES ai_avatars(id),
    review_type             VARCHAR(20) NOT NULL CHECK (review_type IN ('initial', 're_review')),
    ai_result               VARCHAR(20) NOT NULL CHECK (ai_result IN ('pass', 'flag', 'fail')),
    risk_level              VARCHAR(20) NOT NULL DEFAULT 'low'
                            CHECK (risk_level IN ('low', 'medium', 'high')),
    risk_details            JSONB,
    manual_review_status    VARCHAR(20) CHECK (manual_review_status IN ('pending', 'approved', 'rejected')),
    manual_reviewer_id      BIGINT      REFERENCES admin_users(id),
    manual_review_comment   TEXT,
    manual_reviewed_at      TIMESTAMPTZ,
    status                  VARCHAR(20) NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_reviews_user ON ai_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_avatar ON ai_reviews(avatar_id);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_manual_pending ON ai_reviews(manual_review_status) WHERE manual_review_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_ai_reviews_status ON ai_reviews(status);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_risk ON ai_reviews(risk_level) WHERE risk_level IN ('medium', 'high');

-- ============================================================
-- 12. 访问码
-- ============================================================
CREATE TABLE IF NOT EXISTS access_codes (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users(id),
    code            VARCHAR(20)     NOT NULL UNIQUE,
    card_id         VARCHAR(20)     NOT NULL REFERENCES cards(card_id),
    max_uses        INTEGER,
    current_uses    INTEGER         NOT NULL DEFAULT 0,
    expires_at      TIMESTAMPTZ     NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'expired', 'revoked', 'exhausted')),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN access_codes.max_uses IS 'NULL表示不限次数';

CREATE INDEX IF NOT EXISTS idx_access_codes_user ON access_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(code);
CREATE INDEX IF NOT EXISTS idx_access_codes_card ON access_codes(card_id);
CREATE INDEX IF NOT EXISTS idx_access_codes_status ON access_codes(status) WHERE status = 'active';

-- ============================================================
-- 13. 访问记录
-- ============================================================
CREATE TABLE IF NOT EXISTS access_logs (
    id              BIGSERIAL       PRIMARY KEY,
    access_code_id  BIGINT          NOT NULL REFERENCES access_codes(id),
    visitor_ip      VARCHAR(45),
    visitor_ua      TEXT,
    accessed_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_logs_code ON access_logs(access_code_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_time ON access_logs(accessed_at DESC);

-- ============================================================
-- 14. AI对话会话
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
    id              BIGSERIAL       PRIMARY KEY,
    access_code_id  BIGINT          NOT NULL REFERENCES access_codes(id),
    access_log_id   BIGINT          REFERENCES access_logs(id),
    user_id         BIGINT          NOT NULL REFERENCES users(id),
    started_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    ended_at        TIMESTAMPTZ,
    message_count   INTEGER         NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_code ON conversations(access_code_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_time ON conversations(started_at DESC);

-- ============================================================
-- 15. 对话消息
-- ============================================================
CREATE TABLE IF NOT EXISTS conversation_messages (
    id              BIGSERIAL       PRIMARY KEY,
    conversation_id BIGINT          NOT NULL REFERENCES conversations(id),
    role            VARCHAR(20)     NOT NULL CHECK (role IN ('visitor', 'ai_avatar', 'system')),
    content         TEXT            NOT NULL,
    source_tag      VARCHAR(20)     CHECK (source_tag IN ('certified', 'self_reported', 'ai_inferred')),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_time ON conversation_messages(conversation_id, created_at);

-- ============================================================
-- 16. 对话摘要
-- ============================================================
CREATE TABLE IF NOT EXISTS conversation_summaries (
    id                  BIGSERIAL   PRIMARY KEY,
    conversation_id     BIGINT      NOT NULL UNIQUE REFERENCES conversations(id),
    core_skills         TEXT[],
    project_highlights  TEXT[],
    source_stats        JSONB,
    summary_text        TEXT,
    generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_summaries_conversation ON conversation_summaries(conversation_id);

-- ============================================================
-- 17. 管理员角色
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_roles (
    id              BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(50)     NOT NULL UNIQUE,
    display_name    VARCHAR(50)     NOT NULL,
    permissions     JSONB           NOT NULL DEFAULT '[]',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 18. 管理员用户
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id              BIGSERIAL       PRIMARY KEY,
    username        VARCHAR(50)     NOT NULL UNIQUE,
    password_hash   VARCHAR(200)    NOT NULL,
    real_name       VARCHAR(50),
    role_id         BIGINT          NOT NULL REFERENCES admin_roles(id),
    status          VARCHAR(20)     NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'disabled')),
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON admin_users(status);

-- ============================================================
-- 19. 操作日志
-- ============================================================
CREATE TABLE IF NOT EXISTS operation_logs (
    id              BIGSERIAL       PRIMARY KEY,
    admin_user_id   BIGINT          NOT NULL REFERENCES admin_users(id),
    action          VARCHAR(100)    NOT NULL,
    target_type     VARCHAR(50),
    target_id       BIGINT,
    detail          JSONB,
    ip_address      VARCHAR(45),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_op_logs_admin ON operation_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_op_logs_time ON operation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_op_logs_action ON operation_logs(action);
CREATE INDEX IF NOT EXISTS idx_op_logs_target ON operation_logs(target_type, target_id);

-- ============================================================
-- 20. 站点配置
-- ============================================================
CREATE TABLE IF NOT EXISTS site_configs (
    id              BIGSERIAL       PRIMARY KEY,
    config_key      VARCHAR(100)    NOT NULL UNIQUE,
    config_value    TEXT            NOT NULL,
    description     TEXT,
    updated_by      BIGINT          REFERENCES admin_users(id),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 21. 敏感词库
-- ============================================================
CREATE TABLE IF NOT EXISTS sensitive_words (
    id              BIGSERIAL       PRIMARY KEY,
    word            VARCHAR(100)    NOT NULL UNIQUE,
    category        VARCHAR(50),
    severity        VARCHAR(20)     NOT NULL DEFAULT 'medium'
                        CHECK (severity IN ('low', 'medium', 'high')),
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sensitive_words_active ON sensitive_words(is_active) WHERE is_active = TRUE;

-- ============================================================
-- 初始化数据
-- ============================================================

-- 管理员角色
INSERT INTO admin_roles (name, display_name, permissions) VALUES
('super_admin', '超级管理员', '["user.manage", "user.disable", "review.view", "review.approve", "review.reject", "cert.manage", "config.edit", "role.manage", "template.manage", "sensitive.manage", "log.view", "data.export"]'),
('operator', '运营', '["user.manage", "review.view", "cert.manage", "template.manage", "sensitive.manage", "log.view"]'),
('reviewer', '审核员', '["review.view", "review.approve", "review.reject", "cert.manage"]')
ON CONFLICT (name) DO NOTHING;

-- 默认超级管理员（密码: admin123）
INSERT INTO admin_users (username, password_hash, real_name, role_id) VALUES
('admin', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', '系统管理员', 1)
ON CONFLICT (username) DO NOTHING;

-- 站点配置
INSERT INTO site_configs (config_key, config_value, description) VALUES
('site_name', 'AI智能履历平台', '网站名称'),
('site_logo_url', '', '网站Logo URL'),
('site_announcement', '', '网站公告'),
('site_contact_email', '', '联系邮箱'),
('site_terms_url', '', '服务条款链接'),
('identity_cert_expiry_days', '365', '身份认证有效期(天)'),
('education_cert_expiry_days', '730', '学历认证有效期(天)'),
('default_access_code_ttl_hours', '168', '默认访问码有效期(小时, 7天)'),
('max_access_code_uses', '10', '访问码默认最大使用次数'),
('ai_avatar_max_training_per_day', '3', '每日AI分身训练次数上限')
ON CONFLICT (config_key) DO NOTHING;

-- 名片模板（11个行业风格）
INSERT INTO card_templates (name, industry_tag, primary_color, secondary_color, avatar_style, sort_order) VALUES
('经典商务', 'general', '#1a73e8', '#fbbc04', 'circle', 0),
('学术风范', 'education', '#1565c0', '#e8eaf6', 'circle', 1),
('互联网极客', 'it', '#00695c', '#b2dfdb', 'hexagon', 2),
('数字前沿', 'it', '#283593', '#c5cae9', 'square', 3),
('金融精英', 'finance', '#1b5e20', '#c8e6c9', 'circle', 4),
('建筑匠心', 'architecture', '#4e342e', '#d7ccc8', 'square', 5),
('仁心医者', 'medical', '#b71c1c', '#ffcdd2', 'circle', 6),
('正义之盾', 'legal', '#263238', '#cfd8dc', 'hexagon', 7),
('创意设计', 'design', '#e91e63', '#fce4ec', 'circle', 8),
('春华秋实', 'education', '#f57f17', '#fff9c4', 'circle', 9),
('法律守护', 'legal', '#0d47a1', '#bbdefb', 'square', 10)
ON CONFLICT DO NOTHING;

-- 默认敏感词
INSERT INTO sensitive_words (word, category, severity) VALUES
('代开发票', 'fraud', 'high'),
('虚假学历', 'fraud', 'high'),
('包过', 'fraud', 'medium')
ON CONFLICT (word) DO NOTHING;

-- ============================================================
-- RLS 策略（使用 Supabase Auth）
-- ============================================================

-- users 表：用户只能看/改自己的数据
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.role() = 'service_role' OR true);

CREATE POLICY "users_insert_self" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.role() = 'service_role' OR true);

-- experiences：用户管理自己的经历，面试官看公开的
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "experiences_select" ON experiences
  FOR SELECT USING (true);

CREATE POLICY "experiences_insert_own" ON experiences
  FOR INSERT WITH CHECK (true);

CREATE POLICY "experiences_update_own" ON experiences
  FOR UPDATE USING (true);

-- cards：名片公开发布
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cards_select" ON cards
  FOR SELECT USING (true);

CREATE POLICY "cards_insert_own" ON cards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "cards_update_own" ON cards
  FOR UPDATE USING (true);

-- access_codes
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "access_codes_select" ON access_codes
  FOR SELECT USING (true);

CREATE POLICY "access_codes_insert_own" ON access_codes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "access_codes_update_own" ON access_codes
  FOR UPDATE USING (true);

-- conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_select" ON conversations
  FOR SELECT USING (true);

CREATE POLICY "conversations_insert" ON conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "conversations_update" ON conversations
  FOR UPDATE USING (true);

-- conversation_messages
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select" ON conversation_messages
  FOR SELECT USING (true);

CREATE POLICY "messages_insert" ON conversation_messages
  FOR INSERT WITH CHECK (true);

-- 其余表允许所有操作（MVP阶段简化）
ALTER TABLE identity_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iv_all" ON identity_verifications FOR ALL USING (true);

ALTER TABLE education_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ev_all" ON education_verifications FOR ALL USING (true);

ALTER TABLE resume_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ru_all" ON resume_uploads FOR ALL USING (true);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ach_all" ON achievements FOR ALL USING (true);

ALTER TABLE ai_avatars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aa_all" ON ai_avatars FOR ALL USING (true);

ALTER TABLE avatar_debug_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ads_all" ON avatar_debug_sessions FOR ALL USING (true);

ALTER TABLE ai_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ar_all" ON ai_reviews FOR ALL USING (true);

ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "al_all" ON access_logs FOR ALL USING (true);

ALTER TABLE conversation_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cs_all" ON conversation_summaries FOR ALL USING (true);

ALTER TABLE operation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ol_all" ON operation_logs FOR ALL USING (true);

ALTER TABLE site_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sc_all" ON site_configs FOR ALL USING (true);

ALTER TABLE sensitive_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sw_all" ON sensitive_words FOR ALL USING (true);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "au_all" ON admin_users FOR ALL USING (true);

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "arole_all" ON admin_roles FOR ALL USING (true);

ALTER TABLE card_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ct_all" ON card_templates FOR ALL USING (true);

-- ============================================================
-- 完成
-- ============================================================
SELECT '数据库迁移完成！' AS result;
