import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const LiveMonitoringContext = createContext(null);

const DATA_URL =
  "/data/aws_weather_anomaly_dataset_v2_15col.csv";

const STREAM_INTERVAL = 2000;

const STATIONS = [
  "Ambala",
  "Bikaner",
  "Car Nicobar",
  "Chandigarh / Surajpur",
  "Cochin Int. Airport / Kaladi",
  "Coimbatore / Peelamedu",
  "Ludhiana",
  "Mandi",
  "Palakkad",
  "Patiala",
  "Shimla / Kanda",
  "Sundernagar / Sundarnagar",
  "Thrissur",
  "Una",
];

/* =========================================================
   CSV PARSER
========================================================= */

function parseCSV(text) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\r?\n/);

  if (!lines.length) return [];

  const parseLine = (line) => {
    const values = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (
          insideQuotes &&
          line[i + 1] === '"'
        ) {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (
        char === "," &&
        !insideQuotes
      ) {
        values.push(current);
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current);
    return values;
  };

  const headers = parseLine(lines[0]).map(
    (header) => header.trim()
  );

  return lines.slice(1).map((line, index) => {
    const values = parseLine(line);

    const row = {
      __datasetIndex: index,
    };

    headers.forEach((header, valueIndex) => {
      let value =
        values[valueIndex] ?? "";

      value = value.trim();

      if (
        value.startsWith('"') &&
        value.endsWith('"')
      ) {
        value = value.slice(1, -1);
      }

      row[header] = value;
    });

    return row;
  });
}

/* =========================================================
   NUMBER CONVERSION
========================================================= */

function toNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isNaN(number)
    ? null
    : number;
}

/* =========================================================
   NORMALIZE RECORD
========================================================= */

function normalizeRecord(record) {
  return {
    ...record,

    avg_temp: toNumber(record.avg_temp),
    min_temp: toNumber(record.min_temp),
    max_temp: toNumber(record.max_temp),

    relative_humidity: toNumber(
      record.relative_humidity
    ),

    wind_speed: toNumber(
      record.wind_speed
    ),

    air_pressure: toNumber(
      record.air_pressure
    ),

    rainfall: toNumber(
      record.rainfall
    ),

    elevation: toNumber(
      record.elevation
    ),

    latitude: toNumber(
      record.latitude
    ),

    longitude: toNumber(
      record.longitude
    ),
  };
}

/* =========================================================
   PROVIDER
========================================================= */

export function LiveMonitoringProvider({
  children,
}) {
  const [dataset, setDataset] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [
    selectedStation,
    setSelectedStationState,
  ] = useState(
    () =>
      localStorage.getItem(
        "skyguard-selected-station"
      ) || "Ambala"
  );

  /*
    CURRENT POSITION OF EVERY STATION

    Example:

    Ambala   -> 104
    Bikaner  -> 104
    Una      -> 104

    ALL stations advance together every 2 sec.
  */
  const [stationIndexes, setStationIndexes] =
    useState({});

  const intervalRef = useRef(null);

  const selectedStationRef =
    useRef(selectedStation);

  const stationMapRef =
    useRef({});

  /* =======================================================
     UPDATE SELECTED STATION REF
  ======================================================= */

  useEffect(() => {
    selectedStationRef.current =
      selectedStation;
  }, [selectedStation]);

  /* =======================================================
     LOAD CSV ONCE
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadDataset = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          DATA_URL
        );

        if (!response.ok) {
          throw new Error(
            `Dataset request failed: ${response.status}`
          );
        }

        const csvText =
          await response.text();

        const rows = parseCSV(csvText);

        const normalizedRows =
          rows.map(normalizeRecord);

        if (!cancelled) {
          setDataset(normalizedRows);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(
            "Failed to load AWS weather dataset."
          );

          setLoading(false);
        }
      }
    };

    loadDataset();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     GROUP ALL DATA BY STATION
  ======================================================= */

  const stationMap = useMemo(() => {
    const map = {};

    STATIONS.forEach((station) => {
      map[station] = [];
    });

    dataset.forEach((record) => {
      const station =
        record.station_name;

      if (!station) return;

      if (!map[station]) {
        map[station] = [];
      }

      map[station].push(record);
    });

    return map;
  }, [dataset]);

  /* =======================================================
     KEEP MAP REF UPDATED
  ======================================================= */

  useEffect(() => {
    stationMapRef.current =
      stationMap;
  }, [stationMap]);

  /* =======================================================
     INITIALIZE ALL STATIONS
  ======================================================= */

  useEffect(() => {
    if (!dataset.length) return;

    setStationIndexes(
      (previousIndexes) => {
        const nextIndexes = {
          ...previousIndexes,
        };

        STATIONS.forEach((station) => {
          if (
            nextIndexes[station] ===
            undefined &&
            stationMap[station]?.length
          ) {
            nextIndexes[station] = 0;
          }
        });

        return nextIndexes;
      }
    );
  }, [dataset, stationMap]);

  /* =======================================================
     GLOBAL 2-SECOND STREAM

     EVERY STATION ADVANCES HERE.

     This is the important change.
  ======================================================= */

  useEffect(() => {
    if (!dataset.length) return;

    if (intervalRef.current) {
      clearInterval(
        intervalRef.current
      );
    }

    intervalRef.current =
      setInterval(() => {
        const currentMap =
          stationMapRef.current;

        setStationIndexes(
          (previousIndexes) => {
            const nextIndexes = {
              ...previousIndexes,
            };

            STATIONS.forEach((station) => {
              const records =
                currentMap[station] ||
                [];

              if (!records.length) {
                return;
              }

              const currentIndex =
                previousIndexes[
                  station
                ] ?? 0;

              /*
                Stop at last record.
                No restart from record 1.
              */
              if (
                currentIndex <
                records.length - 1
              ) {
                nextIndexes[station] =
                  currentIndex + 1;
              }
            });

            return nextIndexes;
          }
        );
      }, STREAM_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(
          intervalRef.current
        );

        intervalRef.current =
          null;
      }
    };
  }, [dataset.length]);

  /* =======================================================
     SELECTED STATION DATA
  ======================================================= */

  const stationData =
    stationMap[selectedStation] ||
    [];

  const currentIndex =
    stationIndexes[selectedStation] ??
    0;

  const currentRecord =
    stationData[currentIndex] ||
    null;

  /* =======================================================
     LIVE MONITORING HISTORY

     Newest record first.
  ======================================================= */

  const visibleRecords = useMemo(() => {
    if (!stationData.length) {
      return [];
    }

    const recordsReceived =
      stationData.slice(
        0,
        currentIndex + 1
      );

    return [...recordsReceived].reverse();
  }, [
    stationData,
    currentIndex,
  ]);

  /* =======================================================
     SET SELECTED STATION
  ======================================================= */

  const setSelectedStation =
    useCallback((station) => {
      if (!STATIONS.includes(station)) {
        return;
      }

      selectedStationRef.current =
        station;

      setSelectedStationState(
        station
      );

      localStorage.setItem(
        "skyguard-selected-station",
        station
      );
    }, []);

  /* =======================================================
     GET DATA FOR ANY STATION
  ======================================================= */

  const getStationData =
    useCallback(
      (station) => {
        return (
          stationMap[station] || []
        );
      },
      [stationMap]
    );

  /* =======================================================
     GET CURRENT RECORD FOR ANY STATION
  ======================================================= */

  const getCurrentRecord =
    useCallback(
      (station) => {
        const records =
          stationMap[station] ||
          [];

        const index =
          stationIndexes[station] ??
          0;

        return (
          records[index] ||
          null
        );
      },
      [
        stationMap,
        stationIndexes,
      ]
    );

  /* =======================================================
     FORMAT NUMBER
  ======================================================= */

  const formatNumber =
    useCallback(
      (value, digits = 1) => {
        if (
          value === null ||
          value === undefined ||
          value === "" ||
          Number.isNaN(
            Number(value)
          )
        ) {
          return "—";
        }

        return Number(value).toFixed(
          digits
        );
      },
      []
    );

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const contextValue = useMemo(
    () => ({
      dataset,
      loading,
      error,

      stations: STATIONS,

      selectedStation,
      setSelectedStation,

      stationData,
      currentIndex,
      currentRecord,
      visibleRecords,

      stationIndexes,

      getStationData,
      getCurrentRecord,
      formatNumber,

      streamInterval:
        STREAM_INTERVAL,

      isLive:
        !loading &&
        !error &&
        dataset.length > 0,
    }),
    [
      dataset,
      loading,
      error,
      selectedStation,
      setSelectedStation,
      stationData,
      currentIndex,
      currentRecord,
      visibleRecords,
      stationIndexes,
      getStationData,
      getCurrentRecord,
      formatNumber,
    ]
  );

  return (
    <LiveMonitoringContext.Provider
      value={contextValue}
    >
      {children}
    </LiveMonitoringContext.Provider>
  );
}

/* =========================================================
   CUSTOM HOOK
========================================================= */

export function useLiveMonitoring() {
  const context =
    useContext(
      LiveMonitoringContext
    );

  if (!context) {
    throw new Error(
      "useLiveMonitoring must be used inside LiveMonitoringProvider"
    );
  }

  return context;
}

export default LiveMonitoringContext;