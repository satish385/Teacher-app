import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';


// Define the timetable type
type TimetableEntry = {
  day: string;
  period: number;
  subject: string;
  teacher: string;
};

const Timetable: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const timetableSnapshot = await getDocs(collection(db, 'timetable'));
        const timetableData = timetableSnapshot.docs.map((doc) => {
          const data = doc.data();
          // Ensure the data matches the TimetableEntry type
          return {
            day: data.day as string,
            period: data.period as number,
            subject: data.subject as string,
            teacher: data.teacher as string,
          };
        });
        setTimetable(
          timetableData.sort((a, b) => {
            // Sort by day and then by period
            const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayA = daysOrder.indexOf(a.day);
            const dayB = daysOrder.indexOf(b.day);
            return dayA === dayB ? a.period - b.period : dayA - dayB;
          })
        );
      } catch (err) {
        console.error('Error fetching timetable:', err);
        setError('Failed to load timetable.');
      }
    };

    fetchTimetable();
  }, []);

  return (
    <div className="p-6">
        <div className="flex items-center space-x-4">
          <button
            className="p-2 rounded-md hover:bg-gray-200 transition-all md:hidden"
            aria-label="Menu"
          >
         
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Time Table</h1>
        </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Day</th>
              <th className="border px-4 py-2">Period</th>
              <th className="border px-4 py-2">Subject</th>
              <th className="border px-4 py-2">Teacher</th>
            </tr>
          </thead>
          <tbody>
            {timetable.map((entry, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border px-4 py-2">{entry.day}</td>
                <td className="border px-4 py-2">{entry.period}</td>
                <td className="border px-4 py-2">{entry.subject}</td>
                <td className="border px-4 py-2">{entry.teacher}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {timetable.length === 0 && !error && <p className="text-gray-500 mt-4">No timetable data available.</p>}
      </div>
    </div>
  );
};

export default Timetable;
