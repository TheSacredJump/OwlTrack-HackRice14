import re
import PyPDF2
import json
def extract_courses_from_pdf(pdf_path):
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ''
        for page in reader.pages:
            text += page.extract_text()

    course_pattern = r"([A-Z]{4})\s(\d{3})\sUG\s([A-Z &,-]+)\s([A-FS][+-]?)\s(\d+\.\d{3})"

    courses = re.findall(course_pattern, text)

    course_list = []

    sems = count_courses_per_semester(pdf_path)

    for idx, course in enumerate(courses):
        subject_code = course[0]
        course_number = course[1]
        course_title = course[2]
        grade = course[3]
        credit_hours = course[4].replace('.000', '')

        course_data = {
            "name": course_title,
            "code": f"{subject_code} {course_number}",
            "hours": credit_hours,
            "grade": grade,
        }

        course_list.append(course_data)

    offset = 0
    semester = "Y1S1"
    for sem in range(1, len(sems)):
        if sem == 1 or sem == 2:
            if sem == 2:
                semester = f"Y1S2"
            else:
                semester = f"Y1S1"
        if sem == 3 or sem == 4:
            if sem == 4:
                semester = f"Y2S2"
            else:
                semester = f"Y2S1"
        if sem == 5 or sem == 6:
            if sem == 6:
                semester = f"Y3S2"
            else:
                semester = f"Y3S1"
        if sem == 7 or sem == 8:
            if sem == 8:
                semester = f"Y4S2"
            else:
                semester = f"Y4S1"
        for course in range(0 + offset, sems.get(sem) + offset):
            course_list[course]["semester"] = semester
        offset += sems.get(sem)

    return json.dumps(course_list, indent=4)
def count_courses_per_semester(pdf_path):
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ''
        for page in reader.pages:
            text += page.extract_text()

    semester_pattern = r"Term: (Fall|Spring) Semester \d{4}"
    course_pattern = r"([A-Z]{4})\s(\d{3})\sUG\s([A-Z &,-]+)\s[A-FS][+-]?\s(\d+\.\d{3})"

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

# Path to the PDF file
pdf_path = "/Users/anthonytang/Documents/Anthony_Tang_Transcript.pdf"

# Extract and print the courses in JSON format
courses_json = extract_courses_from_pdf(pdf_path)
sems = count_courses_per_semester(pdf_path)

print(courses_json)



