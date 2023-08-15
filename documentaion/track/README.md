<h3 align="center">Documentation Track</h3>

---

## Table of Contents

- [Widget Menu](#widget_menu)
- [Menu Bottom](#menu_bottom)
- [Actions](#actions)
- [Configration Popup](#config_popup)
- [downLoad Data Vehicles](#downLoad_data_vehicles)

## Widget Menu <a name = "widget_menu"></a>

## Menu Bottom <a name = "menu_bottom"></a>

## Actions <a name = "actions"></a>

## Configration Popup <a name = "config_popup"></a>

## downLoad Data Vehicles <a name = "downLoad_data_vehicles"></a>

**Trying to remove map and add it again**

## Stepper Component <a name = "StepperComp"></a>

**States:**

- **AllSteps** this to store all steps that incoming from api
- **selectedStep** this to store an index for a selected step
- **AllLocations** this to store all data for each steps
- **selectedSteps** this to store AllLocations for current selected steps
- **stats** this to store the status of moving vehcele on the map
- **currentSLocation** this to store the current selected location
- **speedCar** this to store speed of car on the map
- **locInfo** this to store the selected step

- **MinDistance** this to store the selected step
- **MaxMarkers** this to store current tap id of the report
- **MaxGuides** this to store current report data
- **allMarkers** this to store current tap title of the report
- **colorOfMarkers** this to store type of date range of report
- **colorOfGuides** this to store the status of request report in ReportsOptions Model
- **markerIcon** this to store the status of request report in ActiveReportOptions Model
- **guidesIcon** this to store the status of sidebar
- **IsFromState** this to store the message for un selected vehicles
- **isToggleConfigOpen** this to store the api and uniqe id for selected reports

**Functions:**

- handleselectedStep -> this to get all information about selected step and drawing them in the map
- icons -> this to handling icons
- drawInitialVehicle -> this to draw Initial Vehicle in the map
- drawselectedsteps -> this is control function
- drawStepsPath -> this to draw lines in the map
- drawStepsMarkers -> this to add Markers on the map
- drawStepsGuides -> this to add Guides on the map
- handleClose -> this to Close opening step
- handleSaveSettings -> this to Save Map Settings
- handleSelect -> this to handling Change that comming from DateRangePicker
