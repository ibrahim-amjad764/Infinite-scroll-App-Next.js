// //src/components/notifications/NotificationBell.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { Bell } from "lucide-react";
// import { NotificationDropdown } from "./NotificationDropdown";
// import api from "../../lib/api";

// export function NotificationBell() {
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [open, setOpen] = useState(false);

//   // Fetch unread notifications count
//   const fetchUnreadCount = async () => {
//     try {
//       const res = await api.get("/notifications/unread-count");
//       setUnreadCount(res.data.unread);
//       console.log("[NotificationBell] Unread count:", res.data.unread);
//     } catch (err) {
//       console.error("[NotificationBell] Failed to fetch unread count:", err);
//     }
//   };

//   useEffect(() => {
//     fetchUnreadCount();
//     const interval = setInterval(fetchUnreadCount, 3000); // refresh every 30s
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setOpen((prev) => !prev)}
//         className="relative"
//       >
//         <Bell className="h-6 w-6 text-gray-600 hover:text-gray-800 transition-all duration-200" />
//         {unreadCount > 0 && (
//           <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 animate-pulse">
//             {unreadCount}
//           </span>
//         )}
//       </button>

//       {open && (
//         <NotificationDropdown
//           onClose={() => setOpen(false)}
//           refreshUnread={fetchUnreadCount} // pass refresh function
//         />
//       )}
//     </div>
//   );
// }


"use Client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";
import { useNotificationStore } from "../../store/notificationStore";
import { connectNotificationSocket } from "../../lib/notificationSocket";
import api from "../../lib/api";

export function NotificationBell() {
  const { unreadCount, setNotifications, setCurrentUserId } = useNotificationStore();
  const [open, setOpen] = useState(false);

  // fetch Notification
  const fetchInitialNotifications = async () => {
    try {
      const res = await api.get("/notifications");//return all notifi...
      if (res?.data?.notifications) {
        setNotifications(res.data.notifications);
        console.log("[NotificationBell] notification loaded:", res.data.notifications.length);
      }

      if (res?.data?.userId) {
        setCurrentUserId(res.data.uerId);
        console.log("[NotificationBell] CurrentUserId received from API", res.data.userId);
      }
    } catch (err) {
      console.error("NotifcatonBell Failed to fetch notif...", err);
    }
  };

  useEffect(() => {
    console.log("[NotificationBell] Mounting...");
    let syncInterval: ReturnType<typeof setInterval> | null = null; 

    // Read user from store
    fetchInitialNotifications().then(() => {
      const userIdFromStore = useNotificationStore.getState().currentUserId;

      if (!userIdFromStore) {
        console.warn("[NotificationBell] currentUserId missing after API Call; realtime disabled return");
      }
      console.log("[NotificationBell] Connecting WebSocket for user:", userIdFromStore);
      if (userIdFromStore) {
        connectNotificationSocket(userIdFromStore);
      }

      syncInterval = setInterval(() => {
        console.log("[NotificationBell] Background sync...");
        fetchInitialNotifications();
      }, 60000)
    })
    return () => {
      console.log("[NotificationBell] Unmounting...");
      if (syncInterval) clearInterval(syncInterval);
    };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative" aria-label="Notifications">

        <Bell className="h-6 w-6 text-gray-600 hover:text-gray-800 transition-all duration-200" />

        {unreadCount > 0 && (
          <span
            id="notif-count"
            className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && <NotificationDropdown onClose={() => setOpen(false)} />}
    </div>
  );
} 
