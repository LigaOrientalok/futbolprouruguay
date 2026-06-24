import { create } from "zustand"
interface UIState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))

interface NotificationState {
  unreadMessages: number
  setUnreadMessages: (count: number) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadMessages: 0,
  setUnreadMessages: (count) => set({ unreadMessages: count }),
}))
