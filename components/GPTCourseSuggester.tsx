import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { IconSparkles } from '@tabler/icons-react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from '@nextui-org/react';
import axios from 'axios';

const GPTCourseSuggester = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState({ otherCourses: [], riceCourses: [] }); // State for courses
  const chatEndRef = useRef(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [activeTab, setActiveTab] = useState('rice'); // State to track which tab is active


  const openModalFunction = () => {
    fetchCourses()
    onOpen()
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Replace this with your actual API call to the GPT model
      const response = await fetch('/api/gpt-course-suggester', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const botMessage = { text: data.message, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { text: 'Sorry, I encountered an error. Please try again.', sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  
  const fetchCourses = async () => {
    console.log('TEST');
    setIsLoading(true); // Shows a loading state while fetching
    try {
      const response = await axios.get('http://127.0.0.1:5000/recommend-courses');
      console.log("RESPONSE:", response); // Log the response
  
      // Check for success status
      if (response.status == 200) {
        console.log('Courses fetched successfully');
  
        const data = response.data.msg; // Access the message field
        setCourses({
          otherCourses: data.otherCourses,
          riceCourses: data.riceCourses
        });
      } else {
        console.log('Failed to fetch courses:', response.data.error);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false); // Remove loading state
    }
  };
  
  
    // try {
    //   const response = await fetch('/recommend-courses', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' }
    //   });

    //   if (!response.ok) throw new Error('Failed to fetch courses');

    //   const data = await response.json();
    //   setCourses({
    //     otherCourses: data.otherCourses,
    //     riceCourses: data.riceCourses
    //   });
    // } catch (error) {
    //   console.error('Error fetching courses:', error);
    // } finally {
    //   setIsLoading(false);
    // }

  return (
    <div className="flex flex-col h-screen w-full mx-auto bg-navy rounded-lg overflow-hidden">
     <Modal isOpen={isOpen} onOpenChange={onOpenChange} onOpen={fetchCourses} backdrop="static" className="w-full max-w-[64rem] h-full">
      <ModalContent className="bg-black z-50 w-full max-w-[64rem] h-[80vh]">
        {(onClose) => (
          <>
            {/* Modal Header with Tab Pills */}
            <ModalHeader className="flex flex-col gap-1 justify-center items-center">
              <div className='w-72 h-8 bg-gray-300 rounded-full flex flex-row space-x-6 justify-center items-center'>
                {/* Rice Courses Pill */}
                <div
                  className={`cursor-pointer duration-500 ${activeTab === 'rice' ? 'font-bold underline text-black' : 'scale-90 text-gray-700'}`}
                  onClick={() => setActiveTab('rice')}
                >
                  Rice Courses
                </div>

                {/* Outside Courses Pill */}
                <div
                  className={`cursor-pointer duration-500 ${activeTab === 'other' ? 'font-bold underline text-black' : 'scale-90 text-gray-700'}`}
                  onClick={() => setActiveTab('other')}
                >
                  Outside Courses
                </div>
              </div>
            </ModalHeader>

            {/* Modal Body with Conditional Rendering */}
            <ModalBody className="overflow-y-auto h-[60vh]">
              {/* Render Rice Courses if activeTab is 'rice' */}
              {activeTab === 'rice' && (
                <>
                  <ul className='flex flex-col space-y-3'>
                    {courses.riceCourses && courses.riceCourses.length > 0 ? (
                      courses.riceCourses.map((course, index) => (
                        <li key={index}>
                          <strong>{course['course name']}</strong> ({course['course number']}) - {course['credit_hours']} credit hours
                          <p>{course.description}</p>
                        </li>
                      ))
                    ) : (
                      <p>No Rice courses found.</p>
                    )}
                  </ul>
                </>
              )}

              {/* Render Other Courses if activeTab is 'other' */}
              {activeTab === 'other' && (
                <>
                  <ul className='flex flex-col space-y-4'>
                    {courses.otherCourses && courses.otherCourses.length > 0 ? (
                      courses.otherCourses.map((course, index) => (
                        <li key={index} className='flex flex-row space-x-4'>
                          <strong>{course['course name']}</strong> ({course.school})
                          <input id="default-checkbox" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        </li>
                      ))
                    ) : (
                      <p>No other courses found.</p>
                    )}
                  </ul>
                </>
              )}
            </ModalBody>

            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={onClose}>
                Send to Rice
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>

{isOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-40 overflow-y-scroll"></div>}
      <div className="bg-modal border-b border-outline/50 p-4 flex flex-row justify-between overflow-y-scroll">
        <h2 className="text-2xl font-bold text-milk">AI Course Suggester and Academic/Career Chatbot</h2>
        <button 
        onClick={openModalFunction}
        className='hover:scale-105 transition duration-300 flex flex-row items-center space-x-2 bg-gradient-to-r from-pink-500 to-indigo-500 px-1 rounded-lg'>
          <IconSparkles />
          <p className='font-medium text-sm'>Explore AI Suggestions</p>
        </button>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3/4 p-3 rounded-lg ${message.sender === 'user' ? 'bg-navy text-milk' : 'bg-modal border border-outline/50 text-owl'}`}>
              {message.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-navy">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about future course reccomendations or any academic/career question you have..."
            className="flex-grow p-2 rounded-lg bg-highlight border border-outline/50 text-milk focus:outline-none focus:ring-2 focus:ring-highlight"
          />
          <button 
            type="submit" 
            className="p-2 bg-highlight text-owl rounded-lg hover:bg-highlight/80 focus:outline-none focus:ring-2 focus:ring-highlight"
            disabled={isLoading}
          >
            {isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GPTCourseSuggester;
