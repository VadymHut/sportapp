import { useEffect, useState } from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  AutocompleteInput,
  Toolbar,
  SaveButton,
  ListButton,
  usePermissions,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import {
  getActivityChoices,
  getGroupChoices,
  getFrequencyChoices,
} from '../../constants/choices';

type Choice = { id: string; name: string };

const FIELD_MAX = 750;

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

export const PlanEdit = () => {
  const { permissions } = usePermissions();
  const canEdit =
    permissions?.includes('ROLE_ADMIN') || permissions?.includes('ROLE_CASHIER');

  const [activityChoices, setActivityChoices] = useState<Choice[]>([]);
  const [groupChoices, setGroupChoices] = useState<Choice[]>([]);
  const [frequencyChoices, setFrequencyChoices] = useState<Choice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [a, g, f] = await Promise.all([
          getActivityChoices(),
          getGroupChoices(),
          getFrequencyChoices(),
        ]);
        if (mounted) {
          setActivityChoices(a);
          setGroupChoices(g);
          setFrequencyChoices(f);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Edit
      title="Edit Membership Plan"
      actions={false}
      sx={{
        p: 0,

        '& .RaEdit-main, & .RaEdit-content': {
          minHeight: 'calc(100dvh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        },

        '& .MuiCard-root': {
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
        toolbar={<SplitToolbar loading={loading} canEdit={!!canEdit} />}
        sx={{
          '& .RaSimpleForm-form': {
            rowGap: 0.7,
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
            Edit Membership Plan
          </Typography>
        </Box>

        <Box sx={{ width: '100%', maxWidth: FIELD_MAX, mx: 'auto' }}>
          <TextInput source="id" label="ID" disabled fullWidth margin="dense" />

          <AutocompleteInput
            source="activityType"
            label="Activity"
            choices={activityChoices}
            optionText="name"
            optionValue="id"
            fullWidth
            disabled={loading || !canEdit}
            margin="dense"
          />
          <AutocompleteInput
            source="groupType"
            label="Group"
            choices={groupChoices}
            optionText="name"
            optionValue="id"
            fullWidth
            disabled={loading || !canEdit}
            margin="dense"
          />
          <AutocompleteInput
            source="frequencyType"
            label="Frequency"
            choices={frequencyChoices}
            optionText="name"
            optionValue="id"
            fullWidth
            disabled={loading || !canEdit}
            margin="dense"
          />
        </Box>
      </SimpleForm>
    </Edit>
  );
};
