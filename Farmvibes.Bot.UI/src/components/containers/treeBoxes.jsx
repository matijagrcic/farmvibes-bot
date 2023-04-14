import * as d3 from "d3";
import * as React from "react";
import { ContextMenu, ModalContainer, DialogBox } from "components/containers";
import { DynamicForm } from "components/forms";
import {
  menuColours,
  createContentFields,
  createNode,
} from "global/defaultValues";
import {
  makeListRequest,
  generateUUID,
  flat,
  prepareContentMenu,
} from "helpers/utils";
import { post, patch, remove } from "helpers/requests";
import { nodeTypes } from "global/defaultValues";
import { SelectableOptionMenuItemType } from "@fluentui/react";

let timerId = null;
let submitAction = null;
let currentNode = null;
let root = null;

export const TreeBoxes = ({
  data,
  theme,
  menuId,
  createNodeAction,
  node,
  loading,
  locale,
  toggleContentPanel,
}) => {
  let nodeRefs = [];
  let colours = menuColours(theme);
  const [showMenu, setShowMenu] = React.useState(false);
  const [nodeRef, setNodeRef] = React.useState(null);
  const [modalHidden, setModalHidden] = React.useState(false);
  const [modalTitle, setModalTitle] = React.useState("");
  const [modalContent, setModalContent] = React.useState([]);
  const [activeNodeType, setActiveNodeType] = React.useState(null);
  const [activeNode, setActiveNode] = React.useState(null);
  const [dialogHidden, setDialogHidden] = React.useState(true);
  const [dialogTitle, setDialogTitle] = React.useState("");
  const [dialogContent, setDialogContent] = React.useState([]);
  const [dialogProceedFunction, setDialogProceedFunction] =
    React.useState(null);
  const [dialogProceedFunctionParams, setDialogProceedFunctionParams] =
    React.useState({});
  const [currentAction, setCurrentAction] = React.useState(null);
  const [formValues, setFormValues] = React.useState({});
  const [contentMenuActions, setContentMenuActions] = React.useState([]);
  let contentArray = [];
  let servicesArray = [];
  const persistNode = (fields, callback) => {
    let nodeResult = createNodeAction(fields);
    callback();
    return nodeResult;
  };

  const patchNode = (fields) => {
    patch(`menu_nodes/${currentNode.id}`, fields).then((response) =>
      console.log(response)
    );
    // setTimeout(function(){ window.location.reload(false); }, 3000);
  };

  const removeNode = (id) => {
    remove(`menu_nodes/${id}`).then((response) => console.log(response));
    delete_node(activeNode);
    setTimeout(function () {
      window.location.reload(false);
    }, 3000);
  };

  const UpdateFormValue = (val) => {
    setFormValues(val);
  };

  const fieldValues = (values) => {
    Object.keys(values[0]).forEach((value) => {
      if (!document.getElementsByName(value))
        this.form.elements[value] = values[value];
    });
  };

  const showNodeModal = (nodeType, action) => {
    let modalTitle = null;
    let content = null;
    setCurrentAction(action);
    switch (action) {
      case "create":
        switch (nodeType) {
          case "content":
            content = createContentFields;
            modalTitle = "Add content";
            break;
          case "service":
            modalTitle = "Add service";
            break;
          default:
            content = createNode;
            modalTitle = "Add branch";
            break;
        }
        break;

      case "edit":
        //Let's flatten the node translations object to get labels
        let temp = flat(currentNode.translations);

        //Append the translations to name for form to display
        setFormValues(
          Object.keys(temp).reduce((res, key) => {
            Object.assign(res, { [`translations.${key}`]: temp[key] });
            return res;
          }, {})
        );

        modalTitle = `Edit ${nodeType} label`;
        content = createNode;
        break;

      case "attach":
        switch (nodeType) {
          case "content":
            content = [
              ...createNode,
              {
                options: contentArray,
                placeholder: "Start typing content description",
                variant: "northstar",
                translatable: false,
                name: "content",
                label: "Select content",
                key: "existingContent",
                type: "combo",
              },
            ];
            // setModalContent(content);
            modalTitle = "Assign content to node";
            break;
          default:
            content = [
              ...createNode,
              {
                options: servicesArray,
                placeholder: "Start typing service description",
                variant: "northstar",
                translatable: false,
                name: "service",
                label: "Select service",
                key: "existingContent",
                type: "combo",
              },
            ];
            // setModalContent(content);
            modalTitle = "Assign service to node";
            break;
        }
        break;

      default:
        console.log(action);
        console.log(nodeType);
        break;
    }

    //Show modal
    setModalContent(content);
    setModalTitle(modalTitle);
    setModalHidden(true);

    //Let's remember the type of node we were working on
    setActiveNodeType(nodeType);
  };

  const showDialog = (nodeType, action) => {
    setCurrentAction(action);
    switch (action) {
      case "delete":
        setDialogContent("Are you sure you want to remove this item?");
        setDialogTitle("Delete " + nodeType);
        setDialogProceedFunction(() => removeNode);
        setDialogProceedFunctionParams(currentNode.id);
        break;
      default:
        setDialogContent(
          "Publishing this node would make it visible on the bot's menu. Do you want to proceed?"
        );
        setDialogTitle("Publish " + nodeType);
        setDialogProceedFunction(() => patchNode);
        setDialogProceedFunctionParams({
          isPublished: !currentNode.isPublished,
        });
        break;
    }
    toggleDialog();
  };

  const showPanel = (action) => {
    toggleContentPanel();
  };

  submitAction = (fields) => {
    menuTimer();
    const nodeTypeId = nodeTypes.filter((nodeType) => {
      return nodeType.name === activeNodeType;
    })[0].id;
    switch (currentAction) {
      case "edit":
        setActiveNode(activeNode);
        update(Object.assign(activeNode, fields));
        patchNode(fields);
        break;
      default:
        //create_node(fields.label,1,activeNodeType)
        //We will need to replace node dynamically instead of reloading in future
        Object.keys(fields.translations).forEach((key) => {
          if (activeNodeType === "content" && currentAction === "create") {
            if (fields.content["translations"] === undefined) {
              fields.content["translations"] = {};
            }
            fields.content["translations"] = {
              ...fields.content["translations"],
              ...{
                [key]: {
                  description: fields.translations[key]["description"],
                  locale: key,
                },
              },
            };
          }
        });

        if (activeNodeType === "content" && currentAction === "create") {
          fields.content.text.forEach((translation) => {
            Object.keys(translation.translations).forEach((key) => {
              translation.translations[key]["locale"] = key;
            });
          });
          post("contents", {
            ...fields.content,
            ...{ description: fields.description },
          }).then((response) =>
            persistNode(
              {
                ...fields,
                ...{
                  type: `/api/menu_node_types/${nodeTypeId}`,
                  content: `/api/contents/${response.id}`,
                  parent: `/api/menu_nodes/${activeNode.id}`,
                },
              },
              () => {
                toggleModal();
                window.location.reload(false);
              }
            )
          );
        } else {
          persistNode(
            {
              ...fields,
              ...{
                type: `/api/menu_node_types/${nodeTypeId}`,
                parent: `/api/menu_nodes/${activeNode.id}`,
              },
            },
            () => {
              toggleModal();
              window.location.reload(false);
            }
          );
        }

        // setTimeout(function () {
        //   window.location.reload(false);
        // }, 8000);
        break;
    }
    setFormValues({});
  };

  const menuButtonActions = [
    {
      key: "newItem",
      text: "Actions",
      iconOnly: true,
      iconProps: { iconName: "Add" },
      ariaLabel: "Actions",
      split: true,
      subMenuProps: {
        items: [
          {
            key: "contentMenu",
            text: "Content",
            iconProps: { iconName: "ContextMenu" },
            subMenuProps: {
              items: [
                {
                  key: "contentMenuNew",
                  text: "New content",
                  onClick: (event) =>
                    toggleContentPanel("Add content", "create-content-node", {
                      nodeTypeId: currentNode.type.id,
                      activeNode: currentNode,
                    }),
                  iconProps: { iconName: "InsertTextBox" },
                },
                {
                  key: "contentMenuExisting",
                  text: "Existing content",
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
                  text: "Existing service",
                  onClick: () => showNodeModal("service", "attach"),
                  iconProps: { iconName: "WaitlistConfirm" },
                },
              ],
            },
          },
          {
            key: "branchMenu",
            text: "New branch",
            onClick: () => showNodeModal("branch", "create"),
            iconProps: { iconName: "BranchFork" },
          },
        ],
      },
    },
    {
      key: "editItem",
      text: "Edit",
      iconOnly: true,
      onClick: () => {
        showNodeModal(currentNode.type.name, "edit");
      },
      iconProps: { iconName: "Edit" },
      split: true,
      ariaLabel: "Edit node",
    },
    {
      key: "publishItem",
      text: "Publish",
      iconOnly: true,
      iconProps: { iconName: "PublishContent" },
      split: true,
      ariaLabel: "Publish node",
      onClick: () => {
        showDialog(currentNode.type.name, "publish");
      },
    },
    {
      key: "deleteItem",
      text: "Delete node",
      iconOnly: true,
      iconProps: { iconName: "Delete" },
      split: true,
      ariaLabel: "Delete node",
      onClick: () => {
        showDialog(currentNode.type.name, "delete");
      },
    },
  ];

  const onLeaveNode = React.useCallback((ev) => {
    setShowMenu(false);
    currentNode = null;
  }, []);
  const menuTimer = (time = 10000) => setTimeout(onLeaveNode, time);

  const showContextMenu = (nodeItem) => {
    currentNode = nodeItem;
    let ref = nodeRefs[0].filter((d) => {
      return d.id === nodeItem.id;
    })[0][0];
    setNodeRef(ref);
    setShowMenu(true);

    //Let's update node menu according to node's properties
    setContentMenuActions(prepareContentMenu(menuButtonActions, nodeItem));
    setActiveNode(nodeItem);
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

  let mousedown; // Use to save temporarily 'mousedown.zoom' value
  let mouseWheel,
    mouseWheelName,
    isKeydownZoom = false;

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
    if (translations.length < 1 || translations[locale] === undefined)
      return "";

    return translations[locale]["label"];
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
    // it is added at the top of the group, so it is drawed first
    // else the nodes tooltips are drawed before their children nodes and they
    // hide them
    let nodeEnter = node
      .enter()
      .append("g", "g.node")
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
      })
      .on("mouseenter", (element) => {
        showContextMenu(element);
      })
      .on("mouseleave", () => {
        timerId = menuTimer();
      });

    saveNodeRef(nodeEnter);

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
    var nodeUpdate = node
      .transition()
      .duration(duration)
      .attr("transform", function (d) {
        return "translate(" + d.y + "," + d.x + ")";
      });

    nodeUpdate.select("rect").attr("class", function (d) {
      return d._children ? "node-rect-closed" : "node-rect";
    });

    nodeUpdate.select("text").style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position
    var nodeExit = node
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
    var link = getLinkGroup(getSvgGroup(getBaseSvg()))
      .selectAll("path")
      .data(links, function (d) {
        return d.target.id;
      });

    function linkMarkerStart(direction, isSelected) {
      if (direction === "SYNC") {
        return isSelected ? "url(#start-arrow-selected)" : "url(#start-arrow)";
      }
      return "";
    }

    function linkType(link) {
      if (link.direction === "SYNC") return "Synchronous [\u2194]";
      else {
        if (link.direction === "ASYN") return "Asynchronous [\u2192]";
      }
      return "???";
    }

    d3.selection.prototype.moveToFront = function () {
      return this.each(function () {
        this.parentNode.appendChild(this);
      });
    };

    // Enter any new links at the parent's previous position.
    // Enter any new links at the parent's previous position.
    let linkenter = link
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
    let linkUpdate = link
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
      "translate(" + translation + ")" + " scale(" + scale + ")"
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

  function removeMouseEvents() {
    // Drag and zoom behaviors are temporarily disabled, so tooltip text can be selected
    mousedown = d3.select("#tree-container").select("svg").on("mousedown.zoom");
    d3.select("#tree-container").select("svg").on("mousedown.zoom", null);
  }

  function reactivateMouseEvents() {
    // Reactivate the drag and zoom behaviors
    d3.select("#tree-container").select("svg").on("mousedown.zoom", mousedown);
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

  function delete_node(node) {
    visit(
      data,
      function (d) {
        if (d.children) {
          for (var child of d.children) {
            if (child === node) {
              d.children.splice(d.children.indexOf(child), 1);
              update(root);
              break;
            }
          }
        }
      },
      function (d) {
        return d.children && d.children.length > 0 ? d.children : null;
      }
    );
  }

  function create_link(label, name) {
    return {
      name: "Link from " + label + " to " + name,
      nodeName: "Link from " + label + " to " + name,
      direction: "ASYN",
    };
  }

  function create_node(name, position, type) {
    if (currentNode !== null) {
      if (currentNode._children !== null) {
        currentNode.children = currentNode._children;
        currentNode._children = null;
      }
      if (currentNode.children === null || currentNode.children === undefined) {
        currentNode.children = [];
      }
      var new_node = {
        nodeName: name,
        label: name,
        id: generateUUID(),
        type: type,
        position: position,
        children: [],
        link: create_link(currentNode.label, name),
      };
      currentNode.children.push(new_node);
    }
    update(currentNode);
  }

  function visit(parent, visitFn, childrenFn) {
    if (!parent) return;

    visitFn(parent);

    var children = childrenFn(parent);
    if (children) {
      var count = children.length;
      for (var i = 0; i < count; i++) {
        visit(children[i], visitFn, childrenFn);
      }
    }
  }

  React.useEffect(() => {
    if (data) {
      drawTree(data);
      //We need to preload content so that if user wants to add existing content to node, we do not have to query each time:
      makeListRequest({
        url: "contents",
        options: { "groups[]": "translations" },
      })
        .then((response) => {
          return response.reduce((rest, curr) => {
            if (curr.label !== null) {
              rest.push({
                key: `/api/contents/${curr.id}`,
                header: curr.label,
                status: curr.isPublished,
              });
            }
            return rest;
          }, []);
        })
        .then((result) => {
          contentArray = result;
        });

      makeListRequest({
        url: "services",
        options: { "groups[]": "translations" },
      })
        .then((response) => {
          return response.reduce((rest, curr) => {
            if (curr.label !== null) {
              rest.push({
                key: `/api/services/${curr.id}?groups[]=list`,
                header: curr.name,
                status: curr.isPublished,
              });
            }
            return rest;
          }, []);
        })
        .then((result) => {
          servicesArray = result;
        });
    } else console.log(data);
  }, [data]);

  React.useEffect(() => {
    update(root);
  }, [locale]);

  return (
    <div>
      <div id='tree-container'></div>
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
            <DynamicForm
              formWidth={650}
              inputs={modalContent}
              onSubmit={submitAction}
              theme={theme}
              inputValues={formValues}
              valuesChanged={UpdateFormValue}
              loading={loading}
            />
          }
          loading={loading}
        ></ModalContainer>
      )}
      {dialogHidden === false && (
        <DialogBox
          title={dialogTitle}
          dialogHidden={dialogHidden}
          showDialog={toggleDialog}
          content={dialogContent}
          cancel='Cancel'
          confirm='Confirm'
          proceedFunction={dialogProceedFunction}
          params={dialogProceedFunctionParams}
        ></DialogBox>
      )}
    </div>
  );
};
