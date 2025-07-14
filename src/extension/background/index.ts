// Background script for SubjectAI extension
/// <reference types="chrome"/>

chrome.runtime.onInstalled.addListener(() => {
  console.log('SubjectAI extension installed');
  
  // Initialize default settings
  chrome.storage.local.set({
    optimizedToday: 0,
    averageOpenRate: 0,
    isLoggedIn: false,
    installDate: Date.now()
  });
});

// Reset daily stats at midnight
chrome.alarms.create('resetDailyStats', {
  when: getNextMidnight(),
  periodInMinutes: 24 * 60 // Every 24 hours
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'resetDailyStats') {
    chrome.storage.local.set({ optimizedToday: 0 });
  }
});

function getNextMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'updateStats') {
    chrome.storage.local.get(['optimizedToday'], (result) => {
      const newCount = (result.optimizedToday || 0) + 1;
      chrome.storage.local.set({ optimizedToday: newCount });
    });
  }
});

export {};