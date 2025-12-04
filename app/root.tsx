import { isRouteErrorResponse } from "react-router";
import { Outlet, useRouteError } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import "./app.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Main App component now just renders the Outlet within the main structure
export default function App() {
  const [installPromptEvent, setInstallPromptEvent] = useState<Event | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // Service Worker Registration
  useEffect(() => {
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
      window.addEventListener('load', registerServiceWorker);
      return () => window.removeEventListener('load', registerServiceWorker);
    }
  }, []); 

  // PWA Install Prompt Handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
      setShowInstallButton(true);
      console.log('beforeinstallprompt event fired');
    };

    const handleAppInstalled = () => {
      setShowInstallButton(false);
      setInstallPromptEvent(null);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPromptEvent) return;
    
    (installPromptEvent as any).prompt();
    (installPromptEvent as any).userChoice.then((choiceResult: { outcome: 'accepted' | 'dismissed' }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPromptEvent(null);
      setShowInstallButton(false);
    });
  };

  // Set CSS variables for theme (client-side only)
  useEffect(() => {
    document.documentElement.style.setProperty('--app-background', '#f5f5dc');
    document.documentElement.style.setProperty('--app-text', '#333333');
    // Add dark mode variables if needed later
  }, []);
  
  // Render Header, Outlet (page content), and Footer
  return (
    <div className="app-layout">
      <Header
        showInstallButton={showInstallButton}
        onInstallClick={handleInstallClick}
      />
      <main className="app-container">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Error Boundary
export function ErrorBoundary() {
  const error = useRouteError();

  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : `Error ${error.status}`;
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
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
