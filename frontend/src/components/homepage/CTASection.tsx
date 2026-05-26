"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, Sparkles, Zap, CheckCircle2 } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-8"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              Join thousands of professionals
            </span>
          </motion.div>

          {/* Heading */}
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Ready to Never Miss
            <br />
            Another Follow-Up?
          </h2>

          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
            Start tracking your follow-ups with intelligent reminders,
            real-time notifications, and seamless integrations. Free forever for
            personal use.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-white text-orange-600 font-bold px-10 py-5 rounded-xl shadow-2xl hover:shadow-3xl transition-all text-lg overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            </Link>

            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 backdrop-blur-sm text-white font-semibold px-10 py-5 rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all text-lg"
              >
                View Live Demo
              </motion.button>
            </Link>
          </div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 text-white/90"
          >
            {[
              "No credit card required",
              "Free forever plan",
              "Setup in 2 minutes",
              "Cancel anytime",
            ].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: "10K+", label: "Active Users" },
            { value: "50K+", label: "Follow-ups Tracked" },
            { value: "99.9%", label: "Uptime" },
            { value: "24/7", label: "Support" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-white/80 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
