export interface PersonalityQuestion {
  id: string;
  text: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  favoredTrait: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
  options: Array<{
    value: number;
    label: string;
  }>;
}

export const personalityQuestions: PersonalityQuestion[] = [
  // E/I Dimension (7 Questions)
  {
    id: 'p-1',
    text: 'I enjoy joining group activities and social events.',
    dimension: 'EI',
    favoredTrait: 'E',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'p-2',
    text: 'I often prefer quiet evenings spent alone or with a close friend.',
    dimension: 'EI',
    favoredTrait: 'I',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'p-3',
    text: 'I feel energized after interacting with new people.',
    dimension: 'EI',
    favoredTrait: 'E',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'p-4',
    text: 'I find that too much social interaction can be draining.',
    dimension: 'EI',
    favoredTrait: 'I',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'p-5',
    text: 'I usually take the initiative in social settings.',
    dimension: 'EI',
    favoredTrait: 'E',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'p-6',
    text: 'I need regular time alone to recharge my energy.',
    dimension: 'EI',
    favoredTrait: 'I',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'p-7',
    text: 'I am comfortable striking up conversations with strangers.',
    dimension: 'EI',
    favoredTrait: 'E',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },

  // S/N Dimension (6 Questions)
  {
    id: 'p-8',
    text: 'I focus on practical details rather than abstract ideas.',
    dimension: 'SN',
    favoredTrait: 'S',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'p-9',
    text: 'I am more interested in future possibilities than immediate realities.',
    dimension: 'SN',
    favoredTrait: 'N',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'p-10',
    text: 'I tend to trust proven methods and tangible information.',
    dimension: 'SN',
    favoredTrait: 'S',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'p-11',
    text: 'I enjoy exploring new concepts and theoretical ideas.',
    dimension: 'SN',
    favoredTrait: 'N',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'p-12',
    text: 'I value concrete facts over imaginative speculation.',
    dimension: 'SN',
    favoredTrait: 'S',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'p-13',
    text: 'I often find myself daydreaming about what could be.',
    dimension: 'SN',
    favoredTrait: 'N',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },

  // T/F Dimension (6 Questions)
  {
    id: 'p-14',
    text: 'I base my decisions on logical analysis rather than personal feelings.',
    dimension: 'TF',
    favoredTrait: 'T',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'p-15',
    text: 'I tend to consider how my decisions will affect others\' feelings.',
    dimension: 'TF',
    favoredTrait: 'F',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'p-16',
    text: 'I enjoy debates and discussing objective issues.',
    dimension: 'TF',
    favoredTrait: 'T',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'p-17',
    text: 'I am often guided by my empathy in challenging situations.',
    dimension: 'TF',
    favoredTrait: 'F',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'p-18',
    text: 'I prefer to remain objective even in emotionally charged situations.',
    dimension: 'TF',
    favoredTrait: 'T',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'p-19',
    text: 'I value harmony and personal connections over strict logic.',
    dimension: 'TF',
    favoredTrait: 'F',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },

  // J/P Dimension (6 Questions)
  {
    id: 'p-20',
    text: 'I like to have a clear plan for my day.',
    dimension: 'JP',
    favoredTrait: 'J',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'p-21',
    text: 'I am comfortable when plans change unexpectedly.',
    dimension: 'JP',
    favoredTrait: 'P',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'p-22',
    text: 'I prefer making decisions promptly rather than keeping options open.',
    dimension: 'JP',
    favoredTrait: 'J',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'p-23',
    text: 'I enjoy the flexibility of a spontaneous schedule.',
    dimension: 'JP',
    favoredTrait: 'P',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'p-24',
    text: 'I value structure and organization in my life.',
    dimension: 'JP',
    favoredTrait: 'J',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
  {
    id: 'p-25',
    text: 'I often find that going with the flow suits me better than strict planning.',
    dimension: 'JP',
    favoredTrait: 'P',
    options: [
      { value: 0, label: 'Strongly Disagree' },
      { value: 1, label: 'Disagree' },
      { value: 2, label: 'Neutral' },
      { value: 3, label: 'Agree' },
      { value: 4, label: 'Strongly Agree' },
    ],
  },
];

export interface PersonalityDimensionScores {
  E: number;
  I: number;
  S: number;
  N: number;
  T: number;
  F: number;
  J: number;
  P: number;
}

export interface PersonalityResult {
  type: string;
  scores: PersonalityDimensionScores;
  interpretation: string;
}

export function calculatePersonalityType(answers: Record<string, number>): PersonalityResult {
  // Initialize scores
  const scores: PersonalityDimensionScores = {
    E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0
  };

  // Calculate scores for each dimension
  personalityQuestions.forEach(question => {
    const answerValue = answers[question.id];
    if (answerValue !== undefined) {
      scores[question.favoredTrait] += answerValue;
    }
  });

  // Determine dominant trait for each dimension
  const E_vs_I = scores.E > scores.I ? 'E' : 'I';
  const S_vs_N = scores.S > scores.N ? 'S' : 'N';
  const T_vs_F = scores.T > scores.F ? 'T' : 'F';
  const J_vs_P = scores.J > scores.P ? 'J' : 'P';

  // Combine to form personality type
  const personalityType = `${E_vs_I}${S_vs_N}${T_vs_F}${J_vs_P}`;

  // Generate basic interpretation
  let interpretation = '';
  
  switch (personalityType) {
    case 'INTJ':
      interpretation = 'The Architect: Strategic thinkers with innovative ideas and a drive for improvement.';
      break;
    case 'INTP':
      interpretation = 'The Logician: Innovative inventors with an unquenchable thirst for knowledge.';
      break;
    case 'ENTJ':
      interpretation = 'The Commander: Bold, imaginative leaders who always find a way forward.';
      break;
    case 'ENTP':
      interpretation = 'The Debater: Smart, curious thinkers who enjoy intellectual challenges.';
      break;
    case 'INFJ':
      interpretation = 'The Advocate: Quiet idealists with a strong moral compass and deep insights.';
      break;
    case 'INFP':
      interpretation = 'The Mediator: Poetic, kind individuals with a desire to help others.';
      break;
    case 'ENFJ':
      interpretation = 'The Protagonist: Charismatic leaders who inspire and connect with people.';
      break;
    case 'ENFP':
      interpretation = 'The Campaigner: Enthusiastic, creative individuals who love possibilities.';
      break;
    case 'ISTJ':
      interpretation = 'The Logistician: Practical, fact-minded individuals with strong reliability.';
      break;
    case 'ISFJ':
      interpretation = 'The Defender: Protective, devoted individuals with a caring nature.';
      break;
    case 'ESTJ':
      interpretation = 'The Executive: Efficient organizers who value tradition and order.';
      break;
    case 'ESFJ':
      interpretation = 'The Consul: Caring, social individuals focused on harmony and cooperation.';
      break;
    case 'ISTP':
      interpretation = 'The Virtuoso: Bold experimenters with a practical approach to problems.';
      break;
    case 'ISFP':
      interpretation = 'The Adventurer: Flexible artists with a strong aesthetic appreciation.';
      break;
    case 'ESTP':
      interpretation = 'The Entrepreneur: Smart, energetic individuals who thrive on excitement.';
      break;
    case 'ESFP':
      interpretation = 'The Entertainer: Spontaneous, energetic individuals who enjoy life.';
      break;
    default:
      interpretation = 'A unique blend of personality traits that make you who you are.';
  }

  return {
    type: personalityType,
    scores,
    interpretation
  };
}
