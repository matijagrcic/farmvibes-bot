import React from "react";
import { connect } from "react-redux";
import { getMenu, createMenuNode } from "../../redux/actions";
import { getStyles } from "components/layout/Sidebar/Nav/Nav.styles";
import { Text, styled, Overlay } from "@fluentui/react";
import TreeBoxes from "components/containers/treeBoxes";
import { LocaleSwitcher } from "components/localeSwitcher";
import { PanelContainer } from "components/containers";
import ContentForm from "components/forms/contentForm";
import { Flex, Loader, Button, ArrowLeftIcon } from "@fluentui/react-northstar";
import { useParams, useLocation } from "react-router-dom";
import { useChannels, useLanguages } from "helpers/utilities";
import { useIntl } from "react-intl";

const MenuDetails = ({ loading, theme, getMenuAction, node }) => {
  const { channels } = useChannels();
  const { locale } = useLanguages();
  const intl = useIntl();
  const [loca, setLoca] = React.useState(locale);
  const location = useLocation();
  let params = useParams();
  const [panelHidden, setPanelHidden] = React.useState(false);
  const [panelTitle, setPanelTitle] = React.useState("");
  const [panelContent, setPanelContent] = React.useState(null);
  const showPanel = (title = null, action = null, params = {}) => {
    //Let's check whether we are opening or closing the panel
    if (title !== null) {
      setPanelTitle(title);
      if (action.includes("content")) {
        setPanelContent(contentForm({ ...params, action }));
      }
    }
    return setPanelHidden(!panelHidden);
  };

  const contentForm = ({ nodeTypeId, activeNode, action }) => {
    return (
      <ContentForm
        action={action}
        nodeTypeId={nodeTypeId}
        activeNode={activeNode}
        channels={channels}
        onPanelDismiss={() => setPanelHidden(false)}
      />
    );
  };

  const onPanelDismiss = () => {
    showPanel();
  };
  const changeMenuLocale = (event, code) => {
    setLoca(code);
  };

  React.useEffect(() => {
    getMenuAction(params.menuId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    //May be a new menu without lables
    setPanelHidden(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node]);

  return (
    <>
      <Flex space="between" styles={{ margin: "30px" }} vAlign="center">
        <Button
          icon={<ArrowLeftIcon />}
          text
          content={intl.formatMessage({ id: "general.nav.backtolist" })}
          onClick={() => window.history.back()}
        />
        <Text block variant={"xLarge"}>
          {intl.formatMessage(
            { id: "menu.designer" },
            { menu: location.state?.title ? location.state?.title : "" }
          )}
        </Text>

        <LocaleSwitcher locale={loca} _onChange={changeMenuLocale} />
      </Flex>

      <Flex id="tree-parent" gap="gap.small">
        <Flex hAlign="center">
          {loading ? (
            <Overlay className={"loader"}>
              <Loader
                label={intl.formatMessage(
                  { id: "general.loading" },
                  { subject: intl.formatMessage({ id: "menu" }, { count: 1 }) }
                )}
                size="largest"
              />
            </Overlay>
          ) : (
            <TreeBoxes
              theme={theme}
              node={node}
              locale={loca}
              toggleContentPanel={showPanel}
            ></TreeBoxes>
          )}
          {panelHidden > 0 && (
            <PanelContainer
              panelWidth="546px"
              panelType="custom"
              panelDismiss={onPanelDismiss}
              lightDismiss={false}
              header={panelTitle}
              showPanel={showPanel}
              content={panelContent}
              description=""
            />
          )}
        </Flex>
      </Flex>
    </>
  );
};

const mapStateToProps = ({ menuReducer }) => {
  const { loading, menu, error, node, menuTree } = menuReducer;
  return { loading, error, menu, node, menuTree };
};

export default connect(mapStateToProps, {
  getMenuAction: getMenu,
  createNodeAction: createMenuNode,
})(styled(MenuDetails, getStyles));
