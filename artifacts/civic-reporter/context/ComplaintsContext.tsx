import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';
export type ComplaintCategory =
  | 'garbage'
  | 'pothole'
  | 'water_leakage'
  | 'streetlight'
  | 'drainage'
  | 'transformer'
  | 'dead_animals'
  | 'other';

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  address: string;
  ward: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  adminNote?: string;
}

interface ComplaintsContextType {
  complaints: Complaint[];
  addComplaint: (data: Omit<Complaint, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateComplaint: (id: string, status: ComplaintStatus, adminNote?: string) => Promise<void>;
  resolvePendingComplaintsForUser: (userId: string, note: string) => Promise<Complaint[]>;
  getComplaintById: (id: string) => Complaint | undefined;
  refreshComplaints: () => Promise<void>;
  loading: boolean;
}

const ComplaintsContext = createContext<ComplaintsContextType | undefined>(undefined);
const KEY = '@swachh_complaints';

const now = Date.now();
const SEED: Complaint[] = [
  {
    id: 'cmp-001',
    userId: 'seed-u1',
    userName: 'Rahul Sharma',
    category: 'garbage',
    title: 'Overflowing garbage bin near park',
    description: 'The garbage bin at Gandhi Park entrance has been overflowing for 3 days, causing bad smell and attracting flies. Immediate clearance needed.',
    address: '15, Gandhi Park, Sector 7',
    ward: 'Ward 12',
    status: 'pending',
    createdAt: new Date(now - 2 * 86400000).toISOString(),
    updatedAt: new Date(now - 2 * 86400000).toISOString(),
  },
  {
    id: 'cmp-002',
    userId: 'seed-u2',
    userName: 'Priya Patel',
    category: 'pothole',
    title: 'Large pothole on main road near school',
    description: 'A dangerous pothole near the school crossing has caused two bike accidents this week. Needs urgent repair.',
    address: 'Near Govt. School, MG Road',
    ward: 'Ward 5',
    status: 'in_progress',
    createdAt: new Date(now - 5 * 86400000).toISOString(),
    updatedAt: new Date(now - 1 * 86400000).toISOString(),
    adminNote: 'Work order issued to PWD department. Expected completion in 3 days.',
  },
  {
    id: 'cmp-003',
    userId: 'seed-u3',
    userName: 'Amit Kumar',
    category: 'streetlight',
    title: 'Streetlight not working at corner',
    description: 'The streetlight at Nehru Street corner has been non-functional for a week. The area is very dark at night, creating safety concerns.',
    address: '5, Nehru Street Corner',
    ward: 'Ward 8',
    status: 'resolved',
    createdAt: new Date(now - 10 * 86400000).toISOString(),
    updatedAt: new Date(now - 3 * 86400000).toISOString(),
    adminNote: 'Bulb replaced and wiring fixed by electricity department.',
  },
  {
    id: 'cmp-004',
    userId: 'seed-u1',
    userName: 'Rahul Sharma',
    category: 'water_leakage',
    title: 'Water pipe leakage near market',
    description: 'A water pipe is leaking near the market area. Water is being wasted and the road has become slippery and dangerous.',
    address: 'Market Street, Near Bus Stand',
    ward: 'Ward 3',
    status: 'pending',
    createdAt: new Date(now - 1 * 86400000).toISOString(),
    updatedAt: new Date(now - 1 * 86400000).toISOString(),
  },
  {
    id: 'cmp-005',
    userId: 'seed-u4',
    userName: 'Sunita Devi',
    category: 'garbage',
    title: 'Illegal dumping near residential area',
    description: 'People are dumping garbage on the vacant plot near our colony. It is becoming a serious health hazard for residents.',
    address: 'Plot 7, Shastri Nagar',
    ward: 'Ward 15',
    status: 'in_progress',
    createdAt: new Date(now - 7 * 86400000).toISOString(),
    updatedAt: new Date(now - 2 * 86400000).toISOString(),
    adminNote: 'Sanitation team dispatched. Notice issued to plot owner.',
  },
  {
    id: 'cmp-006',
    userId: 'seed-u5',
    userName: 'Mohan Das',
    category: 'pothole',
    title: 'Multiple potholes on colony road',
    description: 'The entire stretch of road in Block C has multiple potholes after the rains. Vehicles are getting damaged regularly.',
    address: 'Block C, Krishna Colony',
    ward: 'Ward 7',
    status: 'rejected',
    createdAt: new Date(now - 15 * 86400000).toISOString(),
    updatedAt: new Date(now - 8 * 86400000).toISOString(),
    adminNote: 'This road falls under state PWD jurisdiction. Please contact state office.',
  },
];

export function ComplaintsProvider({ children }: { children: React.ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    try {
      const stored = await AsyncStorage.getItem(KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setComplaints(parsed);
          } else {
            throw new Error('Invalid data shape');
          }
        } catch {
          // Corrupted data — reset to seed
          setComplaints(SEED);
          await AsyncStorage.setItem(KEY, JSON.stringify(SEED));
        }
      } else {
        setComplaints(SEED);
        await AsyncStorage.setItem(KEY, JSON.stringify(SEED));
      }
    } catch {
      // Storage unavailable — use seed in memory only
      setComplaints(SEED);
    } finally {
      setLoading(false);
    }
  }

  async function refreshComplaints() {
    const stored = await AsyncStorage.getItem(KEY);
    if (!stored) {
      setComplaints(SEED);
      await AsyncStorage.setItem(KEY, JSON.stringify(SEED));
      return;
    }

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      throw new Error('Stored complaint data is invalid.');
    }
    setComplaints(parsed as Complaint[]);
  }

  async function addComplaint(data: Omit<Complaint, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
    const newComplaint: Complaint = {
      ...data,
      id: 'cmp-' + Date.now().toString() + Math.random().toString(36).substr(2, 5),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newComplaint, ...complaints];
    setComplaints(updated);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  }

  async function updateComplaint(id: string, status: ComplaintStatus, adminNote?: string) {
    const updated = complaints.map((c) =>
      c.id === id
        ? { ...c, status, adminNote: adminNote ?? c.adminNote, updatedAt: new Date().toISOString() }
        : c
    );
    setComplaints(updated);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  }

  async function resolvePendingComplaintsForUser(userId: string, note: string) {
    const resolvedAt = new Date().toISOString();
    const affected = complaints.filter((c) => c.userId === userId && c.status === 'pending');
    if (affected.length === 0) return [];

    const updated = complaints.map((c) =>
      c.userId === userId && c.status === 'pending'
        ? { ...c, status: 'resolved' as const, adminNote: note, updatedAt: resolvedAt }
        : c
    );
    setComplaints(updated);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
    return affected.map((c) => ({ ...c, status: 'resolved' as const, adminNote: note, updatedAt: resolvedAt }));
  }

  function getComplaintById(id: string) {
    return complaints.find((c) => c.id === id);
  }

  return (
    <ComplaintsContext.Provider value={{ complaints, addComplaint, updateComplaint, resolvePendingComplaintsForUser, getComplaintById, refreshComplaints, loading }}>
      {children}
    </ComplaintsContext.Provider>
  );
}

export function useComplaints() {
  const ctx = useContext(ComplaintsContext);
  if (!ctx) throw new Error('useComplaints must be used within ComplaintsProvider');
  return ctx;
}
