import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const parameterConfig = {
  temperature: {
    label: "Temperature",
    unit: "°C",
    color: "#36B5D6",
    dataKey: "temperature",
  },
  pressure: {
    label: "Atmospheric Pressure",
    unit: "hPa",
    color: "#7890A2",
    dataKey: "pressure",
  },
  humidity: {
    label: "Relative Humidity",
    unit: "%",
    color: "#2F5175",
    dataKey: "humidity",
  },
};

const data = [
  { time: "10:00", temperature: 25.8, pressure: 1011.9, humidity: 71 },
  { time: "10:05", temperature: 26.1, pressure: 1012.1, humidity: 70 },
  { time: "10:10", temperature: 26.5, pressure: 1012.0, humidity: 69 },
  { time: "10:15", temperature: 26.7, pressure: 1012.4, humidity: 70 },
  { time: "10:20", temperature: 27.1, pressure: 1012.3, humidity: 68 },
  { time: "10:25", temperature: 27.0, pressure: 1012.5, humidity: 67 },
  { time: "10:30", temperature: 27.4, pressure: 1012.6, humidity: 68 },
  { time: "10:35", temperature: 27.4, pressure: 1012.6, humidity: 68 },
];

function WeatherChart() {
  const [activeParameter, setActiveParameter] = useState("temperature");

  const parameter = parameterConfig[activeParameter];

  return (
    <div className="weather-chart">
      <div className="card-header">
        <div>
          <span className="card-eyebrow">REAL-TIME ANALYSIS</span>

          <h2>Atmospheric Parameters</h2>

          <div className="chart-current">
            <span
              className="current-indicator"
              style={{ background: parameter.color }}
            />

            <strong>{data[data.length - 1][parameter.dataKey]}</strong>

            <span>{parameter.unit}</span>

            <small>Current {parameter.label}</small>
          </div>
        </div>

        <div className="chart-controls">
          <button className="chart-control active">30 MIN</button>
          <button className="chart-control">1 HR</button>
          <button className="chart-control">6 HR</button>
        </div>
      </div>

      <div className="parameter-tabs">
        {Object.entries(parameterConfig).map(([key, item]) => (
          <button
            key={key}
            className={`parameter-tab ${
              activeParameter === key ? "active" : ""
            }`}
            onClick={() => setActiveParameter(key)}
          >
            <span style={{ background: item.color }} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
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
              tick={{ fill: "#6F87A0", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              stroke="#526B87"
              tick={{ fill: "#6F87A0", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={["auto", "auto"]}
            />

            <Tooltip
              contentStyle={{
                background: "#101A35",
                border: "1px solid #28476D",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "11px",
              }}
              formatter={(value) => [
                `${value} ${parameter.unit}`,
                parameter.label,
              ]}
            />

            <Line
              type="monotone"
              dataKey={parameter.dataKey}
              stroke={parameter.color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: "#090E23",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-footer">
        <span>
          <i className="live-chart-dot" />
          LIVE DATA STREAM
        </span>

        <span>Sampling interval: 5 sec</span>

        <span>Data quality: 98.7%</span>
      </div>
    </div>
  );
}

export default WeatherChart;
