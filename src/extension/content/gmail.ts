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
      // Get email context from compose window for better suggestions
      const emailContext = this.extractEmailContext();
      
      // Get user preferences for tone
      const userPreferences = await this.getUserPreferences();
      const tone = userPreferences?.ai_model_preference === 'creative' ? 'creative' : 'professional';

      // Call the optimize-subject edge function
      const session = await authUtils.getSession();
      const { data, error } = await this.callOptimizeFunction({
        originalSubject: currentSubject,
        emailContext,
        tone
      }, session?.access_token);

      if (error || !data.success) {
        throw new Error(data?.error || 'Failed to generate suggestions');
      }

      this.showSuggestionPopup(subjectField, data.optimizedSubjects);
    } catch (error) {
      logger.error('Failed to get suggestions:', error);
      this.showErrorPopup(subjectField, error.message);
    }
  }

  private extractEmailContext(): string {
    // Try to get email body content for context
    const composeBody = document.querySelector('[role="textbox"][contenteditable="true"]') ||
                      document.querySelector('.editable[contenteditable="true"]') ||
                      document.querySelector('[aria-label*="Message Body"]');
    
    if (composeBody) {
      const text = composeBody.textContent || '';
      return text.substring(0, 500); // First 500 characters for context
    }
    return '';
  }

  private async getUserPreferences(): Promise<any> {
    try {
      if (!this.currentUser?.id) return null;
      
      const { data } = await dbUtils.getUserPreferences(this.currentUser.id);
      return data;
    } catch (error) {
      logger.error('Failed to get user preferences', error);
      return null;
    }
  }

  private async callOptimizeFunction(payload: any, accessToken?: string): Promise<any> {
    try {
      const response = await fetch('https://ntzcqfphhsuddtbugiqd.supabase.co/functions/v1/optimize-subject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken || ''}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50emNxZnBoaHN1ZGR0YnVnaXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NjY5NjUsImV4cCI6MjA2ODA0Mjk2NX0.1saAtNicrVC3-cCdh239Jr-hNQ7c9wnvuwzovIJkWQw'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Edge function call failed:', error);
      throw error;
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
      border: 1px solid #e1e5e9;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      z-index: 10000;
      min-width: 400px;
      max-width: 480px;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    `;

    const header = document.createElement('div');
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 18px;">✨</span>
          <strong style="font-size: 16px; color: #1f2937;">AI-Optimized Suggestions</strong>
        </div>
        <button class="subjectai-close" style="
          background: #f3f4f6; 
          border: none; 
          width: 28px; 
          height: 28px; 
          border-radius: 50%; 
          font-size: 16px; 
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          transition: all 0.2s;
        ">×</button>
      </div>
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #0ea5e9; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
        <div style="font-size: 12px; color: #0369a1; font-weight: 500;">💡 These suggestions are optimized for higher open rates</div>
        <div style="font-size: 11px; color: #075985; margin-top: 2px;">Click any suggestion to use it instantly</div>
      </div>
    `;

    popup.appendChild(header);

    suggestions.forEach((suggestion, index) => {
      const suggestionEl = document.createElement('div');
      suggestionEl.className = 'subjectai-suggestion';
      suggestionEl.innerHTML = `
        <div style="font-weight: 500; color: #1f2937; margin-bottom: 4px;">${suggestion}</div>
        <div style="font-size: 12px; color: #6b7280; display: flex; align-items: center; gap: 4px;">
          <span>📈</span>
          <span>Optimized for engagement</span>
        </div>
      `;
      suggestionEl.style.cssText = `
        padding: 16px 12px;
        cursor: pointer;
        border-radius: 8px;
        margin: 8px 0;
        background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
        border: 2px solid #e5e7eb;
        transition: all 0.3s ease;
        position: relative;
      `;

      suggestionEl.addEventListener('mouseenter', () => {
        suggestionEl.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        suggestionEl.style.borderColor = '#667eea';
        suggestionEl.style.transform = 'translateY(-2px)';
        suggestionEl.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
        
        const textElements = suggestionEl.querySelectorAll('div');
        textElements.forEach(el => {
          (el as HTMLElement).style.color = 'white';
        });
      });

      suggestionEl.addEventListener('mouseleave', () => {
        suggestionEl.style.background = 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)';
        suggestionEl.style.borderColor = '#e5e7eb';
        suggestionEl.style.transform = 'translateY(0)';
        suggestionEl.style.boxShadow = 'none';
        
        const textElements = suggestionEl.querySelectorAll('div');
        if (textElements[0]) (textElements[0] as HTMLElement).style.color = '#1f2937';
        if (textElements[1]) (textElements[1] as HTMLElement).style.color = '#6b7280';
      });

      suggestionEl.addEventListener('click', () => {
        subjectField.value = suggestion;
        subjectField.dispatchEvent(new Event('input', { bubbles: true }));
        popup.remove();
        
        // Show success feedback
        this.showSuccessToast('✨ Subject line optimized successfully!');
        
        // Update stats
        this.updateStats();
      });

      popup.appendChild(suggestionEl);
    });

    // Close button functionality
    const closeBtn = popup.querySelector('.subjectai-close');
    closeBtn?.addEventListener('mouseenter', () => {
      (closeBtn as HTMLElement).style.background = '#e5e7eb';
    });
    closeBtn?.addEventListener('mouseleave', () => {
      (closeBtn as HTMLElement).style.background = '#f3f4f6';
    });
    closeBtn?.addEventListener('click', () => popup.remove());

    // Position popup
    const rect = subjectField.getBoundingClientRect();
    popup.style.left = `${Math.max(10, rect.left)}px`;
    popup.style.top = `${rect.bottom + 8}px`;

    // Ensure popup doesn't go off screen
    const popupRect = popup.getBoundingClientRect();
    if (popupRect.right > window.innerWidth - 10) {
      popup.style.left = `${window.innerWidth - popupRect.width - 10}px`;
    }

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
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 10001;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    `;

    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left}px`;
    tooltip.style.top = `${rect.bottom + 8}px`;

    document.body.appendChild(tooltip);

    setTimeout(() => {
      tooltip.remove();
    }, 3000);
  }

  private showSuccessToast(message: string): void {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      animation: slideInFromRight 0.3s ease-out;
    `;

    // Add animation styles if not already present
    if (!document.querySelector('#subjectai-toast-styles')) {
      const styles = document.createElement('style');
      styles.id = 'subjectai-toast-styles';
      styles.textContent = `
        @keyframes slideInFromRight {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutToRight {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutToRight 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  private showErrorPopup(subjectField: HTMLInputElement, errorMessage: string): void {
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
      border: 1px solid #f87171;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      min-width: 350px;
      max-width: 400px;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    `;

    popup.innerHTML = `
      <div style="text-align: center; padding: 16px;">
        <div style="font-size: 32px; margin-bottom: 12px;">😞</div>
        <h4 style="margin: 0 0 8px 0; color: #ef4444; font-weight: 600; font-size: 16px;">Oops! Something went wrong</h4>
        <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; line-height: 1.4;">
          ${errorMessage || 'We couldn\'t generate AI suggestions right now.'}
        </p>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; margin-bottom: 16px; text-align: left;">
          <div style="color: #dc2626; font-size: 12px; font-weight: 500; margin-bottom: 6px;">💡 Try this:</div>
          <ul style="margin: 0; padding: 0 0 0 16px; color: #991b1b; font-size: 12px; line-height: 1.4;">
            <li>Check your internet connection</li>
            <li>Make sure your subject line isn't empty</li>
            <li>Try again in a few moments</li>
          </ul>
        </div>
        
        <button class="subjectai-retry" style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          margin-right: 8px;
          transition: all 0.2s;
        ">Try Again</button>
        
        <button class="subjectai-close-error" style="
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
        ">Close</button>
      </div>
    `;

    // Position popup
    const rect = subjectField.getBoundingClientRect();
    popup.style.left = `${Math.max(10, rect.left)}px`;
    popup.style.top = `${rect.bottom + 8}px`;

    document.body.appendChild(popup);

    // Add event listeners
    popup.querySelector('.subjectai-retry')?.addEventListener('click', () => {
      popup.remove();
      this.showOptimizationSuggestions(subjectField);
    });

    popup.querySelector('.subjectai-close-error')?.addEventListener('click', () => {
      popup.remove();
    });

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', (e) => {
        if (!popup.contains(e.target as Node)) {
          popup.remove();
        }
      }, { once: true });
    }, 100);
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