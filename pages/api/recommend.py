import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def recommend_courses(file_path):
    # Load the final combined course data
    file_path = '/Users/anthonytang/Downloads/Final_Combined_Courses_Data.csv'
    final_combined_df = pd.read_csv(file_path)
    final_combined_df.fillna('Unknown', inplace=True)
    final_courses_df = final_combined_df  # Assuming you have loaded this earlier

    # List of courses the student has taken
    student_courses = [
        {"name": "STARS, GALAXIES & THE UNIVERSE", "code": "ASTR 101", "hours": "3", "grade": "A", "status": "completed", "semester": "Y1S1"},
        {"name": "TECH PRODUCT DESIGN & DEV", "code": "BUSI 222", "hours": "3", "grade": "A", "status": "completed", "semester": "Y1S1"},
        # Add the rest of the student courses here...
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
            'course_name': final_courses_df['name'],
            'course_number': final_courses_df['course_number'],
            'credit hours': final_courses_df['credit hours'],
            'description': final_courses_df['description'],
            'similarity_score': similarity_scores
        })
    else:
        course_recommendations = pd.DataFrame({
            'course_name': final_courses_df['name'],
            'course_number': final_courses_df['course_number'],
            'school': final_courses_df['school'],
            'similarity_score': similarity_scores
        })

    # Sort the recommendations by similarity score (descending)
    course_recommendations = course_recommendations.sort_values(by='similarity_score', ascending=False)

    # Display the top 10 recommended courses
    display = course_recommendations.head(10)
    
    return json.dumps(display, indent=4)