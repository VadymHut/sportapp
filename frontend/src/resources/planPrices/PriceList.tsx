import {
  List,
  Datagrid,
  TextField,
  NumberField,
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
  ReferenceField,
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

const planFilters = [<SearchInput key="q" source="q" alwaysOn placeholder="Search..." />];

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
        You're about to delete price <b>#{rec.id}</b>. You will not be able to restore it.
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 0.5 }}>
        <Chip size="small" label={`Price: ${rec.price ?? '-'}`} variant="outlined" />
        {rec.validFrom && <Chip size="small" label={`From: ${rec.validFrom}`} variant="outlined" />}
        <Chip
          size="small"
          label={rec.validTo ? `To: ${rec.validTo}` : 'Active'}
          variant="outlined"
          color={rec.validTo ? 'default' : 'success'}
        />
      </Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
        This action affects only this record.
      </Typography>
    </Box>
  );
};

export const PriceList = () => {
  const { permissions } = usePermissions();
  const canEdit =
    permissions?.includes('ROLE_ADMIN') || permissions?.includes('ROLE_CASHIER');
  const canCreate = canEdit;

  return (
    <List
      title="Plan Prices"
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
              Plan Prices
            </Typography>

            <Box sx={{ mb: 1 }}>
              <FilterForm filters={planFilters} />
            </Box>

            <Datagrid
              rowClick="show"
              bulkActionButtons={false}
              size="small"
              sx={{
                '& .column-id': { width: 80, textAlign: 'center' },

                '& .column-membershipPlan': { textAlign: 'center' },

                '& .column-validFrom': { textAlign: 'center' },
                '& .column-validTo': { textAlign: 'center' },
              }}
            >
              <TextField source="id" sortable={false} />

              <ReferenceField
                source="membershipPlan"
                reference="membership-plans"
                link={false}
                sortable={false}
                label="Plan"
              >
                <FunctionField
                  render={(plan: any) => (
                    <Chip
                      size="small"
                      variant="outlined"
                      color="primary"
                      label={
                        plan
                          ? `${plan.activityType ?? '-'} / ${plan.groupType ?? '-'} / ${plan.frequencyType ?? '-'}`
                          : '-'
                      }
                    />
                  )}
                />
              </ReferenceField>

              <NumberField
                source="price"
                label="Price"
                options={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }}
              />

              <EuDateField source="validFrom" label="Valid From" />

              <FunctionField
                source="validTo"
                label="Valid To"
                sortable={false}
                render={(rec: any) =>
                  rec?.validTo ? (
                    <EuDateField source="validTo" record={rec} />
                  ) : (
                    <Chip size="small" variant="outlined" color="success" label="Active" />
                  )
                }
              />

              <OutlinedShowButton />
              {canEdit && <EditButton variant="outlined" />}
              {canEdit && (
                <DeleteButton
                  variant="outlined"
                  mutationMode="pessimistic"
                  confirmTitle="Delete this price?"
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
