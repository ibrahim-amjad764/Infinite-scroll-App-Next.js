"use client"
import { useState, forwardRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { logout } from "@/src/services/auth.service"

interface LogoutButtonProps {
  onDone?: () => void
}

const LogoutButton = forwardRef<HTMLButtonElement, LogoutButtonProps>(
  ({ onDone }, ref) => {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogout = async () => {
      setLoading(true)
      const toastId = toast.loading("Logging out...")
      try {
        await logout()
        toast.success("Logout successful", { id: toastId })
        onDone?.()        // optional dropdown close
        router.push("/auth/login")
      } catch (error: any) {
        toast.error(error.message || "Logout failed", { id: toastId })
      } finally {
        setLoading(false)
      }
    }

    return (
      <Button
        ref={ref}
        variant="destructive"
        className="w-full justify-start"
        onClick={handleLogout}
        disabled={loading}
      >
        {loading ? "Logging out..." : "Logout"}
      </Button>
    )
  }
)

LogoutButton.displayName = "LogoutButton"

export default LogoutButton
