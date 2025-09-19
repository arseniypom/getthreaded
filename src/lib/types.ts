export interface ThreadPost {
  id: number;
  content: string;
  characterCount?: number;
}

export interface ThreadResponse {
  thread: ThreadPost[];
  totalPosts: number;
}

export interface GenerateThreadRequest {
  idea: string;
}

export interface ApiError {
  error: string;
  message: string;
}