import {useEffect } from 'react';
import { StyledButton } from '../Constants/Styles';

/**
 * A customizable button that listens for a single key press event. Pressing the keyMatch
 * key will trigger the callback function specified by clickFunc.
 * 
 * @param {boolean} buttonAvailable - if true, the button is clickable and responsive to keydown events. 
 * @param {() => {}} callBackFunc - a void callback function used for the keyDown event
 * @param {() => {}} clickFunc - a void callback function used for onClick
 * @param {string} text - the label of the button
 * @returns {StyledButton} StyledButton
 */
export default function CallbackKeyEventButton({buttonAvailable, callBackFunc, clickFunc, text}) {

    // handles keydown event activation
    useEffect(() => {
        document.addEventListener('keydown', callBackFunc); 
        return () => {
            document.removeEventListener('keydown', callBackFunc);
        };
    }, [callBackFunc]);

    return (
    <StyledButton variant={'contained'} onClick={clickFunc} disabled={!buttonAvailable}>
        {text}    
    </StyledButton>
    );
}