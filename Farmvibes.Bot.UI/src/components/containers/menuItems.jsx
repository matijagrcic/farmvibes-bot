import * as React from "react";
import { CommandBar } from "@fluentui/react";

export const MenuItems = React.memo(
  ({
    items,
    overflowItems,
    overflowProps,
    farItems,
    ariaLabel,
    primaryGroupAriaLabel,
    farItemsGroupAriaLabel,
    buttonAs,
    onMenuRender,
    styles,
  }) => {
    return (
      <CommandBar
        items={items}
        overflowItems={overflowItems}
        overflowButtonProps={overflowProps}
        farItems={farItems}
        ariaLabel={ariaLabel}
        primaryGroupAriaLabel={primaryGroupAriaLabel}
        farItemsGroupAriaLabel={farItemsGroupAriaLabel}
        splitButtonAriaLabel={"More New options"}
        buttonAs={buttonAs}
        onRenderMenuList={onMenuRender}
        styles={{ ...{ root: { background: "transparent" } }, ...styles }}
      />
    );
  }
);
