import {
  Edit,
  SimpleForm,
  TextInput,
  PasswordInput,
  ListButton,
  SaveButton,
  Toolbar,
  usePermissions,
  required,
  ReferenceInput,
  AutocompleteInput,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

const FIELD_MAX = 750;

const ROLE_CHOICES = [
  { id: 'ROLE_ADMIN', name: 'Admin' },
  { id: 'ROLE_CASHIER', name: 'Cashier' },
  { id: 'ROLE_RECEPTIONIST', name: 'Receptionist' },
];

const SplitToolbar = ({ loading, canEdit }: { loading: boolean; canEdit: boolean }) => (
  <Box sx={{ width: '100%' }}>
    <Toolbar
      sx={{
        px: 0,
        py: 0,
        minHeight: 0,
        mt: -2.25,
        mb: 1.5,
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

export const AppUserEdit = () => {
  const { permissions } = usePermissions();
  const canEdit = permissions?.includes('ROLE_ADMIN');

  return (
    <Edit
      title="Edit User"
      actions={false}
      transform={(data: any) => ({
        ...data,
        login: typeof data.login === 'string' ? data.login.trim() : data.login,
        staff:
          data.staff == null
            ? null
            : typeof data.staff === 'object'
            ? { id: Number(data.staff.id) }
            : { id: Number(data.staff) },
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
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: 800, letterSpacing: 0.3 }}
          >
            Edit User
          </Typography>
        </Box>

        <Box sx={{ width: '100%', maxWidth: FIELD_MAX, mx: 'auto' }}>
          <TextInput source="id" label="ID" disabled fullWidth margin="dense" />

          <ReferenceInput
            source="staff"
            reference="staff"
            perPage={25}
            sort={{ field: 'surname', order: 'ASC' }}
          >
            <AutocompleteInput
              label="Staff Member"
              disabled={!canEdit}
              fullWidth
              margin="dense"
              optionText={(staff: any) => {
                if (!staff) return '';
                const full =
                  `${staff.name ?? ''} ${staff.surname ?? ''}`.trim() || `#${staff.id}`;
                const suffix = staff.jobTitle ? ` – ${staff.jobTitle}` : '';
                return full + suffix;
              }}
              optionValue="id"
              filterToQuery={(searchText: string) => ({ q: searchText })}
              validate={[required()]}
              format={(v) => (typeof v === 'object' && v ? v.id : v)}
              parse={(v) => (v == null || v === '' ? null : Number(v))}
            />
          </ReferenceInput>

          <AutocompleteInput
            source="role"
            label="Role"
            choices={ROLE_CHOICES}
            optionText="name"
            optionValue="id"
            fullWidth
            margin="dense"
            disabled={!canEdit}
            validate={[required()]}
          />

          <TextInput
            source="login"
            label="Login"
            disabled={!canEdit}
            validate={[required()]}
            fullWidth
            margin="dense"
          />

          <PasswordInput
            source="password"
            label="Password"
            disabled={!canEdit}
            validate={[required()]}
            fullWidth
            margin="dense"
            helperText="Enter a new password (8+ characters)"
          />
        </Box>
      </SimpleForm>
    </Edit>
  );
};
