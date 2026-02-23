import {
  Show,
  TextField,
  EditButton,
  ListButton,
  useRecordContext,
} from 'react-admin';
import { Box } from '@mui/material';
import { ShowCard } from '../../components/ShowCard';
import { FieldRow } from '../../components/FieldRow';
import { EuDateField } from '../../components/EuDateField';

const ClientShowContent = () => {
  const record = useRecordContext<any>();
  if (!record) return null;

  const fullName = `${record.name ?? ''} ${record.surname ?? ''}`.trim();

  return (
    <ShowCard
      badges={[fullName || 'Client', record.email, record.personalCode]}
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
      <FieldRow label="Personal Code"><TextField source="personalCode" /></FieldRow>
      <FieldRow label="Email"><TextField source="email" /></FieldRow>
      <FieldRow label="Joined On"><EuDateField source="joinedOn" /></FieldRow>
    </ShowCard>
  );
};

export const ClientShow = () => (
  <Show title="Client" component="div" actions={false} sx={{ p: 0, height: '100%' }}>
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
      <ClientShowContent />
    </Box>
  </Show>
);
