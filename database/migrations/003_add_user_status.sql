-- Add status column to users table
ALTER TABLE users 
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'verified' 
CHECK (status IN ('verified', 'pending', 'suspended'));

-- Create index for status column
CREATE INDEX idx_users_status ON users(status);

-- Update existing users to have verified status
UPDATE users SET status = 'verified' WHERE status IS NULL;
