import Button from '@material-ui/core/Button';
import styled from 'styled-components';

const StyledButton = styled(Button)(({ theme }) => ({
    height: '5vh',
    textTransform: 'none !important',
    '&:disabled': {
        opacity: '0.5 !important',
    }
}));

export default StyledButton;