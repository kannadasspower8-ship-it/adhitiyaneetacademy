export interface ToastEventDetail {
  id: string
  message: string
  type: "success" | "error" | "info" | "loading"
  duration?: number
}

export const toast = {
  show: (message: string, type: ToastEventDetail["type"] = "success", id?: string, duration = 3000) => {
    if (typeof window !== "undefined") {
      const toastId = id || Math.random().toString(36).substring(2, 9)
      window.dispatchEvent(
        new CustomEvent("cms-toast", {
          detail: { id: toastId, message, type, duration } as ToastEventDetail,
        })
      )
      return toastId
    }
    return ""
  },
  success: (message: string, id?: string, duration = 3000) => {
    return toast.show(message, "success", id, duration)
  },
  error: (message: string, id?: string, duration = 4000) => {
    return toast.show(message, "error", id, duration)
  },
  info: (message: string, id?: string, duration = 3000) => {
    return toast.show(message, "info", id, duration)
  },
  loading: (message: string, id?: string) => {
    return toast.show(message, "loading", id)
  },
  dismiss: (id: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("cms-toast-dismiss", {
          detail: { id },
        })
      )
    }
  },
}
