import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Users, BookOpen, FileText, Clock } from 'lucide-react';
import { db } from '../../config/firebaseConfig'; // Ensure correct import path
import { collection, getDocs } from 'firebase/firestore';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [teachersCount, setTeachersCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [submissionsCount, setSubmissionsCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const teachersSnapshot = await getDocs(collection(db, 'teachers'));
        setTeachersCount(teachersSnapshot.size);

        const syllabusSnapshot = await getDocs(collection(db, 'syllabus'));
        setCoursesCount(syllabusSnapshot.size);

        const submissionsSnapshot = await getDocs(collection(db, 'documents'));
        setSubmissionsCount(submissionsSnapshot.size);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchCounts();
  }, []);

  if (user?.role === 'teacher') {
    return null; // Teachers will see TeacherDashboard instead
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900">🎉 Admin Dashboard</h1>
      
      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-400 p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-white" />
            <h2 className="ml-3 text-xl font-semibold text-white">Teachers</h2>
          </div>
          <p className="mt-4 text-5xl font-bold text-white">{teachersCount}</p>
          <p className="text-gray-200">Active teachers</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-400 p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-white" />
            <h2 className="ml-3 text-xl font-semibold text-white">Courses</h2>
          </div>
          <p className="mt-4 text-5xl font-bold text-white">{coursesCount}</p>
          <p className="text-gray-200">Active courses</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-400 p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-white" />
            <h2 className="ml-3 text-xl font-semibold text-white">Submissions</h2>
          </div>
          <p className="mt-4 text-5xl font-bold text-white">{submissionsCount}</p>
          <p className="text-gray-200">This month</p>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-lg shadow-lg transform hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Recent Activities</h2>
        <div className="space-y-4">
          <div className="flex items-center bg-white p-4 rounded-lg shadow hover:shadow-lg transform hover:scale-105 transition-all duration-300">
            <BookOpen className="w-6 h-6 text-blue-500 mr-4" />
            <span className="text-gray-800">Updated Database Management syllabus</span>
            <span className="ml-auto text-sm text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center bg-white p-4 rounded-lg shadow hover:shadow-lg transform hover:scale-105 transition-all duration-300">
            <Clock className="w-6 h-6 text-green-500 mr-4" />
            <span className="text-gray-800">Recorded attendance for Web Development class</span>
            <span className="ml-auto text-sm text-gray-500">5 hours ago</span>
          </div>
          <div className="flex items-center bg-white p-4 rounded-lg shadow hover:shadow-lg transform hover:scale-105 transition-all duration-300">
            <FileText className="w-6 h-6 text-purple-500 mr-4" />
            <span className="text-gray-800">Uploaded new assignment for Data Structures</span>
            <span className="ml-auto text-sm text-gray-500">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
