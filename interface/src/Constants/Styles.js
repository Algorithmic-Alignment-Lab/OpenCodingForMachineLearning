import styled from 'styled-components';
import Button from '@material-ui/core/Button';

export const StyledButton = styled(Button)(({ theme }) => ({
    height: '5vh',
    textTransform: 'none !important',
    '&:disabled': {
        opacity: '0.5 !important',
    }
}));

export const TableStyle = styled.div`
    padding: 0rem;

    table {
        border-spacing: 0;
        border: 0px;
    
        tr { // each row

            height: 3rem;
            &:hover {
                background-color: #efefef;
            }

            :last-child {
                td {
                    border-bottom: 0px;
                }
            }
        }

        th { // the header
            border: 0px;
        }

        td { // each element

            margin: 0;
            padding: 0.5rem;
            border-bottom: 1px solid #efefef;

            input {
                font-size: 1rem;
                padding: 0;
                margin: 0;
                border: 0;
            }
        }
    }
`

export const InputStyle = styled.div`
    padding: 0rem;

    input {
        font-size: 1rem;
        padding: 0;
        margin: 0;
        border: 0;
        width: parent;
        /* padding: 5px 7px; */
        font-size: inherit;
        /* border-radius: 3px; */
        font-weight: normal;
        outline: none
    }
`