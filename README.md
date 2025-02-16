# Quizo

## Description

Quizo is a quiz management system designed to facilitate online quizzes between teachers and students. Teachers can create and manage quizzes, while students can participate and test their knowledge.

## Features :

### 1. Admin role :

- Admin can **add teacher** who can create/edit/delete quizzes.
- Admin can view the **teacher list**.
- Admin can **delete the teacher**.

### 2. Teacher role :

- Teacher can create, edit, and delete quizzes.
- Teacher can create quizzes with features like:
  - Adding a quiz title with a specific subject.
  - Modifying the marks for each question.
  - Setting a **duration/timer** for the quiz.
  - Enabling/disabling **Negative Marking** for the quiz.
  - Enabling/disabling **Unidirected Mode** for the quiz.
  - **Scheduling** the quiz.
  - Adding questions to the quiz with four options and **choosing the correct answer**.
  - When the quiz is live, the teacher can see **how many students attempted the quiz along with their results**.

### 3. Student role :

- Students can attend live quizzes.
- After attending the quiz, students can **view their results**.
- A session **Attempted** is available, where students can see a **history of their attempted quizzes**.
- Students can **review the quiz**, seeing their marked answers and **comparing them with the correct answers**.
- If the timer expires, the quiz will be **automatically submitted**.
- If the student leaves the tab or the window is closed, the **quiz will be automatically submitted**.

### Final Roles and Their Permissions :

- **Admin role** permissions:
  - Add teacher
  - See the teacher list
  - Delete teacher
- **Teacher role** permissions:
  - Create quizzes
  - Edit quizzes
  - Delete quizzes
  - See quiz results with scores
- **Student role** permissions:
  - Attend quizzes
  - View results
  - Review quizzes (with correct and marked answers)

## Installation

To install and run the project locally, you need **Node.js**.

The project contains two parts: **Backend** and **Frontend**.

Clone the repository to your local machine.

### Backend Setup Steps :

1. Navigate to the backend directory: `cd backend`.
2. Create a `.env` file in the root directory of the project.
3. Add the following environment variables to the `.env` file:

```
PORT=[port number]
MONGO_URL="your mongodb url"
```

4. Install the dependencies by running:

```sh
npm install
```

5. Start the server by running:

```sh
npm run dev
```

After that, you will see a message confirming a successful connection to the database, and the server running on `[PORT]`.

### Frontend Setup Steps :

1. Navigate to the frontend directory: `cd frontend`.
2. Install the dependencies by running:

```sh
npm install
```

3. Start the server by running:

```sh
npm run dev
```

If you encounter any errors, open the `package.json` file and install any missing dependencies.
After that, you will see a localhost URL where you can navigate to the application.

### Admin info : ( just for testing )
email : **admin@gmail.com**
password : **admin**


## API Documentation

### API Endpoints

- `/ ` : Home page displaying a list of live quizzes.
- `/login` : Login page.
- `/signup` : Signup page.
- `/take-quiz` : Attempt page where students can take a quiz.
- `/attempted` : Page where students can see the history of attempted quizzes.
- `/quiz-review/:quizId` : Review page where students can review quizzes, including correct and marked answers.
- `/add_quiz` : Add quiz page.
- `/edit-quiz` : Edit quiz page.
- `/check-results/:studentId` : Check results page.
- `/add_teacher` : Add teacher page.
- `/all-teacher` : Page listing all teachers, where the admin can view and delete teachers.

## Live Demo

For a live demo, visit [here](https://quizo-rosy.vercel.app/).

