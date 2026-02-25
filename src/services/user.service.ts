// import api from "@/lib/api";
// import { UserDTO } from "@/types/users";
// // Get
// export const getUsers = async (): Promise<UserDTO[]> => {

//   const res = await api.get<UserDTO[]>("/users");

//   return res.data;
// };
// // Create
// export const createUser = async (
//   payload: Omit<UserDTO, "id"> // Remove id because DB generates
// ): Promise<UserDTO> => {
//   const res = await api.post<UserDTO>("/users", payload);                     

//   return res.data;
// };

// // UPDATE
// export const updateUser = async (
//   id: number,               
//   payload: Partial<UserDTO>// Only fields that need change
// ): Promise<UserDTO> => {
//   const res = await api.patch<UserDTO>(`/users/${id}`, payload);

//   return res.data;
// };

// // DELETE
// export const deleteUser = async (
//   id: number 
// ): Promise<void> => {
//   await api.delete(`/users/${id}`);
// };

import { UserDTO } from "@/types/users";
import api from "@/lib/api";

// CREATE user
export const createUser = async (
  payload: Omit<UserDTO, "id"> // Remove id because DB generates
): Promise<UserDTO> => {
  try {
    const res = await api.post<UserDTO>("/users", payload); // POST request to create user
    return res.data;
  } catch (error) {
    console.error("[CREATE USER ERROR]", error);
    throw error;
  }
};

// UPDATE user
export const updateUser = async (
  id: number,               
  payload: Partial<UserDTO>// Only fields that need change
): Promise<UserDTO> => {
  try {
    const res = await api.patch<UserDTO>(`/users/${id}`, payload); // PATCH request to update user
    return res.data;
  } catch (error) {
    console.error("[UPDATE USER ERROR]", error);
    throw error;
  }
};

// DELETE user
export const deleteUser = async (
  id: number 
): Promise<void> => {
  try {
    await api.delete(`/users/${id}`); // DELETE request to remove user
  } catch (error) {
    console.error("[DELETE USER ERROR]", error);
    throw error;
  }
};