import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import React, { useState, useEffect } from 'react'; // Import useState, useEffect

// Removed problematic type import
// import type { Route } from "./+types/root";
import "./app.css";
import Header from "./components/Header"; // Import Header
import Footer from "./components/Footer"; // Import Footer

// Using a more generic type for links function
export const links: () => { rel: string; href: string; crossOrigin?: string }[] = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@600&family=Poppins:wght@400&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Header /> {/* Add Header */}
        {/* Apply the container class and add bottom margin */}
        <div id="app-content" className="app-container" style={{ minHeight: 'calc(100vh - 100px)', marginBottom: '4rem' }}> 
          {children}
        </div>
        <Footer /> {/* Add Footer */}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [installPromptEvent, setInstallPromptEvent] = useState<Event | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Service Worker Registration
    if ('serviceWorker' in navigator) {
      const registerServiceWorker = () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      };
      // Delay registration until after load event
      window.addEventListener('load', registerServiceWorker);
      // Cleanup listener on component unmount
      return () => window.removeEventListener('load', registerServiceWorker);
    }
  }, []); 

  useEffect(() => {
    // PWA Install Prompt Handling
    const handleBeforeInstallPrompt = (event: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPromptEvent(event);
      // Update UI notify the user they can install the PWA
      setShowInstallButton(true);
      console.log('beforeinstallprompt event fired');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      // Hide the install button
      setShowInstallButton(false);
      // Clear the deferredPrompt so it can be garbage collected
      setInstallPromptEvent(null);
      console.log('PWA was installed');
      // Optionally, send analytics event
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup listeners
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPromptEvent) {
      return;
    }
    // Show the install prompt
    (installPromptEvent as any).prompt(); // Type assertion needed as prompt() isn't standard on Event
    // Wait for the user to respond to the prompt
    (installPromptEvent as any).userChoice.then((choiceResult: { outcome: 'accepted' | 'dismissed' }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      // We can only use the prompt once, clear it.
      setInstallPromptEvent(null);
      setShowInstallButton(false); // Hide button after prompt is shown
    });
  };

  // Pass install state and handler down via context or props
  // For simplicity here, we assume Outlet might render Header indirectly
  // A better approach might use React Context
  // Or pass props directly if Header is rendered here
  // For now, we'll modify Header directly in the next step

  return <Outlet />; // Header is rendered within Layout
}

// Using a more generic type for ErrorBoundary props
export function ErrorBoundary({ error }: { error: any }) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
