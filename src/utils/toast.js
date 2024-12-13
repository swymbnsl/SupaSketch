import toast from "react-hot-toast";

export const customToast = {
  success: (message) =>
    toast.success(message, {
      style: {
        background: "#7c3aed",
        color: "#fff",
        padding: "16px",
        borderLeft: "4px solid #4c1d95",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#7c3aed",
      },
      duration: 3000,
    }),

  error: (message) =>
    toast.error(message, {
      style: {
        background: "#991b1b",
        color: "#fff",
        padding: "16px",
        borderLeft: "4px solid #7f1d1d",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#991b1b",
      },
      duration: 4000,
    }),
};
