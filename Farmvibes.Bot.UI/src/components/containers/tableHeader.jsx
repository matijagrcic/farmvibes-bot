import {
  Flex,
  FlexItem,
  SearchIcon,
  Input,
  Text,
  Segment,
} from "@fluentui/react-northstar";
import React from "react";
import { MenuItems } from "components/containers";
import { Stack, StackItem, useTheme } from "@fluentui/react";
import { LocaleSwitcher } from "components/localeSwitcher";

export function TableHeader({
  menuActions,
  filters,
  searchFields,
  header,
  searchAction,
  locale,
  changeLocale,
}) {
  const { palette } = useTheme();
  return (
    <>
      <Stack horizontal style={{ marginTop: "20px" }}>
        <StackItem grow={3}>
          <MenuItems
            items={menuActions}
            styles={{ root: { paddingLeft: "0px" } }}
            farItems={[
              {
                key: "filters",
                text: "Filter",
                cacheKey: "myCacheKey", // changing this key will invalidate this item's cache
                iconProps: { iconName: "Filter" },
              },
            ]}
          ></MenuItems>
        </StackItem>
        <StackItem grow={2}>
          <Input
            fluid
            icon={<SearchIcon />}
            variables={{
              borderColor: palette.themePrimary,
              borderRadius: 0,
              iconColor: palette.themePrimary,
              placeholderColor: palette.neutralTertiaryAlt,
              borderWidth: "1px",
              backgroundColor: palette.white,
            }}
            style={{ marginTop: "5px" }}
            placeholder='Search...'
            onChange={(event) => searchAction(event, event.currentTarget.value)}
          />
        </StackItem>
        <StackItem style={{ marginTop: "5px", marginLeft: "10px" }}>
          <LocaleSwitcher locale={locale} _onChange={changeLocale} />
        </StackItem>
      </Stack>
      <Flex>
        <Text
          color='brand'
          size='largest'
          weight='bold'
          style={{ marginTop: "40px", marginBottom: "10px" }}
        >
          {header}
        </Text>
      </Flex>
    </>
  );
}
