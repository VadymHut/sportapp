import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { useNotify, useRedirect } from 'react-admin';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { API, httpClient } from '../core/httpClient';

export default function ChangePasswordPage() {
  const notify = useNotify();
  const redirect = useRedirect();

  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [confirmNext, setConfirmNext] = useState('');
  const [showCurr, setShowCurr] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [saving, setSaving] = useState(false);

  const validate = () => {
    if (!currentPassword || !nextPassword || !confirmNext) {
      notify('Please fill in all fields', { type: 'warning' });
      return false;
    }
    if (nextPassword.length < 8) {
      notify('New password must be at least 8 characters', { type: 'warning' });
      return false;
    }
    if (nextPassword !== confirmNext) {
      notify('New password and confirmation do not match', { type: 'warning' });
      return false;
    }
    if (nextPassword === currentPassword) {
      notify('New password must be different from current password', { type: 'warning' });
      return false;
    }
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await httpClient(`${API}/api/account/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword: nextPassword,
        }),
      });

      notify('Password updated successfully', { type: 'info' });
      setCurrentPassword('');
      setNextPassword('');
      setConfirmNext('');
      redirect('/');
    } catch (err: any) {
      const msg =
        err?.body?.message ||
        (typeof err?.body === 'string' ? err.body : '') ||
        err?.message ||
        'Failed to change password';
      notify(msg, { type: 'warning' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100dvh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Card variant="outlined" sx={{ width: '100%', maxWidth: 560, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Change Password
          </Typography>

          <Box
            component="form"
            onSubmit={onSubmit}
            sx={{
              display: 'grid',
              rowGap: 1.25,
              maxWidth: 420,
            }}
          >
            <TextField
              label="Current password"
              type={showCurr ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              size="small"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurr((v) => !v)} edge="end" aria-label="toggle password">
                      {showCurr ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="New password"
              type={showNext ? 'text' : 'password'}
              value={nextPassword}
              onChange={(e) => setNextPassword(e.target.value)}
              size="small"
              autoComplete="new-password"
              helperText="At least 8 characters."
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNext((v) => !v)} edge="end" aria-label="toggle password">
                      {showNext ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirm new password"
              type={showConf ? 'text' : 'password'}
              value={confirmNext}
              onChange={(e) => setConfirmNext(e.target.value)}
              size="small"
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConf((v) => !v)} edge="end" aria-label="toggle password">
                      {showConf ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.25, mt: 1 }}>
              <Button variant="outlined" onClick={() => redirect('/')} disabled={saving} sx={{ textTransform: 'none' }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
