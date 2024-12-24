import React, { useState, useEffect } from 'react';
import { User, Mail, Plus, Edit2, Trash, Eye } from 'lucide-react';
import { db } from "../../config/firebaseConfig"; // Ensure Firebase is configured
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
  joinDate: string;
}

interface TeacherDetails {
  classes: {
    date: string;
    period: string;
    subject: string;
    topicsCovered: string[];
    attendanceCount: number;
  }[];
  documents: {
    title: string;
    type: string;
    description: string;
    uploadDate: string;
    url: string;
  }[];
  syllabus: {
    subject: string;
    topic: string;
    completionStatus: number;
    lastUpdated: string;
  }[];
  publications: {
    title: string;
    description: string;
    journal: string;
    year: string;
  }[];
}


export default function TeacherManager() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    department: '',
  });
  const [editTeacherId, setEditTeacherId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [viewMoreId, setViewMoreId] = useState<string | null>(null);
  const [teacherDetails, setTeacherDetails] = useState<TeacherDetails | null>(null);

  const departments = ['CSE', 'IT', 'MECH', 'AIML', 'CSBS', 'AIDS', 'CIVIL', 'EEE', 'ECE'];

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'teachers'));
        const teachersList: Teacher[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Teacher));
        setTeachers(teachersList);
      } catch (err) {
        console.error("Error fetching teachers: ", err);
        setError('Error fetching teacher data.');
      }
    };
    fetchTeachers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTeacher({ ...newTeacher, [name]: value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewTeacher({ ...newTeacher, department: e.target.value });
  };

  const handleAddTeacher = async () => {
    const { name, email, department } = newTeacher;
    if (!name || !email || !department) {
      setError('Please fill in all fields');
      return;
    }

    const joinDate = new Date().toLocaleDateString();

    try {
      if (editTeacherId) {
        await updateDoc(doc(db, 'teachers', editTeacherId), { name, email, department });

        setTeachers((prevTeachers) =>
          prevTeachers.map((teacher) =>
            teacher.id === editTeacherId ? { ...teacher, name, email, department } : teacher
          )
        );
        setEditTeacherId(null);
      } else {
        const docRef = await addDoc(collection(db, 'teachers'), { name, email, department, joinDate });
        setTeachers((prevTeachers) => [...prevTeachers, { id: docRef.id, name, email, department, joinDate }]);
      }

      setNewTeacher({ name: '', email: '', department: '' });
      setShowForm(false);
    } catch (err) {
      setError('Error saving teacher. Please try again.');
    }
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setNewTeacher({
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
    });
    setEditTeacherId(teacher.id);
    setShowForm(true);
  };

  const handleDeleteTeacher = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'teachers', id));
      setTeachers((prevTeachers) => prevTeachers.filter((teacher) => teacher.id !== id));
    } catch (err) {
      console.error('Error deleting teacher:', err);
      setError('Error deleting teacher. Please try again.');
    }
  };

  const handleViewMore = async (email: string) => {
    try {
      console.log('Fetching teacher details for email:', email);
  
      const teacherQuery = query(collection(db, 'teachers'), where('email', '==', email));
      const querySnapshot = await getDocs(teacherQuery);
  
      if (!querySnapshot.empty) {
        const teacherDoc = querySnapshot.docs[0];
        const teacherId = teacherDoc.id;
  
        // Fetch classes
        const classesSnapshot = await getDocs(query(collection(db, 'classes'), where('teacherId', '==', teacherId)));
        const classes = classesSnapshot.docs.map((doc) => ({
          date: doc.data().date,
          period: doc.data().period,
          subject: doc.data().subject,
          topicsCovered: doc.data().topicsCovered,
          attendanceCount: doc.data().attendanceCount,
        }));
  
        // Fetch documents
        const documentsSnapshot = await getDocs(query(collection(db, 'documents'), where('teacherId', '==', teacherId)));
        const documents = documentsSnapshot.docs.map((doc) => ({
          title: doc.data().title,
          type: doc.data().type,
          description: doc.data().description,
          uploadDate: doc.data().uploadDate,
          url: doc.data().url,
        }));
  
        // Fetch syllabus
        const syllabusSnapshot = await getDocs(query(collection(db, 'syllabus'), where('teacherId', '==', teacherId)));
        const syllabus = syllabusSnapshot.docs.map((doc) => ({
          subject: doc.data().subject,
          topic: doc.data().topic,
          completionStatus: doc.data().completionStatus,
          lastUpdated: doc.data().lastUpdated,
        }));
  
        // Fetch publications
        const publicationsSnapshot = await getDocs(query(collection(db, 'publications'), where('teacherId', '==', teacherId)));
        const publications = publicationsSnapshot.docs.map((doc) => ({
          title: doc.data().title,
          description: doc.data().description,
          journal: doc.data().journal,
          year: doc.data().year,
        }));
  
        // Set state with fetched data
        setTeacherDetails({ classes, documents, syllabus, publications });
        setViewMoreId(teacherId);
      } else {
        setError('Teacher not found.');
      }
    } catch (err) {
      console.error('Error fetching teacher details:', err);
      setError('Error fetching teacher details. Please try again.');
    }
  };
  
  

  return (
    <div className="space-y-6">
       <style>{`
        @media (max-width: 768px) {
          .space-y-6 {
            padding: 1rem;
          }
          .flex.justify-between {
            flex-wrap: wrap;
            gap: 1rem;
          }
          .grid.gap-6 {
            grid-template-columns: 1fr;
          }
          .flex-wrap.gap-4 {
            flex-direction: column;
          }
        }
      `}</style>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manage Teachers</h1>
        <button
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => {
            setShowForm(true);
            setEditTeacherId(null);
          }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Teacher
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            {editTeacherId ? 'Edit Teacher' : 'Add New Teacher'}
          </h2>
          {error && <div className="text-red-600 mb-4">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={newTeacher.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={newTeacher.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                name="department"
                value={newTeacher.department}
                onChange={handleSelectChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              onClick={handleAddTeacher}
            >
              {editTeacherId ? 'Update Teacher' : 'Add Teacher'}
            </button>
            <button
              className="mt-2 w-full text-gray-600 py-2 rounded-md hover:bg-gray-100"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}


      <div className="grid gap-6">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <User className="w-12 h-12 text-gray-400 bg-gray-100 rounded-full p-2" />
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">{teacher.name}</h3>
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{teacher.email}</span>
                    </div>
                    <p className="text-gray-600">Department: {teacher.department}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">
                  Joined: {new Date(teacher.joinDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                onClick={() => handleEditTeacher(teacher)}
              >
                <Edit2 className="w-4 h-4 mr-2 inline-block" />
                Edit
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={() => handleDeleteTeacher(teacher.id)}
              >
                <Trash className="w-4 h-4 mr-2 inline-block" />
                Delete
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={() => handleViewMore(teacher.email)}
              >
                <Eye className="w-4 h-4 mr-2 inline-block" />
                View More
              </button>
              
            </div>
            {viewMoreId === teacher.id && teacherDetails && (
  <div className="space-y-8 mt-6">
    <h2 className="text-2xl font-semibold">📋 Teacher Details</h2>
    <div className="flex flex-wrap gap-4">
      {/* Classes Card */}
      <div className="flex-1 max-w-[300px] bg-blue-100 p-4 rounded-md shadow">
        <h3 className="text-xl font-semibold text-blue-700">Classes</h3>
        <ul className="mt-2 space-y-2 text-sm">
          {teacherDetails.classes.length > 0 ? (
            teacherDetails.classes.map((classItem, idx) => (
              <li key={idx} className="bg-white p-2 rounded shadow">
                <strong>Subject:</strong> {classItem.subject}
              </li>
            ))
          ) : (
            <li>No data found</li>
          )}
        </ul>
      </div>
      {/* Documents Card */}
      <div className="flex-1 max-w-[300px] bg-green-100 p-4 rounded-md shadow">
        <h3 className="text-xl font-semibold text-green-700">Documents</h3>
        <ul className="mt-2 space-y-2 text-sm">
          {teacherDetails.documents.length > 0 ? (
            teacherDetails.documents.map((doc, idx) => (
              <li key={idx} className="bg-white p-2 rounded shadow">
                <strong>Title:</strong> {doc.title}
              </li>
            ))
          ) : (
            <li>No data found</li>
          )}
        </ul>
      </div>
      {/* Syllabus Card */}
      <div className="flex-1 max-w-[300px] bg-purple-100 p-4 rounded-md shadow">
        <h3 className="text-xl font-semibold text-purple-700">Syllabus</h3>
        <ul className="mt-2 space-y-2 text-sm">
          {teacherDetails.syllabus.length > 0 ? (
            teacherDetails.syllabus.map((syllabus, idx) => (
              <li key={idx} className="bg-white p-2 rounded shadow">
                <strong>Topic:</strong> {syllabus.topic}
              </li>
            ))
          ) : (
            <li>No data found</li>
          )}
        </ul>
      </div>
      {/* Publications Card */}
      <div className="flex-1 max-w-[300px] bg-yellow-100 p-4 rounded-md shadow">
        <h3 className="text-xl font-semibold text-yellow-700">Publications</h3>
        <ul className="mt-2 space-y-2 text-sm">
          {teacherDetails.publications.length > 0 ? (
            teacherDetails.publications.map((pub, idx) => (
              <li key={idx} className="bg-white p-2 rounded shadow">
                <strong>Title:</strong> {pub.title} - {pub.journal} ({pub.year})
              </li>
            ))
          ) : (
            <li>No data found</li>
          )}
        </ul>
      </div>
    </div>
    <button
      className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      onClick={() => setViewMoreId(null)}
    >
      Close
    </button>
  </div>
)}

        </div>
      ))}
    </div>
  </div>
);
}