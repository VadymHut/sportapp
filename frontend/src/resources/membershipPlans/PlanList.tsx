import {
  List,
  Datagrid,
  TextField,
  FunctionField,
  EditButton,
  DeleteButton,
  CreateButton,
  ExportButton,
  usePermissions,
  useRecordContext,
  useResourceContext,
  useCreatePath,
  FilterForm,
  SearchInput,
  Pagination,
} from 'react-admin';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Button as MuiButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

const MAX_WIDTH = 1100;

const EnumChip = ({ value }: { value?: string }) => (
  <Chip size="small" color="primary" variant="outlined" label={value ?? '-'} />
);

const OutlinedShowButton = () => {
  const record = useRecordContext<any>();
  const resource = useResourceContext();
  const createPath = useCreatePath();
  if (!record) return null;
  const to = createPath({ resource, id: record.id, type: 'show' });

  return (
    <MuiButton
      component={Link}
      to={to}
      variant="outlined"
      size="small"
      startIcon={<VisibilityIcon />}
    >
      Show
    </MuiButton>
  );
};

const planFilters = [<SearchInput key="q" source="q" alwaysOn placeholder="Search…" />];

const ConfirmDeleteBody = () => {
  const rec = useRecordContext<any>();
  if (!rec) return null;
  return (
    <Box sx={{ pt: 0.5 }}>
      <Typography sx={{ mb: 1 }}>
        You're about to delete plan <b>#{rec.id}</b>. You will not be able to restore it.
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        <Chip size="small" label={`Activity: ${rec.activityType ?? '-'}`} variant="outlined" />
        <Chip size="small" label={`Group: ${rec.groupType ?? '-'}`} variant="outlined" />
        <Chip size="small" label={`Frequency: ${rec.frequencyType ?? '-'}`} variant="outlined" />
      </Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
        This action affects only this record.
      </Typography>
    </Box>
  );
};

export const PlanList = () => {
  const { permissions } = usePermissions();
  const canEdit =
    permissions?.includes('ROLE_ADMIN') || permissions?.includes('ROLE_CASHIER');
  const canCreate = canEdit;

  return (
    <List
      title="Membership Plans"
      actions={false}
      component="div"
      pagination={false}
      perPage={10}
      sx={{
        p: 0,
        '& .RaList-content': {
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        },
      }}
    >
      <Box sx={{ width: '100%', maxWidth: MAX_WIDTH, mx: 'auto' }}>
        <Card variant="outlined" sx={{ width: '100%' }}>
          <CardContent sx={{ pt: 2.1, pb: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.25 }}>
              Membership Plans
            </Typography>

            <Box sx={{ mb: 1 }}>
              <FilterForm filters={planFilters} />
            </Box>

            <Datagrid
              rowClick="show"
              bulkActionButtons={false}
              size="small"
              sx={{ '& .column-id': { width: 80 } }}
            >
              <TextField source="id" sortable={false} />
              <FunctionField
                label="Activity"
                sortable={false}
                render={(rec: any) => <EnumChip value={rec.activityType} />}
              />
              <FunctionField
                label="Group"
                sortable={false}
                render={(rec: any) => <EnumChip value={rec.groupType} />}
              />
              <FunctionField
                label="Frequency"
                sortable={false}
                render={(rec: any) => <EnumChip value={rec.frequencyType} />}
              />

              <OutlinedShowButton />
              {canEdit && <EditButton variant="outlined" />}
              {canEdit && (
                <DeleteButton
                  variant="outlined"
                  mutationMode="pessimistic"
                  confirmTitle="Delete this plan?"
                  confirmContent={<ConfirmDeleteBody />}
                  confirmColor="warning"
                  successMessage="Deleted"
                />
              )}
            </Datagrid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <ExportButton variant="outlined" />
              {canCreate && <CreateButton variant="contained" />}
            </Box>
          </CardContent>
        </Card>

        <Box
          sx={{
            mt: 0.75,
            display: 'flex',
            justifyContent: 'flex-end',
            pr: 2,
          }}
        >
          <Pagination rowsPerPageOptions={[5, 10, 25, 50]} />
        </Box>
      </Box>
    </List>
  );
};
