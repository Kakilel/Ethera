// app/page.js
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="bg-black text-white relative overflow-hidden">

      {/* 🌌 Background */}
      <div className="absolute inset-0 bg-[radial-gradient(at_center,#4f46e520_0%,transparent_70%)]" />
      <div className="absolute w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full -top-40 -left-40" />
      <div className="absolute w-[500px] h-[500px] bg-indigo-600/10 blur-[100px] rounded-full -bottom-32 right-0" />

      {/* ================= HERO ================= */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-6xl md:text-8xl font-bold tracking-tight leading-tight"
        >
          Train smarter.<br />
          <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-white bg-clip-text text-transparent">
            Track everything.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg max-w-xl mt-6"
        >
          Your workouts, nutrition, and progress — unified into one powerful system.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4 mt-10 flex-col sm:flex-row"
        >
          <Link
            href="/auth/register"
            className="px-10 py-4 bg-white text-black rounded-2xl font-semibold hover:bg-gray-100 transition"
          >
            Get Started Free
          </Link>

          <Link
            href="/auth/login"
            className="px-10 py-4 border border-white/20 rounded-2xl hover:bg-white/5 transition"
          >
            Sign In
          </Link>
        </motion.div>

        {/* 📊 FAKE DASHBOARD PREVIEW */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 w-full max-w-5xl bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl"
        >
          <div className="grid grid-cols-3 gap-4 text-left">

            {/* Calories */}
            <div className="bg-black/40 p-4 rounded-2xl">
              <p className="text-gray-400 text-sm">Calories</p>
              <p className="text-2xl font-bold">2,140</p>
              <div className="h-1 bg-gray-800 mt-2 rounded">
                <div className="h-1 bg-purple-500 w-[70%] rounded" />
              </div>
            </div>

            {/* Protein */}
            <div className="bg-black/40 p-4 rounded-2xl">
              <p className="text-gray-400 text-sm">Protein</p>
              <p className="text-2xl font-bold">138g</p>
              <div className="h-1 bg-gray-800 mt-2 rounded">
                <div className="h-1 bg-green-400 w-[60%] rounded" />
              </div>
            </div>

            {/* Water */}
            <div className="bg-black/40 p-4 rounded-2xl">
              <p className="text-gray-400 text-sm">Water</p>
              <p className="text-2xl font-bold">2.5L</p>
              <div className="h-1 bg-gray-800 mt-2 rounded">
                <div className="h-1 bg-blue-400 w-[80%] rounded" />
              </div>
            </div>

          </div>
        </motion.div>

      </section>

      {/* ================= VISUAL / FITNESS SECTION ================= */}
      <section className="relative z-10 py-28 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        {/* 📸 IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl overflow-hidden border border-white/10"
        >
          <img
            src="https://images.unsplash.com/photo-1558611848-73f7eb4001a1"
            alt="fitness"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* TEXT */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-4">
            Built for consistency
          </h2>

          <p className="text-gray-400 leading-relaxed">
            Whether you're tracking workouts, dialing in nutrition, or analyzing
            progress — everything is designed to remove friction and keep you moving forward.
          </p>
        </motion.div>

      </section>

      {/* ================= FEATURES ================= */}
      <section className="relative z-10 py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-8">

        {[
          {
            title: "Workouts",
            desc: "Log sets, reps, and routines with precision.",
          },
          {
            title: "Nutrition",
            desc: "Track calories and macros effortlessly.",
          },
          {
            title: "Progress",
            desc: "Visualize improvement over time with clarity.",
          },
        ].map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-8"
          >
            <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </motion.div>
        ))}

      </section>

      {/* ================= CTA ================= */}
      <section className="relative z-10 py-28 text-center">

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold mb-6"
        >
          Start building discipline
        </motion.h2>

        <p className="text-gray-400 mb-10">
          No noise. Just progress.
        </p>

        <Link
          href="/auth/register"
          className="px-12 py-5 bg-white text-black rounded-2xl font-semibold text-lg hover:bg-gray-100 transition"
        >
          Create Account
        </Link>

      </section>

      {/* FOOTER */}
      <div className="text-center text-xs text-gray-600 pb-8">
        Built like a product, not a template
      </div>

    </main>
  );
}