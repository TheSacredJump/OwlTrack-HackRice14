import React from 'react';
import { FaQuestionCircle } from "react-icons/fa";

const FAQs = () => {
  const faqs = [
    {
      question: "How does OwlTrack create my four-year plan?",
      answer: "OwlTrack uses AI to analyze your academic history, major requirements, and course offerings to create a personalized four-year plan. It considers factors like prerequisites, course availability, and your academic goals to suggest an optimal course sequence."
    },
    {
      question: "Can I customize the four-year plan created by OwlTrack?",
      answer: "Yes, you can customize your plan. While OwlTrack provides an initial suggestion, you have the flexibility to adjust courses, semesters, and other details to fit your preferences and needs."
    },
    {
      question: "How does OwlTrack suggest tailored classes?",
      answer: "OwlTrack considers your academic performance, interests, and degree requirements to suggest classes that align with your goals. It also takes into account course difficulty, professor ratings, and potential career paths to provide personalized recommendations."
    },
    {
      question: "What kind of course statistics does OwlTrack visualize?",
      answer: "OwlTrack visualizes various course statistics including grade distributions, course difficulty ratings, workload estimates, and how courses contribute to your overall degree progress. These visualizations help you make informed decisions about your course selections."
    },
    {
      question: "Is my academic data safe with OwlTrack?",
      answer: "Yes, OwlTrack takes data privacy and security seriously. We use encryption and follow best practices to protect your academic information. Your data is only used to provide personalized planning and suggestions within the OwlTrack platform."
    },
    {
      question: "Can OwlTrack help me if I want to change my major or add a minor?",
      answer: "Absolutely! OwlTrack can help you explore different scenarios, including changing majors or adding minors. It will show you how these changes affect your four-year plan and suggest adjustments to keep you on track for graduation."
    }
  ];

  return (
    <main id='faqs' className='pt-10 bg-modal border-t border-outline/75 rounded-t-lg font-ibm flex flex-col justify-center items-center w-full h-full pb-20'>
      <h1 className='text-6xl font-semibold text-milk text-center mb-10'>Frequently Asked Questions</h1>
      <div className='mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-[95%]'>
        {faqs.map((faq, index) => (
          <div key={index} className='bg-navy px-4 flex flex-col border border-outline/50 rounded-lg  h-auto'>
            <div className='flex flex-row items-center space-x-2 mt-6'>
              <h2 className='text-xl text-milk font-medium'>{faq.question}</h2>
            </div>
            <p className='text-subtext font-semibold mt-4 mb-6'>{faq.answer}</p>
          </div>
        ))}
      </div>
    </main>
  );
};

export default FAQs;