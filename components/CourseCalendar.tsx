'use client'; // This ensures the component is a Client Component in Next.js
import React, { useState, useMemo, useEffect, useRef } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/nextjs';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from '@nextui-org/react';

// Dummy data for initial courses
const initialCourses = [
  { id: 1, name: 'Introduction to Computer Science', code: 'CS101', credits: 3 },
  { id: 2, name: 'Calculus I', code: 'MATH101', credits: 4 },
  { id: 3, name: 'English Composition', code: 'ENG101', credits: 3 },
  // Add other courses...
];

// Drag-and-Drop item type
const ItemTypes = {
  COURSE: 'course',
};

const CourseCalendar = () => {
  const [schedule, setSchedule] = useState(Array(8).fill().map(() => []));
  const [availableCourses, setAvailableCourses] = useState(initialCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState(null);  // Fetched schedule data
  const [isLoading, setIsLoading] = useState(true);  // Loading state
  const [error, setError] = useState(null);  // Error state
  const [update, setUpdate] = useState(false);  // Trigger re-fetch on update
  const { user } = useUser();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Fetch schedule data
  const fetchSchedule = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/grab-schedule', {
        params: { clerkID: user?.id },  // Send clerkID as query parameter
      });
      setData(response.data);  // Set fetched data
      setIsLoading(false);  // Mark loading as complete
    } catch (err) {
      setError(err);  // Capture the error if any
      setIsLoading(false);  // Mark loading as complete
    }
  };

  useEffect(() => {
    fetchSchedule();  // Trigger fetch when component mounts
  }, [update]);

  // Memoized filtering of courses based on search term
  const filteredCourses = useMemo(() => {
    return availableCourses.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableCourses, searchTerm]);

  // Add or move course between semesters
  const alterPlan = async (planID, courseName, targetSemester) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/update_four_year_plan', {
        plan_id: planID,
        course_name: courseName,
        semester: targetSemester,
      });
      if (response.status === 200) {
        console.log('Plan updated successfully');
        setUpdate(!update);
      } else {
        console.log('Failed to update plan:', response.data.error);
      }
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  // Component for draggable course (either from available courses or within a semester)
  const Course = ({ course, currentSemester, width }: {course: any, currentSemester: any, width: any}) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: ItemTypes.COURSE,
      item: { course, currentSemester },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    const isDraggingRef = useRef(false);

    const handleMouseDown = () => {
      isDraggingRef.current = false;
    };

    const handleDragStart = () => {
      isDraggingRef.current = true;
    };

    const handleMouseUp = () => {
      if (!isDraggingRef.current) {
        console.log(`Clicked on course: ${course}`);
        onOpen();
      }
    };

    return (
      <div
        ref={drag}
        onMouseDown={handleMouseDown}
        onDragStart={handleDragStart}
        onMouseUp={handleMouseUp}
        className={`p-2 rounded text-left ${width === 'full' ? 'w-full' : '' } max-h-14 ${isDragging ? 'bg-gray-400' : 'bg-navy border border-outline/50'}`}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        {course}
      </div>
    );
  };

  // Drop zone for semesters
  const Semester = ({ semesterKey, children }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: ItemTypes.COURSE,
      drop: (item) => handleDrop(item.course, item.currentSemester, semesterKey),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }));

    const handleDrop = (course, currentSemester, targetSemester) => {
      if (currentSemester !== targetSemester) {
        alterPlan(data["_id"], course, targetSemester);  // Move the course to the target semester
      }
    };

    return (
      <div
        ref={drop}
        className={`flex flex-wrap h-full gap-2 p-4 border border-outline/50 rounded mr-2 ${isOver ? 'bg-gradient-to-r from-pink-500 to-indigo-500' : 'bg-navy'}`}
        style={{ minHeight: '100px' }}
      >
        {children}
      </div>
    );
  };

  // Drop zone for the "Available Courses"
  const AvailableCoursesDrop = ({ children }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: ItemTypes.COURSE,
      drop: (item) => handleDropBackToAvailable(item.course, item.currentSemester),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }));

    const handleDropBackToAvailable = (course, currentSemester) => {
      if (currentSemester !== 'Unassigned') {
        alterPlan(data["_id"], course, 'Unassigned');  // Move the course back to "Unassigned"
      }
    };

    return (
      <div
        ref={drop}
        className={`flex flex-col gap-2 p-4 ${isOver ? 'bg-highlight' : 'bg-modal border border-outline'} rounded shadow`}
      >
        {children}
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {/* Modal functionality */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent className="bg-black z-50">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Modal Title</ModalHeader>
              <ModalBody>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Nullam pulvinar risus non risus hendrerit venenatis.
                  Pellentesque sit amet hendrerit risus, sed porttitor quam.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Background dimming overlay when modal is open */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-40"></div>}

      {/* Course Calendar */}
      <div className={`p-4 w-full bg-navy overflow-auto h-screen ${isOpen ? 'opacity-40 pointer-events-none' : ''}`}>
        <h1 className="text-2xl font-bold mb-4">Course Calendar</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Available Courses (Drop zone enabled) */}
          <AvailableCoursesDrop>
            <input
              type="text"
              placeholder="Add course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 mb-4 bg-navy border border-outline rounded"
            />
            <h2 className="text-xl font-semibold mb-2">Saved Courses</h2>
            {data && data["Unassigned"].map(course => (
              <Course key={course} course={course} currentSemester="Unassigned" width={'full'} />
            ))}
          </AvailableCoursesDrop>

          {/* Schedule */}
          <div className="bg-modal border border-outline p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Your Four Year Plan</h2>
            <div className="grid grid-cols-2 gap-8">
              {data && Object.keys(data).map((key, idx) => {
                if (key.split("_")[0] === 'year') {
                  return (
                    <div key={idx} className="mb-4">
                      <h3 className="font-semibold">
                        Year {key.split("_")[1]} {idx % 2 === 0 ? 'Fall' : 'Spring'} Semester
                      </h3>
                      <Semester semesterKey={key}>
                        {data[key].map((course, sub_idx) => (
                          <Course key={sub_idx} course={course} currentSemester={key} />
                        ))}
                      </Semester>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default CourseCalendar;
