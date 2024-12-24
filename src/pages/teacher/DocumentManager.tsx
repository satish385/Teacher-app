import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Plus, FileText, Trash2, Edit } from 'lucide-react';
import { db } from '../../config/firebaseConfig'; // Firebase configuration
import {
  getDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
} from 'firebase/firestore';

import type { Document } from '../../types';

export default function DocumentManager() {
  const { user } = useAuthStore(); // Get the authenticated user
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Document>({
    id: '',
    teacherId: '',
    title: '',
    type: 'notes',
    uploadDate: new Date().toISOString(),
    description: '',
    url: '',
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  // Fetch Teacher ID on component mount
  useEffect(() => {
    if (user?.id) fetchTeacherId();
  }, [user?.id]);

  // Fetch Teacher ID from Firestore
  const fetchTeacherId = async () => {
    try {
      if (!user?.id) {
        console.error('User ID is not available');
        return;
      }

      const teacherRef = doc(db, 'teachers', user.id);
      const teacherDoc = await getDoc(teacherRef);

      if (teacherDoc.exists()) {
        setTeacherId(teacherDoc.id);
      } else {
        console.error('Teacher document does not exist.');
      }
    } catch (error) {
      console.error('Error fetching teacher ID:', error);
    }
  };

  // Load documents for the teacher
  useEffect(() => {
    if (teacherId) fetchDocuments();
  }, [teacherId]);

  const fetchDocuments = async () => {
    try {
      if (!teacherId) return;
      const docsRef = collection(db, 'documents');
      const q = query(docsRef, where('teacherId', '==', teacherId));
      const snapshot = await getDocs(q);
      const fetchedDocuments: Document[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Document[];
      setDocuments(fetchedDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  // Open modal for adding or editing a document
  const openModal = (doc: Document | null = null) => {
    if (doc) {
      setIsEditMode(true);
      setFormData({
        id: doc.id,
        teacherId: doc.teacherId,
        title: doc.title,
        description: doc.description,
        type: doc.type,
        url: doc.url,
        uploadDate: doc.uploadDate,
      });
    } else {
      setIsEditMode(false);
      setFormData({
        id: '',
        teacherId: teacherId || '',
        title: '',
        description: '',
        type: 'notes',
        url: '',
        uploadDate: new Date().toISOString(),
      });
    }
    setIsModalOpen(true);
  };

  // Add or update document
  const saveDocument = async () => {
    try {
      if (isEditMode) {
        // Update existing document
        const docRef = doc(db, 'documents', formData.id);
        await updateDoc(docRef, {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          uploadDate: new Date().toISOString(),
          url: formData.url,
        });
      } else {
        // Add new document
        const newDocument = {
          teacherId,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          uploadDate: new Date().toISOString(),
          url: formData.url,
        };
        await addDoc(collection(db, 'documents'), newDocument);
      }

      fetchDocuments();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  // Delete document
  const deleteDocument = async (id: string) => {
    try {
      const docRef = doc(db, 'documents', id);
      await deleteDoc(docRef);
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Document Manager</h1>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-md hover:opacity-90 transition-opacity duration-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Document
        </button>
      </div>

      {/* Document List Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-gradient-to-br from-white to-gray-100 p-6 rounded-lg shadow-lg hover:shadow-2xl transform transition-transform duration-300 hover:scale-105"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start">
                <FileText className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">{doc.title}</h3>
                  <p className="text-gray-600 mt-1">{doc.description}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{new Date(doc.uploadDate).toLocaleDateString()}</span>
            </div>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => openModal(doc)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => deleteDocument(doc.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add/Edit Document */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">{isEditMode ? 'Edit Document' : 'Add Document'}</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
              <input
                type="text"
                placeholder="URL"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">
                Cancel
              </button>
              <button onClick={saveDocument} className="px-4 py-2 bg-blue-500 text-white rounded-md">
                {isEditMode ? 'Save Changes' : 'Add Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
