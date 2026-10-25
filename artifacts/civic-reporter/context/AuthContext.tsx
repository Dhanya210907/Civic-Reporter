import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Role = 'citizen' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  password: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Pick<User, 'name' | 'email' | 'phone'>) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = '@swachh_users';
const CURRENT_USER_KEY = '@swachh_current_user';

const ADMIN_USER: User = {
  id: 'admin-001',
  name: 'Admin Officer',
  email: 'admin@swachh.gov.in',
  phone: '1800-180-2020',
  role: 'admin',
  password: 'admin123',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  async function initAuth() {
    try {
      const storedUsers = await AsyncStorage.getItem(USERS_KEY);
      let userList: User[] = storedUsers ? JSON.parse(storedUsers) : [];
      if (!userList.find((u) => u.id === ADMIN_USER.id)) {
        userList = [ADMIN_USER, ...userList];
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(userList));
      }
      setUsers(userList);
      const currentStr = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (currentStr) setUser(JSON.parse(currentStr));
    } catch {
      // ignore storage errors
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return { success: false, error: 'Invalid email or password.' };
    setUser(found);
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
    return { success: true };
  }

  async function register(name: string, email: string, phone: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim().replace(/\s+/g, ' ');
    const normalizedPhone = phone.replace(/\D/g, '');

    if (users.find((u) => u.email.trim().toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    const newUser: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      role: 'citizen',
      password,
    };
    const updated = [...users, newUser];
    await AsyncStorage.multiSet([
      [USERS_KEY, JSON.stringify(updated)],
      [CURRENT_USER_KEY, JSON.stringify(newUser)],
    ]);
    setUsers(updated);
    setUser(newUser);
    return { success: true };
  }

  async function updateProfile(updates: Pick<User, 'name' | 'email' | 'phone'>) {
    if (!user) return { success: false, error: 'No signed-in account found.' };

    const name = updates.name.trim();
    const email = updates.email.trim().toLowerCase();
    const phone = updates.phone.trim();

    if (!name) return { success: false, error: 'Please enter your name.' };
    if (!email || !email.includes('@')) return { success: false, error: 'Please enter a valid email address.' };
    if (!phone) return { success: false, error: 'Please enter your phone number.' };

    const duplicate = users.find((u) => u.id !== user.id && u.email.toLowerCase() === email);
    if (duplicate) return { success: false, error: 'An account with this email already exists.' };

    const updatedUser = { ...user, name, email, phone };
    const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u));
    setUsers(updatedUsers);
    setUser(updatedUser);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    return { success: true };
  }

  async function deleteAccount() {
    if (!user) return { success: false, error: 'No signed-in account found.' };
    if (user.role === 'admin') return { success: false, error: 'The administrator account cannot be deleted.' };

    const updatedUsers = users.filter((u) => u.id !== user.id);
    setUsers(updatedUsers);
    setUser(null);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    return { success: true };
  }

  async function logout() {
    setUser(null);
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, users, login, register, updateProfile, deleteAccount, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
