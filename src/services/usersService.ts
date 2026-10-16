import api from './api';

export interface BackendUser {
  id: number;
  email: string;
  name?: string;
  role: string;
  status: string;
  lastActive?: string;
  created_at: string;
  organization_id: string;
}

export async function fetchUsers(): Promise<{ total: number; users: BackendUser[] }> {
  const { data } = await api.get('/users');
  return data;
}

export async function patchUser(id: number, body: { status?: string; role?: string }): Promise<BackendUser> {
  const { data } = await api.patch(`/users/${id}`, body);
  return data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`);
}
