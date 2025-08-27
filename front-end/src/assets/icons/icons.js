// src/assets/icons/icons.js
import L from "leaflet";
import {
  faStore,        // mall
  faUtensils,     // restaurant
  faBriefcase,    // office
  faIndustry,     // industrial
  faShoppingBag,  // retail
  faBuilding,     // generic building
  faQuestionCircle, // default / other
  faSchool,
  faHospital
} from "@fortawesome/free-solid-svg-icons";

// Font Awesome Core renderer
import { icon as faIcon } from "@fortawesome/fontawesome-svg-core";

// Helper → turn FA icon into Leaflet divIcon
function makeIcon(fa, color = "#000000", bg = "#ffffff") {
  const svg = faIcon(fa).html.join(""); // render <svg> string
  return L.divIcon({
    className: "fa-leaflet-icon",
    html: `<div style="
      background:${bg};
      border-radius:50%;
      width:32px;
      height:32px;
      display:flex;
      align-items:center;
      justify-content:center;
    ">
      <div style="color:${color};font-size:16px;">${svg}</div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

// ✅ Export industry → Leaflet icon
export const businessIcons = {
  mall: makeIcon(faStore, "#be185d", "#fce7f3"),
  school: makeIcon(faSchool, "#7c3aed", "#ede9fe"),
  restaurant: makeIcon(faUtensils, "#dc2626", "#fee2e2"),
  mall: makeIcon(faShoppingBag, "#f97316", "#ffedd5"),
  hospital: makeIcon(faHospital, "#16a34a", "#dcfce7"),
  office: makeIcon(faBriefcase, "#2563eb", "#dbeafe"),
  default: makeIcon(faQuestionCircle, "#374151", "#f3f4f6"),
};
