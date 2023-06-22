import { red } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

// A custom theme for this app
const theme = createTheme({
  palette: {
    primary: {
      main: '#0099FF',
    },
    secondary: {
      main: '#99EEFF',
    },
    error: {
      main: red.A400,
    },
  },
});

export default theme;
