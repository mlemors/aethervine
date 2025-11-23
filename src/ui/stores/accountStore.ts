/**
 * Account Store - Login & Registration
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Account {
  id: string;
  username: string;
  email: string;
  createdAt: number;
  lastLogin: number;
}

interface AccountStore {
  currentAccount: Account | null;
  accounts: Account[];
  
  // Actions
  login: (username: string, password: string) => boolean;
  register: (username: string, email: string, password: string) => boolean;
  logout: () => void;
  deleteAccount: (accountId: string) => void;
}

const generateId = () => `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useAccountStore = create<AccountStore>()(
  persist(
    (set, get) => ({
      currentAccount: null,
      accounts: [
        // Dev/Test Account
        {
          id: 'acc_dev_001',
          username: 'dev',
          email: 'dev@aethervine.local',
          createdAt: Date.now(),
          lastLogin: Date.now(),
        },
      ],

      login: (username, _password) => {
        const account = get().accounts.find(
          (acc) => acc.username.toLowerCase() === username.toLowerCase()
        );

        if (account) {
          // In production: verify password hash
          // For now, accept any password for existing accounts
          set({
            currentAccount: {
              ...account,
              lastLogin: Date.now(),
            },
          });
          return true;
        }

        return false;
      },

      register: (username, email, _password) => {
        const { accounts } = get();

        // Check if username already exists
        if (accounts.some((acc) => acc.username.toLowerCase() === username.toLowerCase())) {
          return false;
        }

        // Check if email already exists
        if (accounts.some((acc) => acc.email.toLowerCase() === email.toLowerCase())) {
          return false;
        }

        const newAccount: Account = {
          id: generateId(),
          username,
          email,
          createdAt: Date.now(),
          lastLogin: Date.now(),
        };

        set({
          accounts: [...accounts, newAccount],
          currentAccount: newAccount,
        });

        return true;
      },

      logout: () => {
        set({ currentAccount: null });
      },

      deleteAccount: (accountId) => {
        set((state) => ({
          accounts: state.accounts.filter((acc) => acc.id !== accountId),
          currentAccount: state.currentAccount?.id === accountId ? null : state.currentAccount,
        }));
      },
    }),
    {
      name: 'aethervine-accounts',
    }
  )
);
