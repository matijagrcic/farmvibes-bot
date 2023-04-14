import React from "react";
import { connect } from "react-redux";
import { styled } from "@fluentui/react";
import { getStyles } from "components/layout/Sidebar/Nav/Nav.styles";
import { Text } from "@fluentui/react-northstar";
import { makeListRequest, getPlatformComponents } from "helpers/utils";
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
import { FormattedMessage, useIntl } from "react-intl";

const Locations = ({
  getLocationsAction,
  uploadLocationsAction,
  downloadTemplateAction,
  locations,
  loading,
}) => {
  const intl = useIntl();
  const [buttonText, setButtonText] = React.useState(
    intl.formatMessage({ id: "general.form.file.uploadprompt" })
  );
  const [columns, setColumns] = React.useState([]);
  const [lastLocationId, setLastLocationId] = React.useState([]);
  const [panelHidden, setPanelHidden] = React.useState(false);
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
      text: intl.formatMessage({ id: "general.edit" }, { subject: "" }),
      iconProps: { iconName: "Edit" },
      disabled: true,
      onClick: () => onItemInvoked(selected[0]),
      activeCount: " === 1",
    },
    {
      key: "upload",
      text: intl.formatMessage({ id: "administrative.units.locations.import" }),
      iconProps: { iconName: "Upload" },
      onClick: () => {
        setPanelTitle(
          intl.formatMessage(
            { id: "general.form.file.uploadnew" },
            {
              subject: intl.formatMessage({
                id: "administrative.units.locations.file",
              }),
            }
          )
        );
        setPanelContent(
          <>
            <Text>
              <FormattedMessage id="administrative.units.locations.upload" />
            </Text>
            <UploadField
              allowedTypes="application/vnd.ms-excel"
              buttonText={buttonText}
              handleFile={(file, name) => {
                setButtonText(
                  intl.formatMessage(
                    { id: "general.form.file.uploading" },
                    { status: name }
                  )
                );
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
      text: intl.formatMessage(
        { id: "genral.file.download" },
        { file: intl.formatMessage({ id: "general.file.template" }) }
      ),
      iconProps: { iconName: "Download" },
      onClick: () => downloadTemplateAction(),
    },
    {
      key: "delete",
      text: intl.formatMessage({ id: "general.remove" }, { subject: "" }),
      iconProps: { iconName: "Delete" },
      disabled: true,
      activeCount: " > 0",
    },
  ];

  React.useEffect(() => {
    if (columns.length > 0) return;
    let cols = [];
    makeListRequest({ url: "locations/ux_columns" }).then((response) => {
      response["columns"].forEach((item, idx) => {
        let colObj = {
          name: item,
          fieldName: item.toLowerCase(),
          key: item.toLowerCase(),
          data: "string",
          isResizable: true,
          isMultiline: true,
          isSorted: false,
          isSortedDescending: false,
          sortAscendingAriaLabel: intl.formatMessage({
            id: "general.list.sort.az",
          }),
          sortDescendingAriaLabel: intl.formatMessage({
            id: "general.list.sort.za",
          }),
          onRender: (obj) => {
            if (obj.hasOwnProperty(item.toLowerCase()))
              return obj[item.toLowerCase()];
            else {
              getPlatformComponents(
                "administrative_units",
                "administrativeUnits"
              ).then((units) => {
                const type = units.filter(
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
              });
            }
          },
        };
        if (idx === 0) colObj[isRowHeader] = true;
        cols.push(colObj);
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
          itemInvoked={onItemInvoked}
          menuActions={menuActions}
          getRecords={getLocationsAction}
          // itemRemove={onItemRemove}
          header={intl.formatMessage(
            { id: "administrative.units.locations" },
            { count: 1 }
          )}
          recordFilters={{ type: lastLocationId }}
        />
      )}
      {panelHidden && (
        <PanelContainer
          header={panelTitle}
          panelWidth="546px"
          panelType="custom"
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
