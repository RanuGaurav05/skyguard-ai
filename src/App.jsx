import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Stations from "./pages/Stations";
import Anomalies from "./pages/Anomalies";
import SensorHealth from "./components/SensorHealth";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import LiveMonitoring from "./pages/LiveMonitoring";

import Layout from "./components/Layout";
import { LiveMonitoringProvider } from "./components/LiveMonitoringContext";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      {/* GLOBAL LIVE MONITORING PROVIDER */}
      <LiveMonitoringProvider>
        <Routes>

          {/* LANDING PAGE */}
          <Route
            path="/"
            element={<LandingPage />}
          />

          {/* DASHBOARD APP */}
          <Route
            path="/dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />

          {/* LIVE MONITORING */}
          <Route
            path="/live-monitoring"
            element={
              <Layout>
                <LiveMonitoring />
              </Layout>
            }
          />

          {/* AWS STATIONS */}
          <Route
            path="/stations"
            element={
              <Layout>
                <Stations />
              </Layout>
            }
          />

          {/* ANOMALIES */}
          <Route
            path="/anomalies"
            element={
              <Layout>
                <Anomalies />
              </Layout>
            }
          />

          {/* SENSOR HEALTH */}
          <Route
            path="/health"
            element={
              <Layout>
                <SensorHealth />
              </Layout>
            }
          />

          {/* ANALYTICS */}
          <Route
            path="/analytics"
            element={
              <Layout>
                <Analytics />
              </Layout>
            }
          />

          {/* ALERTS */}
          <Route
            path="/alerts"
            element={
              <Layout>
                <Alerts />
              </Layout>
            }
          />

          {/* SETTINGS */}
          {/*
          <Route
            path="/settings"
            element={
              <Layout>
                <Settings />
              </Layout>
            }
          />
          */}

          {/* FALLBACK */}
          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>
      </LiveMonitoringProvider>
    </BrowserRouter>
  );
}

export default App;