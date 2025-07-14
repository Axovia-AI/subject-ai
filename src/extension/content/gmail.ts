/// <reference types="chrome"/>
import { ContentScript } from './types';

export class GmailContentScript implements ContentScript {
  private observer: MutationObserver | null = null;
  private currentSubjectField: HTMLElement | null = null;

  init(): void {
    console.log('SubjectAI: Initializing Gmail integration');
    this.setupObserver();
    this.checkForExistingComposeWindows();
  }

  private setupObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // Check for compose windows
              if (element.querySelector('[name="subject"]') || 
                  element.classList.contains('compose') ||
                  element.querySelector('.compose')) {
                setTimeout(() => this.handleComposeWindow(), 100);
              }
            }
          });
        }
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private checkForExistingComposeWindows(): void {
    const existingSubjectFields = document.querySelectorAll('[name="subject"]');
    if (existingSubjectFields.length > 0) {
      this.handleComposeWindow();
    }
  }

  private handleComposeWindow(): void {
    const subjectField = document.querySelector('[name="subject"]') as HTMLInputElement;
    
    if (!subjectField || subjectField === this.currentSubjectField) {
      return;
    }

    this.currentSubjectField = subjectField;
    this.addSubjectOptimizer(subjectField);
  }

  private addSubjectOptimizer(subjectField: HTMLInputElement): void {
    // Remove existing optimizer if present
    const existingOptimizer = subjectField.parentElement?.querySelector('.subjectai-optimizer');
    if (existingOptimizer) {
      existingOptimizer.remove();
    }

    const optimizer = document.createElement('div');
    optimizer.className = 'subjectai-optimizer';
    optimizer.style.cssText = `
      position: relative;
      display: inline-block;
      margin-left: 8px;
    `;

    const optimizeButton = document.createElement('button');
    optimizeButton.textContent = '✨ Optimize';
    optimizeButton.className = 'subjectai-button';
    optimizeButton.style.cssText = `
      background: hsl(221.2 83.2% 53.3%);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 12px;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    optimizeButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showOptimizationSuggestions(subjectField);
    });

    optimizer.appendChild(optimizeButton);
    
    // Insert after the subject field
    const subjectContainer = subjectField.closest('[role="textbox"]')?.parentElement || subjectField.parentElement;
    if (subjectContainer) {
      subjectContainer.appendChild(optimizer);
    }
  }

  private showOptimizationSuggestions(subjectField: HTMLInputElement): void {
    const currentSubject = subjectField.value.trim();
    
    if (!currentSubject) {
      this.showTooltip(subjectField, 'Please enter a subject line first');
      return;
    }

    // Mock suggestions for now - will connect to API later
    const suggestions = [
      `🚀 ${currentSubject} - Don't Miss Out!`,
      `✅ ${currentSubject} | Quick Action Required`,
      `💡 ${currentSubject} - Limited Time`,
      `🎯 Re: ${currentSubject}`
    ];

    this.showSuggestionPopup(subjectField, suggestions);
  }

  private showSuggestionPopup(subjectField: HTMLInputElement, suggestions: string[]): void {
    // Remove existing popup
    const existingPopup = document.querySelector('.subjectai-suggestions-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    const popup = document.createElement('div');
    popup.className = 'subjectai-suggestions-popup';
    popup.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      min-width: 300px;
      max-width: 400px;
      padding: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    `;

    const header = document.createElement('div');
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <strong>AI Suggestions</strong>
        <button class="subjectai-close" style="background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
      </div>
    `;

    popup.appendChild(header);

    suggestions.forEach((suggestion) => {
      const suggestionEl = document.createElement('div');
      suggestionEl.className = 'subjectai-suggestion';
      suggestionEl.textContent = suggestion;
      suggestionEl.style.cssText = `
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 4px;
        margin: 4px 0;
        background: #f9fafb;
        transition: background-color 0.2s;
      `;

      suggestionEl.addEventListener('mouseenter', () => {
        suggestionEl.style.background = '#e5e7eb';
      });

      suggestionEl.addEventListener('mouseleave', () => {
        suggestionEl.style.background = '#f9fafb';
      });

      suggestionEl.addEventListener('click', () => {
        subjectField.value = suggestion;
        subjectField.dispatchEvent(new Event('input', { bubbles: true }));
        popup.remove();
        
        // Update stats
        this.updateStats();
      });

      popup.appendChild(suggestionEl);
    });

    // Close button functionality
    const closeBtn = popup.querySelector('.subjectai-close');
    closeBtn?.addEventListener('click', () => popup.remove());

    // Position popup
    const rect = subjectField.getBoundingClientRect();
    popup.style.left = `${rect.left}px`;
    popup.style.top = `${rect.bottom + 8}px`;

    document.body.appendChild(popup);

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', (e) => {
        if (!popup.contains(e.target as Node)) {
          popup.remove();
        }
      }, { once: true });
    }, 100);
  }

  private showTooltip(element: HTMLElement, message: string): void {
    const tooltip = document.createElement('div');
    tooltip.textContent = message;
    tooltip.style.cssText = `
      position: absolute;
      background: #374151;
      color: white;
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 10001;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left}px`;
    tooltip.style.top = `${rect.bottom + 8}px`;

    document.body.appendChild(tooltip);

    setTimeout(() => {
      tooltip.remove();
    }, 3000);
  }

  private updateStats(): void {
    chrome.storage.local.get(['optimizedToday'], (result) => {
      const optimizedToday = (result.optimizedToday || 0) + 1;
      chrome.storage.local.set({ optimizedToday });
    });
  }

  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}