import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { API, httpClient } from '../core/httpClient';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

type ActivityCount = { activityType: string; count: number };
type DayPoint = { day: string; count: number };
type TrainerCount = { id: number; name: string; surname: string; count: number };

type MonthSection = {
  month: string;
  checkInsMonth: number;
  membershipsStartedMonth: number;
  dailyCheckIns: DayPoint[];
  byActivity: ActivityCount[];
  topTrainers: TrainerCount[];
  busiestDay: string;
  avgDailyCheckIns: number | null;
};

type DashboardAnalytics = {
  date: string;
  checkInsToday: number;
  presentNow: number;
  presentNowByActivity: ActivityCount[];
  peakHour: string;
  membershipsStartedToday: number;
  month: MonthSection;
};

const PALETTE = [
  '#1976d2', '#9c27b0', '#2e7d32', '#ed6c02', '#d32f2f',
  '#0288d1', '#6d4c41', '#f9a825', '#7b1fa2', '#00897b',
  '#c2185b', '#5d4037', '#303f9f', '#0097a7', '#558b2f',
  '#455a64', '#6a1b9a', '#1e88e5', '#e53935', '#8e24aa',
];
const DEFAULT_COLOR = '#90a4ae';

export const Dashboard = () => {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { json } = await httpClient(`${API}/api/analytics/overview?windowMinutes=90`);
      setData(json as DashboardAnalytics);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  const colorMap = useMemo(() => {
    const present = (data?.presentNowByActivity ?? []).map(a => a.activityType);
    const month = (data?.month?.byActivity ?? []).map(a => a.activityType);
    const names = Array.from(new Set([...present, ...month])).sort();
    const map: Record<string, string> = {};
    names.forEach((name, i) => (map[name] = PALETTE[i % PALETTE.length]));
    return map;
  }, [data?.presentNowByActivity, data?.month?.byActivity]);

  if (loading && !data) {
    return (
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Check-ins today
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {data?.checkInsToday ?? 0}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Peak hour: {data?.peakHour ?? '-'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Present now
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {data?.presentNow ?? 0}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                In last 90 minutes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Memberships started today
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {data?.membershipsStartedToday ?? 0}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                New starts
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                This month - total check-ins
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800 }}
                title="Total check-ins recorded from the 1st of this month to now"
              >
                {data?.month?.checkInsMonth ?? 0}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Avg/day: {data?.month?.avgDailyCheckIns != null
                  ? data.month.avgDailyCheckIns.toFixed(1)
                  : '-'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>


        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ height: 360 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                Present now by activity
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={(data?.presentNowByActivity ?? []).map((a) => ({
                        name: a.activityType,
                        value: a.count,
                      }))}
                      dataKey="value"
                      nameKey="name"
                      outerRadius="80%"
                      isAnimationActive
                    >
                      {(data?.presentNowByActivity ?? []).map((d) => (
                        <Cell
                          key={d.activityType}
                          fill={colorMap[d.activityType] ?? DEFAULT_COLOR}
                        />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined" sx={{ height: 360 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                Daily check-ins - {data?.month?.month ?? ''}
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer>
                  <LineChart data={data?.month?.dailyCheckIns ?? []}>
                    <XAxis dataKey="day" hide />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#1976d2" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip size="small" label={`Busiest day: ${data?.month?.busiestDay ?? '-'}`} />
                <Chip size="small" label={`Memberships started: ${data?.month?.membershipsStartedMonth ?? 0}`} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: 340 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                This month by activity
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer>
                  <BarChart data={data?.month?.byActivity ?? []}>
                    <XAxis dataKey="activityType" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" isAnimationActive>
                      {(data?.month?.byActivity ?? []).map((d) => (
                        <Cell
                          key={d.activityType}
                          fill={colorMap[d.activityType] ?? DEFAULT_COLOR}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: 340 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                Top trainers this month (by check-ins)
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ display: 'grid', rowGap: 0.6 }}>
                {(data?.month?.topTrainers ?? []).map((t) => (
                  <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{`${t.name ?? ''} ${t.surname ?? ''}`.trim()}</Typography>
                    <Chip size="small" label={t.count} />
                  </Box>
                ))}
                {(data?.month?.topTrainers ?? []).length === 0 && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No trainer activity recorded yet this month.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
