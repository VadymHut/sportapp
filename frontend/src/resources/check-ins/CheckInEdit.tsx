import {
    Edit,
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
    TextInput,
    useRecordContext,
    ReferenceField,
    FunctionField,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

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
            <ReferenceField source="membershipPlan" reference="membership-plans" link={false}>
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

export const CheckInEdit = () => {
    const { permissions } = usePermissions();
    const { data: identity, isLoading: identityLoading } = useGetIdentity();

    const isAdmin = permissions?.includes('ROLE_ADMIN');
    const canEdit =
        permissions?.includes('ROLE_ADMIN') ||
        permissions?.includes('ROLE_CASHIER') ||
        permissions?.includes('ROLE_RECEPTIONIST');

    const currentStaffId = (identity as any)?.staffId as number | undefined;
    const saveDisabled = !canEdit || (!isAdmin && !currentStaffId) || identityLoading;

    return (
        <Edit
            title="Edit Check-in"
            actions={false}
            mutationMode="pessimistic"
            transform={(data: any) => {
                const payload: any = { ...data };

                if (typeof data.membership === 'number') {
                    payload.membership = { id: data.membership };
                } else {
                    delete payload.membership;
                }

                if (isAdmin) {
                    if (typeof data.staff === 'number') {
                        payload.staff = { id: data.staff };
                    } else {
                        delete payload.staff;
                    }
                } else if (currentStaffId) {
                    payload.staff = { id: currentStaffId };
                } else {
                    delete payload.staff;
                }

                return payload;
            }}
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
                toolbar={<SplitToolbar loading={identityLoading} canEdit={!saveDisabled} />}
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
                        Edit Check-in
                    </Typography>
                </Box>

                <Box sx={{ width: '100%', maxWidth: FIELD_MAX, mx: 'auto' }}>
                    <TextInput source="id" label="ID" disabled fullWidth margin="dense" />

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
                            inputText={(choice: any) => (choice ? `#${choice.id}` : '')}
                            optionValue="id"
                            filterToQuery={(searchText: string) => ({ q: searchText })}
                            validate={[required()]}
                        />
                    </ReferenceInput>

                    {isAdmin && (
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
                    )}
                </Box>
            </SimpleForm>
        </Edit>
    );
};