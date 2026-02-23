import { useMemo } from 'react';
import {
  Create,
  SimpleForm,
  NumberInput,
  DateInput,
  ReferenceInput,
  SelectInput,
  ListButton,
  SaveButton,
  Toolbar,
  required,
  minValue,
  usePermissions,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

const FIELD_MAX = 750;

const SplitToolbar = ({ loading, canEdit }: { loading: boolean; canEdit: boolean }) => (
  <Box sx={{ width: '100%' }}>
    <Toolbar
      sx={{
        px: 0,
        py: 0,
        minHeight: 0,
        mt: -3,
        mb: 2.5,
      }}
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

export const PriceCreate = () => {
  const { permissions } = usePermissions();
  const canEdit = permissions?.includes('ROLE_ADMIN') || permissions?.includes('ROLE_CASHIER');
  const today = new Date().toISOString().slice(0, 10);
  
  const { search } = useLocation();
  const prefilledPlan = useMemo(() => {
    const p = new URLSearchParams(search).get('membershipPlan');
    return p ? Number(p) : undefined;
  }, [search]);

  return (
    <Create
      title="Create Plan Price"
      transform={(data: any) => {
        const mp = data.membershipPlan;
        return {
          ...data,
          membershipPlan:
            mp == null ? undefined : typeof mp === 'object' ? mp : { id: Number(mp) },
        };
      }}
      sx={{
        p: 0,
        '& .RaCreate-main, & .RaCreate-content': {
          minHeight: 'calc(100dvh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        },
        '& .MuiCard-root': { maxWidth: 900, width: '100%', mx: 'auto' },
        '& .MuiCardContent-root': { py: 1.25 },
        '& .MuiCardContent-root:last-child': { pb: 3 },
      }}
    >
      <SimpleForm
        toolbar={<SplitToolbar loading={false} canEdit={!!canEdit} />}
        defaultValues={{ membershipPlan: prefilledPlan, joinedOn: today }}
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
            mt: 1,
            mb: 1.25,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            width: '100%',
          }}
        >
          <Typography variant="h5" component="h2" sx={{ fontWeight: 800, letterSpacing: 0.3 }}>
            Create Plan Price
          </Typography>
        </Box>

        <Box sx={{ width: '100%', maxWidth: FIELD_MAX, mx: 'auto' }}>
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
              validate={[required()]}
              margin="dense"
              fullWidth
            />
          </ReferenceInput>

          <NumberInput
            source="price"
            label="Price"
            disabled={!canEdit}
            validate={[required(), minValue(0)]}
            margin="dense"
            fullWidth
          />
          <DateInput
            source="validFrom"
            label="Valid From"
            disabled={!canEdit}
            validate={[required()]}
            margin="dense"
            fullWidth
          />
          <DateInput
            source="validTo"
            label="Valid To"
            disabled={!canEdit}
            margin="dense"
            fullWidth
          />
        </Box>
      </SimpleForm>
    </Create>
  );
};
