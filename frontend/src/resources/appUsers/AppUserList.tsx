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
  ReferenceField,
  DateField,
} from "react-admin";
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

const userFilters = [<SearchInput key="q" source="q" alwaysOn placeholder="Search…" />];

const RoleChip = ({ value }: { value?: string }) => (
  <Chip
    size="small"
    color="primary"
    variant="outlined"
    label={value?.replace(/^ROLE_/, '') || '-'}
  />
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
        You're about to delete user <b>{rec.login}</b>. You will not be able to restore it.
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 0.5 }}>
        <Chip
          size="small"
          label={`Role: ${rec.role?.replace(/^ROLE_/, '') ?? '-'}`}
          variant="outlined"
        />
        {rec.staff && <Chip size="small" label={`Staff ID: ${rec.staff}`} variant="outlined" />}
      </Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
        This action affects only this record.
      </Typography>
    </Box>
  );
};

export const AppUserList = () => {
  const { permissions } = usePermissions();
  const canEdit = permissions?.includes('ROLE_ADMIN');
  const canCreate = canEdit;

  return (
    <List
      title="Users"
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
              Users
            </Typography>

            <Box sx={{ mb: 1 }}>
              <FilterForm filters={userFilters} />
            </Box>

            <Datagrid
              rowClick="show"
              bulkActionButtons={false}
              size="small"
              sx={{
                '& .column-id': { width: 80, textAlign: 'center' },
                '& .column-role': { textAlign: 'center' },
                '& .column-lastLoginAt': { textAlign: 'center', whiteSpace: 'nowrap' },

                '& .column-login, & .column-staffDisplay': {
                  maxWidth: 220,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
              }}
            >
              <TextField source="id" sortable={false} />

              <FunctionField
                source="login"
                label="Login"
                sortable={false}
                render={(rec: any) => {
                  const value = rec.login ?? '';
                  if (!value) return '-';
                  return <span title={value}>{value}</span>;
                }}
              />

              <FunctionField
                source="role"
                label="Role"
                sortable={false}
                render={(rec: any) => <RoleChip value={rec.role} />}
              />

              <FunctionField
                source="staffDisplay"
                label="Staff"
                sortable={false}
                render={(rec: any) => {
                  if (!rec.staff) return '-';
                  return (
                    <ReferenceField
                      source="staff"
                      reference="staff"
                      link="show"
                      record={rec}
                      label="Staff"
                    >
                      <FunctionField
                        render={(staff: any) => {
                          const full =
                            `${staff?.name ?? ''} ${staff?.surname ?? ''}`.trim() ||
                            `#${staff?.id}`;
                          const suffix = staff?.jobTitle ? ` – ${staff.jobTitle}` : '';
                          const text = full + suffix;
                          return <span title={text}>{text}</span>;
                        }}
                      />
                    </ReferenceField>
                  );
                }}
              />

              <DateField
                source="lastLoginAt"
                label="Last Login"
                showTime
                locales="en-GB"
                options={{
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }}
              />

              <OutlinedShowButton />
              {canEdit && <EditButton variant="outlined" />}
              {canEdit && (
                <DeleteButton
                  variant="outlined"
                  mutationMode="pessimistic"
                  confirmTitle="Delete this user?"
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
