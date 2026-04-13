import { useEffect } from 'react';
import { useRedirect } from 'react-admin';
import { Box, CircularProgress } from '@mui/material';
import { useLocation } from 'react-router-dom';

export const CheckInCreate = () => {
    const redirect = useRedirect();
    const { search } = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(search);
        const membership =
            params.get('membership') ||
            params.get('membershipId') ||
            params.get('id') ||
            params.get('prefill');

        if (membership) {
            redirect(`/quick-checkin?prefill=${encodeURIComponent(membership)}`);
        } else {
            redirect('/quick-checkin');
        }
    }, [redirect, search]);

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
};