import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  ButtonBase,
  Button,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRedirect } from 'react-admin';

type PersonType = 'client' | 'trainer';

const QuickPersonCreate = () => {
  const redirect = useRedirect();
  const [selected, setSelected] = useState<PersonType | null>(null);

  const handleSelect = (type: PersonType) => () => {
    setSelected(type);
  };

  const handleConfirm = () => {
    if (!selected) return;
    if (selected === 'client') redirect('/clients/create');
    if (selected === 'trainer') redirect('/trainers/create');
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
          maxWidth: 800,
          borderRadius: 2,
        }}
      >
        <CardContent
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, letterSpacing: 0.3, mb: 0.5 }}
            >
              Quick person creation
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Choose whether you want to register a new client or a new trainer.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2.5,
              mt: 1,
            }}
          >
            <ButtonBase
              onClick={handleSelect('client')}
              disableRipple
              disableTouchRipple
              focusRipple={false}
              sx={{
                borderRadius: 2,
                width: '100%',
                textAlign: 'left',
                '& .MuiTouchRipple-root': { display: 'none' },
              }}
            >
              <Box
                sx={(t) => {
                  const isSelected = selected === 'client';
                  const baseScale = isSelected ? 1.03 : 0.98;

                  return {
                    borderRadius: 2,
                    borderWidth: 2,
                    borderStyle: 'solid',
                    borderColor: isSelected
                      ? t.palette.primary.main
                      : t.palette.divider,
                    p: 2.5,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    gap: 1,
                    boxShadow: isSelected
                      ? '0 10px 24px rgba(15, 23, 42, 0.28)'
                      : '0 3px 8px rgba(15, 23, 42, 0.12)',
                    bgcolor: isSelected
                      ? t.palette.action.hover
                      : t.palette.background.paper,
                    transform: `scale(${baseScale})`,
                    transformOrigin: 'center',
                    transition:
                      'transform 700ms cubic-bezier(0.22, 1, 0.36, 1),' +
                      'box-shadow 700ms cubic-bezier(0.22, 1, 0.36, 1),' +
                      'background-color 250ms ease,' +
                      'border-color 250ms ease',
                    willChange:
                      'transform, box-shadow, background-color, border-color',
                    '&:hover': {
                      transform: `scale(${isSelected ? 1.05 : 1.01})`,
                      boxShadow: isSelected
                        ? '0 14px 32px rgba(15, 23, 42, 0.34)'
                        : '0 6px 14px rgba(15, 23, 42, 0.18)',
                    },
                  };
                }}
              >
                <PersonIcon sx={{ fontSize: 32, mb: 0.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  New client
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Register a new member who will purchase memberships and check in.
                </Typography>
                {selected === 'client' && (
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.5,
                      px: 1,
                      py: 0.2,
                      borderRadius: 999,
                      bgcolor: (t) => t.palette.primary.main,
                      color: 'white',
                      fontWeight: 600,
                    }}
                  >
                    Selected
                  </Typography>
                )}
              </Box>
            </ButtonBase>

            <ButtonBase
              onClick={handleSelect('trainer')}
              disableRipple
              disableTouchRipple
              focusRipple={false}
              sx={{
                borderRadius: 2,
                width: '100%',
                textAlign: 'left',
                '& .MuiTouchRipple-root': { display: 'none' },
              }}
            >
              <Box
                sx={(t) => {
                  const isSelected = selected === 'trainer';
                  const baseScale = isSelected ? 1.03 : 0.98;

                  return {
                    borderRadius: 2,
                    borderWidth: 2,
                    borderStyle: 'solid',
                    borderColor: isSelected
                      ? t.palette.primary.main
                      : t.palette.divider,
                    p: 2.5,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    gap: 1,
                    boxShadow: isSelected
                      ? '0 10px 24px rgba(15, 23, 42, 0.28)'
                      : '0 3px 8px rgba(15, 23, 42, 0.12)',
                    bgcolor: isSelected
                      ? t.palette.action.hover
                      : t.palette.background.paper,
                    transform: `scale(${baseScale})`,
                    transformOrigin: 'center',
                    transition:
                      'transform 700ms cubic-bezier(0.22, 1, 0.36, 1),' +
                      'box-shadow 700ms cubic-bezier(0.22, 1, 0.36, 1),' +
                      'background-color 250ms ease,' +
                      'border-color 250ms ease',
                    willChange:
                      'transform, box-shadow, background-color, border-color',
                    '&:hover': {
                      transform: `scale(${isSelected ? 1.05 : 1.01})`,
                      boxShadow: isSelected
                        ? '0 14px 32px rgba(15, 23, 42, 0.34)'
                        : '0 6px 14px rgba(15, 23, 42, 0.18)',
                    },
                  };
                }}
              >
                <SportsGymnasticsIcon sx={{ fontSize: 32, mb: 0.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  New trainer
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Register a trainer who will lead activities and be linked to memberships.
                </Typography>
                {selected === 'trainer' && (
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.5,
                      px: 1,
                      py: 0.2,
                      borderRadius: 999,
                      bgcolor: (t) => t.palette.primary.main,
                      color: 'white',
                      fontWeight: 600,
                    }}
                  >
                    Selected
                  </Typography>
                )}
              </Box>
            </ButtonBase>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mt: 1,
            }}
          >
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              disabled={!selected}
              onClick={handleConfirm}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {selected === 'client'
                ? 'Continue to client form'
                : selected === 'trainer'
                ? 'Continue to trainer form'
                : 'Choose a person type'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default QuickPersonCreate;
