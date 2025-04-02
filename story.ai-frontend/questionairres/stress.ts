export interface StressQuestion {
  id: string;
  text: string;
  isReversed: boolean;
  options: Array<{
    value: number;
    label: string;
  }>;
}

export const stressQuestions: StressQuestion[] = [
  {
    id: 'pss-1',
    text: 'I often find that the pace of my daily tasks feels more than I can manage.',
    isReversed: false,
    options: [
      { value: 0, label: 'Never' },
      { value: 1, label: 'Almost Never' },
      { value: 2, label: 'Sometimes' },
      { value: 3, label: 'Fairly Often' },
      { value: 4, label: 'Very Often' },
    ],
  },
  {
    id: 'pss-2',
    text: 'After a busy day, I quickly find it easy to unwind.',
    isReversed: true,
    options: [
      { value: 0, label: 'Never' },
      { value: 1, label: 'Almost Never' },
      { value: 2, label: 'Sometimes' },
      { value: 3, label: 'Fairly Often' },
      { value: 4, label: 'Very Often' },
    ],
  },
  {
    id: 'pss-3',
    text: 'I notice moments when a sense of unease sneaks up on me unexpectedly.',
    isReversed: false,
    options: [
      { value: 0, label: 'Never' },
      { value: 1, label: 'Almost Never' },
      { value: 2, label: 'Sometimes' },
      { value: 3, label: 'Fairly Often' },
      { value: 4, label: 'Very Often' },
    ],
  },
  {
    id: 'pss-4',
    text: 'My thoughts sometimes keep me from getting a restful night\'s sleep.',
    isReversed: false,
    options: [
      { value: 0, label: 'Never' },
      { value: 1, label: 'Almost Never' },
      { value: 2, label: 'Sometimes' },
      { value: 3, label: 'Fairly Often' },
      { value: 4, label: 'Very Often' },
    ],
  },
  {
    id: 'pss-5',
    text: 'I experience tightness or tension in my body during my day-to-day routines.',
    isReversed: false,
    options: [
      { value: 0, label: 'Never' },
      { value: 1, label: 'Almost Never' },
      { value: 2, label: 'Sometimes' },
      { value: 3, label: 'Fairly Often' },
      { value: 4, label: 'Very Often' },
    ],
  },
  {
    id: 'pss-6',
    text: 'I am confident in my ability to handle disruptions or changes in plans.',
    isReversed: true,
    options: [
      { value: 0, label: 'Never' },
      { value: 1, label: 'Almost Never' },
      { value: 2, label: 'Sometimes' },
      { value: 3, label: 'Fairly Often' },
      { value: 4, label: 'Very Often' },
    ],
  },
  {
    id: 'pss-7',
    text: 'During challenging moments, I find it hard to stay positive.',
    isReversed: false,
    options: [
      { value: 0, label: 'Never' },
      { value: 1, label: 'Almost Never' },
      { value: 2, label: 'Sometimes' },
      { value: 3, label: 'Fairly Often' },
      { value: 4, label: 'Very Often' },
    ],
  },
  {
    id: 'pss-8',
    text: 'I usually feel a surge of energy and motivation throughout the day.',
    isReversed: true,
    options: [
      { value: 0, label: 'Never' },
      { value: 1, label: 'Almost Never' },
      { value: 2, label: 'Sometimes' },
      { value: 3, label: 'Fairly Often' },
      { value: 4, label: 'Very Often' },
    ],
  },
  {
    id: 'pss-9',
    text: 'I catch myself worrying about issues that I hadn\'t anticipated.',
    isReversed: false,
    options: [
      { value: 0, label: 'Never' },
      { value: 1, label: 'Almost Never' },
      { value: 2, label: 'Sometimes' },
      { value: 3, label: 'Fairly Often' },
      { value: 4, label: 'Very Often' },
    ],
  },
  {
    id: 'pss-10',
    text: 'I feel that I can easily keep my emotions in check when things get busy.',
    isReversed: true,
    options: [
      { value: 0, label: 'Never' },
      { value: 1, label: 'Almost Never' },
      { value: 2, label: 'Sometimes' },
      { value: 3, label: 'Fairly Often' },
      { value: 4, label: 'Very Often' },
    ],
  },
];

export interface StressResult {
  score: number;
  level: 'Low' | 'Moderate' | 'High' | 'Very High';
  interpretation: string;
  suggestions: string[];
}

export function calculateStressScore(answers: Record<string, number>): StressResult {
  let totalScore = 0;

  stressQuestions.forEach(question => {
    const answerValue = answers[question.id];
    if (answerValue !== undefined) {
      // Apply reverse scoring for reversed questions
      totalScore += question.isReversed ? 4 - answerValue : answerValue;
    }
  });

  let level: 'Low' | 'Moderate' | 'High' | 'Very High';
  let interpretation: string;
  let suggestions: string[];

  // Categorize stress levels
  if (totalScore <= 10) {
    level = 'Low';
    interpretation = 'Your stress levels appear to be very manageable.';
    suggestions = [
      'Continue your current stress management practices',
      'Practice preventative self-care',
      'Maintain your healthy routines'
    ];
  } else if (totalScore <= 20) {
    level = 'Moderate';
    interpretation = 'You are experiencing a moderate level of stress.';
    suggestions = [
      'Practice mindfulness meditation for 5-10 minutes daily',
      'Ensure you\'re getting adequate sleep',
      'Take regular breaks during work hours'
    ];
  } else if (totalScore <= 30) {
    level = 'High';
    interpretation = 'Your stress levels are elevated and may benefit from active management.';
    suggestions = [
      'Consider daily physical activity to reduce stress',
      'Establish clear boundaries between work and personal time',
      'Try deep breathing exercises when feeling overwhelmed',
      'Consider talking to someone about your stressors'
    ];
  } else {
    level = 'Very High';
    interpretation = 'You are experiencing significant stress levels that require attention.';
    suggestions = [
      'Prioritize stress reduction activities daily',
      'Consider speaking with a mental health professional',
      'Evaluate potential sources of stress in your life',
      'Implement a strict self-care routine',
      'Practice relaxation techniques like progressive muscle relaxation'
    ];
  }

  return {
    score: totalScore,
    level,
    interpretation,
    suggestions
  };
}
