import { Layout as RALayout, CheckForApplicationUpdate } from "react-admin";
import type { LayoutProps } from "react-admin";

export const AppLayout = (props: LayoutProps) => (
  <RALayout {...props}>
    <CheckForApplicationUpdate />
  </RALayout>
);
