import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact HUMRI | Free Pro Bono Legal Aid Nigeria",
  description:
    "Get in touch with HUMRI about submitting a legal matter, volunteering as a lawyer, or any other question. We respond as soon as we can.",
};

export default function ContactPage() {
  return <ContactForm />;
}
