import { useEffect, useMemo, useState } from 'react';
import {
  useNotify,
  useCreate,
  useRedirect,
  useGetIdentity,
} from 'react-admin';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';

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

  checkIns: CheckInInfo[];
};

const formatDate = (iso?: string | null) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('lv-LV');
};

const MembershipQuickView = () => {
  const { id } = useParams<{ id: string }>();
  const notify = useNotify();
  const redirect = useRedirect();
  const { data: identity } = useGetIdentity();
  const [createCheckIn, { isLoading: isCreating }] = useCreate();

  const membershipId = useMemo(() => (id ? Number(id) : NaN), [id]);
  const staffId = (identity as any)?.staffId as number | undefined;

  const [data, setData] = useState<MembershipInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!membershipId || Number.isNaN(membershipId)) {
      setError(new Error('Invalid membership id'));
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { json } = await httpClient(
          `${API}/api/memberships/${membershipId}/info`
        );
        if (!cancelled) {
          setData(json as MembershipInfo);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [membershipId, reloadIndex]);

  const triggerReload = () => setReloadIndex((i) => i + 1);

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

  if (error || !data) {
    return (
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'grid',
          placeItems: 'center',
          px: 2,
        }}
      >
        <Card sx={{ maxWidth: 480, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Membership not found
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Couldn't load the membership details. It may not exist or you may not
            have permission.
          </Typography>
          <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: 'pointer', fontWeight: 600 }}
            onClick={() => redirect('/memberships')}
          >
            Back to memberships
          </Typography>
        </Card>
      </Box>
    );
  }

  const {
    clientName,
    clientSurname,
    clientPersonalCode,
    planLabel,
    trainerName,
    trainerSurname,
    startingDate,
    endingDate,
    checkIns = [],
  } = data;

  const clientFullName =
    `${clientName ?? ''} ${clientSurname ?? ''}`.trim() || 'Unknown client';
  const trainerFullName =
    `${trainerName ?? ''} ${trainerSurname ?? ''}`.trim() || null;

  let rawMax: number | undefined = undefined;
  if (planLabel) {
    const parts = planLabel.split('/').map((p) => p.trim().toUpperCase());
    const freq = parts[2];
    if (freq === 'ONCE') rawMax = 1;
    else if (freq === 'EIGHT') rawMax = 8;
    else if (freq === 'TWELVE') rawMax = 12;
    else if (freq === 'UNLIMITED') rawMax = undefined;
  }

  const hasFiniteLimit =
    typeof rawMax === 'number' && rawMax > 0 && rawMax < 1_000_000;
  const numericMaxVisits = hasFiniteLimit ? rawMax : undefined;
  const isUnlimited = !hasFiniteLimit;


  const ROW_SIZE = 8;
  const BASE_ROWS = 3;

  let totalSlots: number;
  if (isUnlimited) {
    const rowsUsed = Math.ceil((checkIns.length + 1) / ROW_SIZE);
    const rowsToShow = Math.max(BASE_ROWS, rowsUsed + 1);
    totalSlots = rowsToShow * ROW_SIZE;
  } else {
    totalSlots = numericMaxVisits ?? Math.max(checkIns.length + 1, 6);
  }

  const hasRemainingVisits =
    isUnlimited ||
    (numericMaxVisits !== undefined && checkIns.length < numericMaxVisits);

  const handleFastCheckIn = () => {
    if (!membershipId || Number.isNaN(membershipId)) return;
    if (!data) return;

    if (!staffId) {
      notify('Cannot determine current staff user', { type: 'warning' });
      return;
    }

    if (!hasRemainingVisits) {
      notify('No visits remaining for this membership', { type: 'warning' });
      return;
    }

    const newCount = checkIns.length + 1;
    let message = 'Check-in added';
    if (numericMaxVisits) {
      message = `Check-in added (${newCount} / ${numericMaxVisits})`;
    }

    createCheckIn(
      'checkins',
      {
        data: {
          membership: { id: membershipId },
          staff: { id: staffId },
        },
      },
      {
        onSuccess: () => {
          notify(message, { type: 'info' });
          triggerReload();
        },
        onError: (err: any) => {
          console.error('Check-in creation error', err);

          let msg: string =
            err?.body?.message ||
            (typeof err?.body === 'string' ? err.body : '') ||
            err?.message ||
            '';

          const errors = err?.body?.errors;
          if (errors && typeof errors === 'object') {
            const firstField = Object.keys(errors)[0];
            const firstMsg = (errors as any)[firstField]?.[0];
            if (firstMsg) {
              msg = firstMsg;
            }
          }

          if (!msg && err?.body) {
            try {
              msg = JSON.stringify(err.body);
            } catch {
            }
          }

          if (!msg) {
            msg = 'Error while creating check-in';
          }

          if (err?.status && !msg.includes(String(err.status))) {
            msg = `[${err.status}] ${msg}`;
          }

          notify(msg, { type: 'warning' });
        },
      }
    );
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    handleFastCheckIn();
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
          maxWidth: 960,
          borderRadius: 2,
        }}
      >
        <CardContent
          sx={{
            minHeight: 480,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            p: 3.5,
            pb: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2,
              mb: 8,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.3 }}>
                Membership #{data.id}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Quick check-in view
              </Typography>
            </Box>

            {planLabel && (
              <Box
                sx={{
                  px: 1.8,
                  py: 0.6,
                  borderRadius: 999,
                  border: (t) => `1px solid ${t.palette.divider}`,
                  fontSize: 13,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.9,
                  bgcolor: (t) => t.palette.grey[50],
                }}
              >
                <Typography
                  component="span"
                  sx={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}
                >
                  Plan
                </Typography>
                <Typography component="span" sx={{ fontSize: 13 }}>
                  {planLabel}
                </Typography>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
              gap: 6,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Member
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mt: 1 }}>
                  {clientFullName}
                </Typography>
                {clientPersonalCode && (
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mt: 0.6 }}
                  >
                    Personal code: {clientPersonalCode}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Term
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.8 }}>
                  <strong>Start:</strong> {formatDate(startingDate)}
                </Typography>
                <Typography variant="body2">
                  <strong>End:</strong> {formatDate(endingDate)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Trainer
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.8 }}>
                  {trainerFullName || 'No trainer'}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Check-ins
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                Colored bubbles show past visits. Click the first empty bubble to record a
                new check-in right now.
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(8, auto)',
                  gap: 1,
                  alignItems: 'center',
                  mt: 1.5,
                }}
              >
                {Array.from({ length: totalSlots }).map((_, index) => {
                  const ci = checkIns[index];
                  const isFilled = !!ci && index < checkIns.length;
                  const isFirstEmpty = !isFilled && index === checkIns.length;
                  const isClickable = isFirstEmpty && hasRemainingVisits;

                  if (isFilled && ci) {
                    const staffName =
                      `${ci.staffName ?? ''} ${ci.staffSurname ?? ''}`.trim() ||
                      'Unknown staff';
                    const tooltip = `${formatDateTime(ci.visitedAt)} — ${staffName}`;

                    return (
                      <Tooltip key={ci.id} title={tooltip} arrow>
                        <Box
                          sx={{
                            width: 30,
                            height: 30,
                            borderRadius: '999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: (t) => t.palette.success.light,
                            border: (t) => `2px solid ${t.palette.success.main}`,
                            color: (t) => t.palette.success.contrastText,
                            fontSize: 18,
                            boxShadow: '0 0 0 1px rgba(0,0,0,0.04)',
                            cursor: 'default',
                          }}
                        >
                          <CheckIcon sx={{ fontSize: 18 }} />
                        </Box>
                      </Tooltip>
                    );
                  }

                  if (isClickable) {
                    return (
                      <Tooltip
                        key={`slot-${index}`}
                        title={
                          !hasRemainingVisits
                            ? 'No visits remaining'
                            : isCreating
                            ? 'Creating check-in...'
                            : 'Click to create a new check-in right now'
                        }
                        arrow
                      >
                        <Box
                          component="button"
                          type="button"
                          onClick={() => hasRemainingVisits && setConfirmOpen(true)}
                          disabled={isCreating || !hasRemainingVisits}
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: (t) => `2px dashed ${t.palette.primary.main}`,
                            bgcolor: (t) => t.palette.grey[100],
                            color: (t) => t.palette.primary.main,
                            cursor:
                              isCreating || !hasRemainingVisits
                                ? 'default'
                                : 'pointer',
                            padding: 0,
                            outline: 'none',
                            '&:hover': {
                              bgcolor: (t) =>
                                isCreating || !hasRemainingVisits
                                  ? t.palette.grey[100]
                                  : t.palette.grey[200],
                            },
                          }}
                        >
                          {isCreating ? (
                            <CircularProgress size={18} />
                          ) : (
                            <AddIcon sx={{ fontSize: 20 }} />
                          )}
                        </Box>
                      </Tooltip>
                    );
                  }

                  return (
                    <Box
                      key={`slot-${index}`}
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: (t) => `1px dashed ${t.palette.grey[400]}`,
                        bgcolor: (t) => t.palette.grey[50],
                        color: (t) => t.palette.grey[400],
                        fontSize: 12,
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm check-in?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to register a new visit for{' '}
            <strong>{clientFullName}</strong>
            {planLabel && (
              <>
                {' '}
                on plan <strong>{planLabel}</strong>
              </>
            )}
            {' '}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={isCreating}
          >
            {isCreating ? 'Saving...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MembershipQuickView;
