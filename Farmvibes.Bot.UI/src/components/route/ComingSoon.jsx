import React from "react";
import { useIntl } from "react-intl";
import { useLocation } from "react-router-dom";

export function ComingSoon() {
  let location = useLocation();
  const intl = useIntl();

  return (
    <div>
      <h3>{intl.formatMessage({ id: "general.page.comingsoon.title" })}</h3>
      <p>
        {intl.formatMessage(
          { id: "general.page.comingsoon.message" },
          { pathname: location.pathname }
        )}
      </p>
    </div>
  );
}
