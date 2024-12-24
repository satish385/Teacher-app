import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Plus, BookOpen, Trash, Edit } from 'lucide-react';
import { db } from '../../config/firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, getDoc } from 'firebase/firestore';
import type { SyllabusEntry } from '../../types';

export default function SyllabusManager() {
  const { user } = useAuthStore(); // Authenticated user with unique ID
  const [entries, setEntries] = useState<SyllabusEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    subject: '',
    topic: '',
    completionStatus: 0,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null); // Store the teacher's ID

  // Fetch Teacher ID on component mount
  useEffect(() => {
    if (user?.id) fetchTeacherId();
  }, [user?.id]);

  const fetchTeacherId = async () => {
    try {
      if (!user?.id) {
        console.error('User ID is not available');
        return;
      }

      const teacherRef = doc(db, 'teachers', user.id); // Pass `user.id` directly since it's guaranteed to be a string now
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

  // Load syllabus entries for the logged-in teacher
  useEffect(() => {
    if (teacherId) fetchSyllabusEntries();
  }, [teacherId]);

  const fetchSyllabusEntries = async () => {
    if (!teacherId) return;

    try {
      const syllabusRef = collection(db, 'syllabus');
      const q = query(syllabusRef, where('teacherId', '==', teacherId)); // Filter syllabus by teacherId
      const snapshot = await getDocs(q);

      const fetchedEntries: SyllabusEntry[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SyllabusEntry[];

      setEntries(fetchedEntries);
    } catch (error) {
      console.error('Error fetching syllabus entries:', error);
    }
  };

  const openModal = (entry: SyllabusEntry | null = null) => {
    if (entry) {
      setIsEditMode(true);
      setFormData({
        id: entry.id,
        subject: entry.subject,
        topic: entry.topic,
        completionStatus: entry.completionStatus,
      });
    } else {
      setIsEditMode(false);
      setFormData({
        id: '',
        subject: '',
        topic: '',
        completionStatus: 0,
      });
    }
    setIsModalOpen(true);
  };

  const saveEntry = async () => {
    if (!teacherId) return;

    try {
      if (isEditMode) {
        const entryRef = doc(db, 'syllabus', formData.id);
        await updateDoc(entryRef, {
          subject: formData.subject,
          topic: formData.topic,
          completionStatus: formData.completionStatus,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        const newEntry = {
          teacherId,
          subject: formData.subject,
          topic: formData.topic,
          completionStatus: formData.completionStatus,
          lastUpdated: new Date().toISOString(),
        };
        await addDoc(collection(db, 'syllabus'), newEntry);
      }

      fetchSyllabusEntries();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const entryRef = doc(db, 'syllabus', id);
      await deleteDoc(entryRef);
      fetchSyllabusEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="header-container flex justify-between items-center px-4 sm:px-0">
        <div className="flex items-center space-x-4">
          <button
            className="p-2 rounded-md hover:bg-gray-200 transition-all md:hidden"
            aria-label="Menu"
          >
         
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Syllabus Management</h1>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-md hover:opacity-90 transition-opacity duration-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Entry
        </button>
      </div>

      {/* Display Syllabus Entries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-gradient-to-br from-white to-gray-100 p-6 rounded-lg shadow-lg hover:shadow-2xl transform transition-transform duration-300 hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BookOpen className="w-6 h-6 text-blue-500" />
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">{entry.subject}</h3>
                  <p className="text-gray-600">{entry.topic}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(entry.lastUpdated).toLocaleDateString()}
                </div>
                <div className="mt-1">
                  <div className="bg-gray-200 rounded-full h-2 w-32">
                    <div
                      className="bg-blue-500 rounded-full h-2"
                      style={{ width: `${entry.completionStatus}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{entry.completionStatus}% Completed</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => openModal(entry)}
                className="flex items-center text-blue-500 hover:text-blue-700 transition-colors"
              >
                <Edit className="w-5 h-5 mr-2" />
                Edit
              </button>
              <button
                onClick={() => deleteEntry(entry.id)}
                className="flex items-center text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash className="w-5 h-5 mr-2" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add/Edit Entry */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">{isEditMode ? 'Edit Entry' : 'Add New Entry'}</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none"
              />
              <input
                type="text"
                placeholder="Topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
              <input
                type="number"
                placeholder="Completion Status (%)"
                value={formData.completionStatus}
                onChange={(e) => setFormData({ ...formData, completionStatus: +e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">
                Cancel
              </button>
              <button onClick={saveEntry} className="px-4 py-2 bg-blue-500 text-white rounded-md">
                {isEditMode ? 'Save Changes' : 'Add Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
