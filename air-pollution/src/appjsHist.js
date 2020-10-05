// import sampleData from "./data/covids.json";
import covidData from "./data/jan.json";
import React, { useState } from "react";
import "antd/dist/antd.css";
import { StaticMap } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { AmbientLight, PointLight, LightingEffect } from "@deck.gl/core";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import { message, Typography } from "antd";
import { Statistic } from "antd";
import { Divider } from "antd";
import { Menu, Dropdown, Button } from "antd";
import { DownOutlined} from "@ant-design/icons";

// import RangeInput from "./range-input";
const { Title, Text } = Typography;


// Set your mapbox access token here
const mapboxApiAccessToken =
  "pk.eyJ1IjoidmVyYTFrIiwiYSI6ImNrZjQ3aWJoczA4ZGQydm43cXFjcW5peTkifQ.sYJ99dX7B8QyPgV_-TszTA"; // eslint-disable-line

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
  longitude: 122.0,
  latitude: 15.0,
  zoom: 6,
  minZoom: 2,
  maxZoom: 15,
  pitch: 40.5,
  bearing: -27
};

export const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];
/**
 
  [${randomData} * x / 255, 120, 255]
 */
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
  const infectionCount = object.elevationValue;

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
  // const [elevationIndex, setElevationIndex] = useState("infections");
  // const [pollutant, setPollutant] = useState("CO");
  const data = covidData;

  // const elevationIndexMenu = (
  //   <Menu onClick={changeElevationIndex}>
  //     <Menu.Item key="infections">Covid-19 Infections</Menu.Item>
  //     <Menu.Item key="Temperatures">Temperatures</Menu.Item>
  //   </Menu>
  // )
  
  // function changeElevationIndex(e) {
  //   setElevationIndex(e.key);
  //   message.success("Currently showing: " + e.key, 1);
  // }

  // const pollutantMenu = (
  //   <Menu onClick={changePollutant}>
  //     <Menu.Item key="totalIndex">Total Index</Menu.Item>"
  //     <Menu.Item key="CO">Carbon</Menu.Item>
  //     <Menu.Item key="N_Oxides">Nitrogen Oxides</Menu.Item>
  //     <Menu.Item key="CH4">Methane</Menu.Item>
  //     <Menu.Item key="O3">Ozone</Menu.Item>
  //   </Menu>
  // )

  // function changePollutant(e) {
  //   setPollutant(e.key);
  //   message.success("Currently showing: " + e.key, 1);
  // }


  const layers = [
          new HexagonLayer({
          id: "hexagon",
          colorRange,
          coverage,
          data,
          elevationRange: [0, 200],
          extruded: true,
          elevationScale: data && data.length * .5,
          getElevationValue: (d) => d.reduce((sum, point) => sum + point["infections"], 0) * 1000,
          getPosition: (d) => [d.COORDINATES[0], d.COORDINATES[1]],
          getColorValue: (d) => ((d.reduce((sum, point) => sum + point["CO"], 0)) / d.length),
          pickable: true,
          radius: 1600,
          material,
        })
  ];

  return (
    <div
      className="container"
      style={{ height: "100vh", width: "100vw", padding: 290, margin: 0 }}
    >
      <div
        style={{
          backgroundColor: "white",
          zIndex: "1000",
          position: "absolute",
          marginTop: "1.0%",
          right: "1.5%",
          display: "flex",
          flexDirection: "column",
          height: "470px",
          width: "340px",
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingTop: "12px",
        }}
      >
        <Title level={4}>USA Air Pollutants vs Covid-19 Infections/Temperature</Title>
        {/* <div
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
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-evenly",
            paddingTop: "16.66667px",
          }}
        >
          {colorRange.map((color) => (
                <div
                  style={{
                    width: "15%",
                    height: "18px",
                    backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
                  }}
                />
              ))}
        </div> */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "6px",
          }}
        >
          {/* <Text>Safe</Text>
          <Text>Hazardous</Text> */}
        </div>
        <div style={{ paddingTop: "12px" }}>
          <Statistic title="Total Covid-19 Infections: " value={getInfectionsCount(data)} />
        </div>
        <Divider />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignContent: "center",
            justifyContent: "space-around",
          }}
        >
        {/* <div style={{ paddingTop: "24px", paddingLeft: "50%" }}>
          <Text>
            View Code:{" "}
            <a href="https://github.com/Xsort-Programming/one-health-approach">GitHub</a>
          </Text>
        </div> */}
      </div>
      </div>
      <Divider />
      {/* <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignContent: "center",
          justifyContent: "space-around",
        }}
        >
          <Dropdown overlay={elevationIndexMenu} placement="bottomRight">
            <Button>
              {elevationIndex ? elevationIndex : " Covid/Temp "} <DownOutlined />
            </Button>
          </Dropdown>
        </div> */}
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