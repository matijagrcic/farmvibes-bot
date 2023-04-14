import * as React from "react";
import { MenuItems } from ".";

export const ContextMenu = ({ menuButtons, linkRef, onMenuRender }) => {
  const dimensions = linkRef === null ? null : linkRef.getBoundingClientRect();
  const menuOpened = (items) => {
    console.log(items);
  };
  return (
    <div
      style={{
        position: "absolute",
        zIndex: 20,
        top:
          dimensions.top +
          document.body.scrollTop +
          document.documentElement.scrollTop +
          7,
      }}
    >
      <MenuItems
        items={menuButtons}
        onMenuOpened={menuOpened}
        onMenuRender={onMenuRender}
      ></MenuItems>
    </div>
  );
};
