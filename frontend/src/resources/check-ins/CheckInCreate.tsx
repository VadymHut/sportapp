import {
  Create,
  SimpleForm,
  ListButton,
  SaveButton,
  Toolbar,
  usePermissions,
  useGetIdentity,
  ReferenceInput,
  AutocompleteInput,
  SelectInput,
  required,
  useRecordContext,
  ReferenceField,
  FunctionField,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

const FIELD_MAX = 750;

const MembershipSummary = () => {
  const membership = useRecordContext<any>();
  if (!membership) return null;

  return (
    <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
      {`#${membership.id} - `}

      <ReferenceField source="client" reference="clients" link={false}>
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

const SplitToolbar = ({
  loading,
  canEdit,
}: {
  loading: boolean;
  canEdit: boolean;
}) => (
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

export const CheckInCreate = () => {
  const { permissions } = usePermissions();
  const { data: identity } = useGetIdentity();

  const canEdit =
    permissions?.includes('ROLE_ADMIN') ||
    permissions?.includes('ROLE_CASHIER') ||
    permissions?.includes('ROLE_RECEPTIONIST');

  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const prefilledMembership = params.get('membership');

  const staffId = (identity as any)?.staffId;

  return (
    <Create
      title="Create Check-in"
      transform={(data: any) => ({
        ...data,
        membership:
          data.membership != null ? { id: data.membership } : null,
        staff: data.staff != null ? { id: data.staff } : null,
      })}
      sx={{
        p: 0,
        '& .RaCreate-content, & .RaCreate-main': {
          minHeight: 'calc(100dvh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        },
        '& .MuiCard-root': { maxWidth: 900, width: '100%', mx: 'auto' },
        '& .MuiCardContent-root:last-child': { pb: 3 },
      }}
    >
      <SimpleForm
        toolbar={<SplitToolbar loading={false} canEdit={!!canEdit} />}
        defaultValues={{
          membership: prefilledMembership ? Number(prefilledMembership) : undefined,
          staff: staffId ?? undefined,
        }}
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
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: 800, letterSpacing: 0.3 }}
          >
            Create Check-in
          </Typography>
        </Box>

        <Box sx={{ width: '100%', maxWidth: FIELD_MAX, mx: 'auto' }}>
          <ReferenceInput
            source="membership"
            reference="memberships"
            perPage={25}
            sort={{ field: 'id', order: 'DESC' }}
          >
            <AutocompleteInput
              label="Membership"
              disabled={!canEdit}
              fullWidth
              margin="dense"
              optionText={<MembershipSummary />}
              inputText={(choice: any) =>
                choice ? `#${choice.id}` : ''
              }
              optionValue="id"
              filterToQuery={(searchText: string) => ({ q: searchText })}
              validate={[required()]}
            />
          </ReferenceInput>

          <ReferenceInput
            source="staff"
            reference="staff"
            perPage={1000}
            sort={{ field: 'surname', order: 'ASC' }}
          >
            <SelectInput
              label="Staff"
              disabled={!canEdit}
              fullWidth
              margin="dense"
              optionText={(s: any) => {
                if (!s) return '';
                return `${s.name ?? ''} ${s.surname ?? ''}`.trim() || `#${s.id}`;
              }}
              optionValue="id"
              validate={[required()]}
            />
          </ReferenceInput>

        </Box>
      </SimpleForm>
    </Create>
  );
};
