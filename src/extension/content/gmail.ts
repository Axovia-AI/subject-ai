/// <reference types="chrome"/>
import { ContentScript } from './types';
import { authUtils, dbUtils, logger } from '../utils/supabase';

export class GmailContentScript implements ContentScript {
  private observer: MutationObserver | null = null;
  private currentSubjectField: HTMLElement | null = null;
  private isAuthenticated = false;
  private currentUser: any = null;

  async init(): Promise<void> {
    logger.info('Initializing Gmail integration');
    
    // Check authentication status
    await this.checkAuthStatus();
    
    this.setupObserver();
    this.checkForExistingComposeWindows();
    
    // Listen for auth state changes
    authUtils.onAuthStateChange((session) => {
      this.isAuthenticated = !!session?.user;
      this.currentUser = session?.user || null;
      logger.info('Auth state changed:', { isAuthenticated: this.isAuthenticated });
    });
  }

  private async checkAuthStatus(): Promise<void> {
    try {
      const session = await authUtils.getSession();
      this.isAuthenticated = !!session?.user;
      this.currentUser = session?.user || null;
      logger.info('Auth status checked:', { isAuthenticated: this.isAuthenticated });
    } catch (error) {
      logger.error('Failed to check auth status:', error);
    }
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
    optimizeButton.textContent = this.isAuthenticated ? '✨ Optimize' : '🔒 Sign In to Optimize';
    optimizeButton.className = 'subjectai-button';
    optimizeButton.style.cssText = `
      background: ${this.isAuthenticated ? 'hsl(221.2 83.2% 53.3%)' : 'hsl(215.4 16.3% 46.9%)'};
      color: white;
      border: none;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 12px;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: background-color 0.2s;
    `;

    optimizeButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (this.isAuthenticated) {
        this.showOptimizationSuggestions(subjectField);
      } else {
        this.showAuthRequired();
      }
    });

    // Add hover effect
    optimizeButton.addEventListener('mouseenter', () => {
      if (this.isAuthenticated) {
        optimizeButton.style.background = 'hsl(221.2 83.2% 48.3%)';
      }
    });

    optimizeButton.addEventListener('mouseleave', () => {
      optimizeButton.style.background = this.isAuthenticated ? 'hsl(221.2 83.2% 53.3%)' : 'hsl(215.4 16.3% 46.9%)';
    });

    optimizer.appendChild(optimizeButton);
    
    // Insert after the subject field
    const subjectContainer = subjectField.closest('[role="textbox"]')?.parentElement || subjectField.parentElement;
    if (subjectContainer) {
      subjectContainer.appendChild(optimizer);
    }
  }

  private showAuthRequired(): void {
    const popup = document.createElement('div');
    popup.className = 'subjectai-auth-popup';
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 320px;
      text-align: center;
    `;

    popup.innerHTML = `
      <div style="margin-bottom: 16px;">
        <div style="font-size: 24px; margin-bottom: 8px;">🔒</div>
        <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Sign In Required</h3>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Please sign in to your SubjectAI account to use AI-powered subject line optimization
        </p>
      </div>
      <div style="display: flex; gap: 8px; justify-content: center;">
        <button class="subjectai-open-popup" style="
          background: hsl(221.2 83.2% 53.3%);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
          font-weight: 500;
        ">Open Extension</button>
        <button class="subjectai-close-auth" style="
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
        ">Cancel</button>
      </div>
    `;

    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999;
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(popup);

    // Event listeners
    popup.querySelector('.subjectai-open-popup')?.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openPopup' });
      backdrop.remove();
      popup.remove();
    });

    popup.querySelector('.subjectai-close-auth')?.addEventListener('click', () => {
      backdrop.remove();
      popup.remove();
    });

    backdrop.addEventListener('click', () => {
      backdrop.remove();
      popup.remove();
    });
  }

  private async showOptimizationSuggestions(subjectField: HTMLInputElement): Promise<void> {
    const currentSubject = subjectField.value.trim();
    
    if (!currentSubject) {
      this.showTooltip(subjectField, 'Please enter a subject line first');
      return;
    }

    if (!this.isAuthenticated) {
      this.showAuthRequired();
      return;
    }

    // Show loading state
    this.showLoadingPopup(subjectField);

    try {
      // For now, use mock suggestions - will integrate with OpenAI API later
      const suggestions = [
        `🚀 ${currentSubject} - Don't Miss Out!`,
        `✅ ${currentSubject} | Quick Action Required`,
        `💡 ${currentSubject} - Limited Time`,
        `🎯 Re: ${currentSubject}`
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      this.showSuggestionPopup(subjectField, suggestions);
    } catch (error) {
      logger.error('Failed to get suggestions:', error);
      this.showTooltip(subjectField, 'Failed to get suggestions. Please try again.');
    }
  }

  private showLoadingPopup(subjectField: HTMLInputElement): void {
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
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      text-align: center;
    `;

    popup.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
        <div style="
          width: 16px;
          height: 16px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid hsl(221.2 83.2% 53.3%);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
        <span>Generating AI suggestions...</span>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;

    // Position popup
    const rect = subjectField.getBoundingClientRect();
    popup.style.left = `${rect.left}px`;
    popup.style.top = `${rect.bottom + 8}px`;

    document.body.appendChild(popup);
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

  private async updateStats(): Promise<void> {
    if (!this.isAuthenticated || !this.currentUser) {
      return;
    }

    try {
      // Get current stats
      const { data: currentStats } = await dbUtils.getTodayStats(this.currentUser.id);
      const newCount = (currentStats?.optimized_count || 0) + 1;
      
      // Update in database
      await dbUtils.updateUsageStats(this.currentUser.id, newCount);
      
      logger.info('Stats updated:', { optimizedCount: newCount });
    } catch (error) {
      logger.error('Failed to update stats:', error);
    }
  }

  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}