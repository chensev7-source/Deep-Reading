
export type StoryPath = 'redemption' | 'decline' | 'suspense' | 'warmth';

export interface ChoiceRecord {
  nodeId: string;
  step: number;
  path: StoryPath;
  text: string;
  timestamp: number;
}

export interface StayTimeRecord {
  nodeId: string;
  duration: number; // 毫秒
}

export interface User {
  username: string;
  isGuest: boolean;
}

export interface Feedback {
  agencyScore: number;
  emotionScore: number;
  comment: string;
}

export interface StoryNode {
  id: string;
  title: string;
  content: string;
  choices: {
    text: string;
    subtext: string;
    nextId: string;
    path: StoryPath;
  }[];
}

export interface AppState {
  user: User | null;
  currentScreen: 'login' | 'register' | 'welcome' | 'story' | 'feedback' | 'report' | 'dashboard';
  currentNodeId: string;
  choices: ChoiceRecord[];
  nodeTimings: StayTimeRecord[];
  feedback: Feedback | null;
  aiAnalysis: string | null;
  startTime: number | null;
}
