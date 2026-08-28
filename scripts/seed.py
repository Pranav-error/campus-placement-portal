#!/usr/bin/env python3
"""Seed the Campus Placement Portal with realistic demo data across every module.

Usage: python3 seed.py <backend_base_url>
"""
import json
import sys
import urllib.request
import urllib.error

BASE = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "http://localhost:8080"


def call(method, path, body=None, token=None, expect=None):
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read()
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        if expect == "ignore-conflict" and e.code in (409, 400):
            return None
        print(f"  ! {method} {path} -> {e.code}: {err_body[:200]}")
        return None


def get_or_register(email, password, role, student_id=None):
    body = {"email": email, "password": password, "role": role}
    if student_id:
        body["studentId"] = student_id
    res = call("POST", "/api/auth/register", body)
    if res:
        return res["token"]
    # already exists -> log in
    res = call("POST", "/api/auth/login", {"email": email, "password": password})
    return res["token"] if res else None


print("== TPO account ==")
tpo_token = get_or_register("tpo@demo.edu", "password123", "TPO")
assert tpo_token, "Could not get TPO token"

print("== Companies ==")
companies_data = [
    {"name": "Acme Technologies", "industry": "Software", "website": "https://acme.example.com",
     "description": "Enterprise SaaS products for logistics and supply chain.", "contactEmail": "hr@acme.example.com"},
    {"name": "Globex Finance", "industry": "Fintech", "website": "https://globex.example.com",
     "description": "Digital banking and payments infrastructure.", "contactEmail": "careers@globex.example.com"},
    {"name": "Initech Systems", "industry": "IT Services", "website": "https://initech.example.com",
     "description": "Consulting and managed IT services for enterprises.", "contactEmail": "jobs@initech.example.com"},
    {"name": "Soylent Analytics", "industry": "Data & AI", "website": "https://soylent.example.com",
     "description": "Machine learning platforms for retail forecasting.", "contactEmail": "talent@soylent.example.com"},
    {"name": "Umbrella Health", "industry": "Healthtech", "website": "https://umbrella.example.com",
     "description": "Digital health records and telemedicine platform.", "contactEmail": "hr@umbrella.example.com"},
]
company_ids = {}
for c in companies_data:
    res = call("POST", "/api/companies", c, tpo_token)
    if res:
        company_ids[c["name"]] = res["id"]
        print(f"  + {c['name']} (id={res['id']})")

print("== Students ==")
students_data = [
    {"name": "Asha Rao", "email": "asha.rao@example.edu", "branch": "CSE", "rollNumber": "1CS21001",
     "graduationYear": 2026, "cgpa": 8.7, "backlogs": 0, "skills": ["Java", "React", "SQL", "Spring Boot"]},
    {"name": "Kiran Shah", "email": "kiran.shah@example.edu", "branch": "CSE", "rollNumber": "1CS21002",
     "graduationYear": 2026, "cgpa": 9.1, "backlogs": 0, "skills": ["Python", "Django", "PostgreSQL"]},
    {"name": "Meera Iyer", "email": "meera.iyer@example.edu", "branch": "ISE", "rollNumber": "1IS21003",
     "graduationYear": 2026, "cgpa": 7.9, "backlogs": 1, "skills": ["JavaScript", "Node.js", "MongoDB"]},
    {"name": "Rohan Verma", "email": "rohan.verma@example.edu", "branch": "ECE", "rollNumber": "1EC21004",
     "graduationYear": 2027, "cgpa": 6.8, "backlogs": 2, "skills": ["C++", "Embedded Systems", "VLSI"]},
    {"name": "Priya Nair", "email": "priya.nair@example.edu", "branch": "CSE", "rollNumber": "1CS21005",
     "graduationYear": 2026, "cgpa": 8.3, "backlogs": 0, "skills": ["Java", "Spring Boot", "AWS", "Docker"]},
    {"name": "Arjun Menon", "email": "arjun.menon@example.edu", "branch": "ME", "rollNumber": "1ME21006",
     "graduationYear": 2026, "cgpa": 7.2, "backlogs": 0, "skills": ["AutoCAD", "SolidWorks", "Six Sigma"]},
    {"name": "Sneha Gupta", "email": "sneha.gupta@example.edu", "branch": "CSE", "rollNumber": "1CS21007",
     "graduationYear": 2026, "cgpa": 9.4, "backlogs": 0, "skills": ["Python", "Machine Learning", "TensorFlow", "SQL"]},
    {"name": "Vikram Singh", "email": "vikram.singh@example.edu", "branch": "ISE", "rollNumber": "1IS21008",
     "graduationYear": 2026, "cgpa": 6.4, "backlogs": 3, "skills": ["Java", "Android"]},
    {"name": "Anjali Desai", "email": "anjali.desai@example.edu", "branch": "ECE", "rollNumber": "1EC21009",
     "graduationYear": 2026, "cgpa": 8.0, "backlogs": 0, "skills": ["C", "Embedded Systems", "IoT"]},
    {"name": "Karthik Reddy", "email": "karthik.reddy@example.edu", "branch": "CSE", "rollNumber": "1CS21010",
     "graduationYear": 2026, "cgpa": 7.6, "backlogs": 0, "skills": ["Java", "React", "SQL"]},
    {"name": "Divya Krishnan", "email": "divya.krishnan@example.edu", "branch": "CSE", "rollNumber": "1CS21011",
     "graduationYear": 2027, "cgpa": 8.9, "backlogs": 0, "skills": ["Python", "Data Analysis", "SQL", "Power BI"]},
    {"name": "Manish Kumar", "email": "manish.kumar@example.edu", "branch": "ISE", "rollNumber": "1IS21012",
     "graduationYear": 2026, "cgpa": 7.1, "backlogs": 1, "skills": ["JavaScript", "React", "Node.js"]},
]
student_ids = {}
for s in students_data:
    res = call("POST", "/api/students", s, tpo_token)
    if res:
        student_ids[s["email"]] = res["id"]
        print(f"  + {s['name']} (id={res['id']})")

print("== Student login accounts (linked) ==")
student_tokens = {}
for email in list(student_ids.keys())[:5]:  # link the first 5 to real login accounts
    sid = student_ids[email]
    token = get_or_register(email, "studentpass", "STUDENT", sid)
    if token:
        student_tokens[email] = token
        print(f"  + linked {email}")

print("== Jobs ==")
jobs_data = [
    {"company": "Acme Technologies", "title": "Software Engineer", "location": "Bangalore", "ctcLpa": 12.0,
     "openings": 5, "minCgpa": 7.0, "maxBacklogs": 0, "eligibleBranches": ["CSE", "ISE"],
     "eligibleGraduationYear": 2026, "requiredSkills": ["Java", "Spring Boot", "SQL"],
     "description": "Build and scale backend services for our logistics platform."},
    {"company": "Acme Technologies", "title": "Frontend Engineer", "location": "Bangalore", "ctcLpa": 11.0,
     "openings": 3, "minCgpa": 6.5, "maxBacklogs": 1, "eligibleBranches": ["CSE", "ISE"],
     "eligibleGraduationYear": 2026, "requiredSkills": ["React", "JavaScript", "Node.js"],
     "description": "Own the customer-facing dashboard UI."},
    {"company": "Globex Finance", "title": "Backend Developer", "location": "Mumbai", "ctcLpa": 14.5,
     "openings": 4, "minCgpa": 7.5, "maxBacklogs": 0, "eligibleBranches": ["CSE"],
     "eligibleGraduationYear": 2026, "requiredSkills": ["Java", "Spring Boot", "AWS"],
     "description": "Payments infrastructure team; high-throughput transaction systems."},
    {"company": "Initech Systems", "title": "IT Analyst", "location": "Pune", "ctcLpa": 6.5,
     "openings": 10, "minCgpa": 6.0, "maxBacklogs": 3, "eligibleBranches": ["CSE", "ISE", "ECE"],
     "eligibleGraduationYear": 2026, "requiredSkills": ["Java", "SQL"],
     "description": "Entry-level consulting role across client IT systems."},
    {"company": "Soylent Analytics", "title": "ML Engineer", "location": "Hyderabad", "ctcLpa": 16.0,
     "openings": 2, "minCgpa": 8.5, "maxBacklogs": 0, "eligibleBranches": ["CSE", "ISE"],
     "eligibleGraduationYear": 2026, "requiredSkills": ["Python", "Machine Learning", "TensorFlow"],
     "description": "Build forecasting models for retail demand prediction."},
    {"company": "Soylent Analytics", "title": "Data Analyst", "location": "Hyderabad", "ctcLpa": 9.0,
     "openings": 3, "minCgpa": 7.0, "maxBacklogs": 1, "eligibleBranches": ["CSE", "ISE"],
     "eligibleGraduationYear": 2027, "requiredSkills": ["Python", "SQL", "Power BI"],
     "description": "Turn raw retail data into actionable dashboards."},
    {"company": "Umbrella Health", "title": "Embedded Systems Engineer", "location": "Chennai", "ctcLpa": 8.5,
     "openings": 2, "minCgpa": 6.5, "maxBacklogs": 2, "eligibleBranches": ["ECE"],
     "eligibleGraduationYear": 2026, "requiredSkills": ["C", "Embedded Systems", "IoT"],
     "description": "Firmware for connected medical devices."},
    {"company": "Umbrella Health", "title": "Mechanical Design Engineer", "location": "Chennai", "ctcLpa": 7.0,
     "openings": 2, "minCgpa": 6.5, "maxBacklogs": 1, "eligibleBranches": ["ME"],
     "eligibleGraduationYear": 2026, "requiredSkills": ["AutoCAD", "SolidWorks"],
     "description": "Device enclosure and mechanical design for wearables."},
]
job_ids = {}
for j in jobs_data:
    company_id = company_ids.get(j["company"])
    if not company_id:
        continue
    payload = {k: v for k, v in j.items() if k != "company"}
    payload["companyId"] = company_id
    res = call("POST", "/api/jobs", payload, tpo_token)
    if res:
        job_ids[j["title"] + "@" + j["company"]] = res["id"]
        print(f"  + {j['title']} @ {j['company']} (id={res['id']})")

print("== Applications ==")
# (student_email, job_key, target_status)
applications_plan = [
    ("asha.rao@example.edu", "Software Engineer@Acme Technologies", "OFFERED"),
    ("asha.rao@example.edu", "Backend Developer@Globex Finance", "INTERVIEW"),
    ("kiran.shah@example.edu", "ML Engineer@Soylent Analytics", "SHORTLISTED"),
    ("kiran.shah@example.edu", "Data Analyst@Soylent Analytics", "APPLIED"),
    ("meera.iyer@example.edu", "Frontend Engineer@Acme Technologies", "SHORTLISTED"),
    ("priya.nair@example.edu", "Software Engineer@Acme Technologies", "OFFERED"),
    ("priya.nair@example.edu", "Backend Developer@Globex Finance", "REJECTED"),
    ("sneha.gupta@example.edu", "ML Engineer@Soylent Analytics", "OFFERED"),
    ("karthik.reddy@example.edu", "IT Analyst@Initech Systems", "APPLIED"),
]
application_ids = {}
for email, job_key, status in applications_plan:
    sid = student_ids.get(email)
    jid = job_ids.get(job_key)
    if not sid or not jid:
        continue
    token = student_tokens.get(email, tpo_token)  # fall back to TPO applying on their behalf
    res = call("POST", "/api/applications", {"studentId": sid, "jobId": jid}, token, expect="ignore-conflict")
    if res:
        app_id = res["id"]
        application_ids[(email, job_key)] = app_id
        print(f"  + {email} -> {job_key} (id={app_id})")
        if status != "APPLIED":
            call("PUT", f"/api/applications/{app_id}/status", {"status": status}, tpo_token)
            print(f"    -> {status}")

print("== Placements (from OFFERED applications) ==")
placements_plan = [
    ("asha.rao@example.edu", "Software Engineer@Acme Technologies", 12.0, "2026-08-15"),
    ("priya.nair@example.edu", "Software Engineer@Acme Technologies", 12.0, "2026-08-15"),
    ("sneha.gupta@example.edu", "ML Engineer@Soylent Analytics", 16.0, "2026-08-20"),
]
for email, job_key, package_lpa, offer_date in placements_plan:
    app_id = application_ids.get((email, job_key))
    if not app_id:
        continue
    res = call("POST", "/api/placements",
               {"applicationId": app_id, "packageLpa": package_lpa, "offerDate": offer_date},
               tpo_token, expect="ignore-conflict")
    if res:
        print(f"  + placement for {email} @ {job_key} ({package_lpa} LPA)")

print("== Notices ==")
notices_data = [
    {"title": "Pre-Placement Talk: Acme Technologies",
     "body": "Acme Technologies will host a pre-placement talk on Aug 30, 2026 at 4 PM in Seminar Hall 2. "
             "Open to all final-year CSE/ISE students. Bring your resumes."},
    {"title": "Resume Review Drive",
     "body": "The placement cell is running resume reviews all this week. Sign up at the TPO office to get "
             "feedback before the Globex Finance drive."},
    {"title": "Globex Finance — Registration Deadline Extended",
     "body": "Registration for the Globex Finance Backend Developer role has been extended to Sep 2, 2026. "
             "Minimum CGPA 7.5, no active backlogs."},
    {"title": "Mock Interview Sessions",
     "body": "Mock technical interviews for ML/Data roles will be conducted by alumni volunteers on Sep 5. "
             "Slots are limited — register via the notice board at the TPO office."},
]
for n in notices_data:
    res = call("POST", "/api/notices", n, tpo_token)
    if res:
        print(f"  + {n['title']}")

print("\n== Final dashboard stats ==")
print(json.dumps(call("GET", "/api/dashboard/stats", token=tpo_token), indent=2))
