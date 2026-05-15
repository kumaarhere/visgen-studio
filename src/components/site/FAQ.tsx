"use client";

import { motion } from "motion/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "Do I own the copyright to the images I generate?",
    answer: "Yes. Any image you generate is yours to keep, and you have full commercial rights to use it anywhere—whether for client work, print, or social media.",
  },
  {
    question: "How do the credits work?",
    answer: "Every time you generate an image, 1 credit is consumed. Free tier users get 15 credits per month. Pro and Premium tiers receive a higher allocation on purchase.",
  },
  {
    question: "Are my generations private?",
    answer: "On the Free tier, images are public by default. If you upgrade to Pro or Premium, you can toggle your generations to be private so they do not appear in the community feed.",
  },
  {
    question: "Can I download my images in high resolution?",
    answer: "Yes, Pro and Premium users can download their images in HD and 4K resolutions without any watermarks directly from their Studio dashboard.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Absolutely. You can manage or cancel your subscription at any time through your account settings. Payments are securely processed via Razorpay.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="relative py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto glass rounded-3xl p-6 sm:p-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border/40 py-2">
                <AccordionTrigger className="text-left text-sm sm:text-base font-semibold hover:no-underline hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
