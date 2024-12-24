import { create } from 'zustand';
import { User } from '../types';
import { db } from '../config/firebaseConfig'; // Ensure firebase config is correct
import { collection, query, where, getDocs } from 'firebase/firestore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: 'teacher' | 'admin') => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email, password, role) => {
    if (role === 'admin') {
      // Handle admin login logic
      const mockAdminUser: User = {
        id: 'admin1', // Hardcoded admin ID
        name: 'Admin',
        email,
        role: 'admin',
        documentId: null, // Admin does not have a documentId, set it to null
      };
      set({ user: mockAdminUser, isAuthenticated: true });
      return;
    }

    if (role === 'teacher') {
      try {
        // Fetch teacher data from Firestore
        const teachersRef = collection(db, 'teachers');
        const q = query(teachersRef, where('email', '==', email), where('password', '==', password));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const teacherDoc = querySnapshot.docs[0];
          const documentId = teacherDoc.id; // Get document ID from Firestore

          const teacherUser: User = {
            id: documentId, // Use document ID as user ID
            name: email.split('@')[0], // Use email username as display name
            email,
            role: 'teacher',
            documentId, // Store document ID for teacher
          };

          set({ user: teacherUser, isAuthenticated: true });
        } else {
          throw new Error('Invalid teacher credentials');
        }
      } catch (error) {
        console.error(error);
        throw new Error('Login failed. Please try again.');
      }
    } else {
      // For other roles, create mock user with documentId as null or a default value
      const mockUser: User = {
        id: '1', // Use a default ID for other roles
        name: email.split('@')[0], // Use email username as display name
        email,
        role,
        documentId: null, // No Firestore document ID for roles other than 'teacher'
      };
      set({ user: mockUser, isAuthenticated: true });
    }
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));
