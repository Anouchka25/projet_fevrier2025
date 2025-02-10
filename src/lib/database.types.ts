export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          country: string
          created_at: string
          profile_photo_url: string | null
          is_admin: boolean
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          country: string
          created_at?: string
          profile_photo_url?: string | null
          is_admin?: boolean
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          country?: string
          created_at?: string
          profile_photo_url?: string | null
          is_admin?: boolean
        }
      }
      transfer_conditions: {
        Row: {
          id: string
          name: string
          value: number
          currency: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          value: number
          currency: string
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          value?: number
          currency?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      exchange_rates: {
        Row: {
          id: string
          from_currency: string
          to_currency: string
          rate: number
          updated_at: string
        }
        Insert: {
          id?: string
          from_currency: string
          to_currency: string
          rate: number
          updated_at?: string
        }
        Update: {
          id?: string
          from_currency?: string
          to_currency?: string
          rate?: number
          updated_at?: string
        }
      }
      transfer_fees: {
        Row: {
          id: string
          from_country: string
          to_country: string
          payment_method: string
          receiving_method: string
          fee_percentage: number
          updated_at: string
        }
        Insert: {
          id?: string
          from_country: string
          to_country: string
          payment_method: string
          receiving_method: string
          fee_percentage: number
          updated_at?: string
        }
        Update: {
          id?: string
          from_country?: string
          to_country?: string
          payment_method?: string
          receiving_method?: string
          fee_percentage?: number
          updated_at?: string
        }
      }
      // ... autres tables existantes
    }
  }
}