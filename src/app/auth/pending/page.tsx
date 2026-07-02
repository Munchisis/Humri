import Link from "next/link";
import { Scale, Clock } from "lucide-react";

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 dark:bg-gray-900">
      <div className="w-full max-w-md card text-center">
        <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-7 h-7 text-amber-500" />
        </div>
        <h1 className="text-xl font-medium mb-2 dark:text-gray-300">
          Account pending approval
        </h1>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed dark:text-gray-400">
          Your lawyer account is currently under review by the HUMRI admin team.
          You will receive an email notification once your account has been
          approved.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700 mb-6 text-left">
          <p className="font-medium mb-1 dark:text-gray-300">
            What happens next?
          </p>
          <ul className="space-y-1 text-xs dark:text-gray-400">
            <li>· Admin reviews your SCN number and details</li>
            <li>· Approval typically takes 1–2 business days</li>
            <li>· You will be notified by email once approved</li>
          </ul>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-2">
          <Scale className="w-3.5 h-3.5" />
          <Link href="/" className="hover:text-gray-600">
            Return to HUMRI home
          </Link>
        </div>
      </div>
    </div>
  );
}
