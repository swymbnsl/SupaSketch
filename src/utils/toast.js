import toast from "react-hot-toast";

export const customToast = {
  success: (message) =>
    toast.success(message, {
      style: {
        background: "linear-gradient(to right, #9333ea, #ff6b6b)",
        color: "#fff",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(147, 51, 234, 0.3)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#9333ea",
      },
      duration: 3000,
    }),

  error: (message) =>
    toast.error(message, {
      style: {
        background: "#1a1a1a",
        color: "#ff6b6b",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(255, 107, 107, 0.2)",
        border: "1px solid rgba(255, 107, 107, 0.3)",
      },
      iconTheme: {
        primary: "#ff6b6b",
        secondary: "#1a1a1a",
      },
      duration: 4000,
    }),
};
