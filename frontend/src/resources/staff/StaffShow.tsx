import {
  Show,
  TextField,
  useRecordContext,
  EditButton,
  ListButton,
} from 'react-admin';
import { Box } from '@mui/material';
import { ShowCard } from '../../components/ShowCard';
import { FieldRow } from '../../components/FieldRow';
import { EuDateField } from '../../components/EuDateField';

const StaffShowContent = () => {
  const record = useRecordContext<any>();
  if (!record) return null;

  const fullName = `${record.name ?? ''} ${record.surname ?? ''}`.trim();

  const badges = [
    fullName || 'Staff Member',
    record.jobTitle,
    record.email,
    record.personalCode,
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
      <FieldRow label="Name"><TextField source="name" /></FieldRow>
      <FieldRow label="Surname"><TextField source="surname" /></FieldRow>
      <FieldRow label="Job Title"><TextField source="jobTitle" /></FieldRow>
      <FieldRow label="Personal Code"><TextField source="personalCode" /></FieldRow>
      <FieldRow label="Email"><TextField source="email" /></FieldRow>
      <FieldRow label="Joined On"><EuDateField source="joinedOn" /></FieldRow>
    </ShowCard>
  );
};

export const StaffShow = () => (
  <Show title="Staff Member" component="div" actions={false} sx={{ p: 0, height: '100%' }}>
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
      <StaffShowContent />
    </Box>
  </Show>
);
