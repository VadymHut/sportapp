import { Show, TextField, EditButton, ListButton, useRecordContext, useCreatePath } from 'react-admin';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Link as RouterLink } from 'react-router-dom';
import { ShowCard } from '../../components/ShowCard';
import { FieldRow } from '../../components/FieldRow';

const PlanShowContent = () => {
  const record = useRecordContext<any>();
  const createPath = useCreatePath();
  if (!record) return null;

  const addPriceTo =
    `${createPath({ resource: 'plan-prices', type: 'create' })}` +
    `?membershipPlan=${encodeURIComponent(record.id)}`;

  return (
    <ShowCard
      badges={[record.activityType, record.groupType, record.frequencyType]}
      detailsTitle="Details"
      maxWidth={650}
      minHeight="35vh"
      centerVertically
      actions={
        <>
          <ListButton variant="outlined" />
          <EditButton variant="outlined" />
          <Button
            component={RouterLink}
            to={addPriceTo}
            variant="contained"
            startIcon={<AddIcon />}
          >
            Add Price
          </Button>
        </>
      }
    >
      <FieldRow label="ID"><TextField source="id" /></FieldRow>
      <FieldRow label="Activity"><TextField source="activityType" /></FieldRow>
      <FieldRow label="Group"><TextField source="groupType" /></FieldRow>
      <FieldRow label="Frequency"><TextField source="frequencyType" /></FieldRow>
    </ShowCard>
  );
};

export const PlanShow = () => (
  <Show title="Membership Plan" component="div" actions={false} sx={{ p: 0, height: '100%' }}>
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
      <PlanShowContent />
    </Box>
  </Show>
);
