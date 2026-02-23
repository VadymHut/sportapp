import { useMemo } from 'react';
import { useGetList } from 'react-admin';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
} from '@mui/material';

type Plan = {
  id: number;
  activityType?: string | null;
  groupType?: string | null;
  frequencyType?: string | null;
};

type PlanPrice = {
  id: number;
  membershipPlan: number;
  price: number;
  validFrom: string;
  validTo?: string | null;
};

const isActive = (p: PlanPrice, today: Date) => {
  const from = new Date(p.validFrom);
  if (Number.isNaN(from.getTime())) return false;
  if (from > today) return false;
  if (p.validTo) {
    const to = new Date(p.validTo);
    if (!Number.isNaN(to.getTime()) && to < today) return false;
  }
  return true;
};

const frequencyOrder = (f?: string | null) => {
  const key = (f || '').toUpperCase();
  switch (key) {
    case 'ONCE': return 1;
    case 'EIGHT': return 2;
    case 'TWELVE': return 3;
    case 'UNLIMITED': return 4;
    default: return 99;
  }
};

const PriceBoard = () => {
  const { data: plans, isLoading: loadingPlans, error: plansError } = useGetList<Plan>('membership-plans', {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'label', order: 'ASC' },
  });

  const { data: prices, isLoading: loadingPrices, error: pricesError } = useGetList<PlanPrice>('plan-prices', {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'validFrom', order: 'DESC' },
  });

  const rows = useMemo(() => {
    if (!plans) return [];
    const today = new Date();

    const priceByPlan: Record<number, PlanPrice | undefined> = {};
    const list = prices || [];

    for (const pl of plans) {
      const pool = list.filter(pp => Number(pp.membershipPlan) === Number(pl.id));
      if (!pool.length) {
        priceByPlan[pl.id] = undefined;
        continue;
      }
      const active = pool.filter(pp => isActive(pp, today));
      const pick = (arr: PlanPrice[]) =>
        arr.slice().sort((a, b) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime())[0];
      priceByPlan[pl.id] = active.length ? pick(active) : pick(pool);
    }

    return plans
      .map(pl => ({
        activity: pl.activityType || '-',
        group: pl.groupType || '-',
        frequency: pl.frequencyType || '-',
        price: priceByPlan[pl.id]?.price ?? null,
      }))
      .sort((a, b) => {
        const aKey = `${a.activity}||${a.group}`;
        const bKey = `${b.activity}||${b.group}`;
        if (aKey < bKey) return -1;
        if (aKey > bKey) return 1;
        return frequencyOrder(a.frequency) - frequencyOrder(b.frequency);
      });
  }, [plans, prices]);

  const loading = loadingPlans || loadingPrices;

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
          maxWidth: 1000,
          borderRadius: 2,
        }}
      >
        <CardContent
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, letterSpacing: 0.3, mb: 0.5 }}
            >
              Price board
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Latest prices by activity, group, and frequency
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : plansError || pricesError ? (
            <Box
              sx={(t) => ({
                p: 2,
                borderRadius: 1,
                border: `1px solid ${t.palette.error.main}`,
                color: t.palette.error.main,
                fontWeight: 600,
              })}
            >
              Failed to load price board.
            </Box>
          ) : (
            <Box
              sx={(t) => ({
                border: `1px solid ${t.palette.divider}`,
                borderRadius: 2,
                overflow: 'hidden',
                '& table': {
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  width: '100%',
                },
                '& thead th': {
                  background: t.palette.background.default,
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  fontSize: 16,
                  fontWeight: 800,
                  borderBottom: `2px solid ${t.palette.divider}`,
                },
                '& tbody td': {
                  fontSize: 18,
                },
                '@media print': {
                  boxShadow: 'none',
                  border: 'none',
                },
              })}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ pl: 2.5 }}>Activity</TableCell>
                    <TableCell>Group</TableCell>
                    <TableCell>Frequency</TableCell>
                    <TableCell align="right" sx={{ pr: 2.5 }}>Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                        No plans or prices configured.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r, idx) => (
                      <TableRow
                        key={`${r.activity}-${r.group}-${r.frequency}-${idx}`}
                        sx={(t) => ({
                          height: 64,
                          background:
                            idx % 2 === 0 ? t.palette.background.paper : t.palette.action.hover,
                        })}
                      >
                        <TableCell sx={{ pl: 2.5, fontWeight: 700 }}>{r.activity}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{r.group}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{r.frequency}</TableCell>
                        <TableCell align="right" sx={{ pr: 2.5, fontWeight: 800 }}>
                          {r.price == null
                            ? '-'
                            : `${r.price.toLocaleString('lv-LV', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })} EUR`}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PriceBoard;
