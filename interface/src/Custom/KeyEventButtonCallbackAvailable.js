import { useCallback, useEffect } from 'react';

import StyledButton from './StyledButton';

// https://devtrium.com/posts/how-keyboard-shortcut

/**
 * A customizable button that listens for a single key press event. Pressing the keyMatch
 * key will trigger the callback function specified by clickFunc.
 * 
 * @param {() => bool)} buttonAvailable callback function for whether or not the button can be seen, and also whether or not the callback can be activated
 * @param {bool} clickFunc a void callback function used for the keyDown event and onClick
 * @param {string} text the label of the button
 * @param {string} keyMatch the key that must be pressed to trigger the callback function
 * @returns 
 */
export default function KeyEventButton({buttonAvailable, clickFunc, text, keyMatch}) {
    // handle what happens on key press
    const handleKeyPress = useCallback((event) => {
        console.log("pressed key: " + event.key);
        console.log("button available: " + buttonAvailable())
        if (event.key === keyMatch && buttonAvailable()){
            console.log('Pressed matching key');
            clickFunc();
        }
    }, []);

    useEffect(() => {
        // attach the event listener
        document.addEventListener('keydown', handleKeyPress);

        // remove the event listener
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);

    return (
        <StyledButton variant={'contained'} onClick={clickFunc} disabled={!buttonAvailable()}>
            {text}
        </StyledButton>
    );
}