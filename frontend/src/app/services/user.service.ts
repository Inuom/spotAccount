import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly endpoint = 'users';

  constructor(private apiService: ApiService) {}

  getUsers(role?: 'ADMIN' | 'USER', is_active?: boolean): Observable<User[]> {
    let queryParams = '';
    const params: string[] = [];
    
    if (role) {
      params.push(`role=${role}`);
    }
    
    if (is_active !== undefined) {
      params.push(`is_active=${is_active}`);
    }
    
    if (params.length > 0) {
      queryParams = `?${params.join('&')}`;
    }
    
    return this.apiService.get<User[]>(`${this.endpoint}${queryParams}`);
  }

  getUserById(id: string): Observable<User> {
    return this.apiService.get<User>(`${this.endpoint}/${id}`);
  }

  createUser(data: CreateUserDto): Observable<User> {
    return this.apiService.post<User>(this.endpoint, data);
  }

  updateUser(id: string, data: UpdateUserDto): Observable<User> {
    return this.apiService.patch<User>(`${this.endpoint}/${id}`, data);
  }

  deleteUser(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}

