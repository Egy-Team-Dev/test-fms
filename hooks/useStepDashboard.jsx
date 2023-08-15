import { useTranslation } from "next-i18next";
import React from "react";
import style from "styles/scss/custom/components/tour-step/tourStep.module.scss";

const useStepDashboard = () => {
  const { t } = useTranslation("Tour");
  const steps = {
    dashboard: [
      {
        content: (
          <p className={style["basic__step"]}>{t("Welcome_Dashboard")}</p>
        ),
        placement: "center",
        target: "body",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Website Header")}</h4>
            <p>{t("Many interesting options here!")}</p>
          </div>
        ),
        spotlightPadding: 20,
        placement: "bottom",
        target: ".iq-navbar",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Profile Control")}</h4>
            <p>{t("You go to your setting or logout from here.")}</p>
          </div>
        ),
        spotlightPadding: 20,
        placement: "bottom",
        target: ".profile",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Languages")}</h4>
            <p>{t("You can nav between languages.")}</p>
          </div>
        ),
        spotlightPadding: 20,
        placement: "bottom",
        target: ".languages",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Notification Section")}</h4>
            <p>{t("Keep your eyes on notifications.")}</p>
          </div>
        ),
        spotlightPadding: 20,
        placement: "bottom",
        target: ".notifications",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Sync data")}</h4>
            <p>{t("You Sync data whenever you want.")}</p>
          </div>
        ),
        spotlightPadding: 20,
        placement: "bottom",
        target: ".sync-data",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Toggle theme mode")}</h4>
            <p>{t("protect your eyes if you want and choose dark mode.")}</p>
          </div>
        ),
        spotlightPadding: 20,
        placement: "bottom",
        target: ".toggle-dark-mode",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Take a tour")}</h4>
            <p>{t("You can find me here whenever you want.")}</p>
          </div>
        ),
        spotlightPadding: 20,
        placement: "bottom",
        target: ".tour",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Navigation Side")}</h4>
            <p>{t("You can Navigate our website from this bar.")}</p>
          </div>
        ),
        spotlightPadding: 20,
        placement: "right",
        target: ".asideNav",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Progress Bar")}</h4>
            <p>{t("Has the precentages of the vehicles and drivers")}</p>
          </div>
        ),
        spotlightPadding: 20,
        placement: "bottom",
        target: "#progress-bar",
      },

      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Map")}</h4>
            <p>{t("You can see cars displayed on the map")}</p>
          </div>
        ),
        spotlightPadding: 20,
        placement: "bottom",
        target: "#map-section",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Vehicles")}</h4>
            <p>
              {t("You can see the percentages the current vehicles Status")}
            </p>
          </div>
        ),
        placement: "top",
        target: "#vehicles-status",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Average Utilization")}</h4>
            <p>{t("Displayed the Utilization for the last 3 days")}</p>
          </div>
        ),
        placement: "left",
        target: "#average-utilization",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Average Speed")}</h4>
            <p>
              {t("You can see the percentages the current vehicles Status")}
            </p>
          </div>
        ),
        placement: "top",
        target: "#average-speed",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Preventive Maintenance")}</h4>
            <p>
              {t("You can see the number of vehicles that had maintenance")}
            </p>
          </div>
        ),
        placement: "top",
        target: "#preventive-maintenance",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Top Drivers")}</h4>
            <p>{t("Shows the Two Best Rated Drivers")}</p>
          </div>
        ),
        placement: "right",
        target: "#top-drivers",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Worst Drivers")}</h4>
            <p>{t("Shows the Two Worst Rated Drivers")}</p>
          </div>
        ),
        placement: "top",
        target: "#worst-drivers",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Top Utilized Vehicles")}</h4>
            <p>{t("Shows Two best Utilized Vehicles")}</p>
          </div>
        ),
        placement: "top",
        target: "#top-utilized-vehicles",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Worst Utilized Vehicles")}</h4>
            <p>{t("Shows Two Worst Utilized Vehicles")}</p>
          </div>
        ),
        placement: "top",
        target: "#worst-utilized-vehicles",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Repair Plan Table")}</h4>
            <p>{t("Shows the Cars upcoming repair plans")}</p>
          </div>
        ),
        placement: "top",
        target: "#repair-table",
      },
    ],
    reports: [
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Reports")}</h4>
            <p>{t("Welcome-to-reports")}</p>
          </div>
        ),
        disableBeacon: true,
        hideCloseButton: true,
        placement: "center",
        spotlightPadding: 10,
        target: "#reports",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Search_Report")}</h4>
            <p>{t("Search_Desc")}</p>
          </div>
        ),
        disableBeacon: true,
        hideCloseButton: true,
        placement: "right",
        spotlightPadding: 10,
        target: "#report-search",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Report Group")}</h4>
            <p>{t("Pick_Report")}</p>
          </div>
        ),
        disableBeacon: true,
        hideCloseButton: true,
        placement: "right",
        spotlightPadding: 0,
        target: "#Utilization_reports_key",
      },
    ],
    track: [
      {
        content: (
          <div className={style["basic__step basic-imageStep"]}>
            <div className={style["image-container"]}>
              <img
                src={"/assets/images/tour/locate.svg"}
                alt="GPS Marker"
                className={style["step-image"]}
              />
            </div>
            <div className={style["step-body"]}>
              <p className={style.stepHeader}>{t("locate")}</p>
              <p className={style.stepDescription}>
                {t("check_location_with_mouse_cursor")}
              </p>
            </div>
          </div>
        ),
        placement: "top",
        disableBeacon: true,
        target: "#locate",
      },
      {
        content: (
          <div className={style["basic__step basic-imageStep"]}>
            <img
              src={"/assets/images/tour/cleanup.svg"}
              alt="Clean up guy"
              className={style["step-image"]}
            />
            <div>
              <p className={style.stepHeader}>{t("erase")}</p>
              <p className={style.stepDescription}>{t("delete_search_data")}</p>
            </div>
          </div>
        ),
        placement: "top",
        disableBeacon: true,
        target: "#clear-search",
      },
      {
        content: (
          <div className={style["basic__step basic-imageStep"]}>
            <img
              src={"/assets/images/tour/calculateDistance.svg"}
              alt="calculate Distance"
              className={style["step-image"]}
            />
            <div>
              <p className={style.stepHeader}>{t("calculate")}</p>
              <p className={style.stepDescription}>{t("calculate_distance")}</p>
            </div>
          </div>
        ),
        placement: "top",
        disableBeacon: true,
        target: "#calculate-distance",
      },
      {
        content: (
          <div className={style["basic__step basic-imageStep"]}>
            <img
              src={"/assets/images/tour/geofencePanel.svg"}
              alt="car warning"
              className={style["step-image"]}
            />
            <div>
              <p className={style.stepHeader}>{t("geofence")}</p>
              <p className={style.stepDescription}>{t("geofence_toggle")}</p>
            </div>
          </div>
        ),
        placement: "top",
        disableBeacon: true,
        target: "#view-geofence",
      },
      {
        content: (
          <div className={style["basic__step basic-imageStep"]}>
            <img
              src={"/assets/images/tour/warning.svg"}
              alt="location"
              className={style["step-image"]}
            />
            <div>
              <p className={style.stepHeader}>{t("warning")}</p>
              <p className={style.stepDescription}>{t("warning_display")}</p>
            </div>
          </div>
        ),
        placement: "top",
        disableBeacon: true,
        target: "#warning",
      },
      {
        content: (
          <div className={style["basic__step basic-imageStep"]}>
            <img
              src={"/assets/images/tour/geofencePanel.svg"}
              alt="location"
              className={style["step-image"]}
            />
            <div>
              <p className={style.stepHeader}>{t("geofence_table")}</p>
              <p className={style.stepDescription}>
                {t("geofence_table_description")}
              </p>
            </div>
          </div>
        ),
        placement: "top",
        disableBeacon: true,
        target: "#geofence-table",
      },
      {
        content: (
          <div className={style["basic__step basic-imageStep"]}>
            <img
              src={"/assets/images/tour/landmarkPanel.svg"}
              alt="landmarks"
              className={style["step-image"]}
            />
            <div>
              <p className={style.stepHeader}>{t("landmark_panel")}</p>
              <p className={style.stepDescription}>{t("landmark_table")}</p>
            </div>
          </div>
        ),
        placement: "top",
        disableBeacon: true,
        target: "#landmarks-table",
      },
      {
        content: (
          <div className={style["basic__step basic-imageStep"]}>
            <img
              src={"/assets/images/tour/landmarkPanel.svg"}
              alt="landmarks"
              className={style["step-image"]}
            />
            <div>
              <p className={style.stepHeader}>{t("landmark")}</p>
              <p className={style.stepDescription}>{t("landmark_toggle")}</p>
            </div>
          </div>
        ),
        placement: "top",
        disableBeacon: true,
        target: "#landmarks-display",
      },
      {
        content: (
          <div className={style["basic__step basic-imageStep"]}>
            <img
              src={"/assets/images/tour/carGroup.svg"}
              alt="grouped Cars"
              className={style["image-large"]}
            />
            <div>
              <p className={style.stepHeader}>{t("group_cars")}</p>
              <p className={style.stepDescription}>
                {t("group_cars_description")}
              </p>
            </div>
          </div>
        ),
        placement: "top",
        disableBeacon: true,
        target: "#cluster-toggle",
      },
      {
        content: (
          <div className={style["basic__step basic-imageStep"]}>
            <div>
              <p className={style.stepHeader}>{t("search")}</p>
              <p className={style.stepDescription}>{t("search_map")}</p>
            </div>
          </div>
        ),
        placement: "top",
        disableBeacon: true,
        target: "#search-map",
      },
      {
        content: (
          <div className={style["basic__step basic-imageStep"]}>
            <img
              src={"/assets/images/tour/export.svg"}
              alt="grouped Cars"
              className={style["step-image"]}
            />
            <div>
              <p className={style.stepHeader}>{t("export")}</p>
              <p className={style.stepDescription}>{t("export_description")}</p>
            </div>
          </div>
        ),
        placement: "top",
        disableBeacon: true,
        target: "#export",
      },

      {
        content: (
          <div className={style["basic__step"]}>
            <p>{t("open_settings")}</p>
          </div>
        ),
        disableBeacon: true,
        hideCloseButton: true,
        spotlightPadding: 4,
        hideFooter: true,
        placement: "left",
        target: "#track-toggle",
        spotlightClicks: true,
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("configuration")}</h4>
            <p>{t("configuration_description")}</p>
          </div>
        ),
        disableBeacon: true,
        hideCloseButton: true,
        placement: "left",
        spotlightPadding: 0,
        target: "#config-menu",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <p>{t("all_filter")}</p>
          </div>
        ),
        disableBeacon: true,
        hideCloseButton: true,
        placement: "bottom",
        spotlightPadding: 10,
        target: "#btn-check-all-tour",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <p>{t("active_filter")}</p>
          </div>
        ),
        disableBeacon: true,
        hideCloseButton: true,
        placement: "bottom",
        spotlightPadding: 10,
        target: "#btn-check-active-tour",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <p>{t("offline_filter")}</p>
          </div>
        ),
        disableBeacon: true,
        hideCloseButton: true,
        placement: "bottom",
        spotlightPadding: 10,
        target: "#btn-check-offline-tour",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <p>{t("car_status")}</p>
          </div>
        ),
        disableBeacon: true,
        hideCloseButton: true,
        placement: "bottom",
        spotlightPadding: 10,
        target: "#car-filter",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("search")}</h4>
            <p>{t("search_label")}</p>
          </div>
        ),
        disableBeacon: true,
        hideCloseButton: true,
        placement: "bottom",
        spotlightPadding: 10,
        target: "#search-filter",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <p>{t("car_groups")}</p>
          </div>
        ),
        disableBeacon: true,
        hideCloseButton: true,
        placement: "left",
        spotlightPadding: 10,
        spotlightClicks: true,
        target: "#menu-tree",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <p>{t("map_Popup")}</p>
          </div>
        ),
        disableBeacon: true,
        hideCloseButton: true,
        placement: "left",
        spotlightPadding: 10,
        target: ".leaflet-popup-content-wrapper",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <p>{t("config-popup")}</p>
          </div>
        ),
        disableBeacon: true,
        hideCloseButton: true,
        placement: "left",
        spotlightPadding: 10,
        target: "#popup_config_header_icon",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <p>{t("popup_history")}</p>
          </div>
        ),
        disableBeacon: true,
        hideCloseButton: true,
        placement: "left",
        spotlightPadding: 10,
        target: ".btnHPB",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <p>{t("popup_actions")}</p>
          </div>
        ),
        disableBeacon: true,
        hideCloseButton: true,
        placement: "left",
        spotlightPadding: 10,
        target: ".dropbtn",
      },
    ],
    scheduledReports: [
      {
        content: (
          <p className={style["basic__step"]}>{t("Welcome_To_Reports")}</p>
        ),
        locale: { skip: <strong aria-label="skip">{t("End_Tour")}</strong> },
        placement: "center",
        target: "#locate",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Add_Report")}</h4>
            <p>{t("Add_report_desc")}</p>
          </div>
        ),
        spotlightPadding: 20,
        placement: "right",
        target: "#add-report",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Delete_Report")}</h4>
            <p>{t("Delete_Report_Desc")} </p>
          </div>
        ),
        spotlightPadding: 20,
        placement: "bottom",
        target: "#delete-report",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Reports_Table")}</h4>
            <p>{t("Reports_Table_Desc")}</p>
          </div>
        ),
        spotlightPadding: 20,
        placement: "top",
        target: "#reports-data",
      },
    ],
    preventiveSteps: [
      {
        content: (
          <div className={style["basic__step"]}>
            <div className={style["step-body"]}>
              <p className={style.stepDescription}>
                {t("add_maintenance_descreption")}
              </p>
            </div>
          </div>
        ),
        placement: "right",
        disableBeacon: true,
        target: "#add-maintenance-plan",
      },
      {
        content: (
          <div className={style["basic__step basic-imageStep"]}>
            <div className={style["step-body"]}>
              <p className={style.stepDescription}>{t("delete_selected")}</p>
            </div>
          </div>
        ),
        placement: "bottom",
        disableBeacon: true,
        target: "#delete-selected",
      },
      {
        content: (
          <div className={style["basic__step basic-imageStep"]}>
            <div className={style["step-body"]}>
              <p className={style.stepDescription}>{t("view_history")}</p>
            </div>
          </div>
        ),
        placement: "bottom",
        disableBeacon: true,
        target: "#view-history",
      },
      {
        content: (
          <div className={style["basic__step basic-imageStep"]}>
            <div className={style["step-body"]}>
              <p className={style.stepDescription}>
                {t("Exports_all_the_Table_Data_to_an_Excel_file")}
              </p>
            </div>
          </div>
        ),
        placement: "right",
        disableBeacon: true,
        target: "#export-excel",
      },
      {
        content: (
          <div className={style["basic__step basic-imageStep"]}>
            <div className={style["step-body"]}>
              <p className={style.stepDescription}>
                {t("export_pdf_description")}
              </p>
            </div>
          </div>
        ),
        placement: "right",
        disableBeacon: true,
        target: "#export-pdf",
      },
    ],
    managementSteps: [
      {
        content: (
          <p className={style["basic__step"]}>{t("Welcome-management")}</p>
        ),
        placement: "center",
        target: "#management",
        disableBeacon: true,
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Manage_Accounts")}</h4>
            <p>{t("Accounts_Desc")}</p>
          </div>
        ),
        disableBeacon: true,
        spotlightPadding: 20,
        placement: "bottom",
        target: "#manage-accounts",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Manage_Users")}</h4>
            <p>{t("Users_Desc")}</p>
          </div>
        ),
        spotlightPadding: 20,
        placement: "bottom",
        target: "#manage-users",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Manage_Vehicles")}</h4>
            <p>{t("Vehicles_Desc")}</p>
          </div>
        ),
        spotlightPadding: 20,
        placement: "bottom",
        target: "#manage-vehicles",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Manage_Devices")} </h4>
            <p>{t("Devices_Desc")}</p>
          </div>
        ),
        spotlightPadding: 20,
        placement: "top",
        target: "#manage-devices",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Manage_Drivers")} </h4>
            <p>{t("Drivers_Desc")}</p>
          </div>
        ),
        spotlightPadding: 20,
        placement: "top",
        target: "#manage-divers",
      },
      {
        content: (
          <div className={style["basic__step"]}>
            <h4>{t("Manage_Groups")} </h4>
            <p>{t("Groups_Desc")}</p>
          </div>
        ),
        spotlightPadding: 20,
        placement: "top",
        target: "#manage-groups",
      },
    ],
    driverManagmentSteps: [
      {
        content: (
          <div className={style["basic__step basic-imageStep"]}>
            <div className={style["step-body"]}>
              <p className={style.stepHeader}></p>
              <p className={style.stepDescription}>
                {t("driverManagment_intro")}
              </p>
            </div>
          </div>
        ),
        placement: "center",
        disableBeacon: true,
        target: "body",
      },
      {
        content: (
          <div className={style["basic__step basic-imageStep"]}>
            <div className={style["step-body"]}>
              <p className={style.stepHeader}></p>
              <p className={style.stepDescription}>{t("addDriver_button")}</p>
            </div>
          </div>
        ),
        placement: "right",
        disableBeacon: true,
        target: "#add-new-driver",
      },
      {
        content: (
          <div className={style["basic__step basic-imageStep"]}>
            <div className={style["step-body"]}>
              <p className={style.stepHeader}></p>
              <p className={style.stepDescription}>{t("export_button")}</p>
            </div>
          </div>
        ),
        placement: "right",
        disableBeacon: true,
        target: "#export-excel",
      },
      {
        content: (
          <div className={style["basic__step basic-imageStep"]}>
            <div className={style["step-body"]}>
              <p className={style.stepHeader}></p>
              <p className={style.stepDescription}>{t("export_pdf_button")}</p>
            </div>
          </div>
        ),
        placement: "right",
        disableBeacon: true,
        target: "#export-pdf",
      },
    ],
  };
  return steps;
};

export default useStepDashboard;
