import React from "react";
import { Status, Button, Text } from "@fluentui/react-northstar";

export const ItemStatus = ({ status, text, field }) => {
  return (
    <div>
      <Button
        text
        iconOnly
        primary
        size='small'
        icon={<Status state={status} title={text} />}
        content={<Text content={text} />}
      />
    </div>
  );
};
