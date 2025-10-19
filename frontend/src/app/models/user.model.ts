export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role: 'ADMIN' | 'USER';
}

export interface UpdateUserDto {
  name?: string;
  role?: 'ADMIN' | 'USER';
  is_active?: boolean;
}

