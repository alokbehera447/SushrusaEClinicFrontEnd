// Simple toast utility as a replacement for react-hot-toast
// This can be replaced with a proper toast library later

interface ToastOptions {
  duration?: number;
  type?: 'success' | 'error' | 'info';
}

class Toast {
  private container: HTMLElement | null = null;

  private createContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  private createToast(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) {
    const container = this.createContainer();
    
    const toast = document.createElement('div');
    toast.className = `
      px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out
      ${type === 'success' ? 'bg-green-500 text-white' : ''}
      ${type === 'error' ? 'bg-red-500 text-white' : ''}
      ${type === 'info' ? 'bg-blue-500 text-white' : ''}
    `;
    toast.textContent = message;
    
    // Add slide-in animation
    toast.style.transform = 'translateX(100%)';
    container.appendChild(toast);
    
    // Trigger slide-in
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
    });
    
    // Auto remove
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (container.contains(toast)) {
          container.removeChild(toast);
        }
        
        // Remove container if empty
        if (container.children.length === 0) {
          document.body.removeChild(container);
          this.container = null;
        }
      }, 300);
    }, duration);
  }

  success(message: string, options?: ToastOptions) {
    this.createToast(message, 'success', options?.duration);
  }

  error(message: string, options?: ToastOptions) {
    this.createToast(message, 'error', options?.duration);
  }

  info(message: string, options?: ToastOptions) {
    this.createToast(message, 'info', options?.duration);
  }
}

export const toast = new Toast();

// Export for compatibility with react-hot-toast syntax
export default toast;