import { supabase } from '../utils/supabase';

export const authService = {
  // Login with student ID and DOB
  async login(studentId, dob) {
    try {
      // Query the students table
      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('student_id', studentId)
        .eq('dob', dob)
        .single();

      if (error || !student) {
        throw new Error('Invalid credentials');
      }

      // Store user session in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(student));
        localStorage.setItem('userRole', student.role || 'student');
      }

      return { success: true, user: student };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Register new student
  async register(studentData) {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([
          {
            student_id: studentData.studentId,
            name: studentData.name,
            email: studentData.email,
            phone: studentData.phone,
            dob: studentData.dob,
            department: studentData.department,
            year: studentData.year,
            role: 'student',
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { success: true, user: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  // Get current user role
  getUserRole() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userRole') || null;
    }
    return null;
  },

  // Logout
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return this.getCurrentUser() !== null;
  },
};
