-- Users table for NextAuth credentials-based authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('admin', 'guest')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed admin account
-- Generate a hash with: node -e "require('bcryptjs').hash('YOUR_PASSWORD', 12).then(h => console.log(h))"
-- Then run:
-- INSERT INTO users (email, password_hash, role) VALUES ('your@email.com', '<bcrypt_hash>', 'admin');
