import KeyStatCard, { StatItem } from "./KeyStatCard";
import SocialProofBar from "./SocialProofBar";
import statsData from "@/public/data/stats-data.json";

interface KeyStatsSectionProps {
  stats?: StatItem[];
  showSocialProofBar?: boolean;
}

export default function KeyStatsSection({
  stats = statsData.stats as StatItem[],
  showSocialProofBar = true,
}: KeyStatsSectionProps) {
  return (
    <section
      id="statystyki"
      className="relative w-full py-4 sm:py-6 lg:py-8"
      aria-label="Kluczowe statystyki i osiągnięcia szkoły jazdy"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Siatka 4 kluczowych kart statystyk - wierne odwzorowanie makiety */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <KeyStatCard key={stat.id} stat={stat} index={index} />
          ))}
        </div>

        {/* Kreatywny pasek Social Proof: Oceny Google, awatary i zweryfikowane opinie */}
        {showSocialProofBar && (
          <SocialProofBar
            googleRating={statsData.socialProof.googleRating}
            totalReviews={statsData.socialProof.totalReviews}
            testimonials={statsData.socialProof.recentTestimonials}
          />
        )}
      </div>
    </section>
  );
}
