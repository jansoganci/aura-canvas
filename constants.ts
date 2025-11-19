import { AuraColor, AuraColorMeaning, PersonalityQuestion } from './types';

export const AURA_COLORS_MEANINGS: AuraColorMeaning[] = [
  {
    color: AuraColor.RED,
    name: 'Red',
    meaning: 'Passion, Energy, Drive, Willpower, Leadership, Ambition.',
    tailwindClass: 'bg-aura-red text-white',
    borderColorClass: 'border-aura-red',
  },
  {
    color: AuraColor.ORANGE,
    name: 'Orange',
    meaning: 'Creativity, Joy, Enthusiasm, Courage, Social connection, Adventure.',
    tailwindClass: 'bg-aura-orange text-white',
    borderColorClass: 'border-aura-orange',
  },
  {
    color: AuraColor.YELLOW,
    name: 'Yellow',
    meaning: 'Optimism, Intellect, Happiness, Playfulness, Confidence, Logic.',
    tailwindClass: 'bg-aura-yellow text-gray-900',
    borderColorClass: 'border-aura-yellow',
  },
  {
    color: AuraColor.GREEN,
    name: 'Green',
    meaning: 'Growth, Healing, Balance, Nature, Compassion, Harmony, Renewal.',
    tailwindClass: 'bg-aura-green text-gray-900',
    borderColorClass: 'border-aura-green',
  },
  {
    color: AuraColor.BLUE,
    name: 'Blue',
    meaning: 'Peace, Calm, Communication, Intuition, Truth, Expression, Loyalty.',
    tailwindClass: 'bg-aura-blue text-white',
    borderColorClass: 'border-aura-blue',
  },
  {
    color: AuraColor.PURPLE,
    name: 'Purple',
    meaning: 'Spirituality, Wisdom, Intuition, Mysticism, Creativity, Transformation.',
    tailwindClass: 'bg-aura-purple text-white',
    borderColorClass: 'border-aura-purple',
  },
  {
    color: AuraColor.PINK,
    name: 'Pink',
    meaning: 'Love, Tenderness, Affection, Compassion, Empathy, Gentleness.',
    tailwindClass: 'bg-aura-pink text-gray-900',
    borderColorClass: 'border-aura-pink',
  },
  {
    color: AuraColor.WHITE,
    name: 'White',
    meaning: 'Purity, Protection, Clarity, New beginnings, Spiritual awakening, Wholeness.',
    tailwindClass: 'bg-aura-white text-gray-900 border border-gray-300',
    borderColorClass: 'border-gray-400',
  },
];

export const PERSONALITY_QUESTIONS: PersonalityQuestion[] = [
  {
    id: 'social-preference',
    question: 'How do you typically recharge?',
    options: ['Spending time alone', 'Being with friends/groups'],
  },
  {
    id: 'decision-making',
    question: 'When making a decision, are you more likely to rely on:',
    options: ['Logic and facts', 'Intuition and feelings'],
  },
  {
    id: 'energy-level',
    question: 'Which best describes your energy?',
    options: ['Calm and steady', 'Energetic and enthusiastic'],
  },
  {
    id: 'approach-to-change',
    question: 'How do you approach new situations or changes?',
    options: ['Cautiously and methodically', 'Enthusiastically and adaptably'],
  },
  {
    id: 'creative-outlet',
    question: 'Do you have a strong creative outlet?',
    options: ['Yes, I love to create!', 'Not particularly, I prefer other activities.'],
  },
];

// Helper to get color class by AuraColor enum
export function getAuraColorClass(color: AuraColor): string {
  const aura = AURA_COLORS_MEANINGS.find(a => a.color === color);
  return aura?.tailwindClass || '';
}

export function getAuraBorderClass(color: AuraColor): string {
  const aura = AURA_COLORS_MEANINGS.find(a => a.color === color);
  return aura?.borderColorClass || '';
}

export function getAuraName(color: AuraColor): string {
  const aura = AURA_COLORS_MEANINGS.find(a => a.color === color);
  return aura?.name || '';
}

export function getAuraMeaning(color: AuraColor): string {
  const aura = AURA_COLORS_MEANINGS.find(a => a.color === color);
  return aura?.meaning || '';
}
