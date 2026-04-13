import {
    Show,
    TextField,
    DateField,
    ReferenceField,
    FunctionField,
    EditButton,
    ListButton,
    useRecordContext,
    usePermissions,
} from 'react-admin';
import { Box, Button } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import { ShowCard } from '../../components/ShowCard';
import { FieldRow } from '../../components/FieldRow';

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

const CheckInShowContent = () => {
    const record = useRecordContext<any>();
    const { permissions } = usePermissions();

    if (!record) return null;

    const isAdmin = permissions?.includes('ROLE_ADMIN');

    return (
        <ShowCard
            badges={[`Check-in #${record.id}`]}
            detailsTitle="Details"
            maxWidth={650}
            minHeight="35vh"
            centerVertically
            actions={
                <>
                    <ListButton variant="outlined" />
                    <EditButton variant="outlined" />
                    {record.membership && (
                        <Button
                            variant="contained"
                            startIcon={<LaunchIcon />}
                            href={`/memberships/${record.membership}/show`}
                        >
                            Show Membership
                        </Button>
                    )}
                </>
            }
        >
            <FieldRow label="ID">
                <TextField source="id" />
            </FieldRow>

            <FieldRow label="Membership">
                {record.membership ? (
                    <ReferenceField source="membership" reference="memberships" link="show">
                        <MembershipSummary />
                    </ReferenceField>
                ) : (
                    '-'
                )}
            </FieldRow>

            {isAdmin && (
                <FieldRow label="Staff">
                    {record.staff ? (
                        <ReferenceField source="staff" reference="staff" link="show">
                            <FunctionField
                                render={(s: any) =>
                                    s
                                        ? `${s.name ?? ''} ${s.surname ?? ''}`.trim() || `#${s.id}`
                                        : '-'
                                }
                            />
                        </ReferenceField>
                    ) : (
                        '-'
                    )}
                </FieldRow>
            )}

            <FieldRow label="Visited at">
                <DateField source="visitedAt" showTime />
            </FieldRow>
        </ShowCard>
    );
};

export const CheckInShow = () => (
    <Show
        title="Check-in"
        component="div"
        actions={false}
        sx={{ p: 0, height: '100%' }}
    >
        <Box
            sx={{
                minHeight: 'calc(100vh - 64px)',
                display: 'grid',
                placeItems: 'center',
                width: '100%',
                px: 2,
                py: 2,
            }}
        >
            <CheckInShowContent />
        </Box>
    </Show>
);