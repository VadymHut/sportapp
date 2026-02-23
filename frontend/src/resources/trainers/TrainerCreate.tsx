import { useEffect, useState } from 'react';
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
  SelectInput,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import { getActivityChoices } from '../../constants/choices';

type Choice = { id: string; name: string };

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

export const TrainerCreate = () => {
  const { permissions } = usePermissions();
  const canEdit =
    permissions?.includes('ROLE_ADMIN') || permissions?.includes('ROLE_CASHIER');

  const [activityChoices, setActivityChoices] = useState<Choice[]>([]);
  const [loadingChoices, setLoadingChoices] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const a = await getActivityChoices();
        if (mounted) setActivityChoices(a);
      } finally {
        if (mounted) setLoadingChoices(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Create
      title="Create Trainer"
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
        toolbar={<SplitToolbar loading={loadingChoices} />}
        defaultValues={{
          joinedOn: today,
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
            Create Trainer
          </Typography>
        </Box>

        <Box sx={{ width: '100%', maxWidth: FIELD_MAX, mx: 'auto' }}>
          <SelectInput
            source="activity"
            label="Activity"
            choices={activityChoices}
            optionText="name"
            optionValue="id"
            fullWidth
            margin="dense"
            disabled={!canEdit || loadingChoices}
            validate={[required()]}
          />

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
