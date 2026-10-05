import { Car, CreditCard, Headset } from "lucide-react";
import { ContactHighlight, HighlightIcon } from "@/lib/contact";

interface ContactHighlightsProps {
  items: ContactHighlight[];
}

function HighlightGlyph({ icon }: { icon: HighlightIcon }) {
  const className = "size-5 text-blue-700 dark:text-blue-300";
  switch (icon) {
    case "Car":
      return <Car className={className} aria-hidden="true" />;
    case "CreditCard":
      return <CreditCard className={className} aria-hidden="true" />;
    case "Headset":
      return <Headset className={className} aria-hidden="true" />;
  }
}

export default function ContactHighlights({ items }: ContactHighlightsProps) {
  return (
    <section aria-label="Co zapewniamy kursantom" className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="flex items-start gap-3 rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60">
            <HighlightGlyph icon={item.icon} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
