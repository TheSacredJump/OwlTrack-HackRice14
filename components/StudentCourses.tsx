import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { FaFileUpload } from 'react-icons/fa';

const StudentCourses = () => {
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [major, setMajor] = useState('');
  const [standing, setStanding] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gpa, setGpa] = useState(null);
  const [creditProgress, setCreditProgress] = useState(0);

  const TOTAL_CREDITS_REQUIRED = 120;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const response = await fetch('http://127.0.0.1:5000/api/get-user-courses', {
          headers: {
            'X-Clerk-User-Id': user.id
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setCourses(data.courses);
        setMajor(data.major);
        setStanding(data.standing);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (courses.length > 0) {
      calculateGPA();
      calculateCreditProgress();
    }
  }, [courses]);

  const calculateGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    const gradePoints = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0
    };

    courses.forEach(course => {
      if (course.status === 'completed' && course.grade in gradePoints) {
        totalPoints += gradePoints[course.grade] * parseFloat(course.hours);
        totalCredits += parseFloat(course.hours);
      }
    });

    const calculatedGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;
    setGpa(calculatedGPA.toFixed(2));
  };

  const calculateCreditProgress = () => {
    const completedCredits = courses
      .filter(course => course.status === 'completed')
      .reduce((sum, course) => sum + parseFloat(course.hours), 0);
    
    const inProgressCredits = courses
      .filter(course => course.status === 'in_progress')
      .reduce((sum, course) => sum + parseFloat(course.hours), 0);

    const totalCredits = completedCredits + inProgressCredits;
    const progress = (totalCredits / TOTAL_CREDITS_REQUIRED) * 100;
    setCreditProgress(Math.min(progress, 100));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('transcript', file);

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/parse-transcript', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload transcript');
      }

      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 bg-navy h-full overflow-auto">
      <h2 className="text-2xl font-bold mb-4 text-milk">Your Courses</h2>
      
      <div className="mb-4 text-milk">
        <p>Major: {major}</p>
        <p>Standing: {standing}</p>
      </div>

      {/* <div className="mb-4">
        <label htmlFor="transcript-upload" className="flex flex-row items-center space-x-2 w-fit bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-bold py-2 px-4 rounded cursor-pointer">
          <FaFileUpload />
          <p>Upload Transcript</p>
        </label>
        <input
          id="transcript-upload"
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div> */}

      {gpa !== null && (
        <div className="mb-4 text-milk">
          <h3 className="text-xl font-semibold">Overall GPA: {gpa}</h3>
        </div>
      )}

      {creditProgress > 0 && (
        <div className="mb-4 text-milk">
          <h3 className="text-xl font-semibold mb-2">Progress to Graduation</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-gradient-to-r from-pink-500 to-indigo-500 h-2.5 rounded-full" 
              style={{width: `${creditProgress}%`}}
            ></div>
          </div>
          <p className="mt-2">{creditProgress.toFixed(1)}% complete ({Math.round(creditProgress * TOTAL_CREDITS_REQUIRED / 100)} / {TOTAL_CREDITS_REQUIRED} credits)</p>
        </div>
      )}

      {courses.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-2 text-milk">Completed Courses</h3>
          {courses.filter(course => course.status === 'completed').map((course, index) => (
            <div key={index} className="mb-4 p-4 bg-modal rounded-lg text-milk">
              <h3 className="text-lg font-semibold">{course.name}</h3>
              <p>Code: {course.code}</p>
              <p>Credit Hours: {course.hours}</p>
              <p>Grade: {course.grade}</p>
              <p>Semester: {course.semester}</p>
            </div>
          ))}

          <h3 className="text-xl font-semibold mb-2 mt-6 text-milk">Current Courses</h3>
          {courses.filter(course => course.status === 'in_progress').map((course, index) => (
            <div key={index} className="mb-4 p-4 bg-highlight rounded-lg  text-milk">
              <h3 className="text-lg font-semibold">{course.name}</h3>
              <p>Code: {course.code}</p>
              <p>Credit Hours: {course.hours}</p>
              <p>Status: In Progress</p>
              <p>Semester: {course.semester}</p>
            </div>
          ))}
        </div>
      )}

      {courses.length === 0 && (
        <div className="text-milk">No courses to display. Please upload your transcript.</div>
      )}
    </div>
  );
};

export default StudentCourses;