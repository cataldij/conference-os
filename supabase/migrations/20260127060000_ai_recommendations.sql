-- =============================================
-- AI RECOMMENDATIONS - Embeddings & Recommendations
-- Uses pgvector for similarity search
-- =============================================

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================
-- EMBEDDINGS STORAGE
-- =============================================

-- Session embeddings (generated from title + description)
ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS embedding vector(1536),
ADD COLUMN IF NOT EXISTS topics TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'intermediate',
ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMPTZ;

-- User interest embeddings (generated from interests + behavior)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS interest_embedding vector(1536),
ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMPTZ;

-- =============================================
-- RECOMMENDATIONS CACHE
-- =============================================

-- Cached recommendations per user per conference
CREATE TABLE IF NOT EXISTS public.user_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  score DECIMAL NOT NULL, -- similarity score (0-1)
  reason TEXT, -- AI-generated explanation
  recommendation_type TEXT CHECK (recommendation_type IN (
    'interest_match',    -- matches user interests
    'popular',           -- trending/high save rate
    'similar_attendees', -- collaborative filtering
    'skill_building',    -- builds on attended sessions
    'schedule_fit'       -- fits in schedule gaps
  )) DEFAULT 'interest_match',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '1 hour'),
  UNIQUE(user_id, conference_id, session_id)
);

-- =============================================
-- USER BEHAVIOR TRACKING
-- =============================================

-- Session interactions for collaborative filtering
CREATE TABLE IF NOT EXISTS public.session_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  interaction_type TEXT CHECK (interaction_type IN (
    'viewed',      -- opened session detail
    'saved',       -- added to schedule
    'attended',    -- checked in / watched live
    'rated',       -- gave rating
    'shared'       -- shared session
  )) NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5), -- for 'rated' type
  duration_seconds INT, -- for 'viewed' type (time spent)
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, session_id, interaction_type)
);

-- =============================================
-- INDEXES FOR VECTOR SIMILARITY
-- =============================================

-- IVFFlat index for session embeddings (fast approximate search)
-- Lists = sqrt(num_rows), so 100 is good for up to 10k sessions
CREATE INDEX IF NOT EXISTS idx_sessions_embedding
ON sessions USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- IVFFlat index for user interest embeddings
CREATE INDEX IF NOT EXISTS idx_profiles_embedding
ON profiles USING ivfflat (interest_embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for recommendation lookups
CREATE INDEX IF NOT EXISTS idx_recommendations_user_conference
ON user_recommendations(user_id, conference_id, expires_at);

-- Index for interaction analytics
CREATE INDEX IF NOT EXISTS idx_interactions_session
ON session_interactions(session_id, interaction_type);

CREATE INDEX IF NOT EXISTS idx_interactions_user
ON session_interactions(user_id, created_at DESC);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to find similar sessions using vector similarity
CREATE OR REPLACE FUNCTION find_similar_sessions(
  query_embedding vector(1536),
  conference_uuid UUID,
  limit_count INT DEFAULT 10
)
RETURNS TABLE (
  session_id UUID,
  title TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    1 - (s.embedding <=> query_embedding) as similarity
  FROM sessions s
  WHERE s.conference_id = conference_uuid
    AND s.embedding IS NOT NULL
    AND s.start_time > now() -- only future sessions
  ORDER BY s.embedding <=> query_embedding
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get session popularity score
CREATE OR REPLACE FUNCTION get_session_popularity(session_uuid UUID)
RETURNS TABLE (
  save_count BIGINT,
  view_count BIGINT,
  avg_rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE interaction_type = 'saved') as save_count,
    COUNT(*) FILTER (WHERE interaction_type = 'viewed') as view_count,
    AVG(rating) FILTER (WHERE interaction_type = 'rated') as avg_rating
  FROM session_interactions
  WHERE session_id = session_uuid;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_interactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own recommendations
CREATE POLICY "Users see own recommendations"
ON user_recommendations FOR SELECT
USING (auth.uid() = user_id);

-- Users can only see their own interactions
CREATE POLICY "Users see own interactions"
ON session_interactions FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own interactions
CREATE POLICY "Users create own interactions"
ON session_interactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Service role can manage all (for edge functions)
CREATE POLICY "Service manages recommendations"
ON user_recommendations FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Service manages interactions"
ON session_interactions FOR ALL
USING (auth.role() = 'service_role');
