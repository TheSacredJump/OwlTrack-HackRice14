'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/nextjs';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input } from '@nextui-org/react';

// Drag-and-Drop item type
const ItemTypes = {
  COURSE: 'course',
};

const CourseCalendar = () => {
  const [schedule, setSchedule] = useState(Array(8).fill().map(() => []));
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [update, setUpdate] = useState(false);
  const { user } = useUser();
  
  // States for course detail modal
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onOpenChange: onDetailOpenChange } = useDisclosure();
  const [currentCourse, setCurrentCourse] = useState(null);
  const [currentCourseData, setCurrentCourseData] = useState(null);

  // States for course search modal
  const { isOpen: isSearchOpen, onOpen: onSearchOpen, onOpenChange: onSearchOpenChange } = useDisclosure();
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [modalSearchTerm, setModalSearchTerm] = useState('');

  const fetchSchedule = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/grab-schedule', {
        params: { clerkID: user?.id },
      });
      setData(response.data);
      setIsLoading(false);
    } catch (err) {
      setError(err);
      setIsLoading(false);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/get-every-course');
      setAllCourses(response.data);
      setFilteredCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  useEffect(() => {
    fetchSchedule();
    fetchAllCourses();
  }, [update]);

  useEffect(() => {
    const filtered = allCourses.filter(course => 
      course.toLowerCase().includes(modalSearchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [modalSearchTerm, allCourses]);

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

  const addCourseToUnassigned = async (course) => {
    try {
      await alterPlan(data["_id"], course, 'Unassigned');
      onSearchOpenChange(false);
      setModalSearchTerm('');
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const Course = ({ course, currentSemester, width }) => {
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

    const handleMouseUp = async () => {
      if (!isDraggingRef.current) {
        console.log(`Clicked on course: ${course}`);
        setCurrentCourse(course);
        var courseInfo = {
          "_id": "66ef040303e99ec3c0645635",
          "credit-hours": "N/A",
          "crn": "21814",
          "description": "Filler course! Be thinking about what you should take here!",
          "distribution": "N/A",
          "full_name": course,
          "href": "/courses/!SWKSCAT.cat?p_action=COURSE&p_term=202420&p_crn=21814",
          "prereqs": null,
          "sem1": true,
          "sem2": true,
          "shorthand_name": course
        };

        if (data && !Object.keys(data["elective_reqs"]).includes(course)) {
          try {
            const response = await axios.post('http://127.0.0.1:5000/api/get-additional-info', {
              course: course
            });
            if (response.status === 200) {
              courseInfo = response.data.msg;
              console.log('Fetched the additional info:', courseInfo);
              console.log(courseInfo)
            } else {
              console.log('Failed to fetch course info:', response.data.msg);
            }
          } catch (error) {
            console.error('Error fetching course info:', error);
          }
        }

        setCurrentCourseData(courseInfo);
        onDetailOpen();
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
        alterPlan(data["_id"], course, targetSemester);
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
        alterPlan(data["_id"], course, 'Unassigned');
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
      {/* Course Detail Modal */}
      <Modal isOpen={isDetailOpen} onOpenChange={onDetailOpenChange}>
        <ModalContent className="bg-black z-50">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">{currentCourseData && currentCourseData["full_name"]}</ModalHeader>
              <ModalBody>
                <div className="flex flex-col space-y-4">
                  <h1>Course Name: <span className='ml-2 text-gray-400 text-sm'>{currentCourseData && currentCourseData["shorthand_name"]}</span></h1>
                  <h1>Credit Hours: <span className='ml-2 text-gray-400 text-sm'>{currentCourseData && currentCourseData["credit-hours"]}</span></h1>
                  <h1>Distribution Credit: <span className='ml-2 text-gray-400 text-sm'>{currentCourseData && (currentCourseData["distribution"] ? currentCourseData["distribution"] : "N/A")}</span></h1>
                  <h1>Semester: <span className='ml-2 text-gray-400 text-sm'>
                    {currentCourseData && (
                      currentCourseData["sem1"] === true && currentCourseData["sem2"] === true
                        ? "Both"
                        : currentCourseData["sem1"] === true
                          ? "Semester 1"
                          : "Semester 2"
                    )}
                  </span></h1>
                  <h1>Description: <span className='ml-2 text-gray-400 text-sm'>{currentCourseData && currentCourseData["description"]}</span></h1>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Course Search Modal */}
      <Modal 
        isOpen={isSearchOpen} 
        onOpenChange={onSearchOpenChange} 
        scrollBehavior="inside"
        size="2xl"
      >
        <ModalContent className="bg-navy">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Search Courses</ModalHeader>
              <ModalBody>
                <Input
                  placeholder="Search courses..."
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                  className="mb-4"
                />
                <div className="space-y-2">
                  {filteredCourses.map((course, index) => (
                    <div 
                      key={index}
                      className="flex justify-between items-center p-2 bg-modal rounded"
                    >
                      <p className="font-bold">{course}</p>
                      <Button 
                        color="primary" 
                        size="sm"
                        onClick={() => addCourseToUnassigned(course)}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Background dimming overlay when any modal is open */}
      {(isDetailOpen || isSearchOpen) && <div className="fixed inset-0 bg-black bg-opacity-40 z-40"></div>}

      {/* Course Calendar */}
      <div className={`p-4 w-full bg-navy overflow-auto h-screen ${isDetailOpen || isSearchOpen ? 'opacity-40 pointer-events-none' : ''}`}>
        <h1 className="text-2xl font-bold mb-4">Course Calendar</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Available Courses (Drop zone enabled) */}
          <AvailableCoursesDrop>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search saved courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 mb-4 bg-navy border border-outline rounded"
              />
              <Button
                auto
                color="primary"
                onClick={onSearchOpen}
                className="mb-4"
              >
                Add Course
              </Button>
            </div>
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