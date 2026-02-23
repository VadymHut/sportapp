import {
  List,
  Datagrid,
  TextField,
  DateField,
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
  ReferenceField,
  FunctionField,
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

const MAX_WIDTH = 1200;

const checkInFilters = [<SearchInput key="q" source="q" alwaysOn placeholder="Search…" />];

const MembershipSummary = () => {
  const membership = useRecordContext<any>();
  if (!membership) return null;

  return (
    <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
      {`#${membership.id} – `}
      <ReferenceField
        source="client"
        reference="clients"
        link={false}
      >
        <FunctionField
          render={(c: any) =>
            `${c?.name ?? ''} ${c?.surname ?? ''}`.trim() || `#${c?.id}`
          }
        />
      </ReferenceField>
      {' - '}
      <ReferenceField
        source="membershipPlan"
        reference="membership-plans"
        link={false}
      >
        <FunctionField render={(p: any) => p?.activityType ?? '-'} />
      </ReferenceField>
    </Box>
  );
};

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
        You're about to delete check-in <b>#{rec.id}</b>. You will not be able to restore it.
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 0.5 }}>
        {rec.membership && (
          <Chip size="small" label={`Membership: #${rec.membership}`} variant="outlined" />
        )}
        {rec.staff && (
          <Chip size="small" label={`Staff: #${rec.staff}`} variant="outlined" />
        )}
        {rec.visitedAt && (
          <Chip
            size="small"
            label={`Visited at: ${new Date(rec.visitedAt).toLocaleString()}`}
            variant="outlined"
          />
        )}
      </Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
        This action affects only this record.
      </Typography>
    </Box>
  );
};

export const CheckInList = () => {
  const { permissions } = usePermissions();
  const canEdit =
    permissions?.includes('ROLE_ADMIN') ||
    permissions?.includes('ROLE_CASHIER') ||
    permissions?.includes('ROLE_RECEPTIONIST');
  const canCreate = canEdit;

  return (
    <List
      title="Check-ins"
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
              Check-ins
            </Typography>

            <Box sx={{ mb: 1 }}>
              <FilterForm filters={checkInFilters} />
            </Box>

            <Datagrid
              rowClick="show"
              bulkActionButtons={false}
              size="small"
              sx={{
                '& .column-id': { width: 80, textAlign: 'center' },
                '& .column-visitedAt': { textAlign: 'center' },
                '& .column-membership': {
                  maxWidth: 320,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
              }}
            >
              <TextField source="id" sortable={false} />

              <ReferenceField
                source="membership"
                reference="memberships"
                label="Membership"
                link="show"
              >
                <MembershipSummary />
              </ReferenceField>

              <ReferenceField source="staff" reference="staff" label="Staff" link="show">
                <FunctionField
                  render={(s: any) =>
                    s
                      ? `${s.name ?? ''} ${s.surname ?? ''}`.trim() || `#${s.id}`
                      : '-'
                  }
                />
              </ReferenceField>

              <DateField source="visitedAt" label="Visited at" showTime />

              <OutlinedShowButton />
              {canEdit && <EditButton variant="outlined" />}
              {canEdit && (
                <DeleteButton
                  variant="outlined"
                  mutationMode="pessimistic"
                  confirmTitle="Delete this check-in?"
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
