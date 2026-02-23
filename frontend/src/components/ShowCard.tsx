import type { ReactNode } from "react";
import { Card, CardContent, Stack, Chip, Divider, Box, Typography } from '@mui/material';

export type ShowCardProps = {
  badges?: (string | undefined | null)[];
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: number | string;
  detailsTitle?: string;
  minHeight?: number | string;
  centerVertically?: boolean;
};

export const ShowCard = ({
  badges,
  children,
  actions,
  maxWidth = 1200,
  detailsTitle = 'Details',
  minHeight,
  centerVertically = false,
}: ShowCardProps) => {
  const visibleBadges = (badges ?? []).filter(Boolean) as string[];

  return (
    <Card variant="outlined" sx={{ maxWidth, width: '100%', mx: 'auto' }}>
      <CardContent
        sx={{
          pt: 1.25,
          pb: 1.25,
          minHeight,
          display: centerVertically ? 'flex' : 'block',
          flexDirection: 'column',
        }}
      >
        {visibleBadges.length > 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 0.75 }}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                {visibleBadges.map((b, idx) => (
                  <Chip
                    key={idx}
                    size="small"
                    variant="filled"
                    label={b}
                    sx={{
                      bgcolor: 'common.white',
                      color: 'primary.main',
                      border: '1px solid',
                      borderColor: 'rgba(0,0,0,0.12)',
                      fontWeight: 600,
                    }}
                  />
                ))}
              </Stack>
            </Box>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        <Typography variant="h5" align="center" sx={{ fontWeight: 800, letterSpacing: 0.3, mb: 1 }}>
          {detailsTitle ?? 'Details'}
        </Typography>

        {}
        <Stack spacing={1.25} sx={{ flexGrow: centerVertically ? 1 : 0 }}>
          {children}
        </Stack>

        {actions && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {actions}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
