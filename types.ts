export enum AuraColor {
  RED = 'red',
  ORANGE = 'orange',
  YELLOW = 'yellow',
  GREEN = 'green',
  BLUE = 'blue',
  PURPLE = 'purple',
  PINK = 'pink',
  WHITE = 'white',
}

export interface AuraColorMeaning {
  color: AuraColor;
  name: string;
  meaning: string;
  tailwindClass: string;
  borderColorClass: string;
}

export interface PersonalityQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface CommunityComment {
  id: string;
  username: string;
  comment: string;
  auraColor: AuraColor;
}

export type GenerativePart = {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
};

export interface ToolCall {
  functionCalls: FunctionCall[];
}

export interface FunctionCall {
  name: string;
  args: Record<string, unknown>;
  id: string;
}
