-- Atlas (Phase 2): per-trip placement on the world map. Normalized [0,1]
-- fractions of the map's intrinsic size (so the map can be re-arted/resized
-- without moving markers). NULL = unplaced (lives in the tray).
ALTER TABLE trips ADD COLUMN atlas_x DOUBLE PRECISION, ADD COLUMN atlas_y DOUBLE PRECISION;
