import {
  AddIcon,
  Button,
  Flex,
  Menu,
  pxToRem,
  Table,
  Text,
  TrashCanIcon,
  MenuButton,
  MoreIcon,
  gridCellWithFocusableElementBehavior,
  FlexItem,
  menuAsToolbarBehavior,
  Loader,
} from "@fluentui/react-northstar";
import { IconButton } from "@fluentui/react";
import { includesText } from "helpers/utils";
import { useIntl } from "react-intl";
import React from "react";
import { itemsPerPage } from "global/defaultValues";
import { TableHeader } from "./tableHeader";
import { updateContentTextItem } from "redux/actions";
import { useDispatch } from "react-redux";
import get from "lodash.get";

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
  getRecords,
  searchColumns,
  editChildItemFunction,
  removeChildItemFunction,
  menuActions,
}) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsInternal, setRowsInternal] = React.useState([]);
  const [hasPreviousPage, setHasPreviousPage] = React.useState(false);
  let searchDb = true;
  const [searchQuery, setSearchQuery] = React.useState("");
  const [hasNextPage, setHasNextPage] = React.useState(false);
  const loadFirstPage = () => {
    setCurrentPage(1);
  };
  const loadNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };
  const loadPreviousPage = () => {
    setCurrentPage((prev) => prev - 1);
  };

  const onChangeText = (text) => {
    searchDb = false;
    setSearchQuery(text);
    if (text.length > 2) {
      let itms = groups.filter((i) => includesText(i, text, true)) || groups;
      setRowsInternal(buildItems(itms));
    } else setRowsInternal(buildItems(groups));
  };

  const onDBSearch = (text) => {
    searchDb = true;
    setSearchQuery(text);
    setCurrentPage(1);
    fetchRecords();
  };

  const buildItems = (collection) => {
    const styro = { padding: "15px 0", height: "auto" };
    const newRows = [];
    for (const group of collection) {
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
                    key: `add-to-parent-${group.key}`,
                    "aria-label": intl.formatMessage({ id: "general.add" }),
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
                    "aria-label": intl.formatMessage({ id: "general.delete" }),
                    onClick: () => {
                      removeFunction({ id: group.key });
                    },
                  },
                ]}
                iconOnly
                accessibility={menuAsToolbarBehavior}
                aria-label={intl.formatMessage({ id: "general.actions" })}
              />
            ),
          },
        ],
        header: true,
        className: "ui-table_group_header",
      });

      if (group.items !== undefined) {
        newRows.push(
          ...group.items.map((item) => {
            let itemId = item.id || item;
            return {
              styles: styro,
              key: `row-item-${itemId}`,
              items: [
                {
                  key: `cell-item-text-${itemId}`,
                  content: Array.isArray(item[childRow])
                    ? item[childRow].length > 0
                      ? get(item, `${childRow}.0.${childRowContent}`)
                      : ""
                    : item[childRow],
                  styles: { flexGrow: 4 },
                },
                {
                  key: `cell-item-created-${itemId}`,
                  content: intl.formatDate(new Date(item.createdAt), {
                    year: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "numeric",
                    day: "numeric",
                  }),
                  styles: { flexGrow: 1 },
                },
                {
                  key: `cell-item-updated-${itemId}`,
                  content: intl.formatDate(new Date(item.updatedAt), {
                    year: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "numeric",
                    day: "numeric",
                  }),
                  styles: { flexGrow: 1 },
                },
                {
                  key: `cell-item-actions-${itemId}`,
                  content: (
                    <MenuButton
                      trigger={
                        <Button
                          icon={<MoreIcon />}
                          iconOnly
                          title={intl.formatMessage({
                            id: "general.more.actions",
                          })}
                          text
                          aria-label={intl.formatMessage({
                            id: "general.more.actions",
                          })}
                        />
                      }
                      menu={[
                        {
                          key: `edit-item-${itemId}`,
                          content: (
                            <Text
                              content={intl.formatMessage(
                                {
                                  id: "general.edit",
                                },
                                { subject: "" }
                              )}
                            />
                          ),
                          onClick: (e) => {
                            editChildItemFunction(item, group);
                            addFunction("edit-item");
                          },
                        },
                        {
                          key: `publish-item-${itemId}`,
                          content: (
                            <Text
                              content={
                                item.isPublished
                                  ? intl.formatMessage(
                                      {
                                        id: "general.unpublish",
                                      },
                                      { subject: "" }
                                    )
                                  : intl.formatMessage(
                                      {
                                        id: "general.publish",
                                      },
                                      { subject: "" }
                                    )
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
                          key: `remove-item-${itemId}`,
                          content: (
                            <Text
                              content={intl.formatMessage(
                                {
                                  id: "general.remove",
                                },
                                { subject: "" }
                              )}
                            />
                          ),
                          onClick: (e) => {
                            e.preventDefault();
                            removeChildItemFunction(item.id, group.key);
                          },
                        },
                      ]}
                      on="click"
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
    }
    return newRows;
  };

  const fetchRecords = () => {
    if (searchDb) {
      let query = {};
      searchColumns.forEach(
        (col) => (query = { ...query, [col]: searchQuery })
      );
      getRecords({ _page: currentPage, itemsPerPage: itemsPerPage, ...query });
      if (currentPage > 1) setHasPreviousPage(true);
      else setHasPreviousPage(false);
    }
  };

  React.useEffect(() => {
    let itemRows = buildItems(groups);
    setRowsInternal(itemRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  React.useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  React.useEffect(() => {
    if (items >= itemsPerPage) setHasNextPage(true);
    else setHasNextPage(false);
  }, [items]);

  return (
    <>
      <TableHeader
        header={pageTitle}
        searchAction={onChangeText}
        onDBSearch={onDBSearch}
        searchQuery={searchQuery}
        description={pageDescription}
        menuActions={menuActions}
      />
      <Flex column padding="padding.medium" gap="gap.small">
        <Flex space="between">
          <FlexItem>
            <Text
              content={intl.formatMessage(
                {
                  id: "general.list.count",
                },
                { count: items }
              )}
              color="default"
            />
          </FlexItem>
        </Flex>
        {loading ? (
          <Loader
            size="largest"
            label={intl.formatMessage(
              {
                id: "general.loading",
              },
              { subject: addFunctionTitle }
            )}
            labelPosition="below"
          />
        ) : (
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
        )}

        <Flex
          style={{ width: "100%" }}
          tokens={{ childrenGap: "5", padding: "l2" }}
          hAlign="center"
        >
          <IconButton
            iconProps={{ iconName: "Rewind" }}
            disabled={!hasPreviousPage}
            onClick={loadFirstPage}
            ariaLabel={intl.formatMessage({ id: "general.pagination.first" })}
          />
          <IconButton
            iconProps={{ iconName: "Previous" }}
            disabled={!hasPreviousPage}
            onClick={loadPreviousPage}
            ariaLabel={intl.formatMessage({
              id: "general.pagination.previous",
            })}
          />
          <FlexItem
            align="center"
            style={{ width: "32px", textAlign: "center" }}
          >
            <Text
              content={currentPage.toString()}
              aria-label={intl.formatMessage(
                {
                  id: "general.pagination.current",
                },
                { page: currentPage.toString() }
              )}
            />
          </FlexItem>
          <IconButton
            alt="Next Page"
            iconProps={{ iconName: "Next" }}
            disabled={!hasNextPage}
            onClick={loadNextPage}
            ariaLabel={intl.formatMessage({ id: "general.pagination.next" })}
          />
        </Flex>
      </Flex>
    </>
  );
};
