"use client";

import { motion } from "framer-motion";
import { TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const statusData = [
  { name: "Pending", value: 24, color: "#3b82f6" },
  { name: "Escalated", value: 8, color: "#f59e0b" },
  { name: "Completed", value: 45, color: "#10b981" },
  { name: "Snoozed", value: 12, color: "#8b5cf6" },
];

const weeklyData = [
  { day: "Mon", created: 12, completed: 8 },
  { day: "Tue", created: 15, completed: 11 },
  { day: "Wed", created: 8, completed: 14 },
  { day: "Thu", created: 18, completed: 12 },
  { day: "Fri", created: 14, completed: 16 },
  { day: "Sat", created: 6, completed: 9 },
  { day: "Sun", created: 4, completed: 7 },
];

const priorityData = [
  { name: "Low", value: 15 },
  { name: "Medium", value: 28 },
  { name: "High", value: 22 },
  { name: "Urgent", value: 8 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function DashboardPreview() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Analytics Dashboard
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Visualize your productivity with interactive charts powered by
            Recharts and MUI X Charts. Track completion rates, identify
            bottlenecks, and optimize your workflow.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            title="Completed"
            value="45"
            change="+12%"
            color="green"
            delay={0.1}
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Pending"
            value="24"
            change="-5%"
            color="blue"
            delay={0.2}
          />
          <StatCard
            icon={<AlertCircle className="w-6 h-6" />}
            title="Escalated"
            value="8"
            change="+3%"
            color="orange"
            delay={0.3}
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Completion Rate"
            value="94%"
            change="+8%"
            color="purple"
            delay={0.4}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Follow-ups by Status
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Weekly Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Weekly Activity
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="created"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  name="Created"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Priority Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Priority Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Completion Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 shadow-xl p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Key Insights
            </h3>
            <div className="space-y-4">
              {[
                {
                  label: "Average Response Time",
                  value: "2.4 hours",
                  trend: "down",
                },
                {
                  label: "Escalation Rate",
                  value: "11%",
                  trend: "down",
                },
                {
                  label: "On-Time Completion",
                  value: "87%",
                  trend: "up",
                },
                {
                  label: "Active Follow-ups",
                  value: "32",
                  trend: "up",
                },
              ].map((insight, i) => (
                <motion.div
                  key={insight.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-orange-200"
                >
                  <span className="text-gray-700 font-medium">
                    {insight.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {insight.value}
                    </span>
                    <TrendingUp
                      className={`w-5 h-5 ${
                        insight.trend === "up"
                          ? "text-green-500"
                          : "text-red-500 rotate-180"
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon,
  title,
  value,
  change,
  color,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  color: "green" | "blue" | "orange" | "purple";
  delay: number;
}) {
  const colorClasses = {
    green: "from-green-500 to-green-600 text-green-600",
    blue: "from-blue-500 to-blue-600 text-blue-600",
    orange: "from-orange-500 to-orange-600 text-orange-600",
    purple: "from-purple-500 to-purple-600 text-purple-600",
  };

  const isPositive = change.startsWith("+");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 hover:shadow-xl transition-all"
    >
      <div
        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} bg-opacity-10 mb-4`}
      >
        <div className={colorClasses[color].split(" ")[2]}>{icon}</div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <span
          className={`text-sm font-semibold ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {change}
        </span>
      </div>
    </motion.div>
  );
}
