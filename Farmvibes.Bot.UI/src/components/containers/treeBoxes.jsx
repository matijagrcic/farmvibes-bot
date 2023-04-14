import * as d3 from "d3";
import * as React from "react";
import { ContextMenu, ModalContainer, DialogBox } from "components/containers";
import { connect } from "react-redux";
import { DynamicForm } from "components/forms";
import { Overlay, styled } from "@fluentui/react";
import {
  createMenuNode,
  removeMenuNode,
  updateMenuNode,
} from "../../redux/actions";
import { getStyles } from "components/layout/Sidebar/Nav/Nav.styles";
import { menuColours } from "global/defaultValues";
import {
  flat,
  makeListRequest,
  prepareContentMenu,
  updateSideBarheight,
  unflatten,
  getFromStorage,
  getFromIri,
  validateForm,
  capitaliseSentense,
} from "helpers/utils";
import { Loader } from "@fluentui/react-northstar";
import ConstraintContainer from "./constraintContainer";
import { useIntl } from "react-intl";
import { useNodeTypes } from "helpers/utilities/nodeTypes";

let timerId = null;
let submitAction = null;
let currentNode = null;
let root = null;

const TreeBoxes = ({
  menuTree,
  theme,
  createNodeAction,
  removeMenuNodeAction,
  updateMenuNodeAction,
  loading,
  locale,
  toggleContentPanel,
}) => {
  let nodeRefs = [];
  let colours = menuColours(theme);
  const intl = useIntl();
  const { nodeTypes } = useNodeTypes();
  const [showMenu, setShowMenu] = React.useState(false);
  const [nodeRef, setNodeRef] = React.useState(null);
  const [modalHidden, setModalHidden] = React.useState(false);
  const [modalTitle, setModalTitle] = React.useState("");
  const [modalContent, setModalContent] = React.useState([]);
  const [loaderLabel, setLoaderLabel] = React.useState(
    intl.formatMessage({ id: "general.loading" }, { subject: "" })
  );
  const [blockSubmit, setBlockSubmit] = React.useState(false);
  const [treeData, setTreeData] = React.useState({});
  const [nodeCount, setNodeCount] = React.useState(0);
  const [activeNodeType, setActiveNodeType] = React.useState(null);
  const [activeNode, setActiveNode] = React.useState(null);
  const [dialogHidden, setDialogHidden] = React.useState(true);
  const [dialogTitle, setDialogTitle] = React.useState("");
  const [dialogContent, setDialogContent] = React.useState([]);
  const [dialogCancel, setDialogCancel] = React.useState(
    intl.formatMessage({ id: "general.cancel" })
  );
  const [dialogConfirm, setDialogConfirm] = React.useState(
    intl.formatMessage({ id: "general.confirm" })
  );

  const [dialogProceedFunction, setDialogProceedFunction] =
    React.useState(null);
  const [dialogProceedFunctionParams, setDialogProceedFunctionParams] =
    React.useState({});
  const [currentAction, setCurrentAction] = React.useState(null);
  const [formValues, setFormValues] = React.useState({});
  const [contentMenuActions, setContentMenuActions] = React.useState([]);

  const createNode = [
    {
      name: "label",
      key: "menu label",
      required: true,
      length: 50,
      type: "string",
      label: intl.formatMessage({ id: "menu.label" }),
      translatable: true,
      variant: "northstar",
    },
  ];

  const persistNode = (fields, callback) => {
    createNodeAction(fields);
    callback();
  };
  const createContentFields = [
    {
      name: "label",
      key: "menu label",
      required: true,
      length: 300,
      type: "string",
      label: intl.formatMessage({ id: "menu.label" }),
      translatable: true,
    },
    {
      name: "description",
      key: "description",
      required: false,
      length: 300,
      type: "longtext",
      label: intl.formatMessage({ id: "menu.description" }),
      translatable: true,
    },
    {
      fields: [
        {
          name: "text",
          key: "text",
          required: true,
          length: 300,
          type: "longtext",
          label: capitaliseSentense(intl.formatMessage({ id: "general.text" })),
          translatable: true,
          multiple: true,
        },
      ],
      name: "content",
      label: intl.formatMessage({ id: "general.messages" }),
      key: "content",
      type: "array",
      translatable: true,
    },
  ];

  const UpdateFormValue = (val) => {
    setFormValues((prev) => {
      return { ...prev, ...val };
    });
  };

  const showNodeModal = (nodeType, action) => {
    let modalTitle = null;
    let content = null;
    setShowMenu(false);
    setCurrentAction(action);
    switch (action) {
      case "create":
        switch (nodeType) {
          case "content":
            content = createContentFields;
            modalTitle = intl.formatMessage(
              { id: "general.add" },
              { subject: intl.formatMessage({ id: "content" }, { count: 1 }) }
            );
            break;
          case "service":
            modalTitle = intl.formatMessage(
              { id: "general.add" },
              { subject: intl.formatMessage({ id: "service" }, { count: 1 }) }
            );
            break;
          default:
            content = createNode;
            modalTitle = intl.formatMessage(
              { id: "general.add" },
              {
                subject: intl.formatMessage(
                  { id: "menu.branch" },
                  { count: 1 }
                ),
              }
            );
            break;
        }
        break;

      case "edit":
        //Let's flatten the node translations object to get labels
        let temp = flat(currentNode.translations);

        //Append the translations to name for form to display
        setFormValues({
          ...Object.keys(temp).reduce((res, key) => {
            Object.assign(res, { [`translations.${key}`]: temp[key] });
            return res;
          }, {}),
          node: currentNode.id,
        });

        modalTitle = intl.formatMessage(
          { id: "general.edit" },
          {
            subject: `${intl.formatMessage(
              {
                id: `menu.type.${nodeType}`,
              },
              { count: 1 }
            )} label`,
          }
        );
        content = createNode;
        break;

      case "attach":
        switch (nodeType) {
          case "content":
            content = [
              ...createNode,
              {
                options: [],
                placeholder: intl.formatMessage(
                  { id: "general.list.search.autocomplete" },
                  {
                    subject: intl.formatMessage(
                      {
                        id: "menu.type.content",
                      },
                      { count: 1 }
                    ),
                  }
                ),
                variant: "northstar",
                translatable: false,
                name: "content",
                label: intl.formatMessage(
                  { id: "general.form.select" },
                  {
                    subject: intl.formatMessage(
                      { id: "content" },
                      { count: 1 }
                    ),
                  }
                ),
                key: "existingContent",
                type: "combo",
              },
            ];
            modalTitle = intl.formatMessage(
              { id: "menu.node.assign" },
              {
                subject: intl.formatMessage(
                  { id: "menu.type.content" },
                  { count: 1 }
                ),
              }
            );
            break;
          default:
            content = [
              ...createNode,
              {
                options: [],
                placeholder: intl.formatMessage(
                  { id: "general.list.search.autocomplete" },
                  {
                    subject: intl.formatMessage(
                      {
                        id: "menu.type.service",
                      },
                      { count: 1 }
                    ),
                  }
                ),
                variant: "northstar",
                translatable: false,
                name: "service",
                label: intl.formatMessage(
                  { id: "general.form.select" },
                  {
                    subject: intl.formatMessage(
                      { id: "content" },
                      { count: 1 }
                    ),
                  }
                ),
                key: "existingService",
                type: "combo",
              },
            ];
            modalTitle = intl.formatMessage(
              { id: "menu.node.assign" },
              {
                subject: intl.formatMessage(
                  { id: "menu.type.service" },
                  { count: 1 }
                ),
              }
            );
            break;
        }
        break;

      case "constraints":
        modalTitle = intl.formatMessage(
          { id: "general.manage" },
          { subject: "constraints" }
        );
        content = (
          <ConstraintContainer
            object={{ id: currentNode.id }}
            iri={{
              menuNode: `/api/menu_nodes/${currentNode.id}`,
            }}
            paths={{
              list: `menu_nodes/${currentNode.id}/constraints`,
              remove: `menu_nodes/${currentNode.id}/constraints/{id}`,
              new: `menu_node_constraints`,
              update: `menu_nodes/${currentNode.id}/{id}`,
            }}
            action={updateMenuNodeAction}
            loading={loading}
            locale={locale}
          />
        );
        break;
      default:
        console.log(action);
        break;
    }

    //Show modal
    setModalContent(content);
    setModalTitle(modalTitle);
    setModalHidden(true);

    //Let's remember the type of node we were working on
    setActiveNodeType(nodeType);
  };

  const onSearch = async (vals) => {
    if (vals.searchQuery.length < 3) return;
    switch (vals.name) {
      case "content":
        return await makeListRequest({
          url: `contents?groups[]=uxMenus:read&groups[]=translations&translations.label=${vals.searchQuery}`,
        }).then((result) => {
          return result.reduce((arr, itm) => {
            if (itm !== undefined)
              arr.push({
                key: `/api/contents/${itm.id}`,
                header: itm["translations"][locale].label,
              });

            return arr;
          }, []);
        });

      default:
        return await makeListRequest({
          url: `services?groups[]=uxServiceRequest:read&groups[]=translations&translations.name=${vals.searchQuery}`,
        }).then((result) => {
          return result.reduce((serv_array, serv) => {
            if (serv !== undefined) {
              serv_array.push({
                key: `/api/services/${serv.id}`,
                content: getFromIri("serviceTypes", serv["type"])?.translations[
                  locale
                ].name,
                header: serv["translations"][locale].name,
              });
            }
            return serv_array;
          }, []);
        });
    }
  };

  const showDialog = (nodeType, action) => {
    setCurrentAction(action);
    switch (action) {
      case "delete":
        setDialogContent(intl.formatMessage({ id: "general.remove.confirm" }));
        setDialogTitle(
          intl.formatMessage(
            { id: "general.delete" },
            {
              subject: `${intl.formatMessage(
                {
                  id: `menu.type.${nodeType}`,
                },
                { count: 1 }
              )}`,
            }
          )
        );
        setDialogProceedFunction(() => removeMenuNodeAction);
        setDialogProceedFunctionParams(currentNode.id);
        break;
      case "constraints":
        setDialogTitle(
          intl.formatMessage(
            { id: "general.manage" },
            { subject: "constraints" }
          )
        );
        setDialogCancel(intl.formatMessage({ id: "general.close" }));
        setDialogConfirm({ style: { display: "none" } });
        setDialogContent(
          <ConstraintContainer
            object={{ id: currentNode.id }}
            iri={{
              node: `/api/menu_nodes/${currentNode.id}`,
            }}
            paths={{
              list: `menu_nodes/${currentNode.id}/constraints`,
              remove: `menu_nodes/${currentNode.id}/constraints/{id}`,
              new: `menu_node_constraints`,
              update: `menu_nodes/${currentNode.id}/{id}`,
            }}
            action={updateMenuNodeAction}
            loading={loading}
            leading={intl.formatMessage({ id: "constraints.description.menu" })}
            locale={locale}
          />
        );
        break;
      default:
        setDialogContent(
          intl.formatMessage({ id: "constraints.description.menu" })
        );
        setDialogTitle(
          intl.formatMessage(
            { id: "general.publish" },
            {
              subject: `${intl.formatMessage(
                {
                  id: `menu.type.${nodeType}`,
                },
                { count: 1 }
              )}`,
            }
          )
        );
        setDialogProceedFunction(() => updateMenuNodeAction);
        setDialogProceedFunctionParams({
          isPublished: !currentNode.isPublished,
        });
        break;
    }
    toggleDialog();
    setShowMenu(false);
  };

  submitAction = () => {
    const nodeTypeId = nodeTypes.filter((nodeType) => {
      return nodeType.name === activeNodeType;
    })[0].id;
    let data = unflatten(formValues);
    if (data.hasOwnProperty("translations")) {
      Object.keys(data.translations).forEach((key) => {
        data.translations[key]["locale"] = key;
      });
    }
    switch (currentAction) {
      case "edit":
        setActiveNode(activeNode);
        update(Object.assign(activeNode, data));
        updateMenuNodeAction(data);
        break;
      default:
        //create_node(fields.label,1,activeNodeType)
        //We will need to replace node dynamically instead of reloading in future
        if (activeNodeType === "content" && currentAction === "create") {
          return;
        } else {
          persistNode(
            {
              ...data,
              ...{
                type: `/api/menu_node_types/${nodeTypeId}`,
                parent: `/api/menu_nodes/${activeNode.id}`,
              },
            },
            () => {
              toggleModal();
            }
          );
        }
        break;
    }
    setFormValues({});
  };

  const menuButtonActions = [
    {
      key: "newItem",
      text: intl.formatMessage({ id: "general.actions" }),
      iconOnly: true,
      iconProps: { iconName: "Add" },
      ariaLabel: intl.formatMessage({ id: "general.actions" }),
      split: true,
      role: "group",
      subMenuProps: {
        items: [
          {
            key: "contentMenu",
            text: capitaliseSentense(
              intl.formatMessage({ id: "menu.type.content" }, { count: 1 })
            ),
            iconProps: { iconName: "ContextMenu" },
            subMenuProps: {
              items: [
                {
                  key: "contentMenuNew",
                  text: intl.formatMessage(
                    { id: "general.new" },
                    {
                      subject: intl.formatMessage(
                        { id: "menu.type.content" },
                        { count: 1 }
                      ),
                    }
                  ),
                  onClick: (_event) => {
                    toggleContentPanel(
                      intl.formatMessage(
                        { id: "general.add" },
                        {
                          subject: intl.formatMessage(
                            { id: "menu.type.content" },
                            { count: 1 }
                          ),
                        }
                      ),
                      "create-content-node",
                      {
                        nodeTypeId: currentNode.type.id,
                        activeNode: currentNode,
                      }
                    );
                    setShowMenu(false);
                  },
                  iconProps: { iconName: "InsertTextBox" },
                },
                {
                  key: "contentMenuExisting",
                  text: intl.formatMessage(
                    { id: "general.existing" },
                    {
                      subject: intl.formatMessage(
                        { id: "menu.type.content" },
                        { count: 1 }
                      ),
                    }
                  ),
                  onClick: () => showNodeModal("content", "attach"),
                  iconProps: { iconName: "TextDocument" },
                },
              ],
            },
          },
          {
            key: "serviceMenu",
            text: "Service",
            iconProps: { iconName: "CRMServices" },
            subMenuProps: {
              items: [
                {
                  key: "serviceMenuExisting",
                  text: intl.formatMessage(
                    { id: "general.existing" },
                    {
                      subject: intl.formatMessage(
                        { id: "menu.type.service" },
                        { count: 1 }
                      ),
                    }
                  ),
                  onClick: () => showNodeModal("service", "attach"),
                  iconProps: { iconName: "WaitlistConfirm" },
                },
              ],
            },
          },
          {
            key: "branchMenu",
            text: intl.formatMessage(
              { id: "general.new" },
              {
                subject: intl.formatMessage(
                  { id: "menu.type.branch" },
                  { count: 1 }
                ),
              }
            ),
            onClick: () => showNodeModal("branch", "create"),
            iconProps: { iconName: "BranchFork" },
          },
          {
            key: "constraintsMenu",
            text: intl.formatMessage(
              { id: "general.manage" },
              { subject: "constraints" }
            ),
            onClick: () => showDialog("branch", "constraints"),
            iconProps: { iconName: "BranchFork" },
          },
        ],
      },
    },
    {
      key: "editItem",
      text: intl.formatMessage(
        { id: "general.edit" },
        {
          subject: "",
        }
      ),
      iconOnly: true,
      onClick: () => {
        showNodeModal(currentNode.type.name, "edit");
      },
      iconProps: { iconName: "Edit" },
      split: true,
      ariaLabel: intl.formatMessage(
        { id: "general.edit" },
        {
          subject: intl.formatMessage({ id: "menu.node" }, { count: 1 }),
        }
      ),
    },
    {
      key: "publishItem",
      text: intl.formatMessage(
        { id: "general.publish" },
        {
          subject: "",
        }
      ),
      iconOnly: true,
      iconProps: { iconName: "PublishContent" },
      split: true,
      ariaLabel: intl.formatMessage(
        { id: "general.publish" },
        {
          subject: intl.formatMessage({ id: "menu.node" }, { count: 1 }),
        }
      ),
      onClick: () => {
        showDialog(currentNode.type.name, "publish");
      },
    },
    {
      key: "deleteItem",
      text: intl.formatMessage(
        { id: "general.delete" },
        {
          subject: intl.formatMessage({ id: "menu.node" }, { count: 1 }),
        }
      ),
      iconOnly: true,
      iconProps: { iconName: "Delete" },
      split: true,
      ariaLabel: intl.formatMessage(
        { id: "general.delete" },
        {
          subject: intl.formatMessage({ id: "menu.node" }, { count: 1 }),
        }
      ),
      onClick: () => {
        showDialog(currentNode.type.name, "delete");
      },
    },
  ];

  const onLeaveNode = React.useCallback((ev) => {
    setShowMenu(false);
    // currentNode = null; // Disabled temporarily, we will need reference of currentNode to attach newly created nodes
  }, []);

  const showContextMenu = (nodeItem) => {
    currentNode = nodeItem;
    let ref = nodeRefs[0].filter((d) => {
      return d.id === nodeItem.id;
    })[0][0];
    setNodeRef(ref);
    //Let's update node menu according to node's properties
    setContentMenuActions(prepareContentMenu(menuButtonActions, nodeItem));
    setActiveNode(nodeItem);
    setShowMenu(true);
  };

  let margin = {
      top: 0,
      right: 0,
      bottom: 100,
      left: 0,
    },
    // Height and width are redefined later in function of the size of the tree
    // (after that the data are loaded)
    width = document.body.clientWidth - margin.right - margin.left,
    height = 400 - margin.top - margin.bottom;

  const rectNode = { width: 280, height: 55, textMargin: 10 };
  let duration = 750;
  let mouseWheelName = false;

  let tree = d3.layout.tree().size([height, width]);
  let baseSvg,
    svgGroup,
    nodeGroup, // If nodes are not grouped together, after a click the svg node will be set after his corresponding tooltip and will hide it
    linkGroup,
    defs;

  const toggleModal = () => {
    setModalHidden(!modalHidden);
  };

  const toggleDialog = () => {
    setDialogHidden(!dialogHidden);
  };

  function drawTree(data) {
    tree = d3.layout.tree().size([height, width]);
    root = data;
    root.fixed = true;

    // Dynamically set the height of the main svg container
    // breadthFirstTraversal returns the max number of node on a same level
    // and colors the nodes
    var maxDepth = 0;
    var maxTreeWidth = breadthFirstTraversal(
      tree.nodes(root),
      function (currentLevel) {
        maxDepth++;
      }
    );

    height = maxTreeWidth * (rectNode.height + 20) - margin.right - margin.left;
    width = maxDepth * (rectNode.width * 1.5) - margin.top - margin.bottom;

    tree = d3.layout.tree().size([height, width]);
    root.x0 = height / 2;
    root.y0 = 0;

    baseSvg = getBaseSvg();

    // Mouse wheel is deactivated, else after a first drag of the tree, wheel event drags the tree (instead of scrolling the window)
    getMouseWheelEvent();
    d3.select("#tree-container").select("svg").on(mouseWheelName, null);
    d3.select("#tree-container").select("svg").on("dblclick.zoom", null);

    svgGroup = getSvgGroup(baseSvg);

    // SVG elements under nodeGroupTooltip could be associated with nodeGroup,
    // same for linkGroupToolTip and linkGroup,
    // but this separation allows to manage the order on which elements are drew
    // and so tooltips are always on top.
    nodeGroup = getNodeGroup(svgGroup);
    linkGroup = getLinkGroup(svgGroup);

    defs = baseSvg.append("defs");
    initArrowDef();
    initDropShadow();

    update(root);
  }

  const saveNodeRef = (element) => {
    nodeRefs.push(element);
  };

  function getBaseSvg() {
    if (d3.select("#tree-container").select("svg")[0][0] === null)
      return d3
        .select("#tree-container")
        .append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .attr("class", "svgContainer")
        .call(
          d3.behavior
            .zoom()
            //.scaleExtent([0.5, 1.5]) // Limit the zoom scale
            .on("zoom", zoomAndDrag)
        );
    else return d3.select("#tree-container").select("svg");
  }

  function getNodeGroup(svgGroup) {
    if (svgGroup.select("#nodes")[0][0] === null)
      return svgGroup.append("g").attr("id", "nodes");
    else return svgGroup.select("#nodes");
  }

  function getLinkGroup(svgGroup) {
    if (svgGroup.select("#links")[0][0] === null)
      return svgGroup.append("g").attr("id", "links");
    else return svgGroup.select("#links");
  }

  function getSvgGroup(baseSvg) {
    if (baseSvg.select(".drawarea")[0][0] === null)
      return baseSvg
        .append("g")
        .attr("class", "drawarea")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    else return baseSvg.select(".drawarea");
  }

  function getLabel(translations) {
    let lbl = getFromStorage("ux_locale")
      ? getFromStorage("ux_locale")
      : locale;
    if (translations.length < 1 || translations[lbl] === undefined) return "";

    return translations[lbl]["label"];
  }

  function update(source) {
    // Compute the new height, function counts total children of root node and sets tree height accordingly.
    // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
    // This makes the layout more consistent.
    let levelWidth = [1];
    let childCount = function (level, n) {
      if (n.children && n.children.length > 0) {
        if (levelWidth.length <= level + 1) levelWidth.push(0);

        levelWidth[level + 1] += n.children.length;
        n.children.forEach(function (d) {
          childCount(level + 1, d);
        });
      }
    };
    childCount(0, root);
    let newHeight = d3.max(levelWidth) * 100; // 25 pixels per line
    tree = tree.size([newHeight, width]);

    sortTree();

    // Compute the new tree layout
    let nodes = tree.nodes(root).reverse();
    let links = tree.links(nodes);

    // Check if two nodes are in collision on the ordinates axe and move them
    breadthFirstTraversal(tree.nodes(root), collision);

    // Normalize for fixed-depth
    nodes.forEach(function (d) {
      d.y = d.depth * (rectNode.width * 1.5);
    });

    // 1) ******************* Update the nodes *******************
    nodeGroup = getNodeGroup(getSvgGroup(getBaseSvg()));
    let node = nodeGroup.selectAll("g.node").data(nodes, function (d) {
      return d.id;
    });
    // Enter any new nodes at the parent's previous position
    // We use "insert" rather than "append", so when a new child node is added (after a click)
    // it is added at the top of the group, so it is drawn first
    // else the nodes tooltips are drawn before their children nodes and they
    // hide them
    let nodeEnter = node
      .enter()
      .insert("g", "g.node")
      .attr("class", "node")
      .attr("type", function (d) {
        return d.type;
      })
      .attr("id", function (d) {
        return d.id;
      })
      .attr("fill", function (d) {
        return d.type.name ? colours[d.type.name] : colours[d.type];
      })
      .attr("transform", function (d) {
        return "translate(" + source.y + "," + source.x + ")";
      })
      .on("click", function (d) {
        click(d);
        setShowMenu(false);
      })
      .on("contextmenu", (element) => {
        d3.event.preventDefault();
        showContextMenu(element);
      });
    // .on("mouseleave", () => {
    //   timerId = menuTimer();
    // });

    nodeEnter
      .append("g")
      .append("rect")
      .attr("rx", theme.effects.roundedCorner2)
      .attr("ry", theme.effects.roundedCorner2)
      .attr("width", rectNode.width)
      .attr("height", rectNode.height)
      .attr("class", rectNode.height - rectNode.textMargin * 2)
      .attr("fill", function (d) {
        return d.color;
      });

    nodeEnter
      .append("foreignObject")
      .attr("x", rectNode.textMargin)
      .attr("y", rectNode.textMargin)
      .attr("width", function () {
        return rectNode.width - rectNode.textMargin * 2 < 0
          ? 0
          : rectNode.width - rectNode.textMargin * 2;
      })
      .attr("height", function () {
        return rectNode.height - rectNode.textMargin * 2 < 0
          ? 0
          : rectNode.height - rectNode.textMargin * 2;
      })
      .append("xhtml")
      .html(function (d) {
        return (
          '<div style="vertical-align: middle; width: ' +
          (rectNode.width - rectNode.textMargin * 2) +
          "px; height: " +
          (rectNode.height - rectNode.textMargin * 2) +
          'px;" class="node-text wordwrap">' +
          "<p>" +
          getLabel(d.translations) +
          "</p>" +
          "</div>"
        );
      });

    // Transition nodes to their new position.
    let nodeUpdate = node
      .transition()
      .duration(duration)
      .attr("transform", function (d) {
        return "translate(" + d.y + "," + d.x + ")";
      });

    nodeUpdate.select("rect").attr("class", function (d) {
      return d._children ? "node-rect-closed" : "node-rect";
    });

    nodeUpdate.select("text").style("fill-opacity", 1);
    saveNodeRef(nodeUpdate);

    // Transition exiting nodes to the parent's new position
    let nodeExit = node
      .exit()
      .transition()
      .duration(duration)
      .attr("transform", function (d) {
        return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

    nodeExit.select("text").style("fill-opacity", 1e-6);

    // Update the text to reflect whether node has children or not.
    node.select("xhtml").html(function (d) {
      return (
        '<div style="vertical-align: middle; width: ' +
        (rectNode.width - rectNode.textMargin * 2) +
        "px; height: " +
        (rectNode.height - rectNode.textMargin * 2) +
        'px;" class="node-text wordwrap">' +
        "<p>" +
        getLabel(d.translations) +
        "</p>" +
        "</div>"
      );
    });

    // 2) ******************* Update the links *******************
    let link = getLinkGroup(getSvgGroup(getBaseSvg()))
      .selectAll("path")
      .data(links, function (d) {
        return d.target.id;
      });

    updateSideBarheight();

    function linkMarkerStart(direction, isSelected) {
      if (direction === "SYNC") {
        return isSelected ? "url(#start-arrow-selected)" : "url(#start-arrow)";
      }
      return "";
    }

    d3.selection.prototype.moveToFront = function () {
      return this.each(function () {
        this.parentNode.appendChild(this);
      });
    };

    // Enter any new links at the parent's previous position.
    // Enter any new links at the parent's previous position.
    link
      .enter()
      .insert("path", "g")
      .attr("class", "link")
      .attr("id", function (d) {
        return "linkID" + d.target.id;
      })
      .attr("d", function (d) {
        return diagonal(d);
      })
      .attr("marker-end", "url(#end-arrow)")
      .attr("marker-start", function (d) {
        if (d.target.link === undefined) {
          d.target.link = create_link(d.source.label, d.target.label);
        }
        return linkMarkerStart(d.target.link.direction, false);
      })
      .on("mouseover", function (d) {
        d3.select(this).moveToFront();

        d3.select(this).attr("marker-end", "url(#end-arrow-selected)");
        d3.select(this).attr(
          "marker-start",
          linkMarkerStart(d.target.link.direction, true)
        );
        d3.select(this).attr("class", "linkselected");
      });

    // Transition links to their new position.
    link
      .transition()
      .duration(duration)
      .attr("d", function (d) {
        return diagonal(d);
      });

    // Transition exiting nodes to the parent's new position.
    link.exit().transition().remove();

    // Stash the old positions for transition.
    nodes.forEach(function (d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Zoom functionnality is desactivated (user can use browser Ctrl + mouse wheel shortcut)
  function zoomAndDrag() {
    //var scale = d3.event.scale,
    var scale = 1,
      translation = d3.event.translate,
      tbound = -height * scale,
      bbound = height * scale,
      lbound = (-width + margin.right) * scale,
      rbound = (width - margin.left) * scale;
    // limit translation to thresholds
    translation = [
      Math.max(Math.min(translation[0], rbound), lbound),
      Math.max(Math.min(translation[1], bbound), tbound),
    ];
    d3.select(".drawarea").attr(
      "transform",
      `translate(${translation}) scale(${scale})`
    );
  }

  // sort the tree according to the node names
  function sortTree() {
    tree.sort(function (a, b) {
      return parseInt(b.position) < parseInt(a.position) ? 1 : -1;
    });
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }

  // Breadth-first traversal of the tree
  // func function is processed on every node of a same level
  // return the max level
  function breadthFirstTraversal(tree, func) {
    var max = 0;
    if (tree && tree.length > 0) {
      var currentDepth = tree[0].depth;
      var fifo = [];
      var currentLevel = [];

      fifo.push(tree[0]);
      while (fifo.length > 0) {
        var node = fifo.shift();
        if (node.depth > currentDepth) {
          func(currentLevel);
          currentDepth++;
          max = Math.max(max, currentLevel.length);
          currentLevel = [];
        }
        currentLevel.push(node);
        if (node.children) {
          for (var j = 0; j < node.children.length; j++) {
            fifo.push(node.children[j]);
          }
        }
      }
      func(currentLevel);
      return Math.max(max, currentLevel.length);
    }
    return 0;
  }

  // x = ordoninates and y = abscissas
  function collision(siblings) {
    var minPadding = 5;
    if (siblings) {
      for (var i = 0; i < siblings.length - 1; i++) {
        if (siblings[i + 1].x - (siblings[i].x + rectNode.height) < minPadding)
          siblings[i + 1].x = siblings[i].x + rectNode.height + minPadding;
      }
    }
  }

  // Name of the event depends of the browser
  function getMouseWheelEvent() {
    if (d3.select("#tree-container").select("svg").on("wheel.zoom")) {
      mouseWheelName = "wheel.zoom";
      return d3.select("#tree-container").select("svg").on("wheel.zoom");
    }
    if (
      d3.select("#tree-container").select("svg").on("mousewheel.zoom") != null
    ) {
      mouseWheelName = "mousewheel.zoom";
      return d3.select("#tree-container").select("svg").on("mousewheel.zoom");
    }
    if (d3.select("#tree-container").select("svg").on("DOMMouseScroll.zoom")) {
      mouseWheelName = "DOMMouseScroll.zoom";
      return d3
        .select("#tree-container")
        .select("svg")
        .on("DOMMouseScroll.zoom");
    }
  }

  function diagonal(d) {
    var p0 = {
        x: d.source.x + rectNode.height / 2,
        y: d.source.y + rectNode.width,
      },
      p3 = {
        x: d.target.x + rectNode.height / 2,
        y: d.target.y - 12, // -12, so the end arrows are just before the rect node
      },
      m = (p0.y + p3.y) / 2,
      p = [
        p0,
        {
          x: p0.x,
          y: m,
        },
        {
          x: p3.x,
          y: m,
        },
        p3,
      ];
    p = p.map(function (d) {
      return [d.y, d.x];
    });
    return "M" + p[0] + "C" + p[1] + " " + p[2] + " " + p[3];
  }

  function initDropShadow() {
    var filter = defs
      .append("filter")
      .attr("id", "drop-shadow")
      .attr("color-interpolation-filters", "sRGB");

    filter
      .append("feOffset")
      .attr("result", "offOut")
      .attr("in", "SourceGraphic")
      .attr("dx", 0)
      .attr("dy", 0);

    filter.append("feGaussianBlur").attr("stdDeviation", 2);

    filter
      .append("feOffset")
      .attr("dx", 2)
      .attr("dy", 2)
      .attr("result", "shadow");

    filter
      .append("feComposite")
      .attr("in", "offOut")
      .attr("in2", "shadow")
      .attr("operator", "over");
  }

  function initArrowDef() {
    // Build the arrows definitions
    // End arrow
    defs
      .append("marker")
      .attr("id", "end-arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 0)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .attr("class", "arrow")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5");

    // End arrow selected
    defs
      .append("marker")
      .attr("id", "end-arrow-selected")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 0)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .attr("class", "arrowselected")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5");

    // Start arrow
    defs
      .append("marker")
      .attr("id", "start-arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 0)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .attr("class", "arrow")
      .append("path")
      .attr("d", "M10,-5L0,0L10,5");

    // Start arrow selected
    defs
      .append("marker")
      .attr("id", "start-arrow-selected")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 0)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .attr("class", "arrowselected")
      .append("path")
      .attr("d", "M10,-5L0,0L10,5");
  }

  function create_link(label, name) {
    return {
      name: "Link from " + label + " to " + name,
      nodeName: "Link from " + label + " to " + name,
      direction: "ASYN",
    };
  }

  const createDataTree = (dataset) => {
    let hashTable = Object.create(null);
    dataset.forEach(
      (aData) => (hashTable[aData.id] = { ...aData, children: [] })
    );
    let dataTree = [];
    dataset.forEach((aData) => {
      if (aData.parent) {
        hashTable[
          aData.parent.substr(aData.parent.lastIndexOf("/") + 1)
        ].children.push(hashTable[aData.id]);
      } else dataTree.push(hashTable[aData.id]);
    });
    return dataTree;
  };

  const preventSubmit = (status, message = "") => {
    setBlockSubmit(status);
    setLoaderLabel(message);
  };

  React.useEffect(() => {
    if (menuTree && menuTree.length > 0) {
      let m = createDataTree(menuTree)[0];
      setTreeData(m);
      setNodeCount(menuTree.length);
    } else console.log(menuTree);
  }, [menuTree]);

  React.useEffect(() => {
    if (
      Object.keys(treeData).length > 0 &&
      treeData.children.length !== nodeCount
    )
      drawTree(treeData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeData]);

  React.useEffect(() => {
    if (Object.keys(treeData).length > 0) update(root);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  React.useEffect(() => {
    setShowMenu(true);
  }, [nodeRef]);

  return (
    <div>
      <div id="tree-container" onClick={() => setShowMenu(false)}></div>

      {showMenu && nodeRef && (
        <ContextMenu
          menuButtons={contentMenuActions}
          linkRef={nodeRef}
          activeNode={activeNode}
          showMenu={onLeaveNode}
          onMouseEnter={() => {
            clearTimeout(timerId);
          }}
        ></ContextMenu>
      )}

      {modalContent && (
        <ModalContainer
          title={modalTitle}
          modalHidden={modalHidden}
          showModal={toggleModal}
          content={
            <>
              {blockSubmit && (
                <Overlay className={"loader"}>
                  <Loader label={loaderLabel} size="largest" />
                </Overlay>
              )}
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                }}
                style={{ width: "100%" }}
                className="validate"
              >
                <DynamicForm
                  formWidth={650}
                  inputs={modalContent}
                  onSubmit={(e, data, history) => {
                    let hasErrors = validateForm(
                      e.target.closest("form").elements
                    );
                    if (!hasErrors) {
                      submitAction(data, history);
                    }
                  }}
                  theme={theme}
                  inputValues={formValues}
                  valuesChanged={UpdateFormValue}
                  loading={loading}
                  handleSearchQuery={onSearch}
                  preventSubmit={preventSubmit}
                />
              </form>
            </>
          }
          loading={loading}
        ></ModalContainer>
      )}
      {dialogHidden === false && (
        <DialogBox
          title={dialogTitle}
          dialogHidden={!dialogHidden}
          showDialog={toggleDialog}
          content={dialogContent}
          cancel={dialogCancel}
          confirm={dialogConfirm}
          proceedFunction={dialogProceedFunction}
          params={dialogProceedFunctionParams}
        ></DialogBox>
      )}
    </div>
  );
};

const mapStateToProps = ({ menuReducer }) => {
  const { loading, menuTree } = menuReducer;
  return { loading, menuTree };
};

export default connect(mapStateToProps, {
  createNodeAction: createMenuNode,
  removeMenuNodeAction: removeMenuNode,
  updateMenuNodeAction: updateMenuNode,
})(styled(TreeBoxes, getStyles));
