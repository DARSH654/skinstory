"use client";

import { useState } from "react";
import FloatingNavbar from "@/components/FloatingNavbar";
import Footer from "@/components/Footer";
import HighlightPhrase from "@/components/HighlightPhrase";

export default function PressPage() {
  const [form, setForm] = useState({ email: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const e = {};
    if (!form.email.trim()) e.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Please enter a valid email address.";
    if (!form.subject.trim()) e.subject = "Subject is required.";
    if (!form.message.trim()) e.message = "Message is required.";
    return e;
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const body = "From: " + form.email + "\n\n" + form.message;
    const mailto =
      "mailto:press@getskinstory.com" +
      "?subject=" + encodeURIComponent(form.subject) +
      "&body=" + encodeURIComponent(body);
    window.location.href = mailto;
    setSubmitted(true);
  }

  // Shared input class builder — matches hero section border behaviour
  function fieldClass(hasError) {
    if (hasError) {
      return "w-full px-4 py-3 text-sm rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none transition-all border-[3px] border-red-500 dark:border-red-400";
    }
    return "w-full px-4 py-3 text-sm rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none transition-all border border-zinc-200 dark:border-zinc-700 focus:border-[3px] focus:border-zinc-900 dark:focus:border-white";
  }

  return (
    <>
      <FloatingNavbar />
      <main className="min-h-screen bg-white dark:bg-[#121212] px-6 sm:px-12 pt-16 sm:pt-24 pb-10 sm:pb-12 transition-colors duration-200">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10 sm:mb-14">
            <h1 className="text-4xl sm:text-6xl font-normal tracking-tight text-zinc-800 dark:text-zinc-200 mb-4 font-[family-name:var(--font-outfit)]">
              <HighlightPhrase words={[{ text: "Press", hasSpace: false }]} />{" "}Room
            </h1>
            <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 font-normal max-w-md mx-auto">
              Get in touch with our press team for media inquiries, interviews, and press releases.
            </p>
          </div>

          {/* Form / Success state */}
          {submitted ? (
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-8 py-14 text-center shadow-sm">
              <p className="text-3xl mb-3">&#9993;</p>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">
                Your mail client should be open.
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {"If it didn't open, email us directly at "}
                <a href="mailto:press@getskinstory.com" className="text-[#937abd] hover:underline">
                  press@getskinstory.com
                </a>
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 sm:px-8 py-8 shadow-sm space-y-6"
            >
              {/* Email Address */}
              <div className="space-y-1.5">
                <label
                  htmlFor="press-email"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Email Address <span className="text-[#937abd]">*</span>
                </label>
                <input
                  id="press-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  className={fieldClass(!!errors.email)}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label
                  htmlFor="press-subject"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Subject <span className="text-[#937abd]">*</span>
                </label>
                <input
                  id="press-subject"
                  name="subject"
                  type="text"
                  placeholder="Media inquiry, interview request..."
                  value={form.subject}
                  onChange={handleChange}
                  className={fieldClass(!!errors.subject)}
                />
                {errors.subject && (
                  <p className="text-xs text-red-500 dark:text-red-400">{errors.subject}</p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label
                  htmlFor="press-message"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Message <span className="text-[#937abd]">*</span>
                </label>
                <textarea
                  id="press-message"
                  name="message"
                  rows={6}
                  placeholder="Tell us about your outlet, deadline, and what you'd like to cover..."
                  value={form.message}
                  onChange={handleChange}
                  className={fieldClass(!!errors.message)}
                />
                {errors.message && (
                  <p className="text-xs text-red-500 dark:text-red-400">{errors.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold rounded-xl hover:opacity-80 transition-opacity"
              >
                Send Query
              </button>
            </form>
          )}

        </div>
      </main>
      <div className="px-6 sm:px-12 pb-6 bg-white dark:bg-[#121212] transition-colors duration-200">
        <Footer />
      </div>
    </>
  );
}
