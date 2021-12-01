import React from "react";
import cx from "classnames";

import "./Button.scss";

export const Button = ({ children, onClick, type }) => <button onClick={onClick} className={cx({
    "c-button": true,
    "c-button--primary": type === 'primary',
    "c-button--secondary": type === 'secondary',
})}>{ children }</button>;

