import { create } from "zustand";
import type { SkillAssessment, ResumeAnalysis } from "@/types";

interface UserProfile {
  name: string;
  email: string;
  currentRole: string;
  targetTimeline: string;
  industry: string;
  skills: SkillAssessment;
  targetCompanies: {
    id: string;
    name: string;
    industry: string;
    techStack: string[];
  }[];
  resumeUploaded: boolean;
  resumeAnalysis: ResumeAnalysis | null;
}

interface Goal {
  id: string;
  type: "MILESTONE" | "HABIT" | "TARGET" | "PROJECT";
  title: string;
  description: string;
  frequency: string;
  targetValue: number;
  currentValue: number;
  deadline?: string;
  status: "ACTIVE" | "COMPLETED" | "PAUSED";
  streak: number;
  entries: { date: string; value: number }[];
}

interface AppState {
  profile: UserProfile;
  goals: Goal[];
  setProfile: (profile: Partial<UserProfile>) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  logGoalEntry: (goalId: string, value: number) => void;
}

const defaultProfile: UserProfile = {
  name: "",
  email: "",
  currentRole: "",
  targetTimeline: "3 years",
  industry: "",
  skills: {
    technical: 5,
    dataGovernance: 5,
    aiMl: 5,
    businessAcumen: 5,
    leadership: 5,
    stakeholderManagement: 5,
  },
  targetCompanies: [],
  resumeUploaded: false,
  resumeAnalysis: null,
};

export const useAppStore = create<AppState>((set) => ({
  profile: defaultProfile,
  goals: [],

  setProfile: (updates) =>
    set((state) => ({
      profile: { ...state.profile, ...updates },
    })),

  addGoal: (goal) =>
    set((state) => ({
      goals: [...state.goals, goal],
    })),

  updateGoal: (id, updates) =>
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    })),

  removeGoal: (id) =>
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
    })),

  logGoalEntry: (goalId, value) =>
    set((state) => ({
      goals: state.goals.map((g) => {
        if (g.id !== goalId) return g;
        const newEntries = [
          ...g.entries,
          { date: new Date().toISOString(), value },
        ];
        return {
          ...g,
          currentValue: g.currentValue + value,
          entries: newEntries,
        };
      }),
    })),
}));
