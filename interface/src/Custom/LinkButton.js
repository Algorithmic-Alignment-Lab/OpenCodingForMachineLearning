// from NLPDocTool/src/LinkButton.js
import React from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const LinkButton = (props) => {
	let location = useLocation();
	let navigate = useNavigate();
	let params = useParams();
	const {
		match,
		staticContext,
		to,
		onClick,
		router = {
			location,
			navigate,
			params,
		},
		// ⬆ filtering out props that `button` doesn’t know what to do with.
		...rest
	} = props;

	return (
		<Button
			{...rest} // `children` is just another prop!
			onClick={(event) => {
				onClick && onClick(event);
				router.navigate(to);
			}}
		/>
	);
};

LinkButton.propTypes = {
	to: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
};

export default LinkButton;
