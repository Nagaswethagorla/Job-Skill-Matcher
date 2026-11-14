import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  writeBatch,
  query,
  where,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile, UserRole, ApplicantProfile } from '../types';
import { SAMPLE_JOBS } from '../services/sampleJobs';
import { UNSTOP_JOBS, getUnstopApplications } from '../services/unstopData';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  applicantProfile: ApplicantProfile | null;
  role: UserRole;
  loading: boolean;
  profileCompletion: number;
  signInWithGoogle: (roleChoice?: UserRole) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string, role: UserRole) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  saveApplicantProfile: (profile: Partial<ApplicantProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  ensureDatabaseSeeded: () => Promise<void>;
  syncUnstopApplications: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Calculate profile completion percentage
export function calculateProfileCompletion(profile: ApplicantProfile | null): number {
  if (!profile) return 0;
  let score = 0;
  if (profile.fullName && profile.fullName.trim().length > 1) score += 10;
  if (profile.email && profile.phone) score += 10;
  if (profile.degree && profile.college) score += 15;
  if (profile.experienceYears !== undefined) score += 10;
  if (profile.programmingLanguages && profile.programmingLanguages.length > 0) score += 15;
  if (profile.frameworks && profile.frameworks.length > 0) score += 10;
  if (profile.tools && profile.tools.length > 0) score += 10;
  if (profile.softSkills && profile.softSkills.length > 0) score += 10;
  if (profile.projects && profile.projects.length > 0) score += 10;
  return Math.min(100, score);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [applicantProfile, setApplicantProfile] = useState<ApplicantProfile | null>(null);
  const [role, setRole] = useState<UserRole>('applicant');
  const [loading, setLoading] = useState<boolean>(true);

  // Auto seed sample jobs & Unstop jobs in Firestore
  const ensureDatabaseSeeded = async () => {
    try {
      const jobsCol = collection(db, 'jobs');
      const snap = await getDocs(jobsCol);

      // Check if unstop jobs exist
      const unstopDoc = await getDoc(doc(jobsCol, 'unstop-job-1'));
      if (snap.empty || !unstopDoc.exists()) {
        console.log('Seeding initial jobs & Unstop hiring challenges into Firestore...');
        const batch = writeBatch(db);

        // Seed Sample Jobs
        SAMPLE_JOBS.forEach((job, index) => {
          const docRef = doc(jobsCol, `sample-job-${index + 1}`);
          batch.set(docRef, {
            ...job,
            id: `sample-job-${index + 1}`,
          });
        });

        // Seed Unstop Tech Challenges & Drives
        UNSTOP_JOBS.forEach((job, index) => {
          const docRef = doc(jobsCol, `unstop-job-${index + 1}`);
          batch.set(docRef, {
            ...job,
            id: `unstop-job-${index + 1}`,
          });
        });

        await batch.commit();
        console.log('Jobs & Unstop drives successfully seeded to Firestore!');
      }
    } catch (err) {
      console.warn('Auto-seed check note:', err);
    }
  };

  // Seed or sync Unstop applications for applicant
  const syncUnstopApplications = async () => {
    const targetUser = user || auth.currentUser;
    if (!targetUser) return;

    try {
      console.log('Syncing Unstop applications for user:', targetUser.uid);
      const apps = getUnstopApplications(
        targetUser.uid,
        targetUser.displayName || userProfile?.displayName || 'Applicant',
        targetUser.email || 'applicant@example.com'
      );

      const batch = writeBatch(db);
      apps.forEach((app) => {
        const docRef = doc(db, 'applications', `${targetUser.uid}_${app.id}`);
        batch.set(docRef, {
          ...app,
          id: `${targetUser.uid}_${app.id}`,
        }, { merge: true });
      });

      await batch.commit();
      console.log('Unstop applications synced successfully!');
    } catch (err) {
      console.error('Error syncing Unstop applications:', err);
    }
  };

  // Fetch or create user record and applicant profile
  const loadUserData = async (currentUser: User) => {
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userDocRef);

      let profileData: UserProfile;
      if (userSnap.exists()) {
        profileData = userSnap.data() as UserProfile;
      } else {
        // First-time user, default to applicant
        profileData = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'Job Seeker',
          role: 'applicant',
          photoURL: currentUser.photoURL || '',
          createdAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, profileData);
      }

      setUserProfile(profileData);
      setRole(profileData.role || 'applicant');

      // If applicant, load or initialize applicant profile
      if (profileData.role === 'applicant') {
        const appDocRef = doc(db, 'applicantProfiles', currentUser.uid);
        const appSnap = await getDoc(appDocRef);
        if (appSnap.exists()) {
          setApplicantProfile(appSnap.data() as ApplicantProfile);
        } else {
          // Initialize empty applicant profile
          const defaultAppProfile: ApplicantProfile = {
            userId: currentUser.uid,
            fullName: profileData.displayName,
            email: profileData.email,
            phone: '',
            degree: 'Bachelor of Science in Computer Science',
            college: '',
            experienceYears: 2,
            programmingLanguages: ['JavaScript', 'TypeScript', 'Python'],
            frameworks: ['React', 'Node.js', 'Express'],
            tools: ['Git', 'Docker'],
            softSkills: ['Problem Solving', 'Team Collaboration'],
            experience: [],
            projects: [],
            certifications: [],
            updatedAt: new Date().toISOString(),
          };
          await setDoc(appDocRef, defaultAppProfile);
          setApplicantProfile(defaultAppProfile);
        }

        // Check if user has applications, if none, auto-seed Unstop applications
        const userAppsSnap = await getDocs(
          query(collection(db, 'applications'), where('applicantId', '==', currentUser.uid))
        );
        if (userAppsSnap.empty) {
          const apps = getUnstopApplications(
            currentUser.uid,
            profileData.displayName,
            profileData.email
          );
          const batch = writeBatch(db);
          apps.forEach((app) => {
            const docRef = doc(db, 'applications', `${currentUser.uid}_${app.id}`);
            batch.set(docRef, {
              ...app,
              id: `${currentUser.uid}_${app.id}`,
            });
          });
          await batch.commit();
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  useEffect(() => {
    ensureDatabaseSeeded();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserData(currentUser);
      } else {
        setUserProfile(null);
        setApplicantProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (roleChoice: UserRole = 'applicant') => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDocRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        const newProfile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || 'Job Seeker',
          role: roleChoice,
          photoURL: result.user.photoURL || '',
          createdAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
        setRole(roleChoice);
      } else {
        const existingData = userSnap.data() as UserProfile;
        setUserProfile(existingData);
        setRole(existingData.role);
      }
      await loadUserData(result.user);
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      await loadUserData(res.user);
    } catch (error: any) {
      console.error('Email Login Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string, userRole: UserRole) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: UserProfile = {
        uid: res.user.uid,
        email,
        displayName: name,
        role: userRole,
        photoURL: '',
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', res.user.uid), newProfile);
      setUserProfile(newProfile);
      setRole(userRole);

      if (userRole === 'applicant') {
        const appProfile: ApplicantProfile = {
          userId: res.user.uid,
          fullName: name,
          email,
          phone: '',
          degree: '',
          college: '',
          experienceYears: 0,
          programmingLanguages: [],
          frameworks: [],
          tools: [],
          softSkills: [],
          experience: [],
          projects: [],
          certifications: [],
          updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'applicantProfiles', res.user.uid), appProfile);
        setApplicantProfile(appProfile);
      }
      await loadUserData(res.user);
    } catch (error: any) {
      console.error('Registration Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      setApplicantProfile(null);
    } catch (error) {
      console.error('Sign Out Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Quick switch between Applicant and Recruiter demo view for smooth end-to-end evaluation
  const switchDemoRole = async (newRole: UserRole) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { role: newRole });
      setRole(newRole);
      if (userProfile) {
        setUserProfile({ ...userProfile, role: newRole });
      }
      await loadUserData(user);
    } catch (error) {
      console.error('Error switching role:', error);
    }
  };

  const saveApplicantProfile = async (updatedFields: Partial<ApplicantProfile>) => {
    if (!user) return;
    try {
      const merged = {
        ...(applicantProfile || {
          userId: user.uid,
          fullName: user.displayName || 'Applicant',
          email: user.email || '',
          phone: '',
          degree: '',
          college: '',
          experienceYears: 0,
          programmingLanguages: [],
          frameworks: [],
          tools: [],
          softSkills: [],
          projects: [],
          certifications: [],
        }),
        ...updatedFields,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'applicantProfiles', user.uid), merged, { merge: true });
      setApplicantProfile(merged as ApplicantProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `applicantProfiles/${user.uid}`);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user);
    }
  };

  const profileCompletion = calculateProfileCompletion(applicantProfile);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        applicantProfile,
        role,
        loading,
        profileCompletion,
        signInWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        logout,
        switchDemoRole,
        saveApplicantProfile,
        refreshProfile,
        ensureDatabaseSeeded,
        syncUnstopApplications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
