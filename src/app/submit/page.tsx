import type { Metadata } from "next";
import SubmitForm from "./SubmitForm";

export const metadata: Metadata = {
  title: "Submit a Legal Matter | Free Pro Bono Aid - HUMRI",
  description:
    "Facing a legal challenge? Securely submit your legal matter to HUMRI. We connect you with a verified volunteer lawyer in Nigeria within 72 hours, completely free.",
};

export default function SubmitPage() {
  return <SubmitForm />;
}
