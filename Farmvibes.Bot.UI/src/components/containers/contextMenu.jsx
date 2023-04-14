import * as React from "react";
import { MenuItems } from ".";

export const ContextMenu = ({ menuButtons, linkRef, onMenuRender }) => {
  const dimensions =
    linkRef === null
      ? null
      : document
          .getElementById(linkRef["__data__"]["id"])
          .getBoundingClientRect();
  const menuOpened = (items) => {
    console.log(items);
  };
  let offset =
    localStorage.getItem("NavToggler.isNavCollapsed") === "true" ||
    window.innerWidth < 720
      ? 47
      : 280;

  return (
    <div
      style={{
        position: "absolute",
        top:
          dimensions.top +
          document.body.scrollTop +
          document.documentElement.scrollTop -
          110,
        left:
          dimensions.x +
          document.body.scrollLeft +
          document.documentElement.scrollLeft -
          offset,
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
