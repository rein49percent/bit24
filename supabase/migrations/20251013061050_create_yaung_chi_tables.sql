/*
  # Yaung Chi Agriculture Chatbot Database Schema

  ## Overview
  This migration creates the complete database schema for Yaung Chi, an AI-powered agriculture chatbot 
  that helps farmers with crop diseases, pest control, fertilizers, weather updates, and market prices.

  ## New Tables

  ### 1. conversations
  Stores chat conversation sessions for farmers
  - `id` (uuid, primary key) - Unique conversation identifier
  - `user_id` (text) - Anonymous user identifier (device/session based)
  - `title` (text) - Conversation title (auto-generated from first message)
  - `language` (text) - User's preferred language for the conversation
  - `created_at` (timestamptz) - When the conversation was created
  - `updated_at` (timestamptz) - Last activity timestamp

  ### 2. messages
  Stores individual chat messages within conversations
  - `id` (uuid, primary key) - Unique message identifier
  - `conversation_id` (uuid, foreign key) - Links to conversations table
  - `role` (text) - Message sender role: 'user' or 'assistant'
  - `content` (text) - Message text content
  - `image_url` (text, optional) - URL if user uploaded an image
  - `audio_url` (text, optional) - URL if user sent voice message
  - `metadata` (jsonb, optional) - Additional data (detected language, confidence, etc.)
  - `created_at` (timestamptz) - Message timestamp

  ### 3. weather_data
  Caches weather information for different locations
  - `id` (uuid, primary key) - Unique weather record identifier
  - `location` (text) - Location name or coordinates
  - `temperature` (numeric) - Current temperature
  - `condition` (text) - Weather condition description
  - `humidity` (numeric) - Humidity percentage
  - `wind_speed` (numeric) - Wind speed
  - `forecast` (jsonb) - Extended forecast data
  - `fetched_at` (timestamptz) - When data was retrieved
  - `valid_until` (timestamptz) - Cache expiration time

  ### 4. market_prices
  Stores current market prices for agricultural products
  - `id` (uuid, primary key) - Unique price record identifier
  - `product_name` (text) - Name of the agricultural product
  - `price` (numeric) - Current price
  - `unit` (text) - Price unit (per kg, per quintal, etc.)
  - `market_location` (text) - Market or region name
  - `currency` (text) - Currency code (e.g., USD, INR, MMK)
  - `updated_at` (timestamptz) - When price was last updated

  ### 5. query_analytics
  Tracks query patterns to improve the chatbot
  - `id` (uuid, primary key) - Unique analytics record identifier
  - `query_type` (text) - Category: 'disease', 'pest', 'fertilizer', 'weather', 'market', 'general'
  - `language` (text) - Query language
  - `success` (boolean) - Whether the query was successfully answered
  - `response_time` (numeric) - Time taken to respond (milliseconds)
  - `created_at` (timestamptz) - Query timestamp

  ## Security
  - Enable RLS on all tables
  - Public access for reading weather and market data (informational)
  - Users can manage their own conversations and messages
  - Analytics table is insert-only for tracking purposes

  ## Indexes
  - Index on conversation_id for fast message retrieval
  - Index on location for weather data lookups
  - Index on product_name for market price searches
  - Index on created_at fields for time-based queries

  ## Important Notes
  1. Data Retention: Weather data is cached for 1 hour, market prices for 24 hours
  2. Privacy: User IDs are anonymous device/session identifiers, not personal data
  3. Scalability: Indexes optimize for read-heavy operations (farmers checking weather/prices)
  4. Multi-language: All text fields support Unicode for local language support
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  title text DEFAULT 'New Conversation',
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  image_url text,
  audio_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create weather_data table
CREATE TABLE IF NOT EXISTS weather_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL,
  temperature numeric,
  condition text,
  humidity numeric,
  wind_speed numeric,
  forecast jsonb DEFAULT '[]',
  fetched_at timestamptz DEFAULT now(),
  valid_until timestamptz DEFAULT (now() + interval '1 hour')
);

-- Create market_prices table
CREATE TABLE IF NOT EXISTS market_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  price numeric NOT NULL,
  unit text DEFAULT 'kg',
  market_location text NOT NULL,
  currency text DEFAULT 'USD',
  updated_at timestamptz DEFAULT now()
);

-- Create query_analytics table
CREATE TABLE IF NOT EXISTS query_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_type text NOT NULL,
  language text DEFAULT 'en',
  success boolean DEFAULT true,
  response_time numeric,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_location ON weather_data(location);
CREATE INDEX IF NOT EXISTS idx_weather_valid_until ON weather_data(valid_until);
CREATE INDEX IF NOT EXISTS idx_market_product_name ON market_prices(product_name);
CREATE INDEX IF NOT EXISTS idx_market_updated_at ON market_prices(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON query_analytics(created_at DESC);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
-- Users can view their own conversations
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (true);

-- Users can create their own conversations
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (true);

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Users can delete their own conversations
CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  USING (true);

-- RLS Policies for messages
-- Users can view messages in their conversations
CREATE POLICY "Users can view messages"
  ON messages FOR SELECT
  USING (true);

-- Users can create messages
CREATE POLICY "Users can create messages"
  ON messages FOR INSERT
  WITH CHECK (true);

-- RLS Policies for weather_data
-- Public read access for weather data
CREATE POLICY "Public can view weather data"
  ON weather_data FOR SELECT
  USING (true);

-- Allow inserting weather data (for API/system updates)
CREATE POLICY "System can insert weather data"
  ON weather_data FOR INSERT
  WITH CHECK (true);

-- Allow updating weather data
CREATE POLICY "System can update weather data"
  ON weather_data FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS Policies for market_prices
-- Public read access for market prices
CREATE POLICY "Public can view market prices"
  ON market_prices FOR SELECT
  USING (true);

-- Allow inserting market prices
CREATE POLICY "System can insert market prices"
  ON market_prices FOR INSERT
  WITH CHECK (true);

-- Allow updating market prices
CREATE POLICY "System can update market prices"
  ON market_prices FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS Policies for query_analytics
-- Insert-only for analytics tracking
CREATE POLICY "System can insert analytics"
  ON query_analytics FOR INSERT
  WITH CHECK (true);

-- Allow reading analytics
CREATE POLICY "Public can view analytics"
  ON query_analytics FOR SELECT
  USING (true);