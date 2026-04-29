//frontend\src\hooks\useKpis.js
import { useEffect, useState } from "react";
import {
  getProjectCycleTime,
  getProjectHistory,
  getSprintCompliance,
  getSprintDuration,
  getUserPrecisionEstimation,
} from "../services/api";

const KPI_DEFINITIONS = [
  {
    key: "precision",
    title: "Precisión de estimación de carga",
    historyType: "PRECISION_ESTIMACION",
    color: "purple",
    scope: "user",
    unit: "%",
    aliases: [
      "precision-estimacion",
      "precisionestimacion",
      "precision-estimacion-carga",
      "precisionestimaciondecarga",
      "estimacion-de-carga",
      "estimaciondecarga",
      "precision",
      "precision de estimacion",
    ],
    valueFields: [
      "efficiencyPercentage",
      "efficiencypercentage",
      "precisionEstimacion",
      "precision",
      "porcentajeCarga",
      "percentage",
      "valor",
      "value",
      "average",
      "promedio",
    ],
    statusFields: ["statusMessage", "message", "mensaje", "descripcion"],
    fetcher: getUserPrecisionEstimation,
  },
  {
    key: "compliance",
    title: "Cumplimiento de tareas",
    historyType: "CUMPLIMIENTO_SPRINT",
    color: "orange",
    scope: "sprint",
    unit: "%",
    aliases: ["cumplimiento", "sprintcompliance", "compliance"],
    valueFields: [
      "productivityPercentage",
      "compliancePercentage",
      "cumplimiento",
      "percentage",
      "valor",
      "value",
      "average",
      "promedio",
    ],
    statusFields: ["statusMessage", "message", "mensaje", "descripcion"],
    fetcher: getSprintCompliance,
  },
  {
    key: "cycleTime",
    title: "Tareas por equipo",
    historyType: "TIEMPO_CICLO",
    color: "green",
    scope: "project",
    unit: "%",
    aliases: ["tiempo-ciclo", "tiempociclo", "cycletime", "tiempo de ciclo"],
    valueFields: [
      "productivityPercentage",
      "tiempoCiclo",
      "cycleTime",
      "valor",
      "value",
      "average",
      "promedio",
    ],
    statusFields: ["statusMessage", "message", "mensaje", "descripcion"],
    fetcher: getProjectCycleTime,
  },
  {
    key: "duration",
    title: "Duración del sprint",
    historyType: "DURACION_SPRINT",
    color: "blue",
    scope: "sprint",
    unit: "%",
    aliases: ["duracion", "duration", "sprintduration", "sprint duración"],
    valueFields: [
      "efficiencyPercentage",
      "efficiencypercentage",
      "duracion",
      "duration",
      "valor",
      "value",
      "average",
      "promedio",
    ],
    statusFields: ["statusMessage", "message", "mensaje", "descripcion"],
    fetcher: getSprintDuration,
  },
];

const normalizeText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const unwrapResponse = (response) => {
  if (response && typeof response === "object") {
    return response.data ?? response.result ?? response.payload ?? response;
  }

  return response;
};

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const normalizeMetricValue = (value, metric) => {
  const number = toNumber(value);
  if (number === null) {
    return null;
  }

  if (metric.unit === "%" && Math.abs(number) <= 1) {
    return number * 100;
  }

  return number;
};

const formatMetricValue = (value, metric) => {
  const number = normalizeMetricValue(value, metric);
  if (number === null) {
    return "Sin datos";
  }

  if (metric.unit === "%") {
    return `${number.toFixed(1)}%`;
  }

  return `${number.toFixed(1)} ${metric.unit}`;
};

const formatTrendValue = (value, metric) => {
  const number = normalizeMetricValue(value, metric);
  if (number === null) {
    return null;
  }

  if (metric.unit === "%") {
    return `${number > 0 ? "+" : ""}${number.toFixed(1)} pp`;
  }

  return `${number > 0 ? "+" : ""}${number.toFixed(1)} ${metric.unit}`;
};

const formatChartLabel = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
  }).format(date);
};

const selectValueFromObject = (source, fields) => {
  if (!source || typeof source !== "object") {
    return null;
  }

  for (const field of fields) {
    if (source[field] !== undefined && source[field] !== null) {
      return source[field];
    }
  }

  return null;
};

const extractTextFromObject = (source, fields) => {
  if (!source || typeof source !== "object") {
    return null;
  }

  for (const field of fields) {
    const value = source[field];
    if (value !== undefined && value !== null && value !== "") {
      return String(value);
    }
  }

  return null;
};

const normalizeHistoryCollection = (response) => {
  const unwrapped = unwrapResponse(response);
  if (Array.isArray(unwrapped)) {
    return unwrapped;
  }

  if (unwrapped && typeof unwrapped === "object") {
    const nested =
      unwrapped.history ??
      unwrapped.items ??
      unwrapped.data ??
      unwrapped.kpis ??
      unwrapped.kpiHistory ??
      [];
    return Array.isArray(nested) ? nested : [];
  }

  return [];
};

const buildHistoryIdentity = (snapshot, metric) => {
  const idKpi = toNumber(snapshot?.idKpi);
  const rawTokens = [
    metric.key,
    metric.title,
    ...metric.aliases,
    metric.historyType,
    snapshot?.tipo,
    snapshot?.type,
    snapshot?.metric,
    snapshot?.nombre,
    snapshot?.key,
    snapshot?.kpiType,
  ].filter(Boolean);

  const normalizedTokens = [
    ...new Set(rawTokens.map((token) => normalizeText(token)).filter(Boolean)),
  ];

  return {
    idKpi,
    tokens: normalizedTokens,
  };
};

const matchesMetricHistory = (item, historyIdentity) => {
  const itemId = toNumber(item?.idKpi);
  if (historyIdentity.idKpi !== null && itemId !== null) {
    return itemId === historyIdentity.idKpi;
  }

  const sourceText = normalizeText(
    item?.tipo ?? item?.type ?? item?.metric ?? item?.nombre ?? item?.key,
  );

  if (!sourceText) {
    return false;
  }

  return historyIdentity.tokens.some((normalizedAlias) => {
    return (
      sourceText.includes(normalizedAlias) ||
      normalizedAlias.includes(sourceText)
    );
  });
};

const aggregateByDay = (points) => {
  if (!points.length) return [];

  const dayMap = new Map();

  points.forEach((point) => {
    const dateStr = point.date ? new Date(point.date).toDateString() : null;
    if (!dateStr) return;

    if (!dayMap.has(dateStr)) {
      dayMap.set(dateStr, {
        values: [],
        dates: [],
        labels: [],
      });
    }

    const dayData = dayMap.get(dateStr);
    dayData.values.push(point.value);
    dayData.dates.push(point.date);
    dayData.labels.push(point.label);
  });

  return Array.from(dayMap.entries())
    .map(([dateStr, dayData]) => {
      const avgValue =
        dayData.values.reduce((a, b) => a + b, 0) / dayData.values.length;
      const firstDate = dayData.dates[0];
      const uniqueLabel = dayData.labels[0];

      return {
        value: avgValue,
        label: uniqueLabel,
        date: firstDate,
        count: dayData.values.length,
      };
    })
    .sort((left, right) => {
      const leftTime = new Date(left.date || 0).getTime();
      const rightTime = new Date(right.date || 0).getTime();
      return leftTime - rightTime;
    });
};

const buildChartData = (historyItems, metric, snapshot) => {
  const historyIdentity = buildHistoryIdentity(snapshot, metric);
  const sourceItems = historyItems.filter((item) =>
    matchesMetricHistory(item, historyIdentity),
  );

  const normalizedHistory = sourceItems
    .map((item) => {
      const rawValue = selectValueFromObject(item, [
        "valor",
        "value",
        "dato",
        "amount",
      ]);
      const normalizedValue = normalizeMetricValue(rawValue, metric);

      if (normalizedValue === null) {
        return null;
      }

      return {
        value: normalizedValue,
        label: formatChartLabel(
          item?.fechaCalculo ?? item?.createdAt ?? item?.fecha,
        ),
        rawValue,
        date: item?.fechaCalculo ?? item?.createdAt ?? item?.fecha ?? null,
      };
    })
    .filter(Boolean);

  // Agrupar por día y promediar valores del mismo día
  const aggregatedHistory = aggregateByDay(normalizedHistory);

  if (aggregatedHistory.length > 0) {
    return {
      chartData: aggregatedHistory,
      hasHistory: true,
    };
  }

  const snapshotValue = getCurrentValue(snapshot, [], metric);
  const normalizedSnapshotValue = normalizeMetricValue(snapshotValue, metric);

  if (normalizedSnapshotValue === null) {
    return {
      chartData: [],
      hasHistory: false,
    };
  }

  return {
    chartData: [
      {
        value: normalizedSnapshotValue,
        label: "Actual",
        rawValue: snapshotValue,
        date: null,
      },
    ],
    hasHistory: false,
  };
};

const getTrendFromSeries = (chartData, metric) => {
  if (chartData.length < 2) {
    return null;
  }

  const lastPoint = chartData[chartData.length - 1];
  const previousPoint = chartData[chartData.length - 2];
  const delta = lastPoint.value - previousPoint.value;

  if (Math.abs(delta) < 0.01) {
    return "Estable";
  }

  const formattedDelta = formatTrendValue(delta, metric);
  return formattedDelta ? `${formattedDelta} vs. anterior` : null;
};

const getStatusBadgeText = (statusMessage) => {
  if (!statusMessage) {
    return null;
  }

  const message = String(statusMessage).trim();
  if (!message) {
    return null;
  }

  const iconMatch = message.match(/^\[[^\]]+\]/);
  const icon = iconMatch ? iconMatch[0] : "";
  const hasAlertIcon = icon.includes("!");
  const restMessage = icon ? message.slice(icon.length).trim() : message;
  const shortBlock = restMessage.split(":")[0].trim();
  const noDataPattern = /^(?:no\s+hay|sin\s+datos)\b/i;
  const noAssignedTasksPattern =
    /(?:no\s+tiene\s+tareas\s+asignadas|sin\s+tareas\s+asignadas|no\s+ha\s+completado\s+tareas)\b/i;
  const resultLabelMatch = shortBlock.match(/^((?:buen|mal)\s+resultado)\b/i);

  if (
    noDataPattern.test(shortBlock) ||
    noAssignedTasksPattern.test(shortBlock)
  ) {
    return "No hay datos";
  }

  if (resultLabelMatch) {
    const resultLabel = resultLabelMatch[1];
    return icon ? `${icon} ${resultLabel}` : resultLabel;
  }

  const firstWord = shortBlock.split(/\s+/)[0] || "";

  if (hasAlertIcon) {
    return icon ? `${icon} Alerta` : "Alerta";
  }

  if (icon && firstWord) {
    return `${icon} ${firstWord}`;
  }

  if (icon) {
    return icon;
  }

  return firstWord || null;
};

const extractEstimationComparison = (snapshot) => {
  if (!snapshot || typeof snapshot !== "object") {
    return null;
  }

  const statusText = extractTextFromObject(snapshot, [
    "statusMessage",
    "statusMesagge",
    "message",
    "mensaje",
    "descripcion",
    "status",
  ]);
  const mentionsOverestimation =
    /sobreestima|sobreestimo|termina\s+antes/i.test(String(statusText ?? ""));
  const mentionsUnderestimation =
    /subestima|subestimo|termina\s+despues|termina\s+después/i.test(
      String(statusText ?? ""),
    );

  const estimatedRaw = selectValueFromObject(snapshot, [
    "actualValue",
    "estimatedHours",
    "horasEstimadas",
    "tiempoEstimado",
    "estimatedTime",
    "estimado",
  ]);
  const realRaw = selectValueFromObject(snapshot, [
    "expectedValue",
    "actualHours",
    "realHours",
    "horasReales",
    "tiempoReal",
    "actualTime",
    "real",
  ]);

  const estimated = toNumber(estimatedRaw);
  const real = toNumber(realRaw);

  if (estimated !== null && real !== null) {
    const normalized =
      mentionsOverestimation && estimated < real
        ? { estimated: real, real: estimated }
        : mentionsUnderestimation && estimated > real
          ? { estimated: real, real: estimated }
          : { estimated, real };

    return {
      estimated: normalized.estimated,
      real: normalized.real,
      unit: "hrs",
    };
  }

  const details = extractTextFromObject(snapshot, [
    "calculationDetails",
    "calculoDetalles",
    "details",
    "detalle",
  ]);

  if (!details) {
    return null;
  }

  const pairMatch = details.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (!pairMatch) {
    return null;
  }

  const parsedEstimated = toNumber(pairMatch[1]);
  const parsedReal = toNumber(pairMatch[2]);

  if (parsedEstimated === null || parsedReal === null) {
    return null;
  }

  const hasHoursUnit = /hr|hora/i.test(details);

  const normalizedParsed =
    mentionsOverestimation && parsedEstimated < parsedReal
      ? { estimated: parsedReal, real: parsedEstimated }
      : mentionsUnderestimation && parsedEstimated > parsedReal
        ? { estimated: parsedReal, real: parsedEstimated }
        : { estimated: parsedEstimated, real: parsedReal };

  return {
    estimated: normalizedParsed.estimated,
    real: normalizedParsed.real,
    unit: hasHoursUnit ? "hrs" : "",
  };
};

const extractDurationComparison = (snapshot) => {
  if (!snapshot || typeof snapshot !== "object") {
    return null;
  }

  const realRaw = selectValueFromObject(snapshot, [
    "realHours",
    "actualHours",
    "horasReales",
    "tiempoReal",
    "real",
  ]);
  const plannedRaw = selectValueFromObject(snapshot, [
    "plannedHours",
    "estimatedHours",
    "horasPlanificadas",
    "tiempoPlanificado",
    "planificado",
    "estimado",
  ]);

  const real = toNumber(realRaw);
  const planned = toNumber(plannedRaw);

  if (real !== null && planned !== null && planned > 0) {
    return {
      real,
      planned,
      unit: "hrs",
    };
  }

  const details = extractTextFromObject(snapshot, [
    "calculationDetails",
    "calculoDetalles",
    "details",
    "detalle",
  ]);

  if (!details) {
    return null;
  }

  const pairMatch = details.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (!pairMatch) {
    return null;
  }

  const parsedReal = toNumber(pairMatch[1]);
  const parsedPlanned = toNumber(pairMatch[2]);
  if (parsedReal === null || parsedPlanned === null || parsedPlanned <= 0) {
    return null;
  }

  return {
    real: parsedReal,
    planned: parsedPlanned,
    unit: /hr|hora/i.test(details) ? "hrs" : "",
  };
};

const extractCycleTimeComparison = (snapshot) => {
  if (!snapshot || typeof snapshot !== "object") {
    return null;
  }

  const actualRaw = selectValueFromObject(snapshot, [
    "actualValue",
    "actualHours",
    "realHours",
    "horasReales",
    "tiempoReal",
    "real",
  ]);
  const expectedRaw = selectValueFromObject(snapshot, [
    "expectedValue",
    "expectedHours",
    "estimatedHours",
    "horasEsperadas",
    "tiempoEsperado",
    "estimado",
    "planificado",
  ]);

  const actual = toNumber(actualRaw);
  const expected = toNumber(expectedRaw);

  if (actual !== null && expected !== null && expected > 0) {
    return {
      actual,
      expected,
      unit: "hrs",
    };
  }

  const details = extractTextFromObject(snapshot, [
    "calculationDetails",
    "calculoDetalles",
    "details",
    "detalle",
  ]);

  if (!details) {
    return null;
  }

  const pairMatch = details.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (!pairMatch) {
    return null;
  }

  const parsedActual = toNumber(pairMatch[1]);
  const parsedExpected = toNumber(pairMatch[2]);
  if (parsedActual === null || parsedExpected === null || parsedExpected <= 0) {
    return null;
  }

  return {
    actual: parsedActual,
    expected: parsedExpected,
    unit: /hr|hora/i.test(details) ? "hrs" : "",
  };
};

const getCurrentValue = (snapshot, chartData, metric) => {
  if (snapshot && typeof snapshot === "object") {
    const directValue = selectValueFromObject(snapshot, metric.valueFields);
    if (directValue !== null) {
      return directValue;
    }
  }

  if (chartData.length > 0) {
    return chartData[chartData.length - 1].value;
  }

  if (typeof snapshot === "number" || typeof snapshot === "string") {
    return snapshot;
  }

  return null;
};

const getMetricRequest = (metric, userId, projectId, sprintId) => {
  if (metric.scope === "user") {
    return metric.fetcher(userId);
  }

  if (metric.scope === "sprint") {
    return metric.fetcher(userId, sprintId);
  }

  return metric.fetcher(userId, projectId);
};

export function useKpis({ userId, projectId, sprintId = projectId }) {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    async function fetchData() {
      try {
        if (
          !Number.isFinite(userId) ||
          !Number.isFinite(projectId) ||
          !Number.isFinite(sprintId)
        ) {
          setKpis([]);
          setError("No hay contexto activo para cargar KPIs.");
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        const requests = KPI_DEFINITIONS.map((metric) =>
          getMetricRequest(metric, userId, projectId, sprintId),
        );
        const [metricResults, historyResult] = await Promise.allSettled([
          Promise.allSettled(requests),
          getProjectHistory(projectId),
        ]);

        if (!isActive) {
          return;
        }

        const resolvedMetrics =
          metricResults.status === "fulfilled" ? metricResults.value : [];
        const historyItems =
          historyResult.status === "fulfilled"
            ? normalizeHistoryCollection(historyResult.value)
            : [];

        const mapped = KPI_DEFINITIONS.map((metric, index) => {
          const result = resolvedMetrics[index];
          const snapshot =
            result?.status === "fulfilled"
              ? unwrapResponse(result.value)
              : null;
          const chartMeta = buildChartData(historyItems, metric, snapshot);
          const chartData = chartMeta.chartData;
          const currentValue = getCurrentValue(snapshot, chartData, metric);
          const statusMessage = extractTextFromObject(
            snapshot,
            metric.statusFields,
          );
          const statusMessageFallback = extractTextFromObject(snapshot, [
            "statusMesagge",
            "status_msg",
            "status",
          ]);
          const fullStatusMessage = statusMessage || statusMessageFallback;
          const statusBadgeText = getStatusBadgeText(fullStatusMessage);
          const trendMessage = getTrendFromSeries(chartData, metric);
          const estimationComparison =
            metric.key === "precision"
              ? extractEstimationComparison(snapshot)
              : null;
          const durationComparison =
            metric.key === "duration"
              ? extractDurationComparison(snapshot)
              : null;
          const cycleTimeComparison =
            metric.key === "cycleTime"
              ? extractCycleTimeComparison(snapshot)
              : null;

          const durationChartData = durationComparison
            ? [
                {
                  value: durationComparison.real,
                  label: "Tiempo real",
                  date: null,
                },
                {
                  value: durationComparison.planned,
                  label: "Tiempo planificado",
                  date: null,
                },
              ]
            : null;

          const durationRatio = durationComparison
            ? (durationComparison.real / durationComparison.planned) * 100
            : null;

          const cycleTimeChartData = cycleTimeComparison
            ? [
                {
                  value: cycleTimeComparison.expected,
                  label: "Tiempo esperado",
                  date: null,
                },
                {
                  value: cycleTimeComparison.actual,
                  label: "Tiempo real",
                  date: null,
                },
              ]
            : null;

          const displayValue =
            metric.key === "duration" && durationComparison
              ? (() => {
                  const durationPercent = normalizeMetricValue(currentValue, {
                    ...metric,
                    unit: "%",
                  });

                  if (durationPercent === null) {
                    return "Sin datos";
                  }

                  return `${durationPercent.toFixed(2)}%`;
                })()
              : metric.key === "cycleTime"
                ? (() => {
                    const cyclePercent = normalizeMetricValue(currentValue, {
                      ...metric,
                      unit: "%",
                    });

                    if (cyclePercent === null) {
                      return "Sin datos";
                    }

                    return `${cyclePercent.toFixed(1)}%`;
                  })()
                : formatMetricValue(currentValue, metric);

          const displaySubtitle =
            metric.key === "duration" && durationRatio !== null
              ? undefined
              : undefined;

          const displayChartData =
            durationChartData ?? cycleTimeChartData ?? chartData;
          const displayUnit =
            metric.key === "duration" && durationComparison
              ? durationComparison.unit
              : metric.key === "cycleTime" && cycleTimeComparison
                ? cycleTimeComparison.unit
                : metric.unit;
          const displayHasHistory =
            durationChartData || cycleTimeChartData
              ? false
              : chartMeta.hasHistory;

          return {
            key: metric.key,
            title: metric.title,
            value: displayValue,
            change: statusBadgeText || trendMessage || "Sin cambios",
            statusMessage: fullStatusMessage,
            color: metric.color,
            chartData: displayChartData,
            unit: displayUnit,
            hasHistory: displayHasHistory,
            subtitle: displaySubtitle,
            estimationComparison,
            durationComparison,
            cycleTimeComparison,
          };
        });

        setKpis(mapped);

        if (resolvedMetrics.some((result) => result?.status === "rejected")) {
          console.warn(
            "No se pudieron cargar todos los KPI. Se muestran los datos disponibles.",
          );
        }
      } catch (err) {
        console.error(err);
        if (isActive) {
          setError("Error al cargar los KPI.");
          setKpis([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isActive = false;
    };
  }, [projectId, sprintId, userId]);

  return { kpis, loading, error };
}
