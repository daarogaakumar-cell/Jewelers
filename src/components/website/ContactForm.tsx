"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate form submission (would be a real API endpoint in production)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle className="h-12 w-12 text-success" />
        <h3 className="mt-4 text-lg font-semibold text-charcoal-700">
          Message Sent!
        </h3>
        <p className="mt-2 text-sm text-charcoal-500">
          Thank you for reaching out. We&apos;ll get back to you within 24 hours.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="mt-4 text-sm font-medium text-gold-600 hover:text-gold-700"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-charcoal-600"
          >
            Full Name <span className="text-error">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Your name"
            className="h-11 w-full rounded-lg border border-charcoal-200 bg-white px-4 text-sm text-charcoal-700 transition-colors placeholder:text-charcoal-300 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="mb-1.5 block text-sm font-medium text-charcoal-600"
          >
            Phone Number <span className="text-error">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            placeholder="+91 98765 43210"
            className="h-11 w-full rounded-lg border border-charcoal-200 bg-white px-4 text-sm text-charcoal-700 transition-colors placeholder:text-charcoal-300 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-charcoal-600"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="you@example.com"
          className="h-11 w-full rounded-lg border border-charcoal-200 bg-white px-4 text-sm text-charcoal-700 transition-colors placeholder:text-charcoal-300 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
        />
      </div>

      <div>
        <label
          htmlFor="subject"
          className="mb-1.5 block text-sm font-medium text-charcoal-600"
        >
          Subject <span className="text-error">*</span>
        </label>
        <select
          id="subject"
          name="subject"
          required
          className="h-11 w-full rounded-lg border border-charcoal-200 bg-white px-4 text-sm text-charcoal-700 transition-colors focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
        >
          <option value="">Select a subject</option>
          <option value="product-inquiry">Product Inquiry</option>
          <option value="custom-order">Custom Order</option>
          <option value="pricing">Pricing &amp; Quotation</option>
          <option value="exchange">Exchange &amp; Returns</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-sm font-medium text-charcoal-600"
        >
          Message <span className="text-error">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell us about your inquiry..."
          className="w-full rounded-lg border border-charcoal-200 bg-white px-4 py-3 text-sm text-charcoal-700 transition-colors placeholder:text-charcoal-300 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
        />
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
        <Send className="h-4 w-4" />
        Send Message
      </Button>
    </form>
  );
}
