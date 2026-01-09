-- Add group_id column to content_items table
-- This allows grouping multiple images together

-- Add group_id column (nullable, so existing items remain individual)
ALTER TABLE content_items 
ADD COLUMN IF NOT EXISTS group_id VARCHAR(100);

-- Add index for faster group queries
CREATE INDEX IF NOT EXISTS idx_content_items_group_id 
ON content_items(group_id) 
WHERE group_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN content_items.group_id IS 'Optional group identifier. Items with the same group_id are displayed together. NULL means individual item.';

