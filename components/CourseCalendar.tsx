'use client'; // This ensures the component is a Client Component in Next.js
import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';

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
  const [data, setData] = useState(null);       // To store the fetched schedule data
  const [isLoading, setIsLoading] = useState(true);  // To handle loading state
  const [error, setError] = useState(null);     // To handle error state
  const [update, setUpdate] = useState(false)
  const { user } = useUser()

  // Function to fetch the schedule data
  const fetchSchedule = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/grab-schedule', {
        params: { clerkID: user?.id }  // Send clerkID as query parameter
      });
      setData(response.data);  // Set the fetched data
      setIsLoading(false);     // Mark loading as complete
    } catch (err) {
      setError(err);           // Capture the error if any
      setIsLoading(false);     // Mark loading as complete, even in case of error
    }
  };

  // useEffect to fetch data when component mounts
  useEffect(() => {
    fetchSchedule();  // Trigger the fetch when the component is mounted
  }, [update]); 

  console.log("DATA: ", data)
  const filteredCourses = useMemo(() => {
    return availableCourses.filter(course => 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableCourses, searchTerm]);

  const addCourseToSchedule = async (key : String) => {
    if (selectedCourse && data) {
      // Update the local state for the schedul
      alterPlan(data["_id"], selectedCourse, key)
      setSelectedCourse(null)
    }
  };
  
  


  const alterPlan = async (planID, courseName, semester) => {
    try {
        // Send POST request to Flask API with required data
        const response = await axios.post('http://127.0.0.1:5000/api/update_four_year_plan', {
            plan_id: planID,
            course_name: courseName,
            semester: semester,
        });

        // Handle the response
        if (response.status === 200) {
            console.log('Plan updated successfully');
            setUpdate(!update)
        } else {
            console.log('Failed to update plan:', response.data.error);
        }
    } catch (error) {
        console.error('Error updating plan:', error);
    }
};    
    // setSchedule(prevSchedule => {
    //   const newSchedule = [...prevSchedule];
    //   const removedCourse = newSchedule[semesterIndex].find(course => course.id === courseId);
    //   newSchedule[semesterIndex] = newSchedule[semesterIndex].filter(course => course.id !== courseId);
      
    //   setAvailableCourses(prevCourses => {
    //     // Check if the course already exists in availableCourses
    //     if (!prevCourses.some(course => course.id === removedCourse.id)) {
    //       return [...prevCourses, removedCourse];
    //     }
    //     return prevCourses;
    //   });
      
    //   return newSchedule;
    // });
  // };

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
            {data && data["Unassigned"].map(course => (
              <button
                key={course}
                className={`p-2 rounded text-left ${
                  selectedCourse === course
                    ? 'bg-emerald-500 text-white'
                    : 'bg-navy border border-outline/50 hover:bg-gradient-to-r hover:from-pink-500 hover:to-violet-500'
                }`}
                onClick={() => {setSelectedCourse(course)}}
              >
                {course}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-modal border border-outline p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Your Four Year Plan</h2>
          <div className='grid grid-cols-2'>
          {data && Object.keys(data).map((key, idx) => {
            if (key.split("_")[0] === 'year') {
              return (
                <div key={idx} className="mb-4">
                  <h3 className="font-semibold">
                    Year {key.split("_")[1]} {idx % 2 == 0 ? 'Fall' : 'Spring'} Semester
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2 px-4">
                    {data[key].map((course, sub_idx) => (
                      <div key={sub_idx} className="bg-navy border border-outline p-2 rounded flex items-center">
                        <span>{course}</span>
                        <button
                          className="ml-2 text-red-500 hover:text-red-700"
                          onClick={() => alterPlan(data["_id"], course, "Unassigned")}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      className="bg-emerald-500 text-white px-2 rounded-full hover:bg-emerald-600"
                      onClick={() => addCourseToSchedule(key)}
                      disabled={!selectedCourse}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            }
            return null; // Return null if the condition is not met to avoid undefined
          })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCalendar;


/*
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

*/