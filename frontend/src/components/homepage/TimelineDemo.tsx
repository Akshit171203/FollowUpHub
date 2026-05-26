"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  Bell,
  Calendar,
} from "lucide-react";

interface TimelineEvent {
  id: string;
  type:
    | "CREATED"
    | "REMINDER_SENT"
    | "SNOOZED"
    | "RESCHEDULED"
    | "ESCALATED"
    | "DONE";
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

const events: TimelineEvent[] = [
  {
    id: "1",
    type: "CREATED",
    title: "Follow-up Created",
    description: "Client meeting follow-up scheduled for tomorrow",
    timestamp: "2 hours ago",
    icon: <Calendar className="w-5 h-5" />,
    color: "blue",
  },
  {
    id: "2",
    type: "REMINDER_SENT",
    title: "Reminder Sent",
    description: "Email reminder sent to akshit@followuphub.com",
    timestamp: "1 hour ago",
    icon: <Bell className="w-5 h-5" />,
    color: "green",
  },
  {
    id: "3",
    type: "SNOOZED",
    title: "Follow-up Snoozed",
    description: "Snoozed for 30 minutes",
    timestamp: "45 minutes ago",
    icon: <Clock className="w-5 h-5" />,
    color: "yellow",
  },
  {
    id: "4",
    type: "ESCALATED",
    title: "Escalated to Level 2",
    description: "Priority upgraded to HIGH, policy set to PERSISTENT",
    timestamp: "15 minutes ago",
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "orange",
  },
  {
    id: "5",
    type: "ESCALATED",
    title: "Critical Escalation",
    description: "Manager notified via email, Slack alert sent",
    timestamp: "5 minutes ago",
    icon: <Zap className="w-5 h-5" />,
    color: "red",
  },
  {
    id: "6",
    type: "DONE",
    title: "Follow-up Completed",
    description: "Marked as complete by user",
    timestamp: "Just now",
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: "green",
  },
];

const colorConfig = {
  blue: {
    bg: "bg-blue-100",
    border: "border-blue-300",
    text: "text-blue-600",
    line: "bg-blue-300",
  },
  green: {
    bg: "bg-green-100",
    border: "border-green-300",
    text: "text-green-600",
    line: "bg-green-300",
  },
  yellow: {
    bg: "bg-yellow-100",
    border: "border-yellow-300",
    text: "text-yellow-600",
    line: "bg-yellow-300",
  },
  orange: {
    bg: "bg-orange-100",
    border: "border-orange-300",
    text: "text-orange-600",
    line: "bg-orange-300",
  },
  red: {
    bg: "bg-red-100",
    border: "border-red-300",
    text: "text-red-600",
    line: "bg-red-300",
  },
};

export default function TimelineDemo() {
  return (
    <section className="py-20 px-4 bg-white">
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
              Complete Audit Trail
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every action is logged with timestamps. Track the complete lifecycle
            of each follow-up from creation to completion.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Timeline Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-xl p-8">
              <div className="relative">
                {events.map((event, index) => (
                  <TimelineEventCard
                    key={event.id}
                    event={event}
                    index={index}
                    isLast={index === events.length - 1}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Event Types Tracked
              </h3>
              <div className="space-y-4">
                {[
                  {
                    type: "CREATED",
                    desc: "Initial follow-up creation with all metadata",
                  },
                  {
                    type: "REMINDER_SENT",
                    desc: "Every reminder notification logged",
                  },
                  {
                    type: "SNOOZED",
                    desc: "User snooze actions with duration",
                  },
                  {
                    type: "RESCHEDULED",
                    desc: "Due date changes tracked",
                  },
                  {
                    type: "ESCALATED",
                    desc: "Automatic escalation events with level",
                  },
                  { type: "DONE", desc: "Completion timestamp recorded" },
                ].map((item, i) => (
                  <motion.div
                    key={item.type}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {item.type}
                      </h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Database Schema Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="bg-gray-900 rounded-2xl border border-gray-800 shadow-lg p-6"
            >
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                followup_events table
              </h4>
              <pre className="text-sm font-mono text-gray-300 overflow-x-auto">
                <code>
                  {`{
  id: UUID
  followupId: UUID
  userId: UUID
  eventType: ENUM
  message: TEXT
  createdAt: TIMESTAMP
}`}
                </code>
              </pre>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TimelineEventCard({
  event,
  index,
  isLast,
}: {
  event: TimelineEvent;
  index: number;
  isLast: boolean;
}) {
  const colors = colorConfig[event.color as keyof typeof colorConfig];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="relative pb-8"
    >
      {/* Connecting Line */}
      {!isLast && (
        <div
          className={`absolute left-6 top-12 w-0.5 h-full ${colors.line} opacity-30`}
        />
      )}

      {/* Event Card */}
      <div className="flex items-start gap-4">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
          className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full ${colors.bg} ${colors.border} border-2 flex items-center justify-center ${colors.text}`}
        >
          {event.icon}
        </motion.div>

        {/* Content */}
        <motion.div
          whileHover={{ x: 5 }}
          className="flex-1 bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{event.title}</h4>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
              {event.timestamp}
            </span>
          </div>
          <p className="text-sm text-gray-600">{event.description}</p>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}
            >
              {event.type}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
