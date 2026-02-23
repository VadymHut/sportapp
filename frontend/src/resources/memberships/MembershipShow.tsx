import {
  Show,
  TextField,
  useRecordContext,
  EditButton,
  ListButton,
  ReferenceField,
  FunctionField,
} from 'react-admin';
import { Box } from '@mui/material';
import { ShowCard } from '../../components/ShowCard';
import { FieldRow } from '../../components/FieldRow';
import { EuDateField } from '../../components/EuDateField';

const MembershipShowContent = () => {
  const record = useRecordContext<any>();
  if (!record) return null;

  const badges: string[] = [];

  if (record.client) {
    badges.push(`Client #${record.client}`);
  }
  if (record.membershipPlan) {
    badges.push(`Plan #${record.membershipPlan}`);
  }
  if (record.trainer) {
    badges.push(`Trainer #${record.trainer}`);
  }

  return (
    <ShowCard
      badges={badges}
      detailsTitle="Details"
      maxWidth={700}
      minHeight="35vh"
      centerVertically
      actions={
        <>
          <ListButton variant="outlined" />
          <EditButton variant="outlined" />
        </>
      }
    >
      <FieldRow label="ID">
        <TextField source="id" />
      </FieldRow>

      <FieldRow label="Client">
        {record.client ? (
          <ReferenceField source="client" reference="clients" link="show">
            <FunctionField
              render={(c: any) =>
                c
                  ? `${c.name ?? ''} ${c.surname ?? ''}`.trim() +
                    (c.personalCode ? ` (${c.personalCode})` : '')
                  : '-'
              }
            />
          </ReferenceField>
        ) : (
          '-'
        )}
      </FieldRow>

      <FieldRow label="Plan">
        {record.membershipPlan ? (
          <ReferenceField source="membershipPlan" reference="membership-plans" link="show">
            <FunctionField
              render={(p: any) =>
                p
                  ? `${p.activityType ?? '-'} / ${p.groupType ?? '-'} / ${
                      p.frequencyType ?? '-'
                    }`
                  : '-'
              }
            />
          </ReferenceField>
        ) : (
          '-'
        )}
      </FieldRow>

      <FieldRow label="Trainer">
        {record.trainer ? (
          <ReferenceField source="trainer" reference="trainers" link="show">
            <FunctionField
              render={(t: any) =>
                t
                  ? `${t.name ?? ''} ${t.surname ?? ''}`.trim() +
                    (t.activity ? ` – ${t.activity}` : '')
                  : '-'
              }
            />
          </ReferenceField>
        ) : (
          '-'
        )}
      </FieldRow>

      <FieldRow label="Starting Date">
        <EuDateField source="startingDate" />
      </FieldRow>

      <FieldRow label="Ending Date">
        <EuDateField source="endingDate" />
      </FieldRow>
    </ShowCard>
  );
};

export const MembershipShow = () => (
  <Show title="Membership" component="div" actions={false} sx={{ p: 0, height: '100%' }}>
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
      <MembershipShowContent />
    </Box>
  </Show>
);
