import React from "react";
import { Button, Link } from "@fluentui/react";
import { useNavigate } from "react-router-dom";

export function RouteLink(props) {
  const navigate = useNavigate();
  const handleClick = (e) => {
    e.preventDefault();
    props.href && navigate(props.href);
  };

  return <Link {...props} onClick={handleClick} as={Button} />;
}
