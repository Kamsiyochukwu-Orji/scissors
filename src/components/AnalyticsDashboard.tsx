import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

interface AnalyticsDashboardProps {
  linkId: Id<"links">;
}

export function AnalyticsDashboard({ linkId }: AnalyticsDashboardProps) {
  const clicksOverTime = useQuery(api.analytics.getClicksOverTime, { linkId });
  const topReferrers = useQuery(api.analytics.getTopReferrers, { linkId });
  const deviceBreakdown = useQuery(api.analytics.getDeviceBreakdown, {
    linkId,
  });

  const totalClicks = clicksOverTime?.reduce((s, d) => s + d.clicks, 0) ?? 0;

  return (
    <div className="space-y-6" data-testid="analytics-dashboard">
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-indigo-600">
            {totalClicks.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total clicks</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-purple-600">
            {topReferrers?.length ?? 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Referrers</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-cyan-600">
            {deviceBreakdown?.length ?? 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Device types</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Clicks over time (30 days)
        </h3>
        {clicksOverTime && clicksOverTime.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={clicksOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(d) => d.slice(5)}
              />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                labelFormatter={(d) => `Date: ${d}`}
                formatter={(v) => [v, "Clicks"]}
              />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div
            className="h-[200px] flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-xl"
            data-testid="no-clicks-data"
          >
            No click data yet
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Top referrers */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Top referrers
          </h3>
          {topReferrers && topReferrers.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topReferrers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                />
                <YAxis
                  dataKey="referrer"
                  type="category"
                  width={80}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(r) =>
                    r.length > 12 ? r.slice(0, 12) + "…" : r
                  }
                />
                <Tooltip formatter={(v) => [v, "Clicks"]} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-xl">
              No referrer data
            </div>
          )}
        </div>

        {/* Device breakdown */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Device breakdown
          </h3>
          {deviceBreakdown && deviceBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={deviceBreakdown}
                  dataKey="count"
                  nameKey="device"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ device, percent }: any) =>
                    `${device} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {deviceBreakdown.map((_entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(v) => [v, "Clicks"]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-xl">
              No device data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
