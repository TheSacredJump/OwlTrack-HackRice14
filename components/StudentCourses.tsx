import React, { useState } from 'react';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('transcript', file);

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/upload-transcript', {
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

  return (
    <div className="p-4 bg-navy h-full overflow-auto">
      <h2 className="text-2xl font-bold mb-4">Your Courses</h2>
      
      <div className="mb-4">
        <label htmlFor="transcript-upload" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
          Upload Transcript
        </label>
        <input
          id="transcript-upload"
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {loading && <div>Processing transcript...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}

      {courses.length > 0 ? (
        <div>
          {courses.map((course, index) => (
            <div key={index} className="mb-4 p-4 bg-modal rounded-lg">
              <h3 className="text-lg font-semibold">{course.name}</h3>
              <p>Code: {course.code}</p>
              <p>Credit Hours: {course.hours}</p>
              <p>Grade: {course.grade}</p>
              <p>Semester: {course.semester}</p>
            </div>
          ))}
        </div>
      ) : (
        <div>No courses to display. Please upload your transcript.</div>
      )}
    </div>
  );
};

export default StudentCourses;