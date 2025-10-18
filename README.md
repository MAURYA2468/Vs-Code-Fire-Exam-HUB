🔧 Project Setup Guide

This guide will walk you through setting up and running the project locally.

✅ 1. Install Dependencies

First, make sure you have Node.js and npm installed on your machine.

Then, in your project root directory, run:

                                                    1.  npm install


This command will:

Read the package.json file.

Install all required project dependencies into the node_modules folder.

🔥 2. Install Firebase CLI Globally

To interact with Firebase (for deployment, hosting, etc.), install the Firebase CLI globally:

                                                    2.  npm install -g firebase-tools


This command allows you to use the firebase command anywhere in your terminal.

🔐 You might need admin/sudo rights depending on your system.

🏗️ 3. Build the Project

Run:

                                                     3. npm run build


This will:

Compile your source code into a production-ready version.

Typically outputs to a build/ or dist/ directory, depending on the configuration.

🚀 4. Start the Project

To launch the project locally:

                                                          4.  npm start


This command:

Starts the development server (e.g., with live reload).

Your app should now be running at http://localhost:3000 or another port depending on your setup.

📝 Notes

Make sure .env or other config files (if used) are properly set up before running the app.

If using Firebase Hosting or Functions, you may need to run firebase login and firebase init as additional setup.
