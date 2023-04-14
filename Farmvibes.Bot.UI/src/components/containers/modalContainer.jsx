import {
  getTheme,
  mergeStyleSets,
  FontWeights,
  Modal,
  Stack,
  IconButton,
} from "@fluentui/react";
import * as React from "react";
import { useId } from "@fluentui/react-hooks";
import { FormattedMessage, useIntl } from "react-intl";

export function ModalContainer({
  title,
  content,
  modalHidden,
  showModal,
  loading,
}) {
  const theme = getTheme();
  const intl = useIntl();
  const cancelIcon = { iconName: "Cancel" };
  const contentStyles = mergeStyleSets({
    container: {
      display: "flex",
      flexFlow: "column nowrap",
      alignItems: "stretch",
    },
    header: [
      theme.fonts.xLargePlus,
      {
        flex: "1 1 auto",
        borderTop: `4px solid ${theme.palette.themePrimary}`,
        color: theme.palette.neutralPrimary,
        display: "flex",
        alignItems: "center",
        fontWeight: FontWeights.semibold,
        padding: "12px 12px 14px 24px",
      },
    ],
    body: {
      flex: "4 4 auto",
      padding: "0 24px 24px 24px",
      overflowY: "hidden",
      selectors: {
        p: { margin: "14px 0" },
        "p:first-child": { marginTop: 0 },
        "p:last-child": { marginBottom: 0 },
      },
    },
  });
  const iconButtonStyles = {
    root: {
      color: theme.palette.neutralPrimary,
      marginLeft: "auto",
      marginTop: "4px",
      marginRight: "2px",
    },
    rootHovered: {
      color: theme.palette.neutralDark,
    },
  };
  const titleId = useId("title");

  return (
    <div>
      <Stack horizontal>
        <Modal
          titleAriaId={titleId}
          isOpen={modalHidden}
          onDismiss={() => showModal()}
          isBlocking={false}
          containerClassName={contentStyles.container}
          // onLayerDidMount={() => { layerDidMount(inputValues)}}
        >
          <div className={contentStyles.header}>
            <span id={titleId}>{title}</span>
            <IconButton
              styles={iconButtonStyles}
              iconProps={cancelIcon}
              ariaLabel={intl.formatMessage({ id: "general.modal.close" })}
              onClick={() => showModal()}
            />
          </div>
          <div className={contentStyles.body}>
            {loading && (
              <div>
                <FormattedMessage
                  id="general.loading"
                  values={{ subject: "" }}
                />
              </div>
            )}
            {content}
          </div>
        </Modal>
      </Stack>
    </div>
  );
}
