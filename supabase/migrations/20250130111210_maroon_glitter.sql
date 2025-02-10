/*
  # Création des tables pour le système de transfert d'argent

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `country` (text)
      - `created_at` (timestamp)
    - `transfers`
      - `id` (uuid, primary key)
      - `reference` (text, unique)
      - `user_id` (uuid, foreign key)
      - `amount_sent` (numeric)
      - `fees` (numeric)
      - `amount_received` (numeric)
      - `sender_currency` (text)
      - `receiver_currency` (text)
      - `payment_method` (text)
      - `receiving_method` (text)
      - `status` (text)
      - `created_at` (timestamp)
    - `beneficiaries`
      - `id` (uuid, primary key)
      - `transfer_id` (uuid, foreign key)
      - `first_name` (text)
      - `last_name` (text)
      - `payment_details` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  country text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create transfers table
CREATE TABLE IF NOT EXISTS transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  amount_sent numeric NOT NULL,
  fees numeric NOT NULL,
  amount_received numeric NOT NULL,
  sender_currency text NOT NULL,
  receiver_currency text NOT NULL,
  payment_method text NOT NULL,
  receiving_method text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create beneficiaries table
CREATE TABLE IF NOT EXISTS beneficiaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id uuid REFERENCES transfers(id) NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  payment_details jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own transfers"
  ON transfers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transfers"
  ON transfers
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read beneficiaries of own transfers"
  ON beneficiaries
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM transfers
    WHERE transfers.id = beneficiaries.transfer_id
    AND transfers.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert beneficiaries for own transfers"
  ON beneficiaries
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM transfers
    WHERE transfers.id = transfer_id
    AND transfers.user_id = auth.uid()
  ));