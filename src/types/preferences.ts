import type { ThemeMode } from './enums';

export interface UserPreferences {
    showOnlyLast7Days: boolean;
    sortHighPriorityFirst: boolean;
    theme: ThemeMode;
}
