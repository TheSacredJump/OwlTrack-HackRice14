'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import CustomButton from '@/components/CustomButton';
import InputField from '@/components/InputField';
import axios from 'axios';

const majors = [
    'Computer Science', 'Electrical Engineering', 'Mechanical Engineering',
    'Chemical Engineering', 'Civil Engineering', 'Biology', 'Chemistry',
    'Physics', 'Mathematics', 'Economics', 'Psychology', 'English',
    'History', 'Political Science', 'Sociology', 'Art History',
    'Music', 'Philosophy', 'Anthropology', 'Linguistics'
];

const standings = ['Freshman', 'Sophomore', 'Junior', 'Senior'];

const Onboarding = () => {
    const { user } = useUser();
    const router = useRouter();

    const [major, setMajor] = useState('');
    const [standing, setStanding] = useState('');
    const [transcript, setTranscript] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [courses, setCourses] = useState([])

    const handleFileUpload = async (event: any) => {
        console.log(event)
        const file = event.target.files[0];
        if (!file) return;
    
        const formData = new FormData();
        formData.append('transcript', file);
    
        setLoading(true);
        setError("none");
    
        try {
          const response = await fetch('/api/upload-transcript', {
            method: 'POST',
            body: formData,
          });
    
          if (!response.ok) {
            throw new Error('Failed to upload transcript');
          }
    
          const data = await response.json();
          console.log(data)
          setTranscript(true);
          setCourses(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

    const handleSubmit = async (e) => {
        console.log("Successfully Submitted Maybe!")
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!major || !standing || !transcript) {
            setError('Please fill in all fields and upload your transcript.');
            setLoading(false);
            return;
        }
        console.log(courses)
        const formData = new FormData();
        formData.append('major', major);
        formData.append('standing', standing);
        formData.append('courses', JSON.stringify(courses));
        formData.append('clerkId', user?.id);
        formData.append('username', user?.username);


        try {
            // Use Axios for POST request
            const response = await axios.post('http://127.0.0.1:5000//api/create-user', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept' : "multipart/form-data"
                },
            });

            if (response.status !== 201) {
                throw new Error('Failed to save onboarding information');
            }

            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-navy flex items-center justify-center px-4">
            <div className="max-w-md w-full space-y-8 bg-modal p-8 rounded-xl">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-milk">
                    Complete Your Profile
                </h2>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="major" className="sr-only">Major</label>
                        <select
                            id="major"
                            name="major"
                            className="bg-navy text-milk rounded-md px-3 py-2 w-full"
                            value={major}
                            onChange={(e) => setMajor(e.target.value)}
                            required
                        >
                            <option value="">Select your major</option>
                            {majors.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="standing" className="sr-only">Academic Standing</label>
                        <select
                            id="standing"
                            name="standing"
                            className="bg-navy text-milk rounded-md px-3 py-2 w-full"
                            value={standing}
                            onChange={(e) => setStanding(e.target.value)}
                            required
                        >
                            <option value="">Select your academic standing</option>
                            {standings.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="transcript" className="block text-sm font-medium text-milk mb-2">
                            Upload Transcript (PDF)
                        </label>
                        <input
                            type="file"
                            id="transcript"
                            name="transcript"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            className="mt-1 block w-full text-sm text-milk
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-owl file:text-milk
                                hover:file:bg-blue-600"
                            required
                        />
                    </div>
                    {error && (
                        <p className="text-red-500 text-xs italic">{error}</p>
                    )}
                    <CustomButton
                        type="submit"
                        title={loading ? "Saving..." : "Complete Onboarding"}
                        disabled={loading}
                        onClick={(e) => handleSubmit(e)}
                        className="w-full bg-gradient-to-r from-pink-500 to-indigo-500"
                    />
                </form>
            </div>
        </div>
    );
};

export default Onboarding;