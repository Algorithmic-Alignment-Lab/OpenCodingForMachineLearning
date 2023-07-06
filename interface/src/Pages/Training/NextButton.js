import { useEffect } from "react";

import Button from "@material-ui/core/Button";

/**
 *
 * A custom button for Verification that uses index to determine enabled-ness.
 *
 * @param {boolean} buttonAvailable whether or not button can be used
 * @param {() => {}} clickFunc callback function to occur onClick and on KeyPressEvent
 * @param {number} currIndex index representing user's current location in the verification process
 * @param {number} maxIndex index representing max possible location in the verification process
 * @param {string} text label of button
 * @param {boolean} hidden whether or not the button can be seen
 *
 * @returns {Object} Button
 */
export default function NextButton({
	buttonAvailable,
	handleNextButton,
	clickFunc,
	currIndex,
	maxIndex,
	text,
	hidden,
}) {
	useEffect(() => {
		// attach the event listener
		document.addEventListener("keydown", handleNextButton);

		// remove the event listener
		return () => {
			document.removeEventListener("keydown", handleNextButton);
		};
	}, [handleNextButton]);

	let opacity = hidden ? 0 : 1;

	return (
		<div style={{ opacity: opacity }}>
			<Button
				onClick={clickFunc}
				disabled={!buttonAvailable || currIndex >= maxIndex}
			>
				{text}
			</Button>
		</div>
	);
}
