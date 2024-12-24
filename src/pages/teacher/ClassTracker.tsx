import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore'; // For user authentication
import { Clock, Users, BookOpen, Plus, Trash, Edit } from 'lucide-react';
import { db } from '../../config/firebaseConfig'; // Firebase configuration
import { getDoc, doc, collection, getDocs, updateDoc, deleteDoc, addDoc, query, where } from 'firebase/firestore';
import type { ClassPeriod } from '../../types';

export default function ClassTracker() {
  const { user } = useAuthStore(); // Authenticated user with unique ID
  const [classes, setClasses] = useState<ClassPeriod[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ClassPeriod>({
    id: '',
    teacherId: '',
    subject: '',
    date: '',
    period: 1, // Default to period 1
    attendanceCount: 0,
    topicsCovered: [],
  });
  const [teacherId, setTeacherId] = useState<string | null>(null);

  // Fetch Teacher ID on component mount
  useEffect(() => {
    if (user?.id) fetchTeacherId();
  }, [user?.id]);

  // Fetch the teacher document and get the document ID
  const fetchTeacherId = async () => {
    try {
      if (!user?.id) {
        console.error('User ID is not available');
        return;
      }

      const teacherRef = doc(db, 'teachers', user.id); // Fetch teacher details by user ID
      const teacherDoc = await getDoc(teacherRef);

      if (teacherDoc.exists()) {
        setTeacherId(teacherDoc.id); // Store the teacher's document ID
      } else {
        console.error('Teacher document does not exist.');
      }
    } catch (error) {
      console.error('Error fetching teacher ID:', error);
    }
  };

  // Fetch classes specific to the teacher
  useEffect(() => {
    if (teacherId) fetchClasses();
  }, [teacherId]);

  const fetchClasses = async () => {
    if (!teacherId) return; // Ensure teacherId is available

    try {
      const classesRef = collection(db, 'classes');
      const q = query(classesRef, where('teacherId', '==', teacherId)); // Filter classes by teacherId
      const snapshot = await getDocs(q);
      const fetchedClasses: ClassPeriod[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ClassPeriod[];
      setClasses(fetchedClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  // Open modal for adding or editing a class
  const openModal = (classToEdit?: ClassPeriod) => {
    if (classToEdit) {
      setIsEditing(true);
      setEditingId(classToEdit.id);
      setFormData(classToEdit);
    } else {
      setIsEditing(false);
      setFormData({
        id: '',
        teacherId: teacherId || '',
        subject: '',
        date: '',
        period: 1,
        attendanceCount: 0,
        topicsCovered: [],
      });
    }
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setIsEditing(false);
  };

  // Add or update class
  const saveClass = async () => {
    if (!formData.subject || !formData.date || !formData.period) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      if (isEditing && editingId) {
        // Update the class
        const classRef = doc(db, 'classes', editingId);
        await updateDoc(classRef, {
          subject: formData.subject,
          date: formData.date,
          period: formData.period,
          topicsCovered: formData.topicsCovered,
        });
      } else {
        // Add a new class
        const newClass = {
          teacherId: formData.teacherId,
          subject: formData.subject,
          date: formData.date,
          period: formData.period,
          topicsCovered: formData.topicsCovered,
        };
        const docRef = await addDoc(collection(db, 'classes'), newClass);
        setFormData({ ...formData, id: docRef.id }); // Set the generated ID
      }

      fetchClasses(); // Refresh class list
      closeModal();
    } catch (error) {
      console.error('Error saving class:', error);
    }
  };

  // Delete class
  const deleteClass = async (id: string) => {
    try {
      const classRef = doc(db, 'classes', id);
      await deleteDoc(classRef);
      fetchClasses(); // Refresh class list
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
      <div className="flex items-center space-x-4">
          <button
            className="p-2 rounded-md hover:bg-gray-200 transition-all md:hidden"
            aria-label="Menu"
          >
         
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Class Tracker</h1>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-md hover:opacity-90 transition-opacity duration-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          Record New Class
        </button>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classPeriod) => (
          <div
            key={classPeriod.id}
            className="bg-gradient-to-br from-white to-gray-100 p-6 rounded-lg shadow-lg hover:shadow-2xl transform transition-transform duration-300 hover:scale-105"
          >
            <div className="flex justify-between items-start">
              {/* Class Details */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{classPeriod.subject}</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>Period {classPeriod.period}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <BookOpen className="w-5 h-5 mr-2" />
                    <span>{classPeriod.topicsCovered.join(', ')}</span>
                  </div>
                </div>
              </div>
              {/* Date, Edit, and Delete Buttons */}
              <div className="text-right">
                <span className="text-sm text-gray-500">
                  {new Date(classPeriod.date).toLocaleDateString()}
                </span>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => openModal(classPeriod)}
                    className="flex items-center text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <Edit className="w-5 h-5 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteClass(classPeriod.id)}
                    className="flex items-center text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash className="w-5 h-5 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Adding or Editing Class */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? 'Edit Class' : 'Record New Class'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Period</label>
                <input
                  type="number"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min={1}
                  max={10}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Topics Covered</label>
                <input
                  type="text"
                  value={formData.topicsCovered.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      topicsCovered: e.target.value.split(',').map((topic) => topic.trim()),
                    })
                  }
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={saveClass}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
