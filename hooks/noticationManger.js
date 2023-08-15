import axios from "axios";
import { getDatabase, onValue, ref } from "firebase/database";
import { encryptName } from "helpers/encryptions";
import configUrls from "config/config";
import { initializeApp } from "firebase/app";

// firebase init
const firebaseConfig = {
  databaseURL: configUrls.firebase_config.databaseURL,
};
const App = initializeApp(firebaseConfig, "updatefb");
const db = getDatabase(App);

//main hook
export const useNoficationMannager = (
  VehicleData,
  setNotification,
  notifaction
) => {
  if (notifaction) {
    let temp = [...notifaction];

    VehicleData.map((item, i) => {
      if (item.SerialNumber) {
        onValue(ref(db, item.SerialNumber), (snapshot) => {
          if (snapshot.val()?.Speed > item.SpeedLimit && item.SpeedLimit) {
            let name = item.DisplayName;
            let message = `Vehicle ${name} is over speed limit ${
              snapshot.val().Speed
            } `;
            let flag = temp.find(
              (x) => x.message === message && x.name === name
            );

            if (!flag) {
              let newnotifcation = [
                ...temp,
                {
                  name: name,
                  message: message,
                  time: new Date().toISOString(),
                },
              ];
              temp = [...newnotifcation];
              if (newnotifcation.length > 50) {
                newnotifcation.shift();
              }
              setNotification(
                newnotifcation.sort(
                  (a, b) => new Date(b.tiem) - new Date(a.time)
                )
              );
            }
          }
        });
      }
    });
  }
};
