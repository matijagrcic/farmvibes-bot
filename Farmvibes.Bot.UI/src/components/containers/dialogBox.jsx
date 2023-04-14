import * as React from 'react';
import { Dialog, DialogType, DialogFooter, PrimaryButton, DefaultButton } from '@fluentui/react';

export const DialogBox = ({content, title, leadingText,  showDialog, proceedFunction, dialogHidden, confirm, cancel, params}) => {
  const modelProps = {
        isBlocking: false,
        styles: { main: { maxWidth: 450 } },
      };

    const dialogContentProps = {
        type: DialogType.largeHeader,
        title: title,
        subText: leadingText,
      };
  return (
    <>
      <Dialog
        dialogContentProps={dialogContentProps}
        modalProps={modelProps}
        hidden={dialogHidden}
      >
        {content}
        <DialogFooter>
          <PrimaryButton onClick={() => { proceedFunction(params); showDialog()}} text={confirm} />
          <DefaultButton onClick={() => showDialog()} text={cancel} />
        </DialogFooter>
      </Dialog>
    </>
  );
};
