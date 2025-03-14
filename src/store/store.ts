import { create } from 'zustand';

export type TokenType = 'number' | 'operator' | 'tag';

export type Token = {
  id: string;
  type: TokenType;
  value: string;
};

type FormulaStore = {
  tokens: Token[];
  addToken: (token: Token, index?: number) => void;
  updateToken: (id: string, newValue: string) => void;
  removeToken: (id: string) => void;
};

export const useFormulaStore = create<FormulaStore>((set) => ({
  tokens: [],
  addToken: (token, index) =>
    set((state) => {
      const newTokens = [...state.tokens];
      if (index !== undefined) {
        newTokens.splice(index, 0, token);
      } else {
        newTokens.push(token);
      }
      return { tokens: newTokens };
    }),
  updateToken: (id, newValue) =>
    set((state) => ({
      tokens: state.tokens.map((token) =>
        token.id === id ? { ...token, value: newValue } : token
      ),
    })),
  removeToken: (id) =>
    set((state) => ({
      tokens: state.tokens.filter((token) => token.id !== id),
    })),
}));
