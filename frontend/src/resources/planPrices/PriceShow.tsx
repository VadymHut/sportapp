import {
  Show,
  TextField,
  FunctionField,
  EditButton,
  ListButton,
  ReferenceField,
  useRecordContext,
  useCreatePath,
} from 'react-admin';
import { Box, Button, Chip } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import { Link as RouterLink } from 'react-router-dom';
import { ShowCard } from '../../components/ShowCard';
import { FieldRow } from '../../components/FieldRow';
import { EuDateField } from '../../components/EuDateField';


const PriceShowContent = () => {
  const record = useRecordContext<any>();
  const createPath = useCreatePath();
  if (!record) return null;

  const isActive = !record.validTo;
  const priceText =
    typeof record.price === 'number'
      ? `${record.price.toFixed(2)} €`
      : `${Number(record.price ?? 0).toFixed(2)} €`;

  const planShowTo = createPath({
    resource: 'membership-plans',
    id: record.membershipPlan,
    type: 'show',
  });

  return (
    <ShowCard
      badges={[priceText, isActive ? 'Active' : `Ends ${record.validTo}`]}
      detailsTitle="Details"
      maxWidth={650}
      minHeight="35vh"
      centerVertically
      actions={
        <>
          <ListButton variant="outlined" />
          <EditButton variant="outlined" />
          <Button
            component={RouterLink}
            to={planShowTo}
            variant="contained"
            startIcon={<LaunchIcon />}
          >
            Show Plan
          </Button>
        </>
      }
    >
      <FieldRow label="ID"><TextField source="id" /></FieldRow>

      <FieldRow label="Plan">
        <ReferenceField source="membershipPlan" reference="membership-plans" link="show">
          <FunctionField
            render={(plan: any) =>
              plan
                ? `${plan.activityType ?? '-'} / ${plan.groupType ?? '-'} / ${plan.frequencyType ?? '-'}`
                : '-'
            }
          />
        </ReferenceField>
      </FieldRow>

      <FieldRow label="Price">
        <FunctionField render={() => priceText} />
      </FieldRow>

      <FieldRow label="Valid From"><EuDateField source="validFrom" /></FieldRow>

      <FieldRow label="Valid To">
        <FunctionField
          source="validTo"
          render={(rec: any) =>
            rec?.validTo ? (
              <EuDateField source="validTo" record={rec} />
            ) : (
              <Chip size="small" color="success" variant="outlined" label="Active" />
            )
          }
        />
      </FieldRow>
    </ShowCard>
  );
};

export const PriceShow = () => (
  <Show title="Plan Price" component="div" actions={false} sx={{ p: 0, height: '100%' }}>
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
      <PriceShowContent />
    </Box>
  </Show>
);
