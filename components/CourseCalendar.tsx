import React, { useState, useMemo } from 'react';

// Dummy data for initial courses
const initialCourses = [
  { id: 1, name: 'Introduction to Computer Science', code: 'CS101', credits: 3 },
  { id: 2, name: 'Calculus I', code: 'MATH101', credits: 4 },
  { id: 3, name: 'English Composition', code: 'ENG101', credits: 3 },
  { id: 4, name: 'Introduction to Psychology', code: 'PSY101', credits: 3 },
  { id: 5, name: 'World History', code: 'HIST101', credits: 3 },
  { id: 6, name: 'Data Structures and Algorithms', code: 'CS201', credits: 4 },
  { id: 7, name: 'Physics I', code: 'PHYS101', credits: 4 },
  { id: 8, name: 'Organic Chemistry', code: 'CHEM201', credits: 4 },
];

const CourseCalendar = () => {
  const [schedule, setSchedule] = useState(Array(8).fill().map(() => []));
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [availableCourses, setAvailableCourses] = useState(initialCourses);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = useMemo(() => {
    return availableCourses.filter(course => 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableCourses, searchTerm]);

  const addCourseToSchedule = async (semesterIndex) => {
    const sem = ((semesterIndex + 1) % 2) == 0 ? 2 : 1;
    const year = Math.ceil((semesterIndex + 1) / 2);
    if (selectedCourse) {
      // Update the local state for the schedule
      setSchedule(prevSchedule => {
        const newSchedule = [...prevSchedule];
        newSchedule[semesterIndex] = [...newSchedule[semesterIndex], selectedCourse];
        return newSchedule;
      });
  
      // Remove the selected course from the available courses
      setAvailableCourses(prevCourses =>
        prevCourses.filter(course => course.id !== selectedCourse.id)
      );
  
      // Prepare the course data to send to the backend
      const courseData = {
        id: selectedCourse.id,
        name: selectedCourse.name,
        code: selectedCourse.code,
        credits: selectedCourse.credits
      };
  
      try {
        const response = await fetch('http://127.0.0.1:5000//api/update_four_year_plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',  // Include credentials if you're using sessions
          body: JSON.stringify({
            plan_id: "66eef6c9049650cc0a8c535a",  // Update with your actual plan ID
            semester: `year_${year}_sem_${sem}`,  // Adjust the field name accordingly
            course_data: courseData
          }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log('Backend response:', data);
      } catch (error) {
        console.error('Error updating plan:', error);
      }
  
      // Clear the selected course
      setSelectedCourse(null);
    }
  };
  
  

  const removeCourseFromSchedule = (semesterIndex, courseId) => {
    setSchedule(prevSchedule => {
      const newSchedule = [...prevSchedule];
      const removedCourse = newSchedule[semesterIndex].find(course => course.id === courseId);
      newSchedule[semesterIndex] = newSchedule[semesterIndex].filter(course => course.id !== courseId);
      
      setAvailableCourses(prevCourses => {
        // Check if the course already exists in availableCourses
        if (!prevCourses.some(course => course.id === removedCourse.id)) {
          return [...prevCourses, removedCourse];
        }
        return prevCourses;
      });
      
      return newSchedule;
    });
  };

  return (
    <div className="p-4 w-full bg-navy overflow-auto h-screen">
      <h1 className="text-2xl font-bold mb-4">Course Calendar</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-modal border border-outline p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Available Courses</h2>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 mb-4 bg-navy border border-outline rounded"
          />
          <div className="grid grid-cols-1 gap-2">
            {filteredCourses.map(course => (
              <button
                key={course.id}
                className={`p-2 rounded text-left ${
                  selectedCourse && selectedCourse.id === course.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-navy border border-outline/50 hover:bg-gradient-to-r hover:from-pink-500 hover:to-violet-500'
                }`}
                onClick={() => setSelectedCourse(course)}
              >
                {course.code} - {course.name}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-modal border border-outline p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Your Four Year Plan</h2>
          <div className='grid grid-cols-2'>
          {schedule.map((semester, index) => (
            <div key={index} className="mb-4">
              <h3 className="font-semibold">Year {Math.floor(index / 2) + 1}, {(index % 2) == 0 ? 'Fall' : 'Spring'} Semester</h3>
              <div className="flex flex-wrap gap-2 mt-2 px-4">
                {semester.map(course => (
                  <div key={course.id} className="bg-navy border border-outline p-2 rounded flex items-center">
                    <span>{course.code}</span>
                    <button
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={() => removeCourseFromSchedule(index, course.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  className="bg-emerald-500 text-white px-2 rounded-full hover:bg-emerald-600"
                  onClick={() => addCourseToSchedule(index)}
                  disabled={!selectedCourse}
                >
                  +
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCalendar;