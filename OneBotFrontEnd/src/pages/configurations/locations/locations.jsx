import React from "react";
import { connect } from "react-redux";
import { styled } from "@fluentui/react";
import { getStyles } from "components/layout/Sidebar/Nav/Nav.styles";
import { Text } from "@fluentui/react-northstar";
import { getFromStorage, makeListRequest } from "helpers/utils";
import {
  removeLocation,
  uploadLocations,
  updateLocation,
  getLocation,
  createLocation,
  getLocations,
  downloadLocationsTemplate,
} from "redux/locations/actions";
import { Table, PanelContainer } from "components/containers";
import { UploadField } from "components/forms";

const Locations = ({
  getLocationsAction,
  createLocationAction,
  updateLocationAction,
  uploadLocationsAction,
  getLocationAction,
  removeLocationAction,
  downloadTemplateAction,
  locations,
  loading,
}) => {
  const [locale, setLocale] = React.useState(getFromStorage("locale"));
  const [buttonText, setButtonText] = React.useState("Click to attach file");
  const [columns, setColumns] = React.useState([]);
  const [lastLocationId, setLastLocationId] = React.useState([]);
  const [panelHidden, setPanelHidden] = React.useState(false);
  const [inputValues, setInputValues] = React.useState({});
  const [panelContent, setPanelContent] = React.useState(null);
  const [panelTitle, setPanelTitle] = React.useState(null);
  let selected = [];
  const onItemInvoked = (item) => {
    togglePanel();
  };
  const onPanelDismiss = () => {
    togglePanel();
  };

  const togglePanel = () => {
    setPanelHidden(!panelHidden);
  };

  const updateSelected = (items) => {
    selected = items;
  };

  const menuActions = [
    {
      key: "edit",
      text: "Edit",
      iconProps: { iconName: "Edit" },
      disabled: true,
      onClick: () => onItemInvoked(selected[0]),
      activeCount: " === 1",
    },
    {
      key: "upload",
      text: "Import file",
      iconProps: { iconName: "Upload" },
      onClick: () => {
        setPanelTitle("Upload locations file");
        setPanelContent(
          <>
            <Text>
              We will now attempt to upload the locations. This may take a bit
              of time depending on the number of entries you have in your file.
              Please make sure you used the template provided to guarantee the
              success of this process.
            </Text>
            <UploadField
              allowedTypes='application/vnd.ms-excel'
              buttonText={buttonText}
              handleFile={(file, name) => {
                setButtonText(`Uploading ${name}`);
                const upload = new FormData();
                upload.append("file", file);
                upload.append("backup", false);
                uploadLocationsAction(upload);
              }}
            />
          </>
        );
        togglePanel();
      },
    },
    {
      key: "download",
      text: "Download template",
      iconProps: { iconName: "Download" },
      onClick: () => downloadTemplateAction(),
    },
    {
      key: "delete",
      text: "Remove",
      iconProps: { iconName: "Delete" },
      disabled: true,
      activeCount: " > 0",
    },
  ];

  React.useEffect(() => {
    if (columns.length > 0) return;
    let cols = [];
    makeListRequest({ url: "locations/ux_columns" }).then((response) => {
      response["columns"].forEach((item) => {
        cols.push({
          name: item,
          fieldName: item.toLowerCase(),
          key: item.toLowerCase(),
          data: "string",
          isRowHeader: true,
          isResizable: true,
          isMultiline: true,
          isSorted: false,
          isSortedDescending: false,
          sortAscendingAriaLabel: "Sorted A to Z",
          sortDescendingAriaLabel: "Sorted Z to A",
          onRender: (obj) => {
            if (obj.hasOwnProperty(item.toLowerCase()))
              return obj[item.toLowerCase()];
            else {
              const type = getFromStorage("administrativeUnits").filter(
                (unit) => unit.name.toLowerCase() === item.toLowerCase()
              )[0];
              let path = `[${obj.path}`;
              path = path.substring(0, path.length - 1);
              let jzPath = JSON.parse(`${path}]`);
              let pathObj = jzPath.filter(
                (pathItem) => pathItem.type === type.id
              );
              if (pathObj.length > 0) return pathObj[0].name;
              return path.obj;
            }
          },
        });
      });
      setColumns(cols);
      setLastLocationId(response["id"]);
    });
  }, []);
  return (
    <>
      {columns.length > 0 && (
        <Table
          selected={updateSelected}
          loading={loading}
          items={locations}
          cols={columns}
          isCompactMode={false}
          locale={locale}
          itemInvoked={onItemInvoked}
          menuActions={menuActions}
          getRecords={getLocationsAction}
          // itemRemove={onItemRemove}
          header={"Locations"}
          localeUpdate={setLocale}
          recordFilters={{ type: lastLocationId }}
        />
      )}
      {panelHidden && (
        <PanelContainer
          header={panelTitle}
          panelWidth='546px'
          panelType='custom'
          panelDismiss={onPanelDismiss}
          lightDismiss={false}
          content={panelContent}
        />
      )}
    </>
  );
};

const mapStateToProps = ({ locationsReducer }) => {
  const { loading, locations, error } = locationsReducer;
  return { loading, error, locations };
};
export default connect(mapStateToProps, {
  getLocationsAction: getLocations,
  getLocationAction: getLocation,
  createLocationAction: createLocation,
  updateLocationAction: updateLocation,
  uploadLocationsAction: uploadLocations,
  removeLocationAction: removeLocation,
  downloadTemplateAction: downloadLocationsTemplate,
})(styled(Locations, getStyles));
