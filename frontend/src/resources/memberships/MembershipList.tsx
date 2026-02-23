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
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { EuDateField } from '../../components/EuDateField';

const MAX_WIDTH = 1300;

const membershipFilters = [<SearchInput key="q" source="q" alwaysOn placeholder="Search…" />];

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
      onClick={e => e.stopPropagation()}
    >
      Show
    </MuiButton>
  );
};

const VisitsButton = () => {
  const record = useRecordContext<any>();
  if (!record) return null;

  const to = `/memberships/${record.id}/quick`;

  return (
    <MuiButton
      component={Link}
      to={to}
      variant="outlined"
      size="small"
      startIcon={<FlashOnIcon />}
      onClick={e => e.stopPropagation()}
    >
      Visits
    </MuiButton>
  );
};

const ConfirmDeleteBody = () => {
  const rec = useRecordContext<any>();
  if (!rec) return null;
  return (
    <Box sx={{ pt: 0.5 }}>
      <Typography sx={{ mb: 1 }}>
        You're about to delete membership <b>#{rec.id}</b>. You will not be able to restore it.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 0.5 }}>
        {rec.client && (
          <Chip size="small" label={`Client ID: ${rec.client}`} variant="outlined" />
        )}
        {rec.membershipPlan && (
          <Chip
            size="small"
            label={`Plan ID: ${rec.membershipPlan}`}
            variant="outlined"
          />
        )}
        {rec.trainer && (
          <Chip size="small" label={`Trainer ID: ${rec.trainer}`} variant="outlined" />
        )}
      </Box>

      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
        This action affects only this record.
      </Typography>
    </Box>
  );
};

export const MembershipList = () => {
  const { permissions } = usePermissions();
  const canEdit =
    permissions?.includes('ROLE_ADMIN') || permissions?.includes('ROLE_CASHIER');
  const canCreate = canEdit;

  return (
    <List
      title="Memberships"
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
              Memberships
            </Typography>

            <Box sx={{ mb: 1 }}>
              <FilterForm filters={membershipFilters} />
            </Box>

            <Datagrid
              rowClick="show"
              bulkActionButtons={false}
              size="small"
              sx={{
                '& .column-id': { width: 80, textAlign: 'center' },
                '& .column-startingDate, & .column-endingDate': { textAlign: 'center' },
                '& .column-clientDisplay, & .column-planDisplay, & .column-trainerDisplay': {
                  maxWidth: 230,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
              }}
            >
              <TextField source="id" sortable={false} />

              <FunctionField
                source="clientDisplay"
                label="Client"
                sortable={false}
                render={(rec: any) =>
                  rec.client ? (
                    <ReferenceField
                      source="client"
                      reference="clients"
                      link="show"
                      record={rec}
                      label="Client"
                    >
                      <FunctionField
                        render={(client: any) => {
                          const text =
                            `${client?.name ?? ''} ${client?.surname ?? ''}`.trim() ||
                            `#${client?.id}`;
                          return <span title={text}>{text}</span>;
                        }}
                      />
                    </ReferenceField>
                  ) : (
                    '-'
                  )
                }
              />

              <FunctionField
                source="planDisplay"
                label="Plan"
                sortable={false}
                render={(rec: any) =>
                  rec.membershipPlan ? (
                    <ReferenceField
                      source="membershipPlan"
                      reference="membership-plans"
                      link="show"
                      record={rec}
                      label="Plan"
                    >
                      <FunctionField
                        render={(plan: any) => {
                          if (!plan) return '-';
                          const text = `${plan.activityType ?? '-'} / ${
                            plan.groupType ?? '-'
                          } / ${plan.frequencyType ?? '-'}`;
                          return <span title={text}>{text}</span>;
                        }}
                      />
                    </ReferenceField>
                  ) : (
                    '-'
                  )
                }
              />

              <FunctionField
                source="trainerDisplay"
                label="Trainer"
                sortable={false}
                render={(rec: any) =>
                  rec.trainer ? (
                    <ReferenceField
                      source="trainer"
                      reference="trainers"
                      link="show"
                      record={rec}
                      label="Trainer"
                    >
                      <FunctionField
                        render={(trainer: any) => {
                          if (!trainer) return '-';

                          const text =
                            `${trainer.name ?? ''} ${trainer.surname ?? ''}`.trim() ||
                            `#${trainer.id}`;

                          return <span title={text}>{text}</span>;
                        }}
                      />
                    </ReferenceField>
                  ) : (
                    '-'
                  )
                }
              />

              <EuDateField source="startingDate" label="Starting Date" />
              <EuDateField source="endingDate" label="Ending Date" />

              <VisitsButton />

              <OutlinedShowButton />
              {canEdit && <EditButton variant="outlined" />}
              {canEdit && (
                <DeleteButton
                  variant="outlined"
                  mutationMode="pessimistic"
                  confirmTitle="Delete this membership?"
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
