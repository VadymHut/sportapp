import { useState, useEffect } from 'react';
import {
  Edit,
  SimpleForm,
  ListButton,
  SaveButton,
  Toolbar,
  usePermissions,
  required,
  ReferenceInput,
  AutocompleteInput,
  DateInput,
  TextInput,
  FormDataConsumer,
  useGetList,
} from 'react-admin';
import { Box, Typography, Collapse } from '@mui/material';

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

const PlanPricePlateForPlan = ({ planId }: { planId: number }) => {
  const planIdNum = Number(planId);
  if (!planIdNum || Number.isNaN(planIdNum)) return null;

  const { data: prices, isLoading } = useGetList('plan-prices', {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'validFrom', order: 'DESC' },
    filter: { membershipPlan: planIdNum },
  });

  const today = new Date();
  const parseDate = (value?: string | null) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const all = (prices || []) as any[];

  const matching = all.filter((p) => Number(p.membershipPlan) === planIdNum);

  if (!matching.length && isLoading) {
    return (
      <Box
        sx={{
          mt: 1,
          px: 1.5,
          py: 1,
          mb: 4,
          borderRadius: 1,
          border: (t) => `1px dashed ${t.palette.divider}`,
          fontSize: 13,
          color: 'text.secondary',
        }}
      >
        Loading price…
      </Box>
    );
  }

  const active = matching.filter((p) => {
    const from = parseDate(p.validFrom);
    const to = parseDate(p.validTo);
    if (!from) return false;
    if (from > today) return false;
    if (to && to < today) return false;
    return true;
  });

  const pickLatestByFrom = (items: any[]) =>
    items
      .slice()
      .sort((a, b) => {
        const af = parseDate(a.validFrom)?.getTime() ?? 0;
        const bf = parseDate(b.validFrom)?.getTime() ?? 0;
        return bf - af;
      })[0];

  let chosen: any | undefined;
  if (active.length) {
    chosen = pickLatestByFrom(active);
  } else if (matching.length) {
    chosen = pickLatestByFrom(matching);
  }

  const fmtDate = (iso?: string | null) => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  if (!chosen) {
    return (
      <Box
        sx={{
          mt: 1,
          px: 1.5,
          py: 1.1,
          mb: 4,
          borderRadius: 1,
          border: (t) => `1px solid ${t.palette.warning.main}`,
          bgcolor: (t) => t.palette.grey[100],
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, fontSize: 13, mb: 0.3 }}
        >
          No price found for this plan
        </Typography>
        <Typography variant="body2" sx={{ fontSize: 13, color: 'text.secondary' }}>
          This membership plan has no active price configured in Plan Prices.
        </Typography>
      </Box>
    );
  }

  const amount = chosen.price;
  const validFrom = chosen.validFrom;
  const validTo = chosen.validTo;

  return (
    <Box
      sx={{
        mt: 1,
        px: 1.5,
        py: 1.1,
        mb: 4,
        borderRadius: 1,
        border: (t) => `1px solid ${t.palette.primary.light}`,
        bgcolor: (t) => t.palette.grey[100],
      }}
    >
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, fontSize: 13, mb: 0.3 }}
      >
        Price for this membership
      </Typography>
      <Typography variant="body2" sx={{ fontSize: 13 }}>
        <strong>{amount} EUR</strong> to be paid by the client.
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontSize: 12, color: 'text.secondary', mt: 0.4 }}
      >
        Valid from {fmtDate(validFrom)}
        {validTo && ` to ${fmtDate(validTo)}`}
      </Typography>
    </Box>
  );
};

const AnimatedPlanPricePlate = ({ planId }: { planId: number | null }) => {
  const [displayPlanId, setDisplayPlanId] = useState<number | null>(null);

  useEffect(() => {
    if (planId != null && !Number.isNaN(planId)) {
      setDisplayPlanId(planId);
    }
  }, [planId]);

  return (
    <Collapse in={!!planId} timeout={400} appear unmountOnExit>
      {displayPlanId != null && <PlanPricePlateForPlan planId={displayPlanId} />}
    </Collapse>
  );
};

export const MembershipEdit = () => {
  const { permissions } = usePermissions();
  const canEdit =
    permissions?.includes('ROLE_ADMIN') || permissions?.includes('ROLE_CASHIER');

  return (
    <Edit
      mutationMode="pessimistic"
      title="Edit Membership"
      actions={false}
      transform={(data: any) => {
        const payload: any = { ...data };

        if (typeof data.client === 'number') {
          payload.client = { id: data.client };
        } else {
          delete payload.client;
        }

        if (typeof data.membershipPlan === 'number') {
          payload.membershipPlan = { id: data.membershipPlan };
        } else {
          delete payload.membershipPlan;
        }

        if (data.trainer === null) {
          payload.trainer = null;
        } else if (typeof data.trainer === 'number') {
          payload.trainer = { id: data.trainer };
        } else {
          delete payload.trainer;
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
            Edit Membership
          </Typography>
        </Box>

        <Box sx={{ width: '100%', maxWidth: FIELD_MAX, mx: 'auto' }}>
          <TextInput source="id" label="ID" disabled fullWidth margin="dense" />

          <ReferenceInput
            source="client"
            reference="clients"
            perPage={25}
            sort={{ field: 'surname', order: 'ASC' }}
          >
            <AutocompleteInput
              label="Client"
              disabled={!canEdit}
              fullWidth
              margin="dense"
              optionText={(c: any) => {
                if (!c) return '';
                const full = `${c.name ?? ''} ${c.surname ?? ''}`.trim() || `#${c.id}`;
                const pc = c.personalCode ? ` (${c.personalCode})` : '';
                return full + pc;
              }}
              optionValue="id"
              filterToQuery={(searchText: string) => ({ q: searchText })}
              validate={[required()]}
            />
          </ReferenceInput>

          <ReferenceInput
            source="trainer"
            reference="trainers"
            perPage={25}
            sort={{ field: 'surname', order: 'ASC' }}
          >
            <AutocompleteInput
              label="Trainer"
              disabled={!canEdit}
              fullWidth
              margin="dense"
              optionText={(t: any) => {
                if (!t) return '';
                const full = `${t.name ?? ''} ${t.surname ?? ''}`.trim() || `#${t.id}`;
                return full;
              }}
              optionValue="id"
              filterToQuery={(searchText: string) => ({ q: searchText })}
              format={(v) => (v == null ? '' : v)}
              parse={(v) => (v === '' ? null : v)}
            />
          </ReferenceInput>

          <ReferenceInput
            source="membershipPlan"
            reference="membership-plans"
            perPage={25}
            sort={{ field: 'label', order: 'ASC' }}
          >
            <AutocompleteInput
              label="Plan"
              disabled={!canEdit}
              fullWidth
              margin="dense"
              optionText={(p: any) =>
                p
                  ? `${p.activityType ?? '-'} / ${p.groupType ?? '-'} / ${
                      p.frequencyType ?? '-'
                    }`
                  : ''
              }
              optionValue="id"
              filterToQuery={(searchText: string) => ({ q: searchText })}
              validate={[required()]}
            />
          </ReferenceInput>

          <FormDataConsumer>
            {({ formData }) => {
              const raw = formData?.membershipPlan;
              const planId =
                raw && typeof raw === 'object' && raw !== null ? raw.id : raw;
              const numericPlanId =
                planId != null && planId !== '' ? Number(planId) : null;

              return <AnimatedPlanPricePlate planId={numericPlanId} />;
            }}
          </FormDataConsumer>

          <DateInput
            source="startingDate"
            label="Starting Date"
            disabled={!canEdit}
            validate={[required()]}
            fullWidth
            margin="dense"
          />

          <DateInput
            source="endingDate"
            label="Ending Date"
            disabled
            fullWidth
            margin="dense"
          />
        </Box>
      </SimpleForm>
    </Edit>
  );
};
