
-- Fix app_configurations table structure
DO $$ 
BEGIN
    -- Add config_data column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'app_configurations' AND column_name = 'config_data'
    ) THEN
        ALTER TABLE app_configurations ADD COLUMN config_data JSONB;
    END IF;
    
    -- Ensure all required columns exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'app_configurations' AND column_name = 'config_key'
    ) THEN
        ALTER TABLE app_configurations ADD COLUMN config_key TEXT PRIMARY KEY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'app_configurations' AND column_name = 'config_value'
    ) THEN
        ALTER TABLE app_configurations ADD COLUMN config_value TEXT;
    END IF;
    
    -- Insert default global status if it doesn't exist
    INSERT INTO app_configurations (config_key, config_value, config_data) 
    VALUES ('global_status', 'active', '{"status": "active", "message": "System operational"}')
    ON CONFLICT (config_key) DO NOTHING;
    
END $$;
