import * as React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import logo from './static/AAGLogo.png';
import { AppBar } from '@mui/material';
import LinkButton from './../LinkButton.js'
import LogoDevIcon from '@mui/icons-material/LogoDev';

function Header(props) {
  const {title} = props;

  return (
    <React.Fragment>
      <AppBar color="secondary">
      <Toolbar variant="dense" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <LinkButton size="medium" to="/NLPDocTool">Home</LinkButton>
        <Typography
          component="h2"
          variant="h5"
          color="inherit"
          align="center"
          noWrap
          sx={{ flex: 1 }}
        >
          {title}
        </Typography>
        
        <IconButton onClick={() => console.log("hi")}>
          {/* <Avatar variant='square' alt="AAG Logo" src={logo} 
          imgProps={{
            // typescript error, sx not allowed
            sx: {
              objectFit: 'contain',
            },
            onError: (event) => console.log( event )
            }
          }
          sx={{ width: 90, height: 60 }} 
          /> */}
          <LogoDevIcon fontSize="large"/>
        </IconButton>
        
      </Toolbar>
      {/* <Toolbar
        component="nav"
        variant="dense"
        sx={{ justifyContent: 'space-between', overflowX: 'auto' }}
      >
        {sections.map((section) => (
          <Link
            color="inherit"
            noWrap
            key={section.title}
            variant="body2"
            href={section.url}
            sx={{ p: 1, flexShrink: 0 }}
          >
            {section.title}
          </Link>
        ))}
      </Toolbar> */}
      </AppBar>
    </React.Fragment>
  );
}

Header.propTypes = {
  // sections: PropTypes.arrayOf(
  //   PropTypes.shape({
  //     title: PropTypes.string.isRequired,
  //     url: PropTypes.string.isRequired,
  //   }),
  // ).isRequired,
  title: PropTypes.string.isRequired,
};

export default Header;
