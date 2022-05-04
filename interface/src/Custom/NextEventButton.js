import { useEffect } from 'react';

import StyledButton from './StyledButton';

// https://devtrium.com/posts/how-keyboard-shortcut

/**
 * A customizable button that listens for a single key press event. Pressing the keyMatch
 * key will trigger the callback function specified by clickFunc.
 * 
 * @param {bool} buttonAvailable whether or not the button can be seen, and also whether or not the callback can be activated
 * @param {} callBackFunc
 * @param {bool} clickFunc a void callback function used for the keyDown event and onClick
 * @param {string} text the label of the button
 * @param {string} keyMatch the key that must be pressed to trigger the callback function
 * @returns 
 */
export default function NextEventButton({buttonAvailable, callBackFunc, clickFunc, text, keyMatch}) {

    useEffect(() => {
        // attach the event listener
        document.addEventListener('keydown', callBackFunc);

        // remove the event listener
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