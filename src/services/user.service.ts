import api from "@/src/lib/api";
import { UserDTO } from "@/src/types/users";
// Get
export const getUsers = async (): Promise<UserDTO[]> => {

  const res = await api.get<UserDTO[]>("/users");

  return res.data;
};
// Create
export const createUser = async (
  payload: Omit<UserDTO, "id"> // Remove id because DB generates
): Promise<UserDTO> => {
  const res = await api.post<UserDTO>("/users", payload);                     

  return res.data;
};

// UPDATE
export const updateUser = async (
  id: number,               
  payload: Partial<UserDTO>        // Only fields that need change
): Promise<UserDTO> => {
  const res = await api.patch<UserDTO>(`/users/${id}`, payload);

  return res.data;
};

// DELETE
export const deleteUser = async (
  id: number 
): Promise<void> => {
  await api.delete(`/users/${id}`);
};

