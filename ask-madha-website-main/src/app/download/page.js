import PageHeader from "@/components/PageHeader";
import { SmartphoneIcon, AppleIcon, PlayIcon } from "@/components/icons";

export const metadata = {
  title: "Download",
  description:
    "Download Ask Madha for iOS and Android. Start chatting with an AI companion about the Bible today.",
};

export default function DownloadPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Download Ask Madha"
        description="Get the app on your mobile device and start exploring scripture with AI."
        icon={SmartphoneIcon}
      />

      <section className="flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-2">
            <a
              href="https://apps.apple.com/app/ask-madha"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center rounded-2xl border border-border glass p-8 text-center shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary transition-transform duration-300 group-hover:scale-110">
                <AppleIcon className="h-8 w-8" />
              </div>
              <h2 className="mt-6 text-xl font-semibold gradient-text">
                Download for iOS
              </h2>
              <p className="mt-2 text-muted-foreground">
                Available on the App Store for iPhone and iPad.
              </p>
              <span className="mt-6 inline-flex items-center rounded-full gradient-bg px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all group-hover:shadow-lg">
                Get on App Store
              </span>
            </a>

            <a
              href="https://play.google.com/store/apps/details?id=app.askmadha"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center rounded-2xl border border-border glass p-8 text-center shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary transition-transform duration-300 group-hover:scale-110">
                <PlayIcon className="h-8 w-8" />
              </div>
              <h2 className="mt-6 text-xl font-semibold gradient-text">
                Download for Android
              </h2>
              <p className="mt-2 text-muted-foreground">
                Available on Google Play for Android phones and tablets.
              </p>
              <span className="mt-6 inline-flex items-center rounded-full gradient-bg px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all group-hover:shadow-lg">
                Get on Google Play
              </span>
            </a>
          </div>

          <div className="mt-12 rounded-2xl border border-border glass p-8">
            <h3 className="text-lg font-semibold gradient-text">
              System requirements
            </h3>
            <ul className="mt-4 space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                <span>
                  <strong className="text-foreground">iOS:</strong> Requires iOS 14.0 or later. Compatible with iPhone, iPad, and iPod touch.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                <span>
                  <strong className="text-foreground">Android:</strong> Requires Android 8.0 (API level 26) or later.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
