import { Flex, SearchIcon, Input, Text } from "@fluentui/react-northstar";
import React from "react";
import { useIntl } from "react-intl";
import { MenuItems } from "components/containers";
import { Stack, useTheme } from "@fluentui/react";
import { CancelIcon } from "@fluentui/react-icons-mdl2";
import { FontSizes, FontWeights } from "@fluentui/theme";

export function TableHeader({
  header,
  searchAction,
  searchQuery,
  onDBSearch,
  menuActions,
  description,
}) {
  const { palette } = useTheme();
  const intl = useIntl();
  return (
    <>
      <Stack horizontal style={{ marginTop: "20px" }} horizontalAlign="end">
        <Stack.Item grow={3}>
          <MenuItems
            items={menuActions}
            styles={{ root: { paddingLeft: "0px" } }}
            farItems={[
              {
                key: "filters",
                text: "Filter",
                iconProps: { iconName: "Filter" },
              },
            ]}
          ></MenuItems>
        </Stack.Item>
        <Stack.Item>
          <Input
            icon={
              <>
                {((onDBSearch && searchQuery.length > 0) ||
                  searchQuery.length === 0) && (
                  <SearchIcon
                    styles={{ cursor: "pointer" }}
                    onClick={(event) =>
                      onDBSearch &&
                      searchQuery.length > 0 &&
                      onDBSearch(
                        event.currentTarget.parentElement.previousSibling.value
                      )
                    }
                  />
                )}

                {searchQuery.length > 0 && (
                  <CancelIcon
                    styles={{ cursor: "pointer" }}
                    onClick={() =>
                      onDBSearch && searchQuery.length > 0
                        ? onDBSearch("")
                        : searchAction("")
                    }
                  />
                )}
              </>
            }
            variables={{
              borderColor: palette.themePrimary,
              borderRadius: 0,
              iconColor: palette.themePrimary,
              placeholderColor: palette.neutralTertiaryAlt,
              borderWidth: "1px",
              backgroundColor: palette.white,
            }}
            style={{ marginTop: "5px" }}
            value={searchQuery}
            placeholder={`${intl.formatMessage({
              id: "general.list.search",
            })}`}
            onChange={(event) => searchAction(event.currentTarget.value)}
            onKeyDown={(event) => {
              event.key === "Enter" &&
                onDBSearch &&
                onDBSearch(event.currentTarget.value);
            }}
          />
        </Stack.Item>
        <Stack.Item style={{ marginTop: "5px", marginLeft: "10px" }}>
          {/* <LocaleSwitcher locale={locale} _onChange={changeLocale} /> */}
        </Stack.Item>
      </Stack>
      <Flex
        style={{
          marginTop: "20px",
        }}
      >
        <Text color="brand" size="largest" weight="bold">
          {header}
        </Text>
        <Text
          style={{
            fontSize: FontSizes.size16,
            fontWeight: FontWeights.regular,
            margin: "12px 0px 0px 23px",
          }}
        >
          {description}
        </Text>
      </Flex>
    </>
  );
}
