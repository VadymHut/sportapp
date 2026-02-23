import { useState, useRef, useEffect } from 'react';
import {
  useNotify,
  useCreate,
  useGetIdentity,
  useRedirect,
} from 'react-admin';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { useLocation, useSearchParams } from 'react-router-dom';

const getInitialPrefill = (
  searchParams: URLSearchParams,
  locationState: any
): string => {
  const fromQuery =
    searchParams.get('prefill') ||
    searchParams.get('id') ||
    searchParams.get('membershipId');

  const fromState =
    locationState && typeof locationState === 'object'
      ? (locationState as any).prefillMembershipId
      : null;

  const raw = (fromQuery ?? fromState ?? '').toString().trim();
  return /^\d+$/.test(raw) ? raw : '';
};

const QuickCheckIn = () => {
  const notify = useNotify();
  const redirect = useRedirect();
  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  const [createCheckIn, { isLoading: isCreating }] = useCreate();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const initialPrefill = getInitialPrefill(searchParams, location.state);

  const [value, setValue] = useState(initialPrefill);
  const [lastMembershipId, setLastMembershipId] = useState<number | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const staffId = (identity as any)?.staffId as number | undefined;

  useEffect(() => {
    inputRef.current?.focus();
    if (initialPrefill && inputRef.current) {
      inputRef.current.select();
    }
  }, []);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    const membershipId = Number(trimmed);

    if (!trimmed || Number.isNaN(membershipId) || membershipId <= 0) {
      notify('Please enter a valid membership ID', { type: 'warning' });
      return;
    }

    if (!staffId) {
      notify('Cannot determine current staff user', { type: 'warning' });
      return;
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
          const msg = `Check-in added for membership #${membershipId}`;
          notify(msg, { type: 'info' });
          setLastMembershipId(membershipId);
          setLastMessage(msg);
          setValue('');
          setTimeout(() => inputRef.current?.focus(), 0);
        },
        onError: (err: any) => {
          let msg =
            err?.body?.message ||
            (typeof err?.body === 'string' ? err.body : '') ||
            err?.message ||
            'Error while creating check-in';

          const errors = err?.body?.errors;
          if (errors && typeof errors === 'object') {
            const firstField = Object.keys(errors)[0];
            const firstMsg = (errors as any)[firstField]?.[0];
            if (firstMsg) msg = firstMsg;
          }

          notify(msg, { type: 'warning' });
          setLastMembershipId(membershipId);
          setLastMessage(msg);
        },
      }
    );
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
          maxWidth: 700,
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
              Quick check-in
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Type a membership ID and press Enter to register a visit immediately.
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
              inputRef={inputRef}
              label="Membership ID"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              variant="outlined"
              fullWidth
              size="small"
              disabled={isCreating || identityLoading}
              InputProps={{
                sx: {
                  fontSize: 14,
                  py: 0.5,
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={
                isCreating ? (
                  <CircularProgress size={16} />
                ) : (
                  <FlashOnIcon fontSize="small" />
                )
              }
              disabled={isCreating || identityLoading}
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
              {isCreating ? 'Checking…' : 'Check in'}
            </Button>
          </Box>

          {(lastMembershipId || lastMessage) && (
            <Box sx={{ mt: 1.5 }}>
              {lastMessage && (
                <Typography
                  variant="body2"
                  sx={{ mb: 0.75, color: 'text.secondary' }}
                >
                  {lastMessage}
                </Typography>
              )}
              {lastMembershipId && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() =>
                    redirect(`/memberships/${lastMembershipId}/quick`)
                  }
                  sx={{ textTransform: 'none', px: 0 }}
                >
                  Open membership card #{lastMembershipId}
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default QuickCheckIn;
