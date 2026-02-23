import { useState } from 'react';
import { useLogin, useNotify } from 'react-admin';
import { Box, Card, CardContent, TextField, Button, Typography, Stack } from '@mui/material';

export default function LoginPage() {
  const login = useLogin();
  const notify = useNotify();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username, password });
    } catch {
      notify('Invalid credentials', { type: 'error' });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ width: 380, maxWidth: '92vw' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>Sign in</Typography>
          <Box component="form" onSubmit={submit}>
            <Stack spacing={2}>
              <TextField
                label="Username"
                fullWidth
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <Button type="submit" variant="contained" fullWidth>Login</Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
