import React from "react";
import { connect } from "react-redux";
import {
  getMenus,
  createMenuNode,
  updateContentItem,
} from "../../redux/actions";
import { getStyles } from "components/layout/Sidebar/Nav/Nav.styles";
import { Stack, styled, Overlay } from "@fluentui/react";
import { makeListRequest } from "helpers/utils";
import { TreeBoxes } from "components/containers";
import { LocaleSwitcher } from "components/localeSwitcher";
import { PanelContainer } from "components/containers";
import ContentForm from "components/forms/contentForm";

const MenuDetails = ({
  loading,
  menu,
  error,
  theme,
  match,
  createNodeAction,
  node,
  data,
  updateContentItemAction,
}) => {
  const [tree, setTree] = React.useState(null);
  const [locale, setLocale] = React.useState("en");
  const [panelHidden, setPanelHidden] = React.useState(false);
  const [panelTitle, setPanelTitle] = React.useState("");
  const [panelContent, setPanelContent] = React.useState(null);
  const [currentAction, setCurrentAction] = React.useState("");
  const showPanel = (title = null, action = null, params = {}) => {
    setCurrentAction(action);
    //Let's check whether we are opening or closing the panel
    if (title !== null) {
      setPanelTitle(title);
      if (action.includes("content"))
        setPanelContent(contentForm({ ...params, action }));
    }
    return setPanelHidden(!panelHidden);
  };

  const contentForm = ({ nodeTypeId, activeNode, action }) => {
    return (
      <ContentForm
        content={data}
        action={action}
        nodeTypeId={nodeTypeId}
        activeNode={activeNode}
      />
    );
  };

  const onPanelDismiss = () => {
    showPanel();
    updateContentItemAction({});
  };
  const changeMenuLocale = (event, code) => {
    setLocale(code);
  };

  React.useEffect(() => {
    makeListRequest({
      url: `menu_nodes/${match.params.menuId}/nodes`,
      options: {
        "groups[]": "translations",
      },
    }).then((result) => {
      //May be a new menu without lables
      setTree(result[0]);
    });
  }, [match]);

  if (tree !== null) {
    loading = false;
  }

  return (
    <Stack tokens={{ childrenGap: 15 }} id='tree-parent'>
      <Stack
        horizontal
        horizontalAlign='space-between'
        tokens={{ childrenGap: "l1", padding: "l1" }}
        verticalAlign='center'
      >
        <h3>Menu Designer</h3>
        <LocaleSwitcher locale={locale} _onChange={changeMenuLocale} />
      </Stack>
      <Stack>
        {loading && <Overlay />}
        {!loading && tree !== null && (
          <TreeBoxes
            data={tree}
            theme={theme}
            menuId={match.params.menuId}
            createNodeAction={createNodeAction}
            node={node}
            loading={loading}
            locale={locale}
            toggleContentPanel={showPanel}
          ></TreeBoxes>
        )}
        {panelHidden > 0 && (
          <PanelContainer
            panelWidth='546px'
            panelType='custom'
            panelDismiss={onPanelDismiss}
            lightDismiss={false}
            header={panelTitle}
            showPanel={showPanel}
            content={panelContent}
            description=''
          />
        )}
      </Stack>
    </Stack>
  );
};

const mapStateToProps = ({ menuReducer, contentReducer }) => {
  const { loading, menu, error, node } = menuReducer;
  const { data } = contentReducer;
  return { loading, error, menu, node, data };
};

export default connect(mapStateToProps, {
  getMenusAction: getMenus,
  createNodeAction: createMenuNode,
  updateContentItemAction: updateContentItem,
})(styled(MenuDetails, getStyles));
