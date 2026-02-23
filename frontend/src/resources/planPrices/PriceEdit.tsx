import {
  Edit,
  SimpleForm,
  NumberInput,
  DateInput,
  ReferenceInput,
  SelectInput,
  TextInput,
  ListButton,
  SaveButton,
  Toolbar,
  usePermissions,
  required,
  minValue,
} from 'react-admin';
import { Box, Typography, InputAdornment } from '@mui/material';

const validToAfterValidFrom = (value?: string, allValues?: any) => {
  const from: string | undefined = allValues?.validFrom;
  if (!value || !from) return undefined;
  return value >= from ? undefined : 'Must be on or after "Valid From"';
};

const FIELD_MAX = 750;

const SplitToolbar = ({ loading, canEdit }: { loading: boolean; canEdit: boolean }) => (
  <Box sx={{ width: '100%' }}>
    <Toolbar
      sx={{ px: 0, py: 0, minHeight: 0, mt: -2.25, mb: 1.5 }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: FIELD_MAX,
          mx: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <ListButton variant="outlined" size="large" />
        <SaveButton size="large" disabled={loading || !canEdit} />
      </Box>
    </Toolbar>
  </Box>
);

export const PriceEdit = () => {
  const { permissions } = usePermissions();
  const canEdit =
    permissions?.includes('ROLE_ADMIN') || permissions?.includes('ROLE_CASHIER');

  return (
    <Edit
      title="Edit Plan Price"
      actions={false}
      transform={(data: any) => ({
        ...data,
        membershipPlan:
          data.membershipPlan != null
            ? { id: Number(data.membershipPlan) }
            : undefined,
        price: data.price != null ? Number(data.price) : 0,
        validFrom: data.validFrom || null,
        validTo: data.validTo || null,
      })}
      sx={{
        p: 0,

        '& .RaEdit-content, & .RaEdit-main': {
          minHeight: 'calc(100dvh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        },

        '& .MuiCard-root, & .MuiPaper-root': {
          maxWidth: 900,
          width: '100%',
          mx: 'auto',
        },

        '& .MuiCardContent-root': {
          py: 1.25,
        },
      }}
    >
      <SimpleForm
        toolbar={<SplitToolbar loading={false} canEdit={!!canEdit} />}
        sx={{
          '& .RaSimpleForm-form': {
            rowGap: 0.75,
            display: 'flex',
            flexDirection: 'column',
          },
          '& .RaToolbar-root': {
            width: '100%',
            maxWidth: FIELD_MAX,
            mx: 'auto',
            minHeight: 0,
            pt: 0,
            pb: 0,
          },
        }}
      >
        <Box
          sx={{
            mt: 0.5,
            mb: 0.9,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            width: '100%',
          }}
        >
          <Typography variant="h5" component="h2" sx={{ fontWeight: 800, letterSpacing: 0.3 }}>
            Edit Plan Price
          </Typography>
        </Box>

        <Box sx={{ width: '100%', maxWidth: FIELD_MAX, mx: 'auto' }}>
          <TextInput source="id" label="ID" disabled fullWidth margin="dense" />

          <ReferenceInput
            source="membershipPlan"
            reference="membership-plans"
            perPage={1000}
            sort={{ field: 'label', order: 'ASC' }}
          >
            <SelectInput
              optionText={(rec: any) =>
                rec ? `${rec.activityType} / ${rec.groupType} / ${rec.frequencyType}` : ''
              }
              parse={(v) => (v == null ? v : Number(v))}
              disabled={!canEdit}
              fullWidth
              margin="dense"
              validate={[required()]}
            />
          </ReferenceInput>

          <NumberInput
            source="price"
            label="Price"
            disabled={!canEdit}
            fullWidth
            margin="dense"
            validate={[required(), minValue(0)]}
            InputProps={{ endAdornment: <InputAdornment position="end">€</InputAdornment> }}
          />

          <DateInput
            source="validFrom"
            label="Valid From"
            disabled={!canEdit}
            fullWidth
            margin="dense"
            validate={[required()]}
          />
          <DateInput
            source="validTo"
            label="Valid To"
            disabled={!canEdit}
            fullWidth
            margin="dense"
            validate={[validToAfterValidFrom]}
          />
        </Box>
      </SimpleForm>
    </Edit>
  );
};
