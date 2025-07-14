import { GmailContentScript } from './gmail';

let currentScript: GmailContentScript | null = null;

async function initExtension(): Promise<void> {
  // Cleanup existing script
  if (currentScript) {
    currentScript.destroy();
  }

  // Determine which email platform we're on
  const hostname = window.location.hostname;
  
  if (hostname.includes('gmail.com') || hostname.includes('mail.google.com')) {
    currentScript = new GmailContentScript();
    await currentScript.init();
  }
  // Add Outlook support later
  // else if (hostname.includes('outlook')) {
  //   currentScript = new OutlookContentScript();
  //   await currentScript.init();
  // }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExtension);
} else {
  initExtension();
}

// Handle navigation in SPAs
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(initExtension, 1000); // Delay to ensure page has loaded
  }
}).observe(document, { subtree: true, childList: true });