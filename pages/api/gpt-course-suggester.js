// pages/api/gpt-career-advisor.js
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function suggestCourses(courses, optimal) {
    let courseNames = courses.map(course => course.name);
    // Deep copy the optimal array
    let optimal2 = JSON.parse(JSON.stringify(optimal));

    return optimal2.filter(optCourse => !courseNames.includes(optCourse.name));
}

function isCourseQuery(query) {
    const keywords = ['course', 'class', 'subject', 'major', 'degree', 'elective', 'credit', 'schedule'];
    return keywords.some(keyword => query.toLowerCase().includes(keyword));
}

export default async function handler(req, res) {
    const remainingCourses = [{'name': 'INTRO TO PROGRAMMING LANGUAGES', 'code': 'COMP 312', 'hours': '3', 'grade': '', 'semester': 'Y2S2'}, {'name': 'COMPUTER SYSTEMS', 'code': 'COMP 321', 'hours': '4', 'grade': '', 'semester': 'Y2S2'}, {'name': 'FINANCIAL MANAGEMENT', 'code': 'BUSI 343', 'hours': '3', 'grade': '', 'semester': 'Y2S2'}, {'name': 'OPERATIONS MANAGEMENT', 'code': 'BUSI 374', 'hours': '3', 'grade': '', 'semester': 'Y2S2'}, {'name': 'CONCURRENT PROGRAM DESIGN', 'code': 'COMP 318', 'hours': '4', 'grade': '', 'semester': 'Y3S1'}, {'name': 'REASONING ABOUT ALGORITHMS', 'code': 'COMP 382', 'hours': '4', 'grade': '', 'semester': 'Y3S1'}, {'name': 'INTRODUCTION TO COMPUTER VISION', 'code': 'COMP 447', 'hours': '3', 'grade': '', 'semester': 'Y3S1'}, {'name': 'MARKETING', 'code': 'BUSI 380', 'hours': '3', 'grade': '', 'semester': 'Y3S1'}, {'name': 'COMPUTER ETHICS', 'code': 'COMP 301', 'hours': '3', 'grade': '', 'semester': 'Y3S2'}, {'name': 'INTRODUCTION TO PROGRAMMING LANGUAGES', 'code': 'COMP 312', 'hours': '3', 'grade': '', 'semester': 'Y3S2'}, {'name': 'INTRODUCTION TO COMPUTER SYSTEMS', 'code': 'COMP 321', 'hours': '3', 'grade': '', 'semester': 'Y3S2'}, {'name': 'STRATEGIC MANAGEMENT', 'code': 'BUSI 390', 'hours': '3', 'grade': '', 'semester': 'Y3S2'}, {'name': 'SOFTWARE ENGINEERING METHODOLOGY', 'code': 'COMP 410', 'hours': '4', 'grade': '', 'semester': 'Y4S1'}, {'name': 'PARALLEL COMPUTING', 'code': 'COMP 422', 'hours': '4', 'grade': '', 'semester': 'Y4S1'}, {'name': 'BUSINESS COMMUNICATION', 'code': 'BUSI 396', 'hours': '3', 'grade': '', 'semester': 'Y4S1'}, {'name': 'SECURE AND CLOUD COMPUTING', 'code': 'COMP 436', 'hours': '3', 'grade': '', 'semester': 'Y4S1'}, {'name': 'WEB DEVELOPMENT', 'code': 'COMP 431', 'hours': '3', 'grade': '', 'semester': 'Y4S2'}, {'name': 'PRINCIPLES OF PROGRAMMING LANGUAGES', 'code': 'COMP 411', 'hours': '4', 'grade': '', 'semester': 'Y4S2'}, {'name': 'ARTIFICIAL INTELLIGENCE', 'code': 'COMP 440', 'hours': '3', 'grade': '', 'semester': 'Y4S2'}, {'name': 'QUANTUM COMPUTING ALGORITHMS', 'code': 'COMP 458', 'hours': '3', 'grade': '', 'semester': 'Y4S2'}];

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { message } = req.body;
  
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // Check if the query is about a course
        if (isCourseQuery(message)) {
          // Format the remainingCourses into a human-readable string
          const formattedCourses = remainingCourses.map(course => 
            `${course.name} (${course.code}) - ${course.hours} credit hours`).join('\n\n');
    
          const prompt = `
          Based on your interest, here is a list of available courses:
    
          ${formattedCourses}
    
          A student just asked: "${message}". Based on the course names, suggest the most relevant course(s) for the student.
          `;
    
          // Call OpenAI's chat API with the course-related prompt
          const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: prompt },
              { role: 'user', content: message },
            ],
            max_tokens: 150,
            temperature: 0.7,
          });
    
          const reply = completion.choices[0].message.content;
          return res.status(200).json({ message: reply });
        } else {
          // If the query is not about courses, respond normally with general advice
          const prompt = `You are a career advisor. A student just asked: "${message}". Provide thoughtful career advice.`;
    
          // Call OpenAI's chat API with the general career advice prompt
          const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a helpful career advisor.' },
              { role: 'user', content: message },
            ],
            max_tokens: 150,
            temperature: 0.7,
        });
  
      const reply = completion.choices[0].message.content;
      res.status(200).json({ message: reply });
    }
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      res.status(500).json({ error: 'An error occurred while processing your request' });
    }
  }