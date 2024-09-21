import re
import PyPDF2
import json

def extract_courses_from_pdf(pdf_path):
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ''
        for page in reader.pages:
            text += page.extract_text()

    completed_course_pattern = r"([A-Z]{4})\s(\d{3})\sUG\s(.+?)\s([A-FSP][+-]?)\s(\d+\.\d{3})"
    current_course_pattern = r"([A-Z]{4})\s(\d{3})\sUG\s(.+?)\s(\d+\.\d{3})"

    completed_courses = re.findall(completed_course_pattern, text)
    
    # Find the "COURSES IN PROGRESS" section
    in_progress_section = re.search(r"COURSES IN PROGRESS.*", text, re.DOTALL)
    current_courses = []
    if in_progress_section:
        current_courses = re.findall(current_course_pattern, in_progress_section.group())

    course_list = []
    sems = count_courses_per_semester(text)

    # Process completed courses
    for idx, course in enumerate(completed_courses):
        subject_code, course_number, course_title, grade, credit_hours = course
        course_data = {
            "name": course_title.strip(),
            "code": f"{subject_code} {course_number}",
            "hours": credit_hours.replace('.000', ''),
            "grade": grade,
            "status": "completed"
        }
        course_list.append(course_data)

    # Assign semesters to completed courses
    offset = 0
    for sem in range(1, len(sems) + 1):
        if sem <= 2:
            semester = f"Y1S{sem}"
        elif sem <= 4:
            semester = f"Y2S{sem - 2}"
        elif sem <= 6:
            semester = f"Y3S{sem - 4}"
        elif sem <= 8:
            semester = f"Y4S{sem - 6}"

        for course in range(offset, offset + sems.get(sem, 0)):
            course_list[course]["semester"] = semester
        offset += sems.get(sem, 0)

    # Calculate the current semester (for in-progress courses)
    completed_semesters = len(sems)
    current_year = completed_semesters // 2 + 1
    current_semester = completed_semesters % 2
    if current_semester > 2:
        current_year += 1
        current_semester = 1
    current_semester_code = f"Y{current_year}S{current_semester}"

    # Process current courses
    for course in current_courses:
        subject_code, course_number, course_title, credit_hours = course
        course_data = {
            "name": course_title.strip(),
            "code": f"{subject_code} {course_number}",
            "hours": credit_hours.replace('.000', ''),
            "grade": "IP",  # IP for "In Progress"
            "status": "in_progress",
            "semester": current_semester_code
        }
        course_list.append(course_data)

    return json.dumps(course_list, indent=4)

def count_courses_per_semester(text):
    semester_pattern = r"Term: (Fall|Spring) Semester \d{4}"
    course_pattern = r"([A-Z]{4})\s(\d{3})\sUG\s(.+?)\s[A-FSP][+-]?\s(\d+\.\d{3})"

    semester_course_count = {}
    semester_count = 0
    course_count = 0
    counting_courses = False
    lines = text.splitlines()

    for line in lines:
        if re.search(semester_pattern, line):
            if counting_courses:
                semester_course_count[semester_count] = course_count

            semester_count += 1
            course_count = 0
            counting_courses = True

        elif re.search(course_pattern, line) and counting_courses:
            course_count += 1

    if counting_courses:
        semester_course_count[semester_count] = course_count

    return semester_course_count

# The main execution part is removed as it's not needed in the Flask context