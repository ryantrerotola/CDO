export interface SkillAssessment {
  technical: number;
  dataGovernance: number;
  aiMl: number;
  businessAcumen: number;
  leadership: number;
  stakeholderManagement: number;
}

export interface UserPreferences {
  contentCategories: string[];
  contentTypes: string[];
  customTopics: string[];
  readingTime: "morning" | "lunch" | "evening";
  notificationsEnabled: boolean;
  emailDigest: "daily" | "weekly" | "none";
}

export interface ResumeAnalysis {
  skills: string[];
  experience: {
    title: string;
    company: string;
    duration: string;
    relevance: string;
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  certifications: string[];
  gaps: {
    area: string;
    importance: "critical" | "important" | "nice-to-have";
    recommendation: string;
  }[];
  overallReadiness: number;
  suggestedSkillAssessment: SkillAssessment;
  strengthsSummary: string;
  needsWorkSummary: string;
  missingSummary: string;
}

export interface CompanyIntelligence {
  name: string;
  industry: string;
  techStack: string[];
  dataMaturity: "early" | "developing" | "advanced" | "leader";
  cdoInfo?: {
    name: string;
    background: string;
    priorities: string[];
  };
  relevantContent: string[];
}

export interface GoalTemplate {
  title: string;
  description: string;
  type: "MILESTONE" | "HABIT" | "TARGET" | "PROJECT";
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "ONCE";
  targetValue: number;
  category: string;
}

export interface DailyBriefing {
  greeting: string;
  date: string;
  topStories: ContentCard[];
  todaysActions: GoalAction[];
  careerProgress: number;
  trendingTopic: TrendingTopic;
  learningPick: ContentCard;
  upcoming: UpcomingItem[];
}

export interface ContentCard {
  id: string;
  title: string;
  source: string;
  summary: string;
  category: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  relevanceScore: number;
  whyItMatters?: string;
}

export interface GoalAction {
  id: string;
  title: string;
  type: string;
  completed: boolean;
  progress: number;
  target: number;
}

export interface TrendingTopic {
  title: string;
  summary: string;
  sources: string[];
}

export interface UpcomingItem {
  title: string;
  date: string;
  type: "event" | "deadline" | "reminder";
}
