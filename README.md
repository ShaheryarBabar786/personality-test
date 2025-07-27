# Personality Assessment System

A comprehensive personality test administration system with support for multiple test types including Big Five, MBTI, Enneagram, and more.

## 🚀 Installation & Setup

### Prerequisites
- Node.js v16+
- npm v8+

##  Clone the repository

git clone git@github.com:ShaheryarBabar786/personality-test.git

1. Set up Frontend
bash
cd frontend
npm install
2. Set up Server
bash
cd server
npm install


##  🖥️ Running the Application
### Frontend (Angular)
bash
cd frontend
npm run start
Access at: http://localhost:4200

### Backend (Node.js)
bash
cd server
npm run start
API will run at: http://localhost:3000

## 🛠️ Test Creation Guide
There are two ways to create new personality tests:

### Method 1: Manual Creation

- Navigate to Admin Panel
- Click "Create New Test"
- Select test type (Big Five, MBTI, etc.)
- Fill in all required fields:
- Test name and description
- Questions (with translations)
- Outcomes (with translations)
- Save the test configuration

### Method 2: JSON Import (Recommended)

- Use our Test Generator Prompt to create test configurations
- https://docs.google.com/document/d/1CnUKU-4uBdZKApFIXH0uDwhdxrZcSkJkgQKjY7zzv_E/edit?usp=sharing
- Give it the necessary instruction like "Create an MBTI test with 20 questions (5 per dichotomy), French/Spanish translations, and exactly 6 reversed questions" etc
- Copy the document and paste it to any AI model like Chatgpt
- Copy the generated JSON

#### In Admin Panel:

- Select "Import from JSON"
- Paste the JSON into the text area
- Click "Validate JSON"
- Review auto-filled fields
- Click "Create Test"
- It will take to the next model to make any change in the question or outcome
- Then click on the Save Changes and the test will be created.

### Example AI Commands:

"Create an MBTI test with 20 questions (5 per dichotomy), French/Spanish translations, and exactly 6 reversed questions"
"Generate Big Five test with 30 questions (6 per trait), workplace-focused"


## 📋 Supported Test Types

| Test Type            | Traits/Scales        | Questions | Scoring Method |
|----------------------|----------------------|-----------|----------------|
| Big Five             | OCEAN Model          | 25–35     | Sum            |
| MBTI                 | Dichotomies          | 20–28     | Comparison     |
| Enneagram            | 9 Types              | 36–45     | Weighted       |
| DISC                 | 4 Factors            | 24–32     | Comparison     |
| Emotional Intelligence | Components         | 25–35     | Sum            |
