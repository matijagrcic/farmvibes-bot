import React from "react";
import { connect } from "react-redux";
import { Text } from "@fluentui/react-northstar";
import {
  createContent,
  getContents,
  updateContent,
  removeContent,
  updateContentItem,
  createContentItem,
  resetContentItem,
  removeContentTextItem,
} from "../../redux/actions";
import { getStyles } from "components/layout/Sidebar/Nav/Nav.styles";
import { PanelContainer, Grouped } from "components/containers";
import { styled } from "@fluentui/react";
import ContentForm from "components/forms/contentForm";
import { useIntl } from "react-intl";
import { flat } from "helpers/utils";
import { useLocalStorage } from "react-use-storage";

const Contents = ({
  data,
  loading,
  contents,
  getContentsAction,
  createContentAction,
  removeContentAction,
  updateContentItemAction,
  createContentItemAction,
  resetContentItemAction,
  removeContentTextItemAction,
}) => {
  const intl = useIntl();
  const [locale] = useLocalStorage("locale");
  const [panelHidden, setPanelHidden] = React.useState(false);
  const [panelTitle, setPanelTitle] = React.useState("");
  const [currentAction, setCurrentAction] = React.useState("");
  const showPanel = () => {
    return setPanelHidden(!panelHidden);
  };

  const onPanelDismiss = () => {
    showPanel();
    resetContentItemAction();
  };

  const addContent = (action = "create", group = null) => {
    if (group !== null) updateChild(group);
    let title = intl.formatMessage({ id: "content" }, { count: 1 });
    if (action !== null && action.includes("edit")) {
      title = intl.formatMessage({ id: "general.edit" }, { subject: title });
    } else {
      title = intl.formatMessage({ id: "general.add" }, { subject: title });
    }

    setCurrentAction(action);
    setPanelTitle(title);
    showPanel();
  };

  const updateChild = (group) => {
    updateContentItemAction({
      ...flat(group.label),
      content: group.key,
      id: group.key,
    });
  };

  const fetchRecords = (payload) => {
    getContentsAction(payload);
  };

  const menuActions = [
    {
      key: "newItem",
      text: intl.formatMessage(
        { id: "general.add" },
        { subject: intl.formatMessage({ id: "content" }, { count: 1 }) }
      ),
      iconProps: { iconName: "Add" },
      onClick: () => {
        addContent();
      },
    },
  ];

  const editItemFunction = (item, group) => {
    updateContentItemAction({
      text: item.raw.map((variant, index) => {
        return {
          ...variant,
          id: Object.keys(item.contentTextVariants[index].translations).reduce(
            (prev, translation) => {
              return {
                ...prev,
                ...{
                  [translation]:
                    item.contentTextVariants[index].translations[translation]
                      .id,
                },
              };
            },
            {}
          ),
        };
      }),
      ...flat(group.label),
      content: group.key,
      id: item.id,
    });
  };

  const removeItemFunction = (id, group) => {
    removeContentTextItemAction({
      id,
      group,
    });
  };

  React.useEffect(() => {
    if (loading === false) setPanelHidden(false);
  }, [loading]);

  return (
    <>
      <Grouped
        items={contents === undefined ? 0 : contents.length}
        getRecords={fetchRecords}
        addFunction={addContent}
        removeFunction={removeContentAction}
        updateChild={updateChild}
        editChildItemFunction={editItemFunction}
        removeChildItemFunction={removeItemFunction}
        loading={loading}
        addFunctionTitle={intl.formatMessage({ id: "content" }, { count: 1 })}
        pageTitle={intl.formatMessage({ id: "content.page.title" })}
        pageDescription={intl.formatMessage({ id: "content.page.description" })}
        childRow={"contentTextVariants"}
        childRowContent={`translations.${locale}.text`}
        menuActions={menuActions}
        searchColumns={[
          `[translations.label]`,
          `or[text.contentTextVariants.translations.text]`,
        ]}
        groups={contents.map((item) => {
          return {
            key: item.id,
            items: item.text,
            label: { translations: item.translations },
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            collapsible: false,
            header: (
              <Text
                content={`${item.translations[locale]?.label}`}
                size="large"
              />
            ),
          };
        })}
        header={[
          {
            content: intl.formatMessage({ id: "general.description" }),
            styles: { flexGrow: 4 },
            key: "header-title-description",
          },
          {
            content: intl.formatMessage({ id: "general.created.on" }),
            styles: { flexGrow: 1 },
            key: "header-title-created",
          },
          {
            content: intl.formatMessage({ id: "general.updated.on" }),
            styles: { flexGrow: 1 },
            key: "header-title-updated",
          },
          { content: "", styles: { flexGrow: 1 }, key: "header-title-actions" },
        ]}
        locale={locale}
      />
      {panelHidden > 0 && (
        <PanelContainer
          panelWidth="546px"
          panelType="custom"
          panelDismiss={onPanelDismiss}
          lightDismiss={false}
          header={panelTitle}
          showPanel={showPanel}
          content={
            <ContentForm
              createContent={createContentAction}
              createText={createContentItemAction}
              action={currentAction}
              content={data}
              onPanelDismiss={onPanelDismiss}
            />
          }
          description=""
        />
      )}
    </>
  );
};
const mapStateToProps = ({ contentReducer }) => {
  const { loading, contents, error, data } = contentReducer;
  return { loading, error, contents, data };
};

export default connect(mapStateToProps, {
  getContentsAction: getContents,
  createContentAction: createContent,
  updateContentAction: updateContent,
  removeContentAction: removeContent,
  updateContentItemAction: updateContentItem,
  createContentItemAction: createContentItem,
  resetContentItemAction: resetContentItem,
  removeContentTextItemAction: removeContentTextItem,
})(styled(Contents, getStyles));
