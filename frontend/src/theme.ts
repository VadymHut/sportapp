import { createTheme } from '@mui/material/styles';

const darkRed = '#8B0000';
const gray100 = '#f5f6f7';
const gray700 = '#4a5568';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: darkRed },
    secondary: { main: gray700 },
    background: { default: gray100, paper: '#fff' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
  styleOverrides: {
    '*': { boxSizing: 'border-box' },
    html:  { height: '100%', margin: 0, padding: 0, overflow: 'visible' },
    body:  { height: '100%', margin: 0, padding: 0, overflow: 'visible' },
    '#root': { height: '100%', overflow: 'visible' },

    '.RaLayout-root, .RaLayout-appFrame, .RaLayout-content': {
      marginTop: '0 !important',
      paddingTop: '0 !important',
    },
  },
},

    MuiPaper: { styleOverrides: { root: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } } },
    MuiTableRow: { styleOverrides: { root: { '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 10 } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiToolbar: { styleOverrides: { root: { minHeight: 64 } } },
    MuiTableCell: { styleOverrides: { root: { paddingTop: 10, paddingBottom: 10 } } },
    MuiInputBase: { styleOverrides: { root: { background: '#fff' } } },
  },
  typography: { fontSize: 14 },
});
