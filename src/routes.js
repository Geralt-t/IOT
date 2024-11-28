/*!

=========================================================
* Light Bootstrap Dashboard React - v2.0.1
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Dashboard from "views/Dashboard.js";
import UserProfile from "views/UserProfile.js";
import ActionHistory from "views/ActionHistory.js";
import DataSensor from "views/DataSensor.js";
import Bai5 from "views/Bai5.js";
const dashboardRoutes = [
  
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-chart-pie-35",
    component: Dashboard,
    layout: "/admin"
  },
  {
    path: "/user",
    name: "User Profile",
    icon: "nc-icon nc-circle-09",
    component: UserProfile,
    layout: "/admin"
  },
  {
    path: "/table",
    name: "Action History",
    icon: "nc-icon nc-notes",
    component: ActionHistory,
    layout: "/admin"
  },
  {
    path: "/datasensor",
    name: "Data Sensor",
    icon: "nc-icon nc-notes",
    component: DataSensor,
    layout: "/admin"
  },
  {
    path: "/Bai5",
    name: "Bai 5",
    icon: "nc-icon nc-chart-pie-35",
    component: Bai5,
    layout: "/admin"
  }
  
];

export default dashboardRoutes;
