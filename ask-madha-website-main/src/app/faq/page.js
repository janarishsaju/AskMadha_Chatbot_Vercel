import PageHeader from "@/components/PageHeader";
import FAQContent from "@/components/FAQContent";
import { HelpCircleIcon } from "@/components/icons";

export const metadata = {
  title: "FAQ",
  description:
    "Find answers to frequently asked questions about Ask Madha, the AI-powered Catholic spiritual companion app by Madha TV.",
};

export default function FAQPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Frequently Asked Questions"
        description="Everything you need to know about Ask Madha."
        icon={HelpCircleIcon}
      />

      <section className="flex-1 bg-background px-4 py-16 sm:px-6 lg:px-8">
        <FAQContent />
      </section>
    </div>
  );
}
