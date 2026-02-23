import {
  Show,
  TextField,
  useRecordContext,
  EditButton,
  ListButton,
  ReferenceField,
  FunctionField,
  DateField
} from 'react-admin';
import { Box, Chip } from '@mui/material';
import { ShowCard } from '../../components/ShowCard';
import { FieldRow } from '../../components/FieldRow';
console.log("ShowCard typeof:", typeof ShowCard, ShowCard);
console.log("FieldRow typeof:", typeof FieldRow, FieldRow);
console.log("DateField typeof:", typeof DateField, DateField);


const AppUserShowContent = () => {
  const record = useRecordContext<any>();
  if (!record) return null;

  const roleLabel = record.role?.replace(/^ROLE_/, '') ?? '';
  const login = record.login ?? '';

  const badges = [
    login || 'User',
    roleLabel,
  ].filter(Boolean);

  return (
    <ShowCard
      badges={badges}
      detailsTitle="Details"
      maxWidth={650}
      minHeight="35vh"
      centerVertically
      actions={
        <>
          <ListButton variant="outlined" />
          <EditButton variant="outlined" />
        </>
      }
    >
      <FieldRow label="ID"><TextField source="id" /></FieldRow>
      <FieldRow label="Login"><TextField source="login" /></FieldRow>

      <FieldRow label="Role">
        <FunctionField
          source="role"
          render={(rec: any) =>
            rec?.role ? (
              <Chip
                size="small"
                color="primary"
                variant="outlined"
                label={rec.role.replace(/^ROLE_/, '')}
              />
            ) : (
              '-'
            )
          }
        />
      </FieldRow>

      <FieldRow label="Staff">
        {record.staff ? (
          <ReferenceField source="staff" reference="staff" link="show">
            <FunctionField
              render={(staff: any) =>
                staff
                  ? `${staff.name ?? ''} ${staff.surname ?? ''}`.trim() +
                    (staff.jobTitle ? ` – ${staff.jobTitle}` : '')
                  : '-'
              }
            />
          </ReferenceField>
        ) : (
          '-'
        )}
      </FieldRow>

      <FieldRow label="Last Login">
      <FunctionField
        render={(rec: any) => {
          const v = rec?.lastLoginAt;
          if (!v) return "-";
          return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(v));
        }}
  />
</FieldRow>

    </ShowCard>
  );
};

export const AppUserShow = () => (
  <Show title="User" component="div" actions={false} sx={{ p: 0, height: '100%' }}>
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'grid',
        placeItems: 'center',
        width: '100%',
        px: 2,
        py: 2,
      }}
    >
      <AppUserShowContent />
    </Box>
  </Show>
);
