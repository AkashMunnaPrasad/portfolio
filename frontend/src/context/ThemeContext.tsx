import { createContext, useContext, type ReactNode } from 'react';

const ThemeContext = createContext({ theme: 'dark' as const });

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
