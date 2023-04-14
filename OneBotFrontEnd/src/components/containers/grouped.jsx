import {
  AddIcon,
  Button,
  Divider,
  Flex,
  Menu,
  pxToRem,
  Table,
  Text,
  TrashCanIcon,
  MenuButton,
  MoreIcon,
  gridCellWithFocusableElementBehavior,
  SearchIcon,
  Input,
  FlexItem,
  menuAsToolbarBehavior,
  Loader,
} from "@fluentui/react-northstar";
import { getFromStorage } from "helpers/utils";
import { FontSizes, FontWeights } from "@fluentui/theme";
import { Stack } from "@fluentui/react";
import React from "react";
import { itemsPerPage } from "global/defaultValues";
import {
  updateContentItem,
  updateContentTextItem,
  removeContentTextItem,
} from "redux/actions";
import { useDispatch } from "react-redux";
import { flat } from "helpers/utils";

export const Grouped = ({
  items,
  addFunction,
  removeFunction,
  loading,
  addFunctionTitle,
  pageTitle,
  pageDescription,
  groups,
  header,
  childRow,
  childRowContent,
}) => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [locale, setLocale] = React.useState(getFromStorage("locale"));

  const rowsInternal = React.useMemo(() => {
    const styro = { padding: "15px 0", height: "auto" };
    const newRows = [];
    for (const group of groups) {
      newRows.push({
        key: `group-header-${group.key}`,
        items: [
          {
            content: group.header,
            styles: { flexGrow: 4 },
            key: `header-text-${group.key}`,
          },
          {
            key: `header-created-${group.key}`,
            content: "",
          },
          {
            key: `header-updated-${group.key}`,
            content: "",
          },
          {
            key: `header-actions-${group.key}`,
            content: (
              <Menu
                items={[
                  {
                    icon: (
                      <AddIcon
                        {...{
                          outline: true,
                          size: "small",
                        }}
                      />
                    ),
                    key: `add-to-content-${group.key}`,
                    "aria-label": "Add",
                    onClick: () => {
                      addFunction("create-child", group);
                    },
                  },
                  {
                    icon: (
                      <TrashCanIcon
                        {...{
                          outline: true,
                          size: "small",
                        }}
                      />
                    ),
                    key: `remove-content-${group.key}`,
                    "aria-label": "Delete",
                    onClick: () => {
                      removeFunction({ id: group.key });
                      setTimeout(() => window.location.reload(false), 3000);
                    },
                  },
                ]}
                iconOnly
                accessibility={menuAsToolbarBehavior}
                aria-label='Content Actions'
              />
            ),
          },
        ],
        header: true,
        className: "ui-table_group_header",
      });

      if (group.items !== undefined)
        newRows.push(
          ...group.items.map((item) => {
            return {
              styles: styro,
              key: `row-item-${item.id}`,
              items: [
                {
                  key: `cell-item-text-${item.id}`,
                  content: Array.isArray(item[childRow])
                    ? item[childRow].length > 0
                      ? item[childRow][0][childRowContent]
                      : ""
                    : item[childRow],
                  styles: { flexGrow: 4 },
                },
                {
                  key: `cell-item-created-${item.id}`,
                  content: item.createdAt,
                  styles: { flexGrow: 1 },
                },
                {
                  key: `cell-item-updated-${item.id}`,
                  content: item.updatedAt,
                  styles: { flexGrow: 1 },
                },
                {
                  key: `cell-item-actions-${item.id}`,
                  content: (
                    <MenuButton
                      trigger={
                        <Button
                          icon={<MoreIcon />}
                          iconOnly
                          title='More options'
                          text
                          aria-label='Click button'
                        />
                      }
                      menu={[
                        {
                          key: `edit-item-${item.id}`,
                          content: <Text content='Edit' />,
                          onClick: (e) => {
                            dispatch(
                              updateContentItem({
                                text: item.raw.map((variant, index) => {
                                  return {
                                    ...variant,
                                    id: Object.keys(
                                      item.contentTextVariants[index]
                                        .translations
                                    ).reduce((prev, translation) => {
                                      return {
                                        ...prev,
                                        ...{
                                          [translation]:
                                            item.contentTextVariants[index]
                                              .translations[translation].id,
                                        },
                                      };
                                    }, {}),
                                  };
                                }),
                                ...flat(group.label),
                                content: group.key,
                                id: group.key,
                              })
                            );
                            addFunction("edit-text");
                          },
                        },
                        {
                          key: `publish-item-${item.id}`,
                          content: (
                            <Text
                              content={
                                item.isPublished ? "Unpublish" : "Publish"
                              }
                            />
                          ),
                          onClick: (e) => {
                            e.preventDefault();
                            dispatch(
                              updateContentTextItem({
                                id: item.id,
                                isPublished: !item.isPublished,
                              })
                            );
                            setTimeout(
                              () => window.location.reload(false),
                              3000
                            );
                          },
                        },
                        {
                          key: `remove-item-${item.id}`,
                          content: <Text content='Remove' />,
                          onClick: (e) => {
                            e.preventDefault();
                            dispatch(
                              removeContentTextItem({
                                id: item.id,
                              })
                            );
                            setTimeout(
                              () => window.location.reload(false),
                              3000
                            );
                          },
                        },
                      ]}
                      on='click'
                    />
                  ),
                  accessibility: gridCellWithFocusableElementBehavior,
                  onClick: (e) => {
                    e.stopPropagation();
                  },
                  styles: { flexGrow: 1 },
                },
              ],
            };
          })
        );
    }
    return newRows;
  }, [groups]);

  return (
    <>
      <Stack>
        <h1 style={{ fontSize: FontSizes.size42 }}>
          {pageTitle}
          <span
            style={{
              fontSize: FontSizes.size16,
              fontWeight: FontWeights.regular,
              margin: "0px 0px 0px 23px",
            }}
            className={"subTitle-117"}
          >
            {pageDescription}
          </span>
        </h1>
      </Stack>
      <Flex column padding='padding.medium' gap='gap.small'>
        <Flex space='between'>
          <FlexItem>
            <Menu
              iconOnly
              styles={{
                position: "sticky",
                top: 0,
                zIndex: 100,
                alignItems: "stretch",
              }}
              items={[
                {
                  key: "add-item-main",
                  content: (
                    <Button
                      iconOnly
                      text
                      icon={<AddIcon />}
                      content={
                        <Text weight='regular' content={addFunctionTitle} />
                      }
                      onClick={() => {
                        addFunction();
                      }}
                    />
                  ),
                  styles: { border: "transparent" },
                },
                {
                  content: <Divider vertical size={0} />,
                  disabled: true,
                  active: false,
                  styles: {
                    height: "100%",
                    alignSelf: "stretch",
                    "& .ui-menu__itemcontent": {
                      height: "100%",
                    },
                  },
                  key: "divider",
                },
                {
                  content: <Text content={`${items} items`} color='default' />,
                  disabled: true,
                  active: false,
                  as: "div",
                  key: "items-counter",
                },
              ]}
            />
          </FlexItem>
          <FlexItem>
            <Input icon={<SearchIcon />} placeholder='Search...' />
          </FlexItem>
        </Flex>
        <Table
          styles={{
            "& .ui-table_group_header": {
              position: "sticky",
              top: pxToRem(81),
              zIndex: 300,
            },
          }}
          header={{
            styles: {
              position: "sticky",
              top: pxToRem(33),
              zIndex: 200,
              fontSize: pxToRem(12),
            },
            items: header,
            compact: false,
          }}
          rows={rowsInternal}
        />
        {loading && (
          <Loader size='largest' label='loading' labelPosition='below' />
        )}
      </Flex>
    </>
  );
};
