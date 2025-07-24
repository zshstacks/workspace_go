//redux auth slice
export interface AuthState {
  emailError: string | null;
  passwordError: string | null;
  usernameError: string | null;
  error: string | null;
  errorLogin: string | null;
  errorCodeEmail: string | null;

  successCodeEmail: string | null;
  successResent: string | null;
  successLogout: string | null;
  success: string | null;
  successLogin: string | null;

  isLoading: boolean;
  user: any | null;
}

//redux auth .rejected
export interface ErrorPayload {
  error?: string;
  emailError?: string;
  passwordError?: string;
  usernameError?: string;
  errorLogin?: string;
  errorCodeEmail?: string;
}

//redux user slice
export interface UserState {
  user: any | null;
  isLoading: boolean;
  error: string | null;
  successDelete: string | null;
  username: string | null;
}

//user slice error payload
export interface UserErrorPayload {
  error?: string;
}

//pomodoro slice
export interface PomodoroState {
  settings: {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
    autoTransitionEnabled: boolean;
  };
  currentPhase: "pomodoro" | "shortBreak" | "longBreak";
  remainingTime: number;
  isLoading: boolean;
  isRunning: boolean;
  completedPomodoros: number;
  error: string | null;
}

//pomodoro slice error payload
export interface PomodoroErrorPayload {
  error?: string;
}

export interface Task {
  LocalID: number;
  Title: string;
  Description: string;
  Completed: boolean;
  Order: number;
}

export interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  createTitleError: string | null;
  createDescriptionError: string | null;
  updateTitleError: string | null;
  updateDescriptionError: string | null;
}

export interface TaskErrorPayload {
  error?: string;
  createTitleError?: string | null;
  createDescriptionError?: string | null;
  updateTitleError?: string | null;
  updateDescriptionError?: string | null;
}

export interface StatsState {
  currentStreak: number;
  highestStreak: number;
  isLoading: boolean;
  lastVisitDate: number;
  totalVisits: number;

  error: string | null;
}

export interface StatsErrorPayload {
  error?: string;
}

export interface ChatRoom {
  id: string;
  participantA: string;
  participantB: string;
  messages: Message[];
  isConnected: boolean;
}

export interface Message {
  senderID: string;
  receiverID: string;
  body: string;
  timestamp?: string;
}

export interface ChatState {
  activeRoom: ChatRoom | null;
  ws: WebSocket | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  targetUserID: string;
  currentUserID: string | null;
}

export interface ChatErrorPayload {
  error: string;
}

export interface ConnectToChatParams {
  currentUserID: string;
  targetUserID: string;
}
