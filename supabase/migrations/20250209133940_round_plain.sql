/*
  # Add transfer details columns

  1. Changes
    - Add funds_origin column to transfers table
    - Add transfer_reason column to transfers table
    
  2. Description
    These columns store information about:
    - The origin of the funds (salary, savings, etc.)
    - The reason for the transfer (family support, business, etc.)
*/

-- Add new columns to transfers table
ALTER TABLE transfers 
ADD COLUMN IF NOT EXISTS funds_origin text,
ADD COLUMN IF NOT EXISTS transfer_reason text;

-- Add comments for documentation
COMMENT ON COLUMN transfers.funds_origin IS 'Origin of the funds (salary, savings, business, etc.)';
COMMENT ON COLUMN transfers.transfer_reason IS 'Reason for the transfer (family support, business, etc.)';