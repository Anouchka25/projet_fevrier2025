export interface MaxAmount {
  value: number;
  currency: string;
}

export interface PromoCode {
  id: string;
  code: string;
  direction: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: number;
  start_date: string;
  end_date: string;
  max_uses: number | null;
  current_uses: number;
  active: boolean;
}

export interface PromoCodeValidation {
  valid: boolean;
  message: string;
  discount_type: 'PERCENTAGE' | 'FIXED' | null;
  discount_value: number | null;
}