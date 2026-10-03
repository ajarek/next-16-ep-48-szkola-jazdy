import { CreditCard, Compass, ShieldCheck } from "lucide-react";
import { GuaranteeItem } from "@/lib/application";

interface ApplicationGuaranteesProps {
  guarantees: GuaranteeItem[];
}

export default function ApplicationGuarantees({ guarantees }: ApplicationGuaranteesProps) {
  const getIcon = (iconName: GuaranteeItem["icon"]) => {
    switch (iconName) {
      case "CreditCard":
        return <CreditCard className="size-5 text-blue-600 dark:text-blue-400" />;
      case "Compass":
        return <Compass className="size-5 text-blue-600 dark:text-blue-400" />;
      case "ShieldCheck":
        return <ShieldCheck className="size-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <ShieldCheck className="size-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <section aria-label="Gwarancje i korzyści szkoły jazdy" className="mt-8 mb-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {guarantees.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-blue-500/40 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-center size-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 shrink-0">
              {getIcon(item.icon)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
