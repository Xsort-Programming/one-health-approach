// import sampleData from "./data/covids.json";
import './index.css';
import fullData from "./data/full.json";
import janData from "./data/jan.json";
import febData from "./data/feb.json";
import marchData from "./data/mar.json";
import aprilData from "./data/apr.json";
import mayData from "./data/may.json";
import juneData from "./data/jun.json";
import React, { useState, useEffect, useRef} from "react";
import "antd/dist/antd.css";
import { StaticMap } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { AmbientLight, PointLight, LightingEffect } from "@deck.gl/core";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import { Typography } from "antd";
import { Statistic } from "antd";
import { CSSTransition } from 'react-transition-group'

const { Title, Text } = Typography;


// Set your mapbox access token here
const mapboxApiAccessToken =
  "pk.eyJ1IjoidmVyYTFrIiwiYSI6ImNrZjQ3aWJoczA4ZGQydm43cXFjcW5peTkifQ.sYJ99dX7B8QyPgV_-TszTA"; // public token URL

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const pointLight1 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-0.144528, 49.739968, 80000]
});

const pointLight2 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-3.807751, 54.104682, 8000]
});   

const lightingEffect = new LightingEffect({ambientLight, pointLight1, pointLight2});

const material = {
  ambient: 0.64,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [51, 51, 51]
};

const INITIAL_VIEW_STATE = {
  longitude: 105.0,
  latitude: 40.0,
  zoom: 3.5,
  minZoom: 2,
  maxZoom: 15,
  pitch: 40.5,
  bearing: -27
};

export const colorRange = [
  [49, 201, 38],
  [119, 212, 112],
  [50, 191, 120],
  [90, 75, 250],
  [222, 36, 242],
  [145, 6, 73]
];

export const heatmapColorRange = [
  [255, 255, 178],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [240, 59, 32],
  [189, 0, 38],
];


function getTooltip({ object }) {
  if (!object) {
    return null;
  }
  console.log(object);
  const lat = object.position[1];
  const lng = object.position[0];
  const airQ = object.colorValue;
  const infectionCount = object.elevationValue / 10000;

  return `\
    Latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ""}
    Longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ""}
    Air Quality: ${airQ} 
    Number of Infections: ${infectionCount} `;
}

function getInfectionsCount(data) {
  var count = 0;
  for (var i = 0; i < data.length; i++) {

    count += data[i].infections;
  }
  return count;
}

export default function App({
  intensity = 1,
  threshold = 0.1,
  radiusPixels = 30,
  mapStyle = "mapbox://styles/mapbox/dark-v9",
  coverage = 1,
}) {
  // USESTATES FOR DATA AND VISUALIZATION
  const [data, setData] = useState(fullData);
  const [airPollute, setAirPollute] = useState('Index');
  
  const updateAll = () => setData(fullData);
  const updateJan = () => setData(janData);
  const updateFeb = () => setData(febData);
  const updateMarch = () => setData(marchData);
  const updateApril = () => setData(aprilData);
  const updateMay = () => setData(mayData);
  const updateJune = () => setData(juneData);

  const changetoAQI = () => setAirPollute('AQI');
  const changeToCO = () => setAirPollute('CO');
  const changeToO3 = () => setAirPollute('O3');
  const changeToCH4 = () => setAirPollute('CH4');

// NAVBAR FUNCTIONS

  function Navbar(props) {
    return (
      <nav className="navbar">
        <ul className="navbar-nav">{props.children}</ul>
      </nav>
    );
  }

  function NavItem(props) {
    const [open, setOpen] = useState(false);

    return (
      <li className="nav-item">
        <a href="#" className="icon-button" onClick={() => setOpen(!open)}>
          {props.icon}
        </a>
        {open && props.children}
      </li>
    );
  }

  function DropdownMenu() {
    const [activeMenu, setActiveMenu] = useState('main');
    const [menuHeight, setMenuHeight] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
      setMenuHeight(dropdownRef.current?.firstChild.offsetHeight)
    }, [])

    function calcHeight(el) {
      const height = el.offsetHeight;
      setMenuHeight(height);
    }

    function DropdownItem(props) {
      return (
        <a href="#" className="menu-item" onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}>
          <span className="icon-button">{props.leftIcon}</span>
          {props.children}
          <span className="icon-right">{props.rightIcon}</span>
        </a>
      );
    }
    return (
      <div className="dropdown" style={{ height: menuHeight }} ref={dropdownRef}>

        <CSSTransition
          in={activeMenu === 'main'}
          timeout={500}
          classNames="menu-primary"
          unmountOnExit
          onEnter={calcHeight}>
          <div className="menu">
            <DropdownItem
              leftIcon="🕓"
              goToMenu="time">
              Change Time Range
            </DropdownItem>
            <DropdownItem
              leftIcon="☁"
              goToMenu="airPollutant">
              Change Air Pollutant
            </DropdownItem>
            <DropdownItem
              leftIcon="📂">
                <a href="https://github.com/Xsort-Programming/one-health-approach" target="_blank">View Code</a>
            </DropdownItem>
            <DropdownItem
              leftIcon="ℹ">
                <a href="https://github.com/Xsort-Programming/one-health-approach/tree/main/Data_and_analysis_scripts" target="_blank">
                Data Source: On GitHub page
                </a>
            </DropdownItem>
          </div>
        </CSSTransition>

        <CSSTransition
          in={activeMenu === 'time'}
          timeout={500}
          classNames="menu-secondary"
          unmountOnExit
          onEnter={calcHeight}>
          <div className="menu">
            <DropdownItem goToMenu="main" leftIcon="◀️">
              Go Back
            </DropdownItem>
            <div onClick={updateAll}>
              <DropdownItem leftIcon="✓">All</DropdownItem>
            </div>
            <div onClick={updateJan}>
              <DropdownItem leftIcon="J">Jan</DropdownItem>
            </div>
            <div onClick={updateFeb}>
              <DropdownItem leftIcon="F">Feb</DropdownItem>
            </div>
            <div onClick={updateMarch}>
              <DropdownItem leftIcon="M">March</DropdownItem>
            </div>
            <div onClick={updateApril}>
              <DropdownItem leftIcon="A">April</DropdownItem>
            </div>
            <div onClick={updateMay}>
              <DropdownItem leftIcon="M">May</DropdownItem>
            </div>
            <div onClick={updateJune}>
              <DropdownItem leftIcon="J">June</DropdownItem>  
            </div>
          </div>
        </CSSTransition>

        <CSSTransition
          in={activeMenu === 'airPollutant'}
          timeout={500}
          classNames="menu-secondary"
          unmountOnExit
          onEnter={calcHeight}>
          <div className="menu">
            <DropdownItem goToMenu="main" leftIcon="◀️">
              <p>Go Back</p>
            </DropdownItem>
            <div onClick={changetoAQI()}>
            <DropdownItem leftIcon="AQI">Air Quality Index (Xsort)</DropdownItem>
            </div>
            <div onClick={changeToCH4()}>
            <DropdownItem leftIcon="CH4">Methane</DropdownItem>
            </div>
            <div onClick={changeToO3()}>
            <DropdownItem leftIcon="O3">Ozone</DropdownItem>
            </div>
            <div onClick={changeToCO()}>
            <DropdownItem leftIcon="CO">Carbon</DropdownItem>
            </div>
          </div>
        </CSSTransition>
      </div>
    );
  }

// LAYERS
  const layers = [
      new HexagonLayer({
      id: "hexagon",
      colorRange,
      coverage,
      data,
      elevationRange: [0, 20000],
      elevationScale: 100,
      extruded: true,
      getElevationValue: (d) => d.reduce((sum, point) => sum + point["infections"], 0) * 10000,
      getPosition: (d) => [d.COORDINATES[0], d.COORDINATES[1]],
      getColorValue: (d) => d.reduce((sum, point) => sum + point[airPollute], 0) / d.length,
      pickable: true,
      radius: 10000,
      material,
    })
  ];

  return (
    <div>
      <div
        style={{
          backgroundColor: "#B9B6B5",
          zIndex: "1000",
          position: "absolute",
          marginTop: "40.0%",
          right: "1.5%",
          display: "flex",
          flexDirection: "column",
          height: "160px",
          width: "300px",
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingTop: "10px",
        }}
      >
        <div
          style={{
            display: "flex", 
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}>
        <Text>Air Pollution Safety Index</Text>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-evenly",
            paddingTop: "7px",
          }}
        >
          {colorRange.map((color) => (
                <div
                  style={{
                    width: "16.666677%",
                    height: "18px",
                    backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
                  }}
                />
              ))}
        </div>
        <div
          className="legend-text"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "6px",
          }}
        >
          <Text>Low Hazard</Text>
          <Text>High Hazard</Text>
        </div>
        <div style={{ paddingTop: "7px" }}>
          <Statistic title="Total Covid-19 Infections: " value={getInfectionsCount(data)} />
        </div>
      </div>
      <div
        style={{
          zIndex: "1000",
          right: "0.0%",
          position: "absolute",
        }}
      >
        <Navbar>
          <NavItem icon="↡">
            <DropdownMenu/>
          </NavItem>
        </Navbar>
      </div>
      <div
        style={{
          zIndex: "-1",
        }}
      >
        <DeckGL
          effects={[lightingEffect]}
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          layers={layers}
          getTooltip={getTooltip}
        >
          <StaticMap
            reuseMaps
            mapStyle={mapStyle}
            preventStyleDiffing={true}
            mapboxApiAccessToken={mapboxApiAccessToken}
          />
        </DeckGL>
      </div>
    </div>

  );
}
