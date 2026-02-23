import type { ReactNode } from "react";
import { Typography, Box } from "@mui/material";

type FieldRowProps = {
  label: string;
  children: ReactNode;
};

export const FieldRow = ({ label, children }: FieldRowProps) => (
  <Box>
    <Typography variant="caption" sx={{ color: "text.secondary" }}>
      {label}
    </Typography>
    <Box sx={{ mt: 0.25 }}>{children}</Box>
  </Box>
);
