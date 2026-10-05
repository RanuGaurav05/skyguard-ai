import { useMemo, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useLiveMonitoring } from "./LiveMonitoringContext";

const parameterConfig = {
  temperature: {
    label: "Temperature",
    unit: "°C",
    color: "#36B5D6",
    dataKey: "avg_temp",
  },

  pressure: {
    label: "Atmospheric Pressure",
    unit: "hPa",
    color: "#7890A2",
    dataKey: "air_pressure",
  },

  humidity: {
    label: "Relative Humidity",
    unit: "%",
    color: "#2F5175",
    dataKey: "relative_humidity",
  },
};

const WINDOW_SIZE = 9;

function WeatherChart() {
  const [activeParameter, setActiveParameter] =
    useState("temperature");

  const {
    selectedStation,
    stationData,
    currentRecord,
    currentIndex,
    isLive,
  } = useLiveMonitoring();

  const parameter =
    parameterConfig[activeParameter];

  /* =======================================================
     9-POINT SLIDING WINDOW

     Example:

     Old:
     01 02 03 04 05 06 07 08 09

     New record arrives:

     02 03 04 05 06 07 08 09 10

     But because user wants NEWEST ON LEFT,
     display becomes:

     10 09 08 07 06 05 04 03 02
  ======================================================= */

  const chartData = useMemo(() => {
  if (!stationData.length) {
    return [];
  }

  // Records received up to the current live position
  const recordsUpToNow = stationData.slice(
    0,
    currentIndex + 1
  );

  // Keep ONLY the latest 9 records
  // Oldest record stays on the LEFT
  // Newest record stays on the RIGHT
  const lastNine = recordsUpToNow.slice(-9);

  return lastNine
    .map((record) => ({
      time: record.date_of_record,
      value: record[parameter.dataKey],
    }))
    .filter(
      (record) =>
        record.value !== null &&
        record.value !== undefined &&
        record.value !== "" &&
        !Number.isNaN(Number(record.value))
    );
}, [
  stationData,
  currentIndex,
  parameter.dataKey,
]);


  /* =======================================================
     CURRENT VALUE
  ======================================================= */

  const currentValue =
    currentRecord?.[
      parameter.dataKey
    ];

  const formattedCurrentValue =
    currentValue !== null &&
    currentValue !== undefined &&
    currentValue !== "" &&
    !Number.isNaN(
      Number(currentValue)
    )
      ? Number(
          currentValue
        ).toFixed(1)
      : "—";

  return (
    <div className="weather-chart">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="card-header">

        <div>

          <span className="card-eyebrow">
            REAL-TIME ANALYSIS
          </span>

          <h2>
            Atmospheric Parameters
          </h2>

          <div className="chart-current">

            <span
              className="current-indicator"
              style={{
                background:
                  parameter.color,
              }}
            />

            <strong>
              {formattedCurrentValue}
            </strong>

            <span>
              {parameter.unit}
            </span>

            <small>
              Current{" "}
              {parameter.label}
            </small>

          </div>

        </div>

      </div>


      {/* ===================================================
          PARAMETER TABS
      =================================================== */}

      <div className="parameter-tabs">

        {Object.entries(
          parameterConfig
        ).map(([key, item]) => (

          <button
            key={key}
            className={`parameter-tab ${
              activeParameter === key
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveParameter(
                key
              )
            }
          >

            <span
              style={{
                background:
                  item.color,
              }}
            />

            {item.label}

          </button>

        ))}

      </div>


      {/* ===================================================
          CHART
      =================================================== */}

      <div className="chart-container">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 15,
              left: 0,
              bottom: 5,
            }}
          >

            <CartesianGrid
              stroke="#1B3155"
              strokeDasharray="3 5"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              stroke="#526B87"
              tick={{
                fill: "#6F87A0",
                fontSize: 11,
              }}
              axisLine={false}
              tickLine={false}
              padding={{
                left: 18,
                right: 8,
              }}
              interval={0}
            />

            <YAxis
              stroke="#526B87"
              tick={{
                fill: "#6F87A0",
                fontSize: 11,
                dy: -3,
              }}
              axisLine={false}
              tickLine={false}
              domain={[
                "auto",
                "auto",
              ]}
            />

            <Tooltip
              contentStyle={{
                background: "#101A35",
                border:
                  "1px solid #28476D",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "11px",
              }}
              formatter={(value) => [
                `${Number(value).toFixed(
                  1
                )} ${parameter.unit}`,
                parameter.label,
              ]}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke={parameter.color}
              strokeWidth={2.5}
              dot={false}
              connectNulls
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: "#090E23",
              }}
              isAnimationActive
              animationDuration={350}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>


      {/* ===================================================
          FOOTER
      =================================================== */}

      <div className="chart-footer">

        <span>
          <i className="live-chart-dot" />

          {isLive
            ? "LIVE DATA STREAM"
            : "DATA STREAM"}
        </span>

        <span>
          Station: {selectedStation}
        </span>

        <span>
          9-day window
        </span>

        <span>
          {chartData.length} points
        </span>

      </div>

    </div>
  );
}

export default WeatherChart;