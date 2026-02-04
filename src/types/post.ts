//src/types/users.ts
// import { UserDTO } from "./users";  // import UserDTO

// export interface Post {
//   id: number;
//   user: UserDTO;  // Replace the `string` user with `UserDTO`
//   time: string;
//   content: string;
//   image: string | null;
// }
interface Post {
  id: string; 
  content: string;
  images?: string[]; 
  createdAt: string;
  user: {
    id: string;
    firstName?: string | null | undefined ; 
    lastName?: string | null | undefined ;
    email: string;
  };
  time?: string; 
}
