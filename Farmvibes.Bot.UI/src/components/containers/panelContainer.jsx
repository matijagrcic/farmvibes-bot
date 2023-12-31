import * as React from "react";
import { Panel, Stack, PanelType } from "@fluentui/react";
import { useIntl } from "react-intl";

export const PanelContainer = ({
  panelType,
  panelHidden = true,
  showPanel,
  header,
  content,
  footerContent,
  description,
  lightDismiss,
  panelDismiss,
  panelWidth,
}) => {
  const [panelSize, setPanelSize] = React.useState(null);
  const intl = useIntl();

  React.useEffect(() => {
    switch (panelType) {
      case "medium":
        setPanelSize(PanelType.medium);
        break;

      case "large":
        setPanelSize(PanelType.large);
        break;

      case "custom":
        setPanelSize(PanelType.custom);
        break;

      default:
        setPanelSize(PanelType.smallFixedFar);
        break;
    }
  }, [panelType]);
  return (
    <Panel
      isOpen={panelHidden}
      onDismiss={() => {
        panelDismiss();
      }}
      headerText={header}
      closeButtonAriaLabel={intl.formatMessage({ id: "general.close" })}
      isLightDismiss={lightDismiss}
      type={panelSize}
      isFooterAtBottom={true}
      onRenderFooterContent={footerContent}
      customWidth={panelWidth}
    >
      <Stack>
        <p>{description}</p>
        {content}
      </Stack>
    </Panel>
  );
};
