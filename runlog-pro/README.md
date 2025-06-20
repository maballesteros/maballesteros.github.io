# RunLog Pro

RunLog Pro is a web application designed for runners to log their running sessions, generate personalized training plans based on algorithmic calculations, track their progress over time, and make manual adjustments to their schedule.

## Features

*   **Detailed Session Logging**: Record runs with distance, duration, elevation, heart rate data (FCMax, FCRest, FCAvg, Gender), and notes. TRIMP (Training Impulse) is automatically calculated. Supports logging multiple sessions per day.
*   **Algorithmic Training Plan Generation**: Automatically creates personalized training plans. Plans adapt based on your recent performance, customizable progression settings, user-modified training days, and manually logged weekly deload statuses.
*   **Interactive Dashboard**:
    *   **Current Week View**: Detailed, interactive card for the current week, showing planned vs. actual (if logged). Click days to log new sessions, edit existing ones, or directly modify the plan for that day using an intuitive modal.
    *   **Weekly Summary**: Quick overview of the current week's total distance, duration, TRIMP, and progress against planned targets.
    *   **Future Plan Calendar**: Visual calendar layout of upcoming training weeks, detailing planned workouts and their intensity.
    *   **Progress Chart**: Track your weekly training load (TRIMP or distance) over time, comparing planned vs. actual performance.
*   **Comprehensive Logbook**:
    *   View all logged activities, neatly grouped by week.
    *   Daily cards summarize activity; click to view/edit individual sessions or add new ones for that day.
    *   Manage multiple sessions within a single day through a dedicated modal, allowing for detailed tracking of two-a-days or separate activities.
*   **Weekly Review & Adjustments**:
    *   Manually mark specific weeks as "deload weeks" directly in the log.
    *   Add personal notes or valorizations for each training week to keep track of subjective feelings, conditions, or other relevant factors.
    *   These inputs (deload status and notes) are stored and can influence future plan generation logic.
*   **Customizable Training Settings**: Fine-tune your training progression:
    *   Weekly load increment percentage.
    *   Deload week frequency and load reduction percentage.
    *   Overall plan horizon (number of weeks visible in the future plan).
    *   Primary target metric for the plan (TRIMP or distance).
    *   Preferred day for the long run and its percentage contribution to weekly kilometers or TRIMP.
*   **Data Management**: Securely import and export your complete training data (sessions, settings, plan, weekly notes) as a JSON file for backup or transfer. Option to clear all application data with confirmation.
*   **Responsive Design**: Optimized for usability across desktop and mobile devices.
*   **Offline Functionality**: Core features, including data logging, viewing existing plans, and settings adjustments, are available offline using local browser storage.
*   **User-Friendly Interface**: Intuitive navigation, clear presentation of information, helpful tooltips, and non-intrusive modals for common actions. Confirmation dialogs for critical operations prevent accidental data loss.

## Tech Stack

*   **Frontend**: React 19, TypeScript
*   **Styling**: TailwindCSS (via CDN)
*   **State Management**: Zustand
*   **Routing**: React Router (HashRouter)
*   **Forms**: React Hook Form with Zod for validation
*   **Charts**: Recharts
*   **Date Management**: date-fns
*   **File Saving**: file-saver
*   **Client-side Storage**: LocalStorage

## Prerequisites for Building

*   Node.js and npm (or yarn) – primarily for development tools if you set up a more complex build process.

## Development

The application is structured with an `index.html` that loads React and other dependencies via an import map and directly imports the main `index.tsx` module. For development, you would typically use a local development server (like Vite, Parcel, or a simple `http-server`) that can serve `index.html` and handle TypeScript/JSX either on-the-fly or after a build step.

1.  **Clone the repository (if applicable).**
2.  **Install dependencies (for build tools):**
    While the project uses CDNs/esm.sh for runtime dependencies, for a more robust build process or to manage development tools, you would typically use a `package.json`. If one were set up, you'd run:
    ```bash
    npm install
    # or
    # yarn install
    ```
3.  **Serve `index.html`:**
    Use a simple HTTP server to serve the project root directory. For example, using `http-server`:
    ```bash
    npx http-server .
    ```
    Then open the provided URL in your browser.

## Building for Static Deployment

To "compile" this application into static files (HTML, CSS, JS) suitable for deployment on any static web host, a build process is typically required. This process generally involves:

1.  **Transpiling TypeScript/JSX**: Convert all `.ts` and `.tsx` files into standard JavaScript (`.js`) files that browsers can execute. Tools like the TypeScript compiler (`tsc`) or bundlers like Vite/Webpack/Parcel are used for this.
2.  **Preparing `index.html`**:
    *   The `index.html` file must be included in your static output.
    *   Script tags in `index.html` that point to `.tsx` files (e.g., `<script type="module" src="/index.tsx">`) need to be updated to point to their compiled `.js` counterparts (e.g. `<script type="module" src="/index.js">`) if your build tool doesn't handle this automatically.
3.  **Bundling (Optional but Recommended)**:
    Tools like Vite, Webpack, or Parcel can bundle all your JavaScript code and dependencies into fewer, optimized files. They can also handle TypeScript compilation and other optimizations.
4.  **Output**:
    *   The result of the build process is a directory (commonly named `dist` or `build`) containing `index.html` and all necessary JavaScript, CSS (if any separate CSS files are generated), and other static assets.
5.  **Deployment**:
    *   The contents of this output directory can then be uploaded to any static web hosting service (e.g., GitHub Pages, Netlify, Vercel, AWS S3).

**Example conceptual build steps using `tsc` (simplified):**

*   Ensure `typescript` is installed (`npm install -D typescript`).
*   Have a `tsconfig.json` correctly configured (e.g., with `outDir: "./dist"`, `jsx: "react-jsx"`, `module: "esnext"`, `target: "es2020"`).
*   Run `npx tsc`. This will output `.js` files to your `outDir` (e.g., `./dist`).
*   Manually copy `index.html` to the `outDir`.
*   Adjust the script tag in the copied `index.html` to point to the compiled `index.js`:
    `<script type="module" src="/index.js"></script>` (if `index.tsx` is the entry point and is output as `index.js` in the root of `outDir`).

Using a dedicated bundler (like Vite, Parcel, or Webpack) is highly recommended as it automates these steps, optimizes assets, and provides a better development experience. For example, with Vite, you would typically run `npm run build`, and it would produce an optimized `dist` folder ready for deployment.

Since the application no longer relies on external APIs requiring sensitive keys in the client-side code for its core functionality, the build and deployment process is straightforward for static hosting.

