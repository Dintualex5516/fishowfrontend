import { api } from "./api";

export type EntityName = "customers" | "parties" | "salesmen" | "products";

export type Entity = { 
  id: number | string; 
  name: string; 
  phone?: string;
  created_at?: string 
};

export const listEntities = async (
  entity: EntityName,
  opts?: { search?: string; page?: number; pageSize?: number }
): Promise<{ data: Entity[]; totalCount: number; page: number; pageSize: number }> => {
  const params: any = {};
  if (opts?.search) params.search = opts.search;
  params.page = opts?.page ?? 1;
  params.pageSize = opts?.pageSize ?? 10;

  const resp = await api.get(`/api/masters/${entity}`, { params });
  return resp.data;
};

export const createEntity = async (entity: EntityName, body: { name: string; phone?: string }) => {
  const resp = await api.post(`/api/masters/${entity}`, body);
  return resp.data;
};

export const updateEntity = async (entity: EntityName, id: number | string, body: { name: string; phone?: string }) => {
  const resp = await api.put(`/api/masters/${entity}/${id}`, body);
  return resp.data;
};

export const deleteEntity = async (entity: EntityName, id: number | string) => {
  const resp = await api.delete(`/api/masters/${entity}/${id}`);
  return resp.data;
};