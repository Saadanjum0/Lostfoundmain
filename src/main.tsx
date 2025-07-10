// Force immediate background application before any React code runs
(function() {
  const forceBackground = () => {
    const elements = [document.documentElement, document.body, document.getElementById('root')];
    elements.forEach(el => {
      if (el) {
        el.style.setProperty('background', 'radial-gradient(ellipse at center, #1a1a1a 0%, #141414 30%, #0f0f0f 70%, #0a0a0a 100%)', 'important');
        el.style.setProperty('background-color', '#0a0a0a', 'important');
        el.style.setProperty('color', 'white', 'important');
        el.style.setProperty('transition', 'none', 'important');
      }
    });
  };
  
  // Apply immediately
  forceBackground();
  
  // Apply on DOM mutations (covers refresh scenarios)
  const observer = new MutationObserver(forceBackground);
  observer.observe(document.documentElement, { 
    attributes: true, 
    childList: true, 
    subtree: true 
  });
  
  // Clean up observer after a short delay (React should be loaded by then)
  setTimeout(() => observer.disconnect(), 2000);
})();

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure background is applied before React renders
const rootElement = document.getElementById("root")!;
rootElement.style.setProperty('background', 'transparent', 'important');
rootElement.style.setProperty('color', 'white', 'important');
rootElement.style.setProperty('min-height', '100vh', 'important');

createRoot(rootElement).render(<App />);
