-- Script to create the session table for authentication

-- Create the session table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

-- Create index on expire(sid) to optimize session lookups
CREATE INDEX IF NOT EXISTS IDX_user_sessions_expire ON public.user_sessions (expire);

-- Display success message
SELECT 'Session table created successfully' AS status;