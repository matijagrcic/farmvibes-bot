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
} from "../../redux/actions";
import { getStyles } from "components/layout/Sidebar/Nav/Nav.styles";
import { PanelContainer, Grouped } from "components/containers";
import { styled } from "@fluentui/react";
import ContentForm from "components/forms/contentForm";
import { getFromStorage, flat } from "helpers/utils";

const Contents = ({
  data,
  loading,
  contents,
  getContentsAction,
  createContentAction,
  updateContentAction,
  removeContentAction,
  updateContentItemAction,
  createContentItemAction,
  error,
}) => {
  const [locale, setLocale] = React.useState(getFromStorage("locale"));
  const [panelHidden, setPanelHidden] = React.useState(false);
  const [panelTitle, setPanelTitle] = React.useState("");
  const [currentAction, setCurrentAction] = React.useState("");
  const showPanel = () => {
    return setPanelHidden(!panelHidden);
  };

  const onPanelDismiss = () => {
    showPanel();
    updateContentItemAction({});
  };

  const addContent = (action = "create", group = null) => {
    if (group !== null) updateChild(group);
    console.log(data);
    let title = "content";
    if (action !== null && action.includes("edit")) {
      title = `Edit ${title}`;
    } else {
      title = `Add ${title}`;
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

  const fetchRecords = React.useCallback((currentPage) => {
    getContentsAction({ page: currentPage, itemsPerPage: 10 });
  });

  React.useEffect(() => {
    getContentsAction({ page: 1, itemsPerPage: 10 });
  }, []);

  return (
    <>
      <Grouped
        items={contents === undefined ? 0 : contents.length}
        getRecords={fetchRecords}
        addFunction={addContent}
        removeFunction={removeContentAction}
        updateChild={updateChild}
        loading={loading}
        addFunctionTitle='Add content'
        pageTitle='Bot contents'
        pageDescription='Here is a list of content created for your users'
        childRow={"contentTextVariants"}
        childRowContent={"text"}
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
                weight='bold'
                content={`${item.translations[locale]?.label}`}
                size='large'
              />
            ),
          };
        })}
        header={[
          {
            content: "Description",
            styles: { flexGrow: 4 },
            key: "header-title-description",
          },
          {
            content: "Created on",
            styles: { flexGrow: 1 },
            key: "header-title-created",
          },
          {
            content: "Updated on",
            styles: { flexGrow: 1 },
            key: "header-title-updated",
          },
          { content: "", styles: { flexGrow: 1 }, key: "header-title-actions" },
        ]}
      />
      {panelHidden > 0 && (
        <PanelContainer
          panelWidth='546px'
          panelType='custom'
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
            />
          }
          description=''
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
})(styled(Contents, getStyles));
