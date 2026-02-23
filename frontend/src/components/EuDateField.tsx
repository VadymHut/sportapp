import { DateField } from "react-admin";
import type { DateFieldProps } from "react-admin";

export const EuDateField = (props: DateFieldProps) => (
  <DateField
    {...props}
    locales="lv-LV"
    options={{ day: "2-digit", month: "2-digit", year: "numeric" }}
  />
);
