import { useEffect, useMemo, useRef, useState } from 'react';
import { useNotify, useRedirect } from 'react-admin';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Divider,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonIcon from '@mui/icons-material/Person';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useLocation, useSearchParams } from 'react-router-dom';

import { API, httpClient } from '../core/httpClient';

type CheckInInfo = {
  id: number;
  visitedAt: string;
  staffId?: number | null;
  staffName?: string | null;
  staffSurname?: string | null;
};

type MembershipInfo = {
  id: number;
  clientId?: number | null;
  clientName?: string | null;
  clientSurname?: string | null;
  clientPersonalCode?: string | null;
  trainerId?: number | null;
  trainerName?: string | null;
  trainerSurname?: string | null;
  planId?: number | null;
  planLabel?: string | null;
  startingDate?: string | null;
  endingDate?: string | null;
  maxVisits?: number | null;
  checkIns: CheckInInfo[];
};

type ClientStats = {
  totalMemberships: number;
  activeMemberships: number;
  totalCheckIns: number;
  lastCheckInAt?: string | null;
  nearestEnding?: string | null;
};

type ClientInfo = {
  id: number;
  name: string | null;
  surname: string | null;
  personalCode: string | null;
  email: string | null;
  joinedOn: string | null;
  stats: ClientStats;
  activeMembershipIds: number[];
  primaryMembershipId?: number | null;
  memberships: MembershipInfo[];
};

const fmtDate = (iso?: string | null) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [yyyy, mm, dd] = iso.split('-');
      return `${dd}/${mm}/${yyyy}`;
    }
    return iso;
  }
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const fmtDateTime = (iso?: string | null) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('lv-LV');
};

const fullName = (name?: string | null, surname?: string | null) =>
  `${name ?? ''} ${surname ?? ''}`.trim() || '-';

const getInitialClientPrefill = (
  searchParams: URLSearchParams,
  locationState: any
): string => {
  const fromQuery =
    searchParams.get('clientId') ||
    searchParams.get('client') ||
    searchParams.get('id');

  const fromState =
    locationState && typeof locationState === 'object'
      ? (locationState as any).prefillClientId
      : null;

  const raw = (fromQuery ?? fromState ?? '').toString().trim();
  return /^\d+$/.test(raw) ? raw : '';
};

const MembershipCard = ({ m }: { m: MembershipInfo }) => {
  const redirect = useRedirect();

  const used = m.checkIns?.length ?? 0;
  const cap = m.maxVisits ?? null;
  const isUnlimited = cap == null;

  const usageLabel = isUnlimited ? `${used} used (unlimited)` : `${used} / ${cap}`;
  const valuePct =
    isUnlimited || cap! <= 0 ? 0 : Math.min(100, Math.round((used / cap!) * 100));

  return (
    <Box
      sx={(t) => ({
        scrollSnapAlign: 'start',
        minWidth: 310,
        maxWidth: 360,
        flex: '0 0 auto',
        borderRadius: 2,
        border: `1px solid ${t.palette.divider}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        background: t.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <Box sx={{ p: 2.25, pb: 1.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalActivityIcon fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            #{m.id} - {m.planLabel || 'Plan -'}
          </Typography>
        </Box>

        <Box sx={{ mt: 1.25, display: 'grid', rowGap: 0.4 }}>
          <Typography variant="body2">
            <strong>Term:</strong> {fmtDate(m.startingDate)} - {fmtDate(m.endingDate)}
          </Typography>
          <Typography variant="body2">
            <strong>Trainer:</strong>{' '}
            {m.trainerId ? fullName(m.trainerName, m.trainerSurname) : 'No trainer'}
          </Typography>
        </Box>

        <Box sx={{ mt: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 0.75,
            }}
          >
            <EventAvailableIcon fontSize="small" />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {usageLabel}
            </Typography>
          </Box>
          {!isUnlimited && (
            <LinearProgress
              variant="determinate"
              value={valuePct}
              sx={{
                height: 8,
                borderRadius: 999,
              }}
            />
          )}
        </Box>

        {m.checkIns && m.checkIns.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Last check-in:{' '}
              {fmtDateTime(m.checkIns[m.checkIns.length - 1].visitedAt)}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />

      <Box
        sx={(t) => ({
          p: 1.25,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
          background: t.palette.background.default,
        })}
      >
        <Tooltip title="Open quick card">
          <Button
            size="small"
            variant="outlined"
            startIcon={<VisibilityIcon />}
            sx={{ textTransform: 'none' }}
            onClick={() => redirect(`/memberships/${m.id}/quick`)}
          >
            Quick card
          </Button>
        </Tooltip>

        <Tooltip title="Check in (prefill)">
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<CreditCardIcon />}
            sx={(t) => ({
              textTransform: 'none',
              bgcolor: t.palette.primary.main,
              '&:hover': { bgcolor: t.palette.primary.dark },
            })}
            onClick={() => redirect(`/quick-checkin?prefill=${m.id}`)}
          >
            Check in
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};

const ClientInfoPage = () => {
  const notify = useNotify();
  const redirect = useRedirect();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const initialPrefill = getInitialClientPrefill(searchParams, location.state);

  const [value, setValue] = useState(initialPrefill);
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const primaryName = useMemo(
    () => (client ? fullName(client.name, client.surname) : ''),
    [client]
  );

  const loadClient = async (raw: string) => {
    const id = Number(raw.trim());
    if (!raw || Number.isNaN(id) || id <= 0) {
      notify('Enter a valid Client ID', { type: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const { json } = await httpClient(
        `${API}/api/clients/${id}/info?includeCheckIns=true`
      );
      setClient(json as ClientInfo);
    } catch (e: any) {
      setClient(null);
      const msg =
        e?.body?.message ||
        (typeof e?.body === 'string' ? e.body : '') ||
        e?.message ||
        'Failed to load client info';
      notify(msg, { type: 'warning' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPrefill) {
      loadClient(initialPrefill);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadClient(value);
  };

  const scrollByCards = (dir: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = 360;
    const amount = dir === 'left' ? -cardWidth * 1.2 : cardWidth * 1.2;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

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
          maxWidth: 980,
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
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, letterSpacing: 0.3, mb: 0.5 }}
            >
              Client info
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              View a client's memberships at a glance and act quickly.
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1.5,
              alignItems: { xs: 'stretch', sm: 'center' },
            }}
          >
            <TextField
              label="Client ID"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              variant="outlined"
              fullWidth
              size="small"
              disabled={loading}
              InputProps={{
                sx: { fontSize: 14, py: 0.5 },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              disabled={loading}
              sx={{
                minWidth: 120,
                height: 38,
                textTransform: 'none',
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 1.5,
                px: 2,
              }}
            >
              {loading ? 'Loading...' : 'Load'}
            </Button>
          </Box>

          {client && (
            <Box
              sx={{
                mt: 1,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1.3fr 1fr' },
                gap: 2.5,
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'grid', rowGap: 0.4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {primaryName}{' '}
                    {client.personalCode ? `(${client.personalCode})` : ''}
                  </Typography>
                </Box>
                {client.email && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {client.email}
                  </Typography>
                )}
                {client.joinedOn && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Joined: {fmtDate(client.joinedOn)}
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                }}
              >
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  label={`Memberships: ${client.stats.totalMemberships}`}
                />
                <Chip
                  size="small"
                  color="success"
                  variant="outlined"
                  label={`Active: ${client.stats.activeMemberships}`}
                />
                <Chip
                  size="small"
                  color="default"
                  variant="outlined"
                  label={`Check-ins: ${client.stats.totalCheckIns}`}
                />
                <Tooltip
                  title={
                    client.stats.lastCheckInAt
                      ? fmtDateTime(client.stats.lastCheckInAt)
                      : '-'
                  }
                >
                  <Chip
                    size="small"
                    variant="outlined"
                    icon={<AccessTimeIcon fontSize="small" />}
                    label="Last check-in"
                  />
                </Tooltip>
                {client.stats.nearestEnding && (
                  <Chip
                    size="small"
                    color="warning"
                    variant="outlined"
                    label={`Nearest end: ${fmtDate(client.stats.nearestEnding)}`}
                  />
                )}
              </Box>
            </Box>
          )}

          {!client && !loading && (
            <Box
              sx={{
                mt: 1.5,
                px: 1.5,
                py: 1.25,
                borderRadius: 1,
                border: (t) => `1px dashed ${t.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <InfoOutlinedIcon fontSize="small" />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Enter a Client ID above to load memberships.
              </Typography>
            </Box>
          )}

          {client && (
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Memberships ({client.memberships.length})
                </Typography>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton onClick={() => scrollByCards('left')} size="small">
                    <ChevronLeftIcon />
                  </IconButton>
                  <IconButton onClick={() => scrollByCards('right')} size="small">
                    <ChevronRightIcon />
                  </IconButton>
                </Box>
              </Box>

              <Box
                ref={scrollerRef}
                sx={{
                  display: 'flex',
                  gap: 2,
                  overflowX: 'auto',
                  pb: 1,
                  scrollSnapType: 'x mandatory',
                  scrollBehavior: 'smooth',
                  '&::-webkit-scrollbar': { height: 8 },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: 999,
                  },
                }}
              >
                {client.memberships.length === 0 ? (
                  <Box
                    sx={(t) => ({
                      border: `1px dashed ${t.palette.divider}`,
                      borderRadius: 2,
                      p: 2,
                      color: 'text.secondary',
                    })}
                  >
                    No memberships yet.
                  </Box>
                ) : (
                  client.memberships.map((m) => (
                    <MembershipCard key={m.id} m={m} />
                  ))
                )}
              </Box>
            </Box>
          )}

          {client && (
            <Box
              sx={{
                mt: 2,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => redirect('/')}
                sx={{ textTransform: 'none' }}
              >
                Back to dashboard
              </Button>
              <Button
                variant="contained"
                onClick={() => redirect('/memberships')}
                sx={{ textTransform: 'none' }}
                color="primary"
              >
                Open memberships list
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClientInfoPage;
