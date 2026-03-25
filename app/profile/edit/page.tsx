"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchUserProfile, updateUserProfile } from "../../api/profile-user/user";
import ProfileContent from "../../../src/components/membership/profile-page/ProfileContent";
import Loader from "../../../components/ui/Loader";
import { Button } from "../../../components/ui/button";

const EditProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  useEffect(() => {
    document.title = "Edit Profile | My Next JS App"
  }, [])

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userProfile = await fetchUserProfile();
        setUser(userProfile);
      } catch (error) {
        console.error("[EditProfilePage] Fetch error:", error);
        toast.error("Failed to load profile.");
      }
    };
    void getUserData();
  }, []);

  const handleSave = async (updatedUser: any) => {
    setIsSaving(true);
    try {
      await updateUserProfile(updatedUser);
      toast.success("Profile saved successfully!");
      router.push("/profile");
    } catch (error) {
      console.error("[EditProfilePage] Save error:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/profile");
  };

  if (!user) return <Loader title="Loading form..." subtitle="Preparing your profile data" size="md" />;

  return (
    <div className="min-h-screen bg-slate-200 text-gray-800 dark:bg-zinc-900 dark:text-gray-300">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6 ">
        {/* Back button */}
        <div>
          <Button variant="outline" asChild className="dark:bg-zinc-900 dark:hover:bg-zinc-700 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 text-md">
            <Link href="/profile">← Back</Link>
          </Button>
        </div>

        <div>
          <h2 className="text-2xl font-semibold ">Edit profile</h2>
          <p className="text-sm text-slate-400 mt-2 italic ">
            Personal, Account, Security & Notifications. Changes reflect on your profile page.
          </p>
        </div>

        <ProfileContent user={user} onSave={handleSave} onCancel={handleCancel} isSaving={isSaving} />
      </div>
    </div>
  );
};

export default EditProfilePage;