import {
  Create,
  SimpleForm,
  TextInput,
  DateInput,
  ListButton,
  SaveButton,
  Toolbar,
  usePermissions,
  required,
  email,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

const FIELD_MAX = 750;

const SplitToolbar = ({ loading }: { loading: boolean }) => (
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
        <SaveButton size="large" disabled={loading} />
      </Box>
    </Toolbar>
  </Box>
);

export const ClientCreate = () => {
  const { permissions } = usePermissions();
  const canEdit =
    permissions?.includes('ROLE_ADMIN') || permissions?.includes('ROLE_CASHIER');

  return (
    <Create
      title="Create Client"
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
        toolbar={<SplitToolbar loading={false} />}
        defaultValues={{
          joinedOn: new Date(),
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
          <Typography variant="h5" component="h2" sx={{ fontWeight: 800, letterSpacing: 0.3 }}>
            Create Client
          </Typography>
        </Box>

        <Box sx={{ width: '100%', maxWidth: FIELD_MAX, mx: 'auto' }}>
          <TextInput
            source="name"
            label="Name"
            disabled={!canEdit}
            validate={[required()]}
            fullWidth
            margin="dense"
          />
          <TextInput
            source="surname"
            label="Surname"
            disabled={!canEdit}
            validate={[required()]}
            fullWidth
            margin="dense"
          />
          <TextInput
            source="personalCode"
            label="Personal Code"
            disabled={!canEdit}
            validate={[required()]}
            helperText="Format: 123456-12345"
            fullWidth
            margin="dense"
          />
          <TextInput
            source="email"
            label="Email"
            disabled={!canEdit}
            validate={[email()]}
            fullWidth
            margin="dense"
          />
          <DateInput
            source="joinedOn"
            label="Joined On"
            disabled={!canEdit}
            validate={[required()]}
            fullWidth
            margin="dense"
          />
        </Box>
      </SimpleForm>
    </Create>
  );
};
