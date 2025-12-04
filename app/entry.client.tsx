import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';
import App, { ErrorBoundary } from './root'; // Import App and ErrorBoundary
import Home from './routes/home'; // Import Home route component
import RecipeArchive from './routes/archive'; // Re-import Archive route component
import { ConvexClientProvider } from './lib/convex'; // Import Convex provider

// Define routes using createBrowserRouter
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Use App component from root.tsx as the layout
    errorElement: <ErrorBoundary />, // Use the ErrorBoundary from root.tsx
    children: [
      {
        index: true, // This makes Home the default route for "/"
        element: <Home />,
      },
      {
        path: "archive", // Re-add the archive route
        element: <RecipeArchive />,
      },
      // Add other routes here as needed
    ],
  },
]);

// Get the root element
const rootElement = document.getElementById('root');

if (rootElement) {
  // Use createRoot for React 18+
  const root = ReactDOM.createRoot(rootElement);
  
  // Render the app using RouterProvider wrapped with ConvexProvider
  root.render(
    <React.StrictMode>
      <ConvexClientProvider>
        <RouterProvider router={router} />
      </ConvexClientProvider>
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element. Ensure your index.html has an element with id='root'.");
}
