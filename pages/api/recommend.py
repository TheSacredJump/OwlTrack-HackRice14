import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def recommend_courses_prediction(file_path):
    # Load the final combined course data
    final_combined_df = pd.read_csv(file_path)
    final_combined_df.fillna('Unknown', inplace=True)
    final_courses_df = final_combined_df  # Assuming you have loaded this earlier

    # List of courses the student has taken
    student_courses = [
  {
    "name": "STARS, GALAXIES & THE UNIVERSE",
    "code": "ASTR 101",
    "hours": "3",
    "grade": "A",
    "status": "completed",
    "semester": "Y1S1"
  },
  {
    "name": "TECH PRODUCT DESIGN & DEV",
    "code": "BUSI 222",
    "hours": "3",
    "grade": "A",
    "status": "completed",
    "semester": "Y1S1"
  },
  {
    "name": "COMPUTATIONAL THINKING",
    "code": "COMP 140",
    "hours": "4",
    "grade": "A+",
    "status": "completed",
    "semester": "Y1S1"
  },
  {
    "name": "TECHNOLOGIES OF TASTE",
    "code": "FWIS 141",
    "hours": "3",
    "grade": "A",
    "status": "completed",
    "semester": "Y1S1"
  },
  {
    "name": "MULTIVARIABLE CALCULUS",
    "code": "MATH 212",
    "hours": "3",
    "grade": "A+",
    "status": "completed",
    "semester": "Y1S1"
  },
  {
    "name": "CTIS WORKSHOP",
    "code": "UNIV 194",
    "hours": "0",
    "grade": "S",
    "status": "completed",
    "semester": "Y1S1"
  },
  {
    "name": "CDOD WORKSHOP",
    "code": "UNIV 195",
    "hours": "0",
    "grade": "S",
    "status": "completed",
    "semester": "Y1S1"
  },
  {
    "name": "FINANCIAL ACCOUNTING",
    "code": "BUSI 305",
    "hours": "3",
    "grade": "A",
    "status": "completed",
    "semester": "Y1S2"
  },
  {
    "name": "ALGORITHMIC THINKING",
    "code": "COMP 182",
    "hours": "4",
    "grade": "P",
    "status": "completed",
    "semester": "Y1S2"
  },
  {
    "name": "PRINCIPLES OF ECONOMICS",
    "code": "ECON 100",
    "hours": "3",
    "grade": "A+",
    "status": "completed",
    "semester": "Y1S2"
  },
  {
    "name": "ART SINCE 1945",
    "code": "HART 205",
    "hours": "3",
    "grade": "A+",
    "status": "completed",
    "semester": "Y1S2"
  },
  {
    "name": "LINEAR ALGEBRA",
    "code": "MATH 355",
    "hours": "3",
    "grade": "B+",
    "status": "completed",
    "semester": "Y1S2"
  },
  {
    "name": "LEADING IN ORGANIZATIONS",
    "code": "BUSI 310",
    "hours": "3",
    "grade": "IP",
    "status": "in_progress",
    "semester": "Y2S1"
  },
  {
    "name": "INTRODUCTION TO PROGRAM DESIGN",
    "code": "COMP 215",
    "hours": "4",
    "grade": "IP",
    "status": "in_progress",
    "semester": "Y2S1"
  },
  {
    "name": "INTRO TO COMPUTER ORGANIZATION",
    "code": "COMP 222",
    "hours": "4",
    "grade": "IP",
    "status": "in_progress",
    "semester": "Y2S1"
  },
  {
    "name": "THE SCIENCES OF THE MIND",
    "code": "PHIL 130",
    "hours": "3",
    "grade": "IP",
    "status": "in_progress",
    "semester": "Y2S1"
  },
  {
    "name": "PROBABILITY & STATISTICS",
    "code": "STAT 310",
    "hours": "3",
    "grade": "IP",
    "status": "in_progress",
    "semester": "Y2S1"
  }
]

    # Create a DataFrame for the student's courses
    student_courses_df = pd.DataFrame(student_courses)

    # Combine the name and description columns for better text representation
    final_courses_df['combined'] = final_courses_df['name'] + " " + final_courses_df['course_number']
    student_courses_df['combined'] = student_courses_df['name'] + " " + student_courses_df['code']

    # Create a TF-IDF vectorizer
    tfidf = TfidfVectorizer(stop_words='english')

    # Fit the vectorizer on the combined course text of all courses
    tfidf_matrix = tfidf.fit_transform(final_courses_df['combined'])

    # Transform the student courses using the same TF-IDF vectorizer
    student_tfidf_matrix = tfidf.transform(student_courses_df['combined'])

    # Calculate cosine similarity between student courses and available courses
    cosine_similarities = cosine_similarity(student_tfidf_matrix, tfidf_matrix)

    # Sum the similarities for each available course
    similarity_scores = cosine_similarities.sum(axis=0)

    # Create a DataFrame with similarity scores
    if ('OwlTrack' in file_path):  
        course_recommendations = pd.DataFrame({
            'course name': final_courses_df['name'],
            'course number': final_courses_df['course_number'],
            'credit hours': final_courses_df['credit_hours'],
            'description': final_courses_df['description'],
            'similarity score': similarity_scores
        })
    else:
        course_recommendations = pd.DataFrame({
            'course name': final_courses_df['name'],
            'course number': final_courses_df['course_number'],
            'school': final_courses_df['school'],
            'similarity score': similarity_scores
        })

    # Sort the recommendations by similarity score (descending)
    course_recommendations = course_recommendations.sort_values(by='similarity score', ascending=False)

    # Display the top 10 recommended courses
    display = course_recommendations.head(10)
    
    return display.to_json(orient='records', indent=4)