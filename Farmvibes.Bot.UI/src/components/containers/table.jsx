import * as React from "react";
import {
  Overlay,
  DetailsListLayoutMode,
  Selection,
  SelectionMode,
  ConstrainMode,
  ShimmeredDetailsList,
  Stack,
  IconButton,
  MarqueeSelection,
  mergeStyleSets,
  TextField,
  Announced,
} from "@fluentui/react";
import { MenuItems, TableHeader } from "components/containers";
import { itemsPerPage } from "global/defaultValues";

const classNames = mergeStyleSets({
  fileIconHeaderIcon: {
    padding: 0,
    fontSize: "16px",
  },
  fileIconCell: {
    textAlign: "center",
    selectors: {
      "&:before": {
        content: ".",
        display: "inline-block",
        verticalAlign: "middle",
        height: "100%",
        width: "0px",
        visibility: "hidden",
      },
    },
  },
  fileIconImg: {
    verticalAlign: "middle",
    maxHeight: "16px",
    maxWidth: "16px",
  },
  controlWrapper: {
    display: "flex",
    flexWrap: "wrap",
  },
  exampleToggle: {
    display: "inline-block",
    marginBottom: "10px",
    marginRight: "30px",
  },
  selectionDetails: {
    marginBottom: "20px",
  },
});
const controlStyles = {
  root: {
    margin: "0 30px 20px 0",
    maxWidth: "300px",
  },
};

export const Table = React.memo(
  ({
    cols,
    items,
    isCompactMode,
    locale,
    itemInvoked,
    itemRemove,
    menuActions,
    getRecords,
    loading,
    selected,
    header,
    localeUpdate,
    additionalActions = [],
    evaluateAdditionalActions,
    recordFilters = {},
  }) => {
    const [currentPage, setCurrentPage] = React.useState(1);
    const [hasPreviousPage, setHasPreviousPage] = React.useState(false);
    const [hasNextPage, setHasNextPage] = React.useState(false);
    const [mainActionMenu, setMainActionMenu] = React.useState(menuActions);
    let selection = Selection;
    selection = new Selection({
      onSelectionChanged: () => {
        setSelectionDetails(getSelectionDetails());
        onItemSelected(selection);
      },
    });

    const getSelectionDetails = () => {
      const selectionCount = selection.count;

      switch (selectionCount) {
        case 0:
          return "No items selected";
        case 1:
          return "1 item selected "; /* +  (selection[0]).name */
        default:
          return `${selectionCount} items selected`;
      }
    };

    const stringFormat = (template, ...args) => {
      for (const k in args) {
        template = template.replace("{" + k + "}", args[k]);
      }
      return template;
    };

    const changeLocale = (event, code) => {
      localeUpdate(code);
    };

    const loadFirstPage = () => {
      setCurrentPage(1);
    };
    const loadNextPage = () => {
      setCurrentPage((prev) => prev + 1);
    };
    const loadPreviousPage = () => {
      setCurrentPage((prev) => prev - 1);
    };

    const [records, setRecords] = React.useState([]);

    //We need to append action columns
    const [columns, setColumns] = React.useState([
      ...cols,
      {
        name: "Actions",
        fieldName: `actions`,
        key: `actions`,
        data: "string",
        isRowHeader: true,
        isResizable: true,
        isMultiline: false,
        minWidth: 180,
        onRender: (item) => {
          return (
            <MenuItems
              items={[
                ...additionalActions.map((additionalAction, idx) => {
                  return {
                    ...additionalAction,
                    ...{ onClick: () => evaluateAdditionalActions(item, idx) },
                  };
                }),
                {
                  key: "edit",
                  text: "Edit",
                  iconProps: { iconName: "Edit" },
                  onClick: () => itemInvoked(item),
                  iconOnly: true,
                  buttonStyles: {
                    root: { background: "transparent" },
                  },
                },
                {
                  key: "delete",
                  text: "Delete",
                  iconProps: { iconName: "Delete" },
                  iconOnly: true,
                  onClick: () => itemRemove(item),
                  buttonStyles: {
                    root: { background: "transparent" },
                  },
                },
              ]}
            />
          );
        },
      },
    ]);
    const [selectionDetails, setSelectionDetails] = React.useState(
      getSelectionDetails()
    );

    const onColumnClick = (ev, column) => {
      const newColumns = columns.slice();
      const currColumn = newColumns.filter(
        (currCol) => column.key === currCol.key
      )[0];
      newColumns.forEach((newCol) => {
        if (newCol === currColumn) {
          currColumn.isSortedDescending = !currColumn.isSortedDescending;
          currColumn.isSorted = true;
        } else {
          newCol.isSorted = false;
          newCol.isSortedDescending = true;
        }
      });
      const newItems = copyAndSort(
        items,
        currColumn.fieldName,
        currColumn.isSortedDescending
      );
      setRecords(newItems);
      setColumns(newColumns);
    };

    React.useEffect(() => {
      selection.setAllSelected(false);
      //We need to append column sort function to all provided columns
      columns.forEach((col) => {
        col.onColumnClick = onColumnClick;
      });
      records.forEach(
        (record) => {
          record.key = record.id;
        },
        [records]
      );
    });

    React.useEffect(() => {
      setRecords(() => (items.length > 0 ? [...items] : []));
      if (items.length >= itemsPerPage) setHasNextPage(true);
      else setHasNextPage(false);
    }, [items]);

    const onChangeText = (ev, text) => {
      setRecords(items.filter((i) => includesText(i, text)) || items);
    };

    const includesText = (i, text, deep = false) => {
      return Object.values(i).some((txt) => {
        if (txt !== null && txt.constructor.name === "Object" && deep)
          return includesText(txt, text);
        if (txt !== null && txt.constructor === Array && deep)
          return (
            txt.filter((j) => {
              return includesText(j, text);
            }).length > 0
          );
        if (typeof txt === "string" && txt !== null) {
          return txt.toLowerCase().indexOf(text.toLowerCase()) > -1;
        }
      });
    };

    function getKey(item) {
      return item.id;
    }

    const copyAndSort = (items, columnKey, isSortedDescending) => {
      const key = columnKey;
      return items
        .slice(0)
        .sort((a, b) =>
          (isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1
        );
    };

    const renderItemColumn = (item, index, column) => {
      const fieldContent = item[column.fieldName];
      if (
        item.hasOwnProperty("translations") &&
        item.translations.hasOwnProperty(locale) &&
        item.translations[locale].hasOwnProperty(column.key) &&
        locale !== undefined
      )
        return item.translations[locale][column.key];
      else return fieldContent;
    };

    /* Toggles command bar on the top right of lists when items are selected */
    const onItemSelected = (selections) => {
      const count = selections.count;

      //We have to create a new object to hold the menus otherwise component will re-render resetting mainActionMenu in state
      let updatedMenu = [];
      menuActions.forEach((action) => {
        updatedMenu.push(Object.assign({}, action));

        //If we have no activeCount item, it means button should always be enabled
        if (action.activeCount === undefined) return;

        //Let's create a dynamic function to evaluate how many menu options should be disabled / enabled
        let fn = new Function("count", "return count" + action.activeCount);
        if (fn(count)) updatedMenu[updatedMenu.length - 1]["disabled"] = false;
        else updatedMenu[updatedMenu.length - 1]["disabled"] = true;
      });
      setMainActionMenu(updatedMenu);
      if (selected) selected(selections.getSelection());
    };

    React.useEffect(() => {
      getRecords({
        ...recordFilters,
        ...{ page: currentPage, itemsPerPage: itemsPerPage },
      });
      if (currentPage > 1) setHasPreviousPage(true);
      else setHasPreviousPage(false);
    }, [currentPage]);

    return (
      <div>
        <TableHeader
          menuActions={mainActionMenu}
          header={header}
          searchAction={onChangeText}
          changeLocale={changeLocale}
          locale={locale}
        />
        <Stack horizontal>
          <Stack.Item grow={1}>
            <Announced
              message={`Number of items after filter applied: ${records.length}.`}
            />
            <div className={classNames.selectionDetails}>
              {selectionDetails}
            </div>
            {selectionDetails ? (
              <Announced message={selectionDetails} />
            ) : undefined}
          </Stack.Item>
        </Stack>
        <Stack>
          <Stack.Item>
            <MarqueeSelection selection={selection}>
              <ShimmeredDetailsList
                items={records}
                compact={isCompactMode}
                columns={columns}
                selectionMode={SelectionMode.multiple}
                getKey={getKey}
                setKey='records'
                layoutMode={DetailsListLayoutMode.justified}
                isHeaderVisible={true}
                selection={selection}
                selectionPreservedOnEmptyClick={true}
                onRenderItemColumn={renderItemColumn}
                onItemInvoked={itemInvoked}
                enterModalSelectionOnTouch={true}
                ariaLabelForSelectionColumn='Toggle selection'
                ariaLabelForSelectAllCheckbox='Toggle selection for all items'
                checkButtonAriaLabel='select row'
                constrainMode={ConstrainMode.horizontalConstrained}
                enableShimmer={!records}
                listProps={{
                  renderedWindowsAhead: 0,
                  renderedWindowsBehind: 0,
                }}
              />
            </MarqueeSelection>
          </Stack.Item>
          <Stack.Item align='center' style={{ marginTop: 30 }}>
            <Stack
              horizontal
              style={{ width: "100%" }}
              tokens={{ childrenGap: "5", padding: "l2" }}
            >
              <IconButton
                alt='First Page'
                iconProps={{ iconName: "Rewind" }}
                disabled={!hasPreviousPage}
                onClick={loadFirstPage}
              />
              <IconButton
                alt='Previous Page'
                iconProps={{ iconName: "Previous" }}
                disabled={!hasPreviousPage}
                onClick={loadPreviousPage}
              />
              <Stack.Item
                align='center'
                style={{ width: "32px", textAlign: "center" }}
              >
                {stringFormat(
                  // resources.getString('Label_Grid_Footer'),
                  currentPage.toString(),
                  selection.getSelectedCount().toString()
                )}
              </Stack.Item>
              <IconButton
                alt='Next Page'
                iconProps={{ iconName: "Next" }}
                disabled={!hasNextPage}
                onClick={loadNextPage}
              />
            </Stack>
          </Stack.Item>
          {loading && <Overlay />}
        </Stack>
      </div>
    );
  }
);
