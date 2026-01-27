-- Functions for Q&A upvote management

-- Increment upvotes
CREATE OR REPLACE FUNCTION increment_upvotes(question_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE qa_questions
  SET upvotes = upvotes + 1
  WHERE id = question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement upvotes
CREATE OR REPLACE FUNCTION decrement_upvotes(question_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE qa_questions
  SET upvotes = GREATEST(0, upvotes - 1)
  WHERE id = question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_upvotes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_upvotes(UUID) TO authenticated;
