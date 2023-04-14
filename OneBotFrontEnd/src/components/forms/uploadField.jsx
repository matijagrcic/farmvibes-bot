import React from "react";
import { DefaultButton } from "@fluentui/react";

export const UploadField = ({
  handleFile,
  name,
  required,
  disabled,
  label,
  allowedTypes,
  buttonText,
}) => {
  const hiddenFileInput = React.useRef(null);
  const [uploadIcon, setUploadIcon] = React.useState("Upload");

  const handleClick = (event) => {
    hiddenFileInput.current.click();
  };
  const handleChange = (event) => {
    const fileUploaded = event.target.files[0];
    handleFile(fileUploaded, fileUploaded.name);
    setUploadIcon("StatusCircleCheckmark");
  };

  return (
    <>
      <DefaultButton
        toggle
        onClick={handleClick}
        text={buttonText}
        iconProps={{ iconName: uploadIcon }}
      />
      <input
        type='file'
        ref={hiddenFileInput}
        onChange={handleChange}
        style={{ display: "none" }}
        accept={allowedTypes}
        name={name}
        required={required}
        disabled={disabled}
      />
    </>
  );
};
