import { useEffect } from "react";
import useDrivePicker from "react-google-drive-picker";

function Drive() {
  const [openPicker, authResponse] = useDrivePicker();
  // const customViewsArray = [new google.picker.DocsView()]; // custom view
  //API key
  //AIzaSyBC-rfDRJZ1HZV_osZmUcy1IxcjDym24qM
  const handleOpenPicker = () => {
    openPicker({
      clientId: "699038042138-sje885f3hrtjoj0coe4lgiidslb4bemm.apps.googleusercontent.com",
      developerKey: "AIzaSyBC-rfDRJZ1HZV_osZmUcy1IxcjDym24qM",
      viewId: "DOCS",
      // token: token, // pass oauth token in case you already have one
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true,
      // customViews: customViewsArray, // custom view
      callbackFunction: (data) => {
        if (data.action === "cancel") {
          console.log("User clicked cancel/close button");
        }
        console.log(data);
      },
    });
  };

  return (
    <div>
      <button onClick={() => handleOpenPicker()}>Open Picker</button>
    </div>
  );
}

export default Drive;
