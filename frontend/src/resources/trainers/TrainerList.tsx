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
  useResourceDefinition,
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
import { EuDateField } from '../../components/EuDateField';

const MAX_WIDTH = 1100;

const trainerFilters = [<SearchInput key="q" source="q" alwaysOn placeholder="Search…" />];

const ActivityChip = ({ value }: { value?: string }) => (
  <Chip size="small" color="primary" variant="outlined" label={value ?? '-'} />
);

const OutlinedShowButton = () => {
  const record = useRecordContext<any>();
  const resource = useResourceContext();
  const createPath = useCreatePath();
  const { hasShow } = useResourceDefinition({ resource });

  if (!record) return null;
  const to = createPath({ resource, id: record.id, type: hasShow ? 'show' : 'edit' });

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

const ConfirmDeleteBody = () => {
  const rec = useRecordContext<any>();
  if (!rec) return null;
  return (
    <Box sx={{ pt: 0.5 }}>
      <Typography sx={{ mb: 1 }}>
        You're about to delete trainer <b>{rec.name} {rec.surname}</b>. You will not be able
        to restore it.
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 0.5 }}>
        <Chip size="small" label={`Activity: ${rec.activity ?? '-'}`} variant="outlined" />
        <Chip size="small" label={`Personal code: ${rec.personalCode ?? '-'}`} variant="outlined" />
        {rec.email && <Chip size="small" label={rec.email} variant="outlined" />}
      </Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
        This action affects only this record.
      </Typography>
    </Box>
  );
};

export const TrainerList = () => {
  const { permissions } = usePermissions();
  const canEdit =
    permissions?.includes('ROLE_ADMIN') || permissions?.includes('ROLE_CASHIER');
  const canCreate = canEdit;

  return (
    <List
      title="Trainers"
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
              Trainers
            </Typography>

            <Box sx={{ mb: 1 }}>
              <FilterForm filters={trainerFilters} />
            </Box>

            <Datagrid
              rowClick="show"
              bulkActionButtons={false}
              size="small"
              sx={{
                '& .column-id': { width: 80, textAlign: 'center' },
                '& .column-personalCode': { whiteSpace: 'nowrap' },
                '& .column-joinedOn': { textAlign: 'center' },
                '& .column-activity': { textAlign: 'center' },

                '& .column-fullName': {
                  maxWidth: 220,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
              }}
            >
              <TextField source="id" sortable={false} />

              <FunctionField
                source="fullName"
                label="Name"
                sortable={false}
                render={(rec: any) => {
                  const full = `${rec.name ?? ''} ${rec.surname ?? ''}`.trim();
                  if (!full) return '-';
                  return <span title={full}>{full}</span>;
                }}
              />

              <FunctionField
                source="activity"
                label="Activity"
                sortable={false}
                render={(rec: any) => <ActivityChip value={rec.activity} />}
              />

              <TextField source="personalCode" label="Personal Code" sortable={false} />
              <TextField source="email" label="Email" sortable={false} />
              <EuDateField source="joinedOn" label="Joined On" />

              <OutlinedShowButton />
              {canEdit && <EditButton variant="outlined" />}
              {canEdit && (
                <DeleteButton
                  variant="outlined"
                  mutationMode="pessimistic"
                  confirmTitle="Delete this trainer?"
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
