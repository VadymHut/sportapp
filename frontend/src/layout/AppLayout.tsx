import { Layout, useSidebarState, usePermissions, Menu } from 'react-admin';
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
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ListAltIcon from '@mui/icons-material/ListAlt';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PeopleIcon from '@mui/icons-material/People';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import BadgeIcon from '@mui/icons-material/Badge';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { Link as RouterLink } from 'react-router-dom';
import CustomUserMenu from './CustomUserMenu';

const APPBAR_H = 64;

type RoleName = 'ROLE_RECEPTIONIST' | 'ROLE_CASHIER' | 'ROLE_ADMIN';

const RoleText = () => {
    const { permissions, isLoading } = usePermissions();
    if (isLoading) return null;

    const raw =
        Array.isArray(permissions) && permissions.length
            ? permissions[0]
            : typeof permissions === 'string'
                ? permissions
                : '';

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

const getCurrentRole = (permissions: unknown): RoleName | null => {
    if (Array.isArray(permissions)) {
        if (permissions.includes('ROLE_ADMIN')) return 'ROLE_ADMIN';
        if (permissions.includes('ROLE_CASHIER')) return 'ROLE_CASHIER';
        if (permissions.includes('ROLE_RECEPTIONIST')) return 'ROLE_RECEPTIONIST';
        return null;
    }

    if (
        permissions === 'ROLE_ADMIN' ||
        permissions === 'ROLE_CASHIER' ||
        permissions === 'ROLE_RECEPTIONIST'
    ) {
        return permissions;
    }

    return null;
};

const actionButtonSx = {
    width: '200px',
    minWidth: '200px',
    maxWidth: '200px',
    textTransform: 'none',
    borderRadius: 1,
    fontWeight: 600,
    fontSize: 12,
    px: 1,
    py: 0.4,
    backgroundColor: 'white',
    color: (t: any) => t.palette.primary.main,
    boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    justifyContent: 'center',
    flex: '0 0 auto',
    '& .MuiButton-startIcon': {
        marginRight: 0.75,
    },
    '&:hover': {
        backgroundColor: (t: any) => t.palette.grey[100],
        boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
    },
};

const TOP_ACTIONS = [
    {
        label: 'Quick check-in',
        to: '/quick-checkin',
        icon: <FlashOnIcon />,
        roles: ['ROLE_ADMIN', 'ROLE_CASHIER', 'ROLE_RECEPTIONIST'] as RoleName[],
    },
    {
        label: 'Quick add person',
        to: '/quick-person',
        icon: <PersonAddAltIcon />,
        roles: ['ROLE_ADMIN', 'ROLE_CASHIER'] as RoleName[],
    },
    {
        label: 'New membership',
        to: '/memberships/create',
        icon: <CardMembershipIcon />,
        roles: ['ROLE_ADMIN', 'ROLE_CASHIER'] as RoleName[],
    },
    {
        label: 'Client info',
        to: '/client-info',
        icon: <PersonSearchIcon />,
        roles: ['ROLE_ADMIN', 'ROLE_CASHIER', 'ROLE_RECEPTIONIST'] as RoleName[],
    },
    {
        label: 'Trainer info',
        to: '/trainer-info',
        icon: <SportsGymnasticsIcon />,
        roles: ['ROLE_ADMIN', 'ROLE_CASHIER', 'ROLE_RECEPTIONIST'] as RoleName[],
    },
    {
        label: 'Price board',
        to: '/price-board',
        icon: <PriceChangeIcon />,
        roles: ['ROLE_ADMIN', 'ROLE_CASHIER', 'ROLE_RECEPTIONIST'] as RoleName[],
    },
    {
        label: 'Import data',
        to: '/import-data',
        icon: <FileUploadIcon />,
        roles: ['ROLE_ADMIN', 'ROLE_CASHIER'] as RoleName[],
    },
];

const SIDEBAR_ITEMS = [
    {
        label: 'Membership-plans',
        to: '/membership-plans',
        icon: <ListAltIcon />,
        roles: ['ROLE_ADMIN', 'ROLE_CASHIER', 'ROLE_RECEPTIONIST'] as RoleName[],
    },
    {
        label: 'Plan-prices',
        to: '/plan-prices',
        icon: <MonetizationOnIcon />,
        roles: ['ROLE_ADMIN', 'ROLE_CASHIER', 'ROLE_RECEPTIONIST'] as RoleName[],
    },
    {
        label: 'Clients',
        to: '/clients',
        icon: <PeopleIcon />,
        roles: ['ROLE_ADMIN', 'ROLE_CASHIER', 'ROLE_RECEPTIONIST'] as RoleName[],
    },
    {
        label: 'Trainers',
        to: '/trainers',
        icon: <FitnessCenterIcon />,
        roles: ['ROLE_ADMIN', 'ROLE_CASHIER', 'ROLE_RECEPTIONIST'] as RoleName[],
    },
    {
        label: 'Staff',
        to: '/staff',
        icon: <BadgeIcon />,
        roles: ['ROLE_ADMIN'] as RoleName[],
    },
    {
        label: 'Users',
        to: '/app-users',
        icon: <ManageAccountsIcon />,
        roles: ['ROLE_ADMIN'] as RoleName[],
    },
    {
        label: 'Memberships',
        to: '/memberships',
        icon: <CardMembershipIcon />,
        roles: ['ROLE_ADMIN', 'ROLE_CASHIER', 'ROLE_RECEPTIONIST'] as RoleName[],
    },
    {
        label: 'Checkins',
        to: '/checkins',
        icon: <HowToRegIcon />,
        roles: ['ROLE_ADMIN', 'ROLE_CASHIER', 'ROLE_RECEPTIONIST'] as RoleName[],
    },
];

const AppMenu = () => {
    const { permissions, isLoading } = usePermissions();
    if (isLoading) return null;

    const currentRole = getCurrentRole(permissions);

    const visibleItems = SIDEBAR_ITEMS.filter(
        (item) => currentRole && item.roles.includes(currentRole)
    );

    return (
        <Menu>
            <Menu.DashboardItem />
            {visibleItems.map((item) => (
                <Menu.Item
                    key={item.to}
                    to={item.to}
                    primaryText={item.label}
                    leftIcon={item.icon}
                />
            ))}
        </Menu>
    );
};

const MyAppBar = () => {
    const [open, setOpen] = useSidebarState();
    const { permissions } = usePermissions();

    const currentRole = getCurrentRole(permissions);
    const isReceptionist = currentRole === 'ROLE_RECEPTIONIST';

    const visibleActions = TOP_ACTIONS.filter(
        (action) => currentRole && action.roles.includes(currentRole)
    );

    return (
        <AppBar
            position="sticky"
            color="primary"
            elevation={0}
            sx={{ top: 0, zIndex: (t) => t.zIndex.appBar }}
        >
            <Toolbar
                sx={{
                    minHeight: APPBAR_H,
                    px: 2,
                    display: 'grid',
                    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
                    alignItems: 'center',
                    columnGap: 2,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifySelf: 'start',
                    }}
                >
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => setOpen(!open)}
                        size="large"
                        aria-label="Toggle sidebar"
                    >
                        <MenuIcon />
                    </IconButton>
                </Box>

                <Box
                    sx={{
                        minWidth: 0,
                        px: 1,
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: isReceptionist ? '950px' : '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                        }}
                    >
                        {visibleActions.map((action) => (
                            <Box
                                key={action.to}
                                sx={{
                                    flex: 1,
                                    minWidth: 0,
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}
                            >
                                <Button
                                    component={RouterLink}
                                    to={action.to}
                                    variant="contained"
                                    color="inherit"
                                    startIcon={action.icon}
                                    sx={actionButtonSx}
                                >
                                    {action.label}
                                </Button>
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifySelf: 'end',
                        gap: 1.25,
                        whiteSpace: 'nowrap',
                    }}
                >
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
        menu={AppMenu}
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