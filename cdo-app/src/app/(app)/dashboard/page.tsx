import { TopStories } from "@/components/dashboard/top-stories";
import { TodaysActions } from "@/components/dashboard/todays-actions";
import { CareerProgress } from "@/components/dashboard/career-progress";
import { TrendingTopic } from "@/components/dashboard/trending-topic";
import { LearningPick } from "@/components/dashboard/learning-pick";
import { PodcastPicks } from "@/components/dashboard/podcast-picks";
import { Upcoming } from "@/components/dashboard/upcoming";
import { getGreeting } from "@/lib/utils";

export default function DashboardPage() {
  const greeting = getGreeting();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{greeting}</h1>
        <p className="text-[var(--muted-foreground)]">
          Here&apos;s your CDO career briefing for today
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Main content */}
        <div className="lg:col-span-2 space-y-6">
          <TopStories />
          <TrendingTopic />
          <PodcastPicks />
        </div>

        {/* Right column - Actions & Progress */}
        <div className="space-y-6">
          <TodaysActions />
          <CareerProgress />
          <LearningPick />
          <Upcoming />
        </div>
      </div>
    </div>
  );
}
