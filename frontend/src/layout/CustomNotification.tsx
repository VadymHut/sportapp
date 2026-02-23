import { Notification, type NotificationProps } from "react-admin";

export default function CustomNotification(props: NotificationProps) {
  return (
    <Notification
      autoHideDuration={4000}
      {...props}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{
        position: "fixed",
        zIndex: (t) => t.zIndex.snackbar,

        "& .MuiSnackbarContent-root": {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          borderRadius: 14,
          px: 2,
          py: 1.25,
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          border: (t) => `1px solid ${t.palette.divider}`,
          bgcolor: "background.paper",
          color: "text.primary",
          fontWeight: 600,
          letterSpacing: 0.2,
          textAlign: "center",
          maxWidth: 560,
        },

        "& .MuiSnackbarContent-action > .MuiButtonBase-root": {
          textTransform: "uppercase",
          fontWeight: 800,
          borderRadius: 999,
          px: 1.25,
          border: (t) => `1px solid ${t.palette.text.secondary}`,
          bgcolor: "transparent",
        },
      }}
    />
  );
}
