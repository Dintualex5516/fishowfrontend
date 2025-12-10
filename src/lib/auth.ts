import {api} from "./api"

export type SignUpPayload = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role:string
};

export type UserResponse = {
  id: number;
  full_name: string;
  username: string;
  email: string;
  created_at: string;
};

export async function signup(payload: SignUpPayload) {
  const resp = await api.post<{ user: UserResponse }>('/api/auth/signup', {
    fullName: payload.fullName,
    username: payload.username,
    email: payload.email,
    password: payload.password,
    role:payload.role
  });
  return resp.data;
}

export const login = (payload: { username: string; password: string }) =>
  api.post('/api/auth/login', {
    username: payload.username,
    password: payload.password,
  });

export default api;