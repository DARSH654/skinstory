"use client";

import WaitlistForm from "@/components/WaitlistForm";

export default function BlogWaitlistForm({ source = "blog" }) {
  return <WaitlistForm source={source} placeholder="Enter your email address" />;
}