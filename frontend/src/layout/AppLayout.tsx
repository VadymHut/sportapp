import { Layout, useSidebarState, usePermissions } from 'react-admin';
import AppBar from '@mui/material/AppBar';
import {
  Toolbar,
  Box,
  Typography,
  IconButton,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { Link as RouterLink } from 'react-router-dom';
import CustomUserMenu from './CustomUserMenu';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import PriceChangeIcon from '@mui/icons-material/PriceChange';

const APPBAR_H = 64;

const RoleText = () => {
  const { permissions, isLoading } = usePermissions();
  if (isLoading) return null;
  const raw = Array.isArray(permissions) && permissions.length ? permissions[0] : '';
  const label = raw.replace(/^ROLE_/, '');
  if (!label) return null;
  return (
    <Typography
      variant="body2"
      sx={{ fontWeight: 700, letterSpacing: 0.3, textTransform: 'capitalize' }}
    >
      {label.toLowerCase()}
    </Typography>
  );
};

const MyAppBar = () => {
  const [open, setOpen] = useSidebarState();
  return (
    <AppBar
      position="sticky"
      color="primary"
      elevation={0}
      sx={{ top: 0, zIndex: (t) => t.zIndex.appBar }}
    >
      <Toolbar sx={{ minHeight: APPBAR_H, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setOpen(!open)}
            size="large"
            aria-label="Toggle sidebar"
          >
            <MenuIcon />
          </IconButton>

          <Box
            sx={{
              ml: '260px',
              display: 'flex',
              alignItems: 'center',
              gap: 15,
            }}
          >
            <Button
              component={RouterLink}
              to="/quick-checkin"
              variant="contained"
              color="inherit"
              startIcon={<FlashOnIcon />}
              sx={{
                textTransform: 'none',
                borderRadius: 1,
                fontWeight: 600,
                fontSize: 13,
                px: 2,
                py: 0.4,
                backgroundColor: 'white',
                color: (t) => t.palette.primary.main,
                boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                '&:hover': {
                  backgroundColor: (t) => t.palette.grey[100],
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                },
              }}
            >
              Quick check-in
            </Button>

            <Button
              component={RouterLink}
              to="/quick-person"
              variant="contained"
              color="inherit"
              startIcon={<PersonAddAltIcon />}
              sx={{
                textTransform: 'none',
                borderRadius: 1,
                fontWeight: 600,
                fontSize: 13,
                px: 2,
                py: 0.4,
                backgroundColor: 'white',
                color: (t) => t.palette.primary.main,
                boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                '&:hover': {
                  backgroundColor: (t) => t.palette.grey[100],
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                },
              }}
            >
              Quick add person
            </Button>

            <Button
              component={RouterLink}
              to="/memberships/create"
              variant="contained"
              color="inherit"
              startIcon={<CardMembershipIcon />}
              sx={{
                textTransform: 'none',
                borderRadius: 1,
                fontWeight: 600,
                fontSize: 13,
                px: 2,
                py: 0.4,
                backgroundColor: 'white',
                color: (t) => t.palette.primary.main,
                boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                '&:hover': {
                  backgroundColor: (t) => t.palette.grey[100],
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                },
              }}
            >
              New membership
            </Button>

            <Button
              component={RouterLink}
              to="/client-info"
              variant="contained"
              color="inherit"
              startIcon={<PersonSearchIcon />}
              sx={{
                textTransform: 'none',
                borderRadius: 1,
                fontWeight: 600,
                fontSize: 13,
                px: 2,
                py: 0.4,
                backgroundColor: 'white',
                color: (t) => t.palette.primary.main,
                boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                '&:hover': {
                  backgroundColor: (t) => t.palette.grey[100],
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                },
              }}
            >
              Client info
            </Button>

            <Button
              component={RouterLink}
              to="/trainer-info"
              variant="contained"
              color="inherit"
              startIcon={<SportsGymnasticsIcon />}
              sx={{
                textTransform: 'none',
                borderRadius: 1,
                fontWeight: 600,
                fontSize: 13,
                px: 2,
                py: 0.4,
                backgroundColor: 'white',
                color: (t) => t.palette.primary.main,
                boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                '&:hover': {
                  backgroundColor: (t) => t.palette.grey[100],
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                },
              }}
            >
              Trainer info
            </Button>
            
            <Button
              component={RouterLink}
              to="/price-board"
              variant="contained"
              color="inherit"
              startIcon={<PriceChangeIcon />}
              sx={{
                textTransform: 'none',
                borderRadius: 1,
                fontWeight: 600,
                fontSize: 13,
                px: 2,
                py: 0.4,
                backgroundColor: 'white',
                color: (t) => t.palette.primary.main,
                boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                '&:hover': {
                  backgroundColor: (t) => t.palette.grey[100],
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                },
              }}
            >
              Price board
            </Button> 
            
          </Box>
        </Box>

        <Box sx={{ flex: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <RoleText />
          <CustomUserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export const AppLayout = (props: any) => (
  <Layout
    {...props}
    appBar={MyAppBar}
    sx={{
      '& .RaLayout-root, & .RaLayout-appFrame': {
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      },
      '& .RaLayout-content': {
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        p: 0,
        m: 0,
      },
      '& .RaLayout-content > *': {
        width: '100%',
        maxWidth: 'none',
        mx: 'auto',
      },
      '& .RaSidebarToggleButton-root, & .RaSidebarToggleButton-button': {
        display: 'none !important',
      },
      '& .MuiDrawer-root .MuiPaper-root, & .RaSidebar-root .MuiDrawer-paper': {
        borderRight: '1px solid rgba(0,0,0,0.14) !important',
        boxShadow: 'none !important',
      },
    }}
  />
);
