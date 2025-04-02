export interface AnxietyQuestion {
  id: string;
  text: string;
  options: Array<{
    value: number;
    label: string;
  }>;
}

export const anxietyQuestions: AnxietyQuestion[] = [
  {
    id: 'gad-1',
    text: 'During the past two weeks, how often have you found yourself feeling unusually on edge or restless?',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'gad-2',
    text: 'In the past two weeks, how frequently have you had difficulty setting aside repetitive worries about everyday events?',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'gad-3',
    text: 'Over the past two weeks, how often have you noticed that minor concerns seem to take on a larger significance?',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'gad-4',
    text: 'During the past two weeks, how frequently have you experienced moments when it\'s hard to relax, even in calm situations?',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'gad-5',
    text: 'In the last two weeks, how often have you felt so unsettled that sitting quietly has been a challenge?',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'gad-6',
    text: 'Over the past two weeks, how often have you been easily bothered by small interruptions or changes?',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'gad-7',
    text: 'During the past two weeks, how often have you felt an unexplained sense of apprehension about what might happen?',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
];

export interface AnxietyResult {
  score: number;
  level: 'Minimal' | 'Mild' | 'Moderate' | 'Severe';
  interpretation: string;
  suggestions: string[];
}

export function calculateAnxietyScore(answers: Record<string, number>): AnxietyResult {
  let totalScore = 0;

  anxietyQuestions.forEach(question => {
    const answerValue = answers[question.id];
    if (answerValue !== undefined) {
      totalScore += answerValue;
    }
  });

  let level: 'Minimal' | 'Mild' | 'Moderate' | 'Severe';
  let interpretation: string;
  let suggestions: string[];

  // Categorize anxiety levels based on score
  if (totalScore <= 4) {
    level = 'Minimal';
    interpretation = 'Minimal or no anxiety symptoms detected.';
    suggestions = [
      'Continue monitoring your mental well-being',
      'Practice preventative self-care',
      'Maintain healthy sleep habits'
    ];
  } else if (totalScore <= 9) {
    level = 'Mild';
    interpretation = 'Mild anxiety symptoms detected.';
    suggestions = [
      'Practice deep breathing exercises for 5 minutes daily',
      'Consider limiting caffeine intake',
      'Establish a regular sleep schedule'
    ];
  } else if (totalScore <= 14) {
    level = 'Moderate';
    interpretation = 'Moderate anxiety symptoms detected.';
    suggestions = [
      'Try mindfulness meditation apps',
      'Consider regular physical activity to reduce anxiety',
      'Establish a worry journal to track thoughts',
      'Review work-life balance and stress triggers'
    ];
  } else {
    level = 'Severe';
    interpretation = 'Severe anxiety symptoms detected.';
    suggestions = [
      'Consider speaking with a mental health professional',
      'Practice daily relaxation techniques',
      'Establish a strong support system',
      'Limit exposure to anxiety-inducing situations when possible',
      'Consider guided self-help resources for anxiety management'
    ];
  }

  return {
    score: totalScore,
    level,
    interpretation,
    suggestions
  };
}
