import { UserMenu, Logout, useGetIdentity, usePermissions, MenuItemLink } from 'react-admin';
import { Avatar, Box, Divider, MenuItem, Typography } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';

function initials(n?: string) {
  if (!n) return '?';
  const p = n.trim().split(/\s+/);
  return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
}

export default function CustomUserMenu() {
  const { data: identity } = useGetIdentity();
  const { permissions } = usePermissions();
  const roleRaw = Array.isArray(permissions) && permissions.length ? permissions[0] : '';
  const role = roleRaw.replace(/^ROLE_/, '').toLowerCase();

  const fullName =
    identity?.fullName ||
    [identity?.firstName, identity?.lastName].filter(Boolean).join(' ') ||
    identity?.username ||
    'User';

  return (
    <UserMenu>
      <MenuItem disabled sx={{ opacity: 1, cursor: 'default' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 0.5 }}>
          <Avatar sx={{ width: 36, height: 36, fontWeight: 700 }}>
            {initials(fullName)}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 800, lineHeight: 1.1 }}>{fullName}</Typography>
            {identity?.username && (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                @{identity.username}
              </Typography>
            )}
            {role && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {role}
              </Typography>
            )}
          </Box>
        </Box>
      </MenuItem>

      <Divider />
      <MenuItemLink to="/change-password" leftIcon={<LockResetIcon />} primaryText="Change password" />
      <Divider sx={{ my: 0.5 }} />
      <Logout />
    </UserMenu>
  );
}
