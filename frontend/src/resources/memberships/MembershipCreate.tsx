import {
  Create,
  SimpleForm,
  ListButton,
  SaveButton,
  Toolbar,
  usePermissions,
  required,
  ReferenceInput,
  AutocompleteInput,
  DateInput,
  FormDataConsumer,
  useNotify,
  useRedirect,
  useDataProvider,
} from 'react-admin';
import { Box, Typography, Collapse } from '@mui/material';
import { useEffect, useState } from 'react';

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


const PlanPricePlateForPlan = ({ planId }: { planId: number }) => {
  const dataProvider = useDataProvider();
  const [state, setState] = useState<{
    loading: boolean;
    prices: any[];
    error: any;
  }>({ loading: true, prices: [], error: null });

  useEffect(() => {
    const planIdNum = Number(planId);
    if (!planIdNum || Number.isNaN(planIdNum)) {
      setState({ loading: false, prices: [], error: null });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    dataProvider
      .getList('plan-prices', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'validFrom', order: 'DESC' },
        filter: { membershipPlan: planIdNum },
      })
      .then(({ data }) => {
        if (cancelled) return;
        setState({ loading: false, prices: data as any[], error: null });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({ loading: false, prices: [], error });
      });

    return () => {
      cancelled = true;
    };
  }, [dataProvider, planId]);

  const { loading, prices } = state;

  const today = new Date();
  const parseDate = (value?: string | null) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const all = prices || [];
  const planIdNum = Number(planId);

  const matching = all.filter((p: any) => Number(p.membershipPlan) === planIdNum);

  const fmtDate = (iso?: string | null) => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  if (!matching.length) {
    if (loading) {
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
          Loading price...
        </Box>
      );
    }

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
        <Typography
          variant="body2"
          sx={{ fontSize: 13, color: 'text.secondary' }}
        >
          This membership plan has no active price configured in Plan Prices.
        </Typography>
      </Box>
    );
  }

  const active = matching.filter((p: any) => {
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

  if (!chosen) {
    return null;
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

export const MembershipCreate = () => {
  const { permissions } = usePermissions();
  const notify = useNotify();
  const redirect = useRedirect();
  const canEdit =
    permissions?.includes('ROLE_ADMIN') || permissions?.includes('ROLE_CASHIER');

  const today = new Date().toISOString().slice(0, 10);

  const handleSuccess = (data: any) => {
    notify('Membership created', { type: 'info' });
    redirect(`/memberships/${data.id}/price`);
  };

  return (
    <Create
      title="Create Membership"
      transform={(data: any) => ({
        ...data,
        client: data.client != null ? { id: data.client } : null,
        membershipPlan:
          data.membershipPlan != null ? { id: data.membershipPlan } : null,
        trainer: data.trainer != null ? { id: data.trainer } : null,
      })}
      mutationOptions={{ onSuccess: handleSuccess }}
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
          startingDate: today,
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
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: 800, letterSpacing: 0.3 }}
          >
            Create Membership
          </Typography>
        </Box>

        <Box sx={{ width: '100%', maxWidth: FIELD_MAX, mx: 'auto' }}>
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

              return (
                <Collapse
                  in={numericPlanId != null}
                  timeout={400}
                  appear
                  unmountOnExit
                >
                  {numericPlanId != null && (
                    <PlanPricePlateForPlan planId={numericPlanId} />
                  )}
                </Collapse>
              );
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
        </Box>
      </SimpleForm>
    </Create>
  );
};
