export type ThemeName = '1' | '2' | '3' | '4';

export interface Theme {
  name: ThemeName;
  label: string;
  classes: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    card: string;
    error: string;
    success: string;
    warning: string;
  };
}

export const themes: Record<ThemeName, Theme> = {
  '1': {
    name: '1',
    label: '테마 1',
    classes: {
      background: 'bg-t1-background',
      text: 'text-t1-text',
      primary: 'bg-t1-primary',
      secondary: 'bg-t1-secondary',
      accent: 'text-t1-accent',
      border: 'border-t1-text',
      card: 'bg-t1-card',
      error: 'bg-red-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
    }
  },
  '2': {
    name: '2',
    label: '테마 2',
    classes: {
      background: 'bg-t2-background',
      text: 'text-t2-text',
      primary: 'bg-t2-primary',
      secondary: 'bg-t2-secondary',
      accent: 'text-t2-accent',
      border: 'border-t2-text',
      card: 'bg-t2-card',
      error: 'bg-red-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
    }
  },
  '3': {
    name: '3',
    label: '테마 3',
    classes: {
      background: 'bg-t3-background',
      text: 'text-t3-text',
      primary: 'bg-t3-primary',
      secondary: 'bg-t3-secondary',
      accent: 'text-t3-accent',
      border: 'border-t3-text',
      card: 'bg-t3-card',
      error: 'bg-red-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
    },
  },
  '4': {
    name: '4',
    label: '테마 4',
    classes: {
      background: 'bg-t4-background',
      text: 'text-t4-text',
      primary: 'bg-t4-primary',
      secondary: 'bg-t4-secondary',
      accent: 'text-t4-accent',
      border: 'border-t4-text',
      card: 'bg-t4-card',
      error: 'bg-red-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
    }
  }
};

export const DEFAULT_THEME: ThemeName = '3';
