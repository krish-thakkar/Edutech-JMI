import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Sankey,
  AreaChart,
  Area,
} from "recharts";
import {
  Activity,
  TrendingUp,
  MousePointer,
  Eye,
  Clock,
  ChevronDown,
  Settings,
  Download,
  Share2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const MetricCard = ({
  title,
  value,
  change,
  icon,
  chart,
  isNegative = false,
}) => (
  <div className="bg-[#1F2937] rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
    <div className="flex justify-between items-start mb-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-opacity-10 bg-gray-700">{icon}</div>
          <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        </div>
        <div className="text-3xl font-bold text-white">{value}</div>
      </div>
      <span
        className={`flex items-center text-sm px-3 py-1 rounded-full ${
          isNegative
            ? "text-red-400 bg-red-400/10"
            : "text-green-400 bg-green-400/10"
        }`}
      >
        <TrendingUp
          className={`w-4 h-4 mr-1.5 ${isNegative && "transform rotate-180"}`}
        />
        {change}
      </span>
    </div>
    <div className="mt-4">{chart}</div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("Last 14 days, daily");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/dashboard");
        setData(response.data.data);
        setError(null);
        toast.success("Dashboard updated", {
          style: {
            background: "#1F2937",
            color: "#fff",
            borderRadius: "8px",
          },
        });
      } catch (err) {
        setError(err.message);
        toast.error("Failed to load data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(intervalId);
  }, []);

  const metrics = useMemo(() => {
    if (!data.length) return {};

    const totalImpressions = data.reduce(
      (acc, curr) => acc + curr.impressions,
      0
    );
    const totalClicks = data.reduce((acc, curr) => acc + curr.clicks, 0);
    const totalHovers = data.reduce((acc, curr) => acc + curr.hoverCount, 0);
    const hoverToClickRate = totalClicks / totalHovers;

    return {
      totalImpressions,
      totalClicks,
      totalHovers,
      avgHoverTime: (
        data.reduce((acc, curr) => acc + curr.hoverTime, 0) / data.length
      ).toFixed(1),
      ctr: ((totalClicks / totalImpressions) * 100).toFixed(2),
      hoverRate: ((totalHovers / totalImpressions) * 100).toFixed(2),
      costPerClick: ((totalClicks * 0.5) / totalClicks).toFixed(2),
      hoverToClickRate: (hoverToClickRate * 100).toFixed(2),
    };
  }, [data]);

  const sankeyData = useMemo(() => {
    if (!metrics.totalImpressions)
      return {
        nodes: [],
        links: [],
      };

    const impressionsToHovers = metrics.totalHovers;
    const hoversToClicks = metrics.totalClicks;
    const impressionsLost = metrics.totalImpressions - metrics.totalHovers;
    const hoversLost = metrics.totalHovers - metrics.totalClicks;

    return {
      nodes: [
        { name: "Impressions", id: 0 },
        { name: "Hovers", id: 1 },
        { name: "Clicks", id: 2 },
        { name: "No Interaction", id: 3 },
        { name: "No Click", id: 4 },
      ],
      links: [
        {
          source: 0,
          target: 1,
          value: impressionsToHovers,
          name: "User Hovers",
        },
        {
          source: 1,
          target: 2,
          value: hoversToClicks,
          name: "User Clicks",
        },
        {
          source: 0,
          target: 3,
          value: impressionsLost,
          name: "No Hover",
        },
        {
          source: 1,
          target: 4,
          value: hoversLost,
          name: "Abandoned",
        },
      ],
    };
  }, [metrics]);

  const calculatePercentageChange = (currentValue, previousValue) => {
    if (!previousValue) return "0.0%";
    const change = ((currentValue - previousValue) / previousValue) * 100;
    return change.toFixed(1) + "%";
  };

  const getMetricChanges = useMemo(() => {
    if (data.length < 2) return {};

    const midPoint = Math.floor(data.length / 2);
    const recentData = data.slice(midPoint);
    const previousData = data.slice(0, midPoint);

    const recent = {
      impressions: recentData.reduce((acc, curr) => acc + curr.impressions, 0),
      clicks: recentData.reduce((acc, curr) => acc + curr.clicks, 0),
      hovers: recentData.reduce((acc, curr) => acc + curr.hoverCount, 0),
      cost: recentData.length * 0.5,
    };

    const previous = {
      impressions: previousData.reduce(
        (acc, curr) => acc + curr.impressions,
        0
      ),
      clicks: previousData.reduce((acc, curr) => acc + curr.clicks, 0),
      hovers: previousData.reduce((acc, curr) => acc + curr.hoverCount, 0),
      cost: previousData.length * 0.5,
    };

    return {
      impressions: calculatePercentageChange(
        recent.impressions,
        previous.impressions
      ),
      clicks: calculatePercentageChange(recent.clicks, previous.clicks),
      hovers: calculatePercentageChange(recent.hovers, previous.hovers),
      cost: calculatePercentageChange(recent.cost, previous.cost),
    };
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111827] text-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#111827] text-gray-100 flex items-center justify-center">
        <div className="text-center p-8 bg-[#1F2937] rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Error Loading Dashboard</h2>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="min-h-screen bg-[#111827] text-gray-100 flex items-center justify-center">
        <div className="text-center p-8 bg-[#1F2937] rounded-xl">
          <h2 className="text-2xl font-bold mb-4">No Data Available</h2>
          <p className="text-gray-400">
            There is no interaction data to display at this time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] text-gray-100 p-8">
      <Toaster position="top-right" />
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-3xl font-bold text-white">
              Ad Performance Dashboard
            </h1>
            <div className="flex items-center gap-2 bg-[#1F2937] px-6 py-2.5 rounded-lg cursor-pointer hover:bg-[#2D3748] transition-colors">
              <span className="text-gray-300">{timeRange}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="p-3 hover:bg-[#1F2937] rounded-lg transition-colors">
              <Download className="w-5 h-5" />
            </button>
            <button className="p-3 hover:bg-[#1F2937] rounded-lg transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-3 hover:bg-[#1F2937] rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Metrics Cards Grid */}
        <div className="grid grid-cols-4 gap-8">
          <MetricCard
            title="Total Impressions"
            value={metrics.totalImpressions?.toLocaleString()}
            change={getMetricChanges.impressions}
            icon={<Eye className="w-6 h-6 text-blue-400" />}
            chart={
              <AreaChart data={data.slice(-7)} width={120} height={60}>
                <Area
                  type="monotone"
                  dataKey="impressions"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                />
              </AreaChart>
            }
          />
          <MetricCard
            title="Click-Through Rate"
            value={`${metrics.ctr}%`}
            change={getMetricChanges.clicks}
            icon={<MousePointer className="w-6 h-6 text-green-400" />}
            chart={
              <AreaChart data={data.slice(-7)} width={120} height={60}>
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.1}
                />
              </AreaChart>
            }
          />
          <MetricCard
            title="Hover Rate"
            value={`${metrics.hoverRate}%`}
            change={getMetricChanges.hovers}
            icon={<Activity className="w-6 h-6 text-purple-400" />}
            chart={
              <AreaChart data={data.slice(-7)} width={120} height={60}>
                <Area
                  type="monotone"
                  dataKey="hoverCount"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.1}
                />
              </AreaChart>
            }
          />
          <MetricCard
            title="Cost Per Click"
            value={`$${metrics.costPerClick}`}
            change={getMetricChanges.cost}
            isNegative={true}
            icon={<Clock className="w-6 h-6 text-red-400" />}
            chart={
              <AreaChart data={data.slice(-7)} width={120} height={60}>
                <Area
                  type="monotone"
                  dataKey="hoverTime"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.1}
                />
              </AreaChart>
            }
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* Performance Overview Chart */}
          <div className="bg-[#1F2937] rounded-xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold">Performance Overview</h2>
              <select className="bg-[#374151] text-sm rounded-lg px-4 py-2 border-none outline-none">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="adId"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF" }}
                />
                <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#374151",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    padding: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="impressions"
                  name="Impressions"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  name="Clicks"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* User Journey Flow */}
          <div className="bg-[#1F2937] rounded-xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold">User Journey Flow</h2>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span className="text-sm text-gray-400">Impressions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-sm text-gray-400">Clicks</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <Sankey
                data={sankeyData}
                node={{
                  nodePadding: 50,
                  colors: [
                    "#3B82F6",
                    "#10B981",
                    "#8B5CF6",
                    "#6B7280",
                    "#9CA3AF",
                  ],
                }}
                link={{
                  stroke: "#E5E7EB",
                }}
              >
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#374151",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    padding: "12px",
                  }}
                />
              </Sankey>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Position Analysis */}
        <div className="bg-[#1F2937] rounded-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold">Position Analysis</h2>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  const csvContent =
                    "data:text/csv;charset=utf-8," +
                    data.map((row) => Object.values(row).join(",")).join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "position_analysis.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-6 py-2.5 bg-[#374151] rounded-lg text-sm hover:bg-[#4B5563] transition-colors"
              >
                Export Data
              </button>
              <button className="px-6 py-2.5 bg-blue-600 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                View Details
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="position"
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF" }}
              />
              <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#374151",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  padding: "12px",
                }}
              />
              <Bar
                dataKey="clicks"
                name="Clicks"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="hoverCount"
                name="Hovers"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* Performance by Company */}
          <div className="bg-[#1F2937] rounded-xl p-8">
            <h2 className="text-xl font-semibold mb-6">
              Performance by Company
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="pb-4 px-4 text-gray-400 font-medium">
                      Company
                    </th>
                    <th className="pb-4 px-4 text-gray-400 font-medium">
                      Impressions
                    </th>
                    <th className="pb-4 px-4 text-gray-400 font-medium">
                      Clicks
                    </th>
                    <th className="pb-4 px-4 text-gray-400 font-medium">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(
                    new Set(data.map((item) => item.companyName))
                  ).map((company) => {
                    const companyData = data.filter(
                      (item) => item.companyName === company
                    );
                    const totalImpressions = companyData.reduce(
                      (acc, curr) => acc + curr.impressions,
                      0
                    );
                    const totalClicks = companyData.reduce(
                      (acc, curr) => acc + curr.clicks,
                      0
                    );
                    const ctr = (
                      (totalClicks / totalImpressions) *
                      100
                    ).toFixed(2);

                    return (
                      <tr
                        key={company}
                        className="border-b border-gray-700 hover:bg-[#374151] transition-colors"
                      >
                        <td className="py-4 px-4">{company}</td>
                        <td className="py-4 px-4">
                          {totalImpressions.toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          {totalClicks.toLocaleString()}
                        </td>
                        <td className="py-4 px-4">{ctr}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Domain Performance */}
          <div className="bg-[#1F2937] rounded-xl p-8">
            <h2 className="text-xl font-semibold mb-6">Domain Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="pb-4 px-4 text-gray-400 font-medium">
                      Domain
                    </th>
                    <th className="pb-4 px-4 text-gray-400 font-medium">
                      Avg. Hover Time
                    </th>
                    <th className="pb-4 px-4 text-gray-400 font-medium">
                      Hover Rate
                    </th>
                    <th className="pb-4 px-4 text-gray-400 font-medium">
                      Conversion
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(new Set(data.map((item) => item.domain))).map(
                    (domain) => {
                      const domainData = data.filter(
                        (item) => item.domain === domain
                      );
                      const avgHoverTime = (
                        domainData.reduce(
                          (acc, curr) => acc + curr.hoverTime,
                          0
                        ) / domainData.length
                      ).toFixed(1);
                      const hoverRate = (
                        (domainData.reduce(
                          (acc, curr) => acc + curr.hoverCount,
                          0
                        ) /
                          domainData.reduce(
                            (acc, curr) => acc + curr.impressions,
                            0
                          )) *
                        100
                      ).toFixed(2);
                      const conversion = (
                        (domainData.reduce(
                          (acc, curr) => acc + curr.clicks,
                          0
                        ) /
                          domainData.reduce(
                            (acc, curr) => acc + curr.hoverCount,
                            0
                          )) *
                        100
                      ).toFixed(2);

                      return (
                        <tr
                          key={domain}
                          className="border-b border-gray-700 hover:bg-[#374151] transition-colors"
                        >
                          <td className="py-4 px-4">{domain}</td>
                          <td className="py-4 px-4">{avgHoverTime}s</td>
                          <td className="py-4 px-4">{hoverRate}%</td>
                          <td className="py-4 px-4">{conversion}%</td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
