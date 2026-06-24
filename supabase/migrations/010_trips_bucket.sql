INSERT INTO storage.buckets (id, name, public) VALUES ('trips', 'trips', true) ON CONFLICT (id) DO NOTHING;
