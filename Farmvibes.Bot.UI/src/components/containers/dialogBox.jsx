import * as React from "react";

import { CloseIcon, Dialog } from "@fluentui/react-northstar";
import { useIntl } from "react-intl";

export const DialogBox = ({
  content,
  title,
  showDialog,
  proceedFunction,
  dialogHidden,
  confirm,
  cancel,
  params,
}) => {
  const intl = useIntl();
  return (
    <>
      <Dialog
        cancelButton={cancel}
        confirmButton={confirm}
        content={content}
        header={title}
        open={dialogHidden}
        onCancel={() => {
          showDialog();
        }}
        onConfirm={() => {
          proceedFunction(params);
          showDialog();
        }}
        headerAction={{
          icon: <CloseIcon />,
          title: intl.formatMessage({ id: "general.close" }),
          onClick: () => showDialog(),
        }}
      />
    </>
  );
};
