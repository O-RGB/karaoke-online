// login
export interface LoginBody {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type?: string;
}

// register
export interface RegisterBody {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface RegisterResponse {
  manual_verification_required?: boolean;
  verification_code?: string;
  detail?: string;
}
