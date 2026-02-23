import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDataProvider, useRedirect } from 'react-admin';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';

type Membership = {
  id: number;
  client?: number | { id: number };
  trainer?: number | { id: number } | null;
  membershipPlan?: number | { id: number };
  startingDate?: string;
  endingDate?: string;
};

type PlanPrice = {
  id: number;
  membershipPlan: number;
  price: number;
  validFrom: string;
  validTo?: string | null;
};

const fmtDate = (iso?: string | null) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso || '-';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export default function MembershipPriceSummary() {
  const { id } = useParams<{ id: string }>();
  const dataProvider = useDataProvider();
  const redirect = useRedirect();

  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [price, setPrice] = useState<PlanPrice | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const memId = Number(id);
        if (!memId || Number.isNaN(memId)) {
          throw new Error('Invalid membership id');
        }

        const { data: mem } = await dataProvider.getOne<Membership>('memberships', {
          id: memId,
        });
        if (cancelled) return;
        setMembership(mem);

        const rawPlan = (mem as any)?.membershipPlan;
        const planId = rawPlan && typeof rawPlan === 'object' ? rawPlan.id : rawPlan;
        if (!planId) {
          setPrice(null);
          setLoading(false);
          return;
        }

        const { data: prices } = await dataProvider.getList<PlanPrice>('plan-prices', {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: 'validFrom', order: 'DESC' },
          filter: { membershipPlan: Number(planId) },
        });
        if (cancelled) return;

        const today = new Date();
        const parseDate = (v?: string | null) => {
          if (!v) return null;
          const d = new Date(v);
          return Number.isNaN(d.getTime()) ? null : d;
        };

        const onlyThisPlan = (prices || []).filter(
          (p) => Number(p.membershipPlan) === Number(planId)
        );

        const active = onlyThisPlan.filter((p) => {
          const from = parseDate(p.validFrom);
          const to = parseDate(p.validTo ?? null);
          if (!from) return false;
          if (from > today) return false;
          if (to && to < today) return false;
          return true;
        });

        const pickLatestByFrom = (arr: PlanPrice[]) =>
          arr
            .slice()
            .sort(
              (a, b) =>
                (parseDate(b.validFrom)?.getTime() ?? 0) -
                (parseDate(a.validFrom)?.getTime() ?? 0)
            )[0];

        let chosen: PlanPrice | null = null;
        if (active.length) chosen = pickLatestByFrom(active);
        else if (onlyThisPlan.length) chosen = pickLatestByFrom(onlyThisPlan);

        setPrice(chosen ?? null);
        setLoading(false);
      } catch (e: any) {
        if (cancelled) return;
        setLoading(false);
        setError(
          e?.message || e?.toString?.() || 'Unable to load membership / price information'
        );
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [id, dataProvider]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'grid',
          placeItems: 'center',
          px: 2,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !membership) {
    return (
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'grid',
          placeItems: 'center',
          px: 2,
        }}
      >
        <Card sx={{ maxWidth: 520, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Couldn't load membership
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            {error || 'Membership not found or you have no access.'}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" onClick={() => redirect('/')}>
              Go to Dashboard
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => redirect('/quick-checkin')}
            >
              Quick check-in
            </Button>
          </Box>
        </Card>
      </Box>
    );
  }

  const memId = membership.id;
  const start = fmtDate(membership.startingDate);
  const end = fmtDate(membership.endingDate);

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 3,
      }}
    >
      <Card
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: 760,
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0.3 }}>
              Payment summary
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Membership #{memId} · Term {start} - {end}
            </Typography>
          </Box>

          {price ? (
            <Box
              sx={{
                mt: 1,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                border: (t) => `1px solid ${t.palette.primary.light}`,
                bgcolor: (t) => t.palette.grey[100],
              }}
            >
              <Typography variant="body2" sx={{ fontSize: 14 }}>
                Amount due
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                €{price.price.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Valid from {fmtDate(price.validFrom)}
                {price.validTo ? ` to ${fmtDate(price.validTo)}` : ''}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                mt: 1,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                border: (t) => `1px solid ${t.palette.warning.main}`,
                bgcolor: (t) => t.palette.grey[100],
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                No price found for this plan
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Configure a price in Plan Prices to proceed with payment.
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.25, mt: 1 }}>
            <Button variant="outlined" onClick={() => redirect('/')}>
              Go to Dashboard
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => redirect(`/quick-checkin?membershipId=${memId}`)}
            >
              Quick check-in
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
