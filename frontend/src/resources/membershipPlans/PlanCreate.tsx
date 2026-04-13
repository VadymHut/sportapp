import { useEffect, useState } from 'react';
import {
    Create,
    SimpleForm,
    AutocompleteInput,
    Toolbar,
    SaveButton,
    ListButton,
    required,
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

const SplitToolbar = ({ disabled }: { disabled: boolean }) => (
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
                <SaveButton size="large" disabled={disabled} />
            </Box>
        </Toolbar>
    </Box>
);

export const PlanCreate = () => {
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

    const formDisabled = loading || !canEdit;

    return (
        <Create
            title="Create Membership Plan"
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
                toolbar={<SplitToolbar disabled={formDisabled} />}
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
                        Create Membership Plan
                    </Typography>
                </Box>

                <Box sx={{ width: '100%', maxWidth: FIELD_MAX, mx: 'auto' }}>
                    <AutocompleteInput
                        source="activityType"
                        label="Activity"
                        choices={activityChoices}
                        optionText="name"
                        optionValue="id"
                        fullWidth
                        disabled={formDisabled}
                        validate={[required()]}
                        margin="dense"
                    />
                    <AutocompleteInput
                        source="groupType"
                        label="Group"
                        choices={groupChoices}
                        optionText="name"
                        optionValue="id"
                        fullWidth
                        disabled={formDisabled}
                        validate={[required()]}
                        margin="dense"
                    />
                    <AutocompleteInput
                        source="frequencyType"
                        label="Frequency"
                        choices={frequencyChoices}
                        optionText="name"
                        optionValue="id"
                        fullWidth
                        disabled={formDisabled}
                        validate={[required()]}
                        margin="dense"
                    />
                </Box>
            </SimpleForm>
        </Create>
    );
};