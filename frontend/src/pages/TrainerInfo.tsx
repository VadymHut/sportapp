import { useEffect, useMemo, useRef, useState } from 'react';
import { useNotify, useRedirect } from 'react-admin';
import {
  Box, Card, CardContent, Typography, TextField, Button, Chip,
  IconButton, Tooltip, LinearProgress, Divider, Collapse
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
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

type TrainerStats = {
  activeMemberships: number;
  totalMemberships: number;
  totalCheckIns: number;
  lastCheckInAt?: string | null;
  nearestEnding?: string | null;
};

type TrainerInfo = {
  id: number;
  name: string | null;
  surname: string | null;
  email: string | null;
  stats: TrainerStats;
  activeClientIds: number[];
  activeClientsNow: number;
  totalClientsEver: number;
  activeMemberships: MembershipInfo[];
  pastMemberships: MembershipInfo[];
};

const fmtDate = (iso?: string | null) => {
  if (!iso) return '-';
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [yyyy, mm, dd] = iso.split('-');
    return `${dd}/${mm}/${yyyy}`;
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
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

const fullName = (a?: string | null, b?: string | null) =>
  `${a ?? ''} ${b ?? ''}`.trim() || '-';

const getInitialTrainerPrefill = (sp: URLSearchParams, st: any): string => {
  const fromQuery = sp.get('trainerId') || sp.get('id') || sp.get('trainer');
  const fromState = st && typeof st === 'object' ? (st as any).prefillTrainerId : null;
  const raw = (fromQuery ?? fromState ?? '').toString().trim();
  return /^\d+$/.test(raw) ? raw : '';
};

const MembershipCard = ({ m }: { m: MembershipInfo }) => {
  const redirect = useRedirect();
  const used = m.checkIns?.length ?? 0;
  const cap = m.maxVisits ?? null;
  const unlimited = cap == null;
  const pct = unlimited || !cap ? 0 : Math.min(100, Math.round((used / cap) * 100));

  return (
    <Box sx={(t) => ({
      scrollSnapAlign: 'start',
      minWidth: 310, maxWidth: 360, flex: '0 0 auto',
      borderRadius: 2,
      border: `1px solid ${t.palette.divider}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      background: t.palette.background.paper,
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    })}>
      <Box sx={{ p: 2.25, pb: 1.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SportsGymnasticsIcon fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            #{m.id} - {m.planLabel || 'Plan -'}
          </Typography>
        </Box>

        <Box sx={{ mt: 1.1, display: 'grid', rowGap: 0.4 }}>
          <Typography variant="body2">
            <strong>Client:</strong> {fullName(m.clientName, m.clientSurname)}
          </Typography>
          <Typography variant="body2">
            <strong>Term:</strong> {fmtDate(m.startingDate)} - {fmtDate(m.endingDate)}
          </Typography>
        </Box>

        <Box sx={{ mt: 1.25 }}>
          {!unlimited && (
            <>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {used} / {cap}
              </Typography>
              <LinearProgress variant="determinate" value={pct} sx={{ mt: 0.5, height: 8, borderRadius: 999 }} />
            </>
          )}
          {m.checkIns?.length > 0 && (
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.75 }}>
              Last check-in: {fmtDateTime(m.checkIns[m.checkIns.length - 1].visitedAt)}
            </Typography>
          )}
        </Box>
      </Box>

      <Divider />

      <Box sx={(t) => ({
        p: 1.25, display: 'flex', justifyContent: 'flex-end', gap: 1,
        background: t.palette.background.default
      })}>
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
            startIcon={<CreditCardIcon />}
            sx={(t) => ({
              textTransform: 'none',
              bgcolor: t.palette.primary.dark,
              '&:hover': { bgcolor: t.palette.primary.main },
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

const TrainerInfoPage = () => {
  const notify = useNotify();
  const location = useLocation();
  const [sp] = useSearchParams();
  const [value, setValue] = useState(getInitialTrainerPrefill(sp, location.state));
  const [trainer, setTrainer] = useState<TrainerInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAllPast, setShowAllPast] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const name = useMemo(() => trainer ? fullName(trainer.name, trainer.surname) : '', [trainer]);

  const loadTrainer = async (raw: string) => {
    const id = Number(raw.trim());
    if (!raw || Number.isNaN(id) || id <= 0) {
      notify('Enter a valid Trainer ID', { type: 'warning' }); return;
    }
    setLoading(true);
    try {
      const { json } = await httpClient(`${API}/api/trainers/${id}/info?includeCheckIns=false`);
      setTrainer(json as TrainerInfo);
    } catch (e: any) {
      setTrainer(null);
      const msg = e?.body?.message || (typeof e?.body === 'string' ? e.body : '') || e?.message || 'Failed to load trainer info';
      notify(msg, { type: 'warning' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = getInitialTrainerPrefill(sp, location.state);
    if (init) loadTrainer(init);
  }, []);

  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); loadTrainer(value); };

  const scrollByCards = (dir: 'left' | 'right') => {
    const el = scrollerRef.current; if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -420 : 420, behavior: 'smooth' });
  };

  const pastDisplay = useMemo(() => {
    if (!trainer) return [];
    if (showAllPast) return trainer.pastMemberships;
    const latestByClient = new Map<number, MembershipInfo>();
    for (const m of trainer.pastMemberships) {
      const cid = m.clientId ?? -1;
      const prev = latestByClient.get(cid);
      if (!prev) latestByClient.set(cid, m);
      else {
        const prevEnd = prev.endingDate ?? '';
        const curEnd = m.endingDate ?? '';
        if (curEnd > prevEnd) latestByClient.set(cid, m);
      }
    }
    return Array.from(latestByClient.values());
  }, [trainer, showAllPast]);

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 3 }}>
      <Card variant="outlined" sx={{ width: '100%', maxWidth: 980, borderRadius: 2 }}>
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0.3, mb: 0.5 }}>
              Trainer info
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              See a trainer's active load and membership history at a glance.
            </Typography>
          </Box>

          <Box component="form" onSubmit={onSubmit}
               sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, alignItems: { xs: 'stretch', sm: 'center' } }}>
            <TextField
              label="Trainer ID"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              variant="outlined"
              fullWidth
              size="small"
              disabled={loading}
              InputProps={{ sx: { fontSize: 14, py: 0.5 } }}
            />
            <Button type="submit" variant="contained" endIcon={<ArrowForwardIcon />} disabled={loading}
                    sx={{ minWidth: 120, height: 38, textTransform: 'none', fontSize: 14, fontWeight: 600, borderRadius: 1.5, px: 2 }}>
              {loading ? 'Loading…' : 'Load'}
            </Button>
          </Box>

          {trainer && (
            <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.3fr 1fr' }, gap: 2.5, alignItems: 'center' }}>
              <Box sx={{ display: 'grid', rowGap: 0.4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SportsGymnasticsIcon />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {name}
                  </Typography>
                </Box>
                {trainer.email && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{trainer.email}</Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Chip size="small" color="primary" variant="outlined"
                      label={`Active memberships: ${trainer.stats.activeMemberships}`} />
                <Chip size="small" color="default" variant="outlined"
                      label={`Total memberships: ${trainer.stats.totalMemberships}`} />
                <Chip size="small" color="success" variant="outlined"
                      label={`Active clients: ${trainer.activeClientsNow}`} />
                <Chip size="small" color="default" variant="outlined"
                      label={`Clients (ever): ${trainer.totalClientsEver}`} />
                <Tooltip title={trainer.stats.lastCheckInAt ? fmtDateTime(trainer.stats.lastCheckInAt) : '-'}>
                  <Chip size="small" variant="outlined" icon={<AccessTimeIcon fontSize="small" />} label="Last check-in" />
                </Tooltip>
                {trainer.stats.nearestEnding && (
                  <Chip size="small" color="warning" variant="outlined"
                        label={`Nearest end: ${fmtDate(trainer.stats.nearestEnding)}`} />
                )}
              </Box>
            </Box>
          )}

          {trainer && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Active memberships ({trainer.activeMemberships.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton onClick={() => scrollByCards('left')} size="small"><ChevronLeftIcon /></IconButton>
                  <IconButton onClick={() => scrollByCards('right')} size="small"><ChevronRightIcon /></IconButton>
                </Box>
              </Box>

              <Box ref={scrollerRef}
                   sx={{
                     display: 'flex', gap: 2, overflowX: 'auto', pb: 1,
                     scrollSnapType: 'x mandatory', scrollBehavior: 'smooth',
                     '&::-webkit-scrollbar': { height: 8 },
                     '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 999 }
                   }}>
                {trainer.activeMemberships.length === 0 ? (
                  <Box sx={(t) => ({ border: `1px dashed ${t.palette.divider}`, borderRadius: 2, p: 2, color: 'text.secondary' })}>
                    No active memberships.
                  </Box>
                ) : trainer.activeMemberships.map(m => (
                  <MembershipCard key={m.id} m={m} />
                ))}
              </Box>
            </Box>
          )}

          {trainer && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryToggleOffIcon fontSize="small" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Past memberships
                  </Typography>
                  {!showAllPast && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      showing latest per client
                    </Typography>
                  )}
                </Box>
                <Button
                  size="small"
                  variant="text"
                  startIcon={showAllPast ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => setShowAllPast(v => !v)}
                  sx={{ textTransform: 'none' }}
                >
                  {showAllPast ? 'Show less' : 'Show all'}
                </Button>
              </Box>

              <Collapse in timeout={300}>
                <Box sx={{
                  mt: 1, display: 'flex', gap: 2, flexWrap: 'wrap'
                }}>
                  {pastDisplay.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>No past memberships.</Typography>
                  ) : pastDisplay.map(m => (
                    <Box key={m.id} sx={(t) => ({
                      minWidth: 310, maxWidth: 360, flex: '0 0 auto',
                      borderRadius: 2, border: `1px dashed ${t.palette.divider}`,
                      background: t.palette.background.default
                    })}>
                      <MembershipCard m={m} />
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TrainerInfoPage;
