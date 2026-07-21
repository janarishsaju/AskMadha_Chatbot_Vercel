import PageHeader from "@/components/PageHeader";
import { LockIcon } from "@/components/icons";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Read the Ask Madha Privacy Policy to understand how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Privacy Policy"
        description="Your privacy matters to us. This policy explains how we handle your information."
        icon={LockIcon}
      />

      <section className="flex-1 bg-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-8 text-muted-foreground">
          <p>
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold gradient-text">
              1. Information we collect
            </h2>
            <p>
              When you use Ask Madha, we may collect the following information:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">Account information:</strong> name, email address, and authentication details when you sign up or log in.
              </li>
              <li>
                <strong className="text-foreground">Chat data:</strong> questions and messages you send to the AI agent to provide responses and improve the service.
              </li>
              <li>
                <strong className="text-foreground">Device information:</strong> device type, operating system version, and app version to help us troubleshoot and improve performance.
              </li>
              <li>
                <strong className="text-foreground">Usage data:</strong> anonymized analytics about how you interact with the app, such as feature usage and session duration.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold gradient-text">
              2. How we use your information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Provide, maintain, and improve the Ask Madha app and website.</li>
              <li>Generate AI responses to your Bible-related questions.</li>
              <li>Secure your account and keep your chat history synced across devices.</li>
              <li>Respond to your support requests and feedback.</li>
              <li>Understand how users interact with the app to improve the experience.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold gradient-text">
              3. AI and chat data
            </h2>
            <p>
              Your chat messages may be processed by third-party AI services to generate responses. We do not sell your chat data. We may review anonymized or aggregated conversation patterns to improve response quality, but we do not share personally identifiable chat content with unauthorized parties.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold gradient-text">
              4. Data security
            </h2>
            <p>
              We take reasonable measures to protect your information, including encryption, secure authentication, and access controls. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold gradient-text">
              5. Your choices
            </h2>
            <p>
              You can update your account information or delete your account at any time through the app settings. If you delete your account, we will remove your personal data and chat history from our active systems, subject to legal or technical retention requirements.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold gradient-text">
              6. Children&apos;s privacy
            </h2>
            <p>
              Ask Madha is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will delete it.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold gradient-text">
              7. Changes to this policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the &quot;Last updated&quot; date at the top of this page. We encourage you to review this policy periodically.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold gradient-text">
              8. Contact us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a
                href="mailto:support@askmadha.com"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                support@askmadha.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
