export const motionTokens = {
  durations: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },
  easings: {
    default: 'cubic-bezier(0.16, 1, 0.3, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const;
