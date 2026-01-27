"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { logout } from "@/src/services/auth.service";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("auth/login"); // redirect after logout
    } catch (error) {
      alert("Failed to logout");
    }
  };

  return (
    <Button variant="destructive" onClick={handleLogout}>
      Logout
    </Button>
  );
}