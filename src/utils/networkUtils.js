// Network utility for handling connectivity issues
export const networkUtils = {
  // Check if we're in a browser environment
  isBrowser: () => typeof window !== 'undefined',
  
  // Simplified connectivity check for production
  async checkConnectivity() {
    if (!this.isBrowser()) return false;
    
    try {
      // Use navigator.onLine as primary check
      if (!navigator.onLine) return false;
      
      // Simple fetch test with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      console.warn('Connectivity check failed:', error);
      return navigator.onLine; // Fallback to browser's online status
    }
  },
  
  // Wait for network to be available
  async waitForNetwork(maxWaitTime = 10000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      if (await this.checkConnectivity()) {
        return true;
      }
      // Wait 1 second before next check
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return false;
  },
  
  // Retry function with exponential backoff
  async retryWithBackoff(fn, maxRetries = 2, baseDelay = 500) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        const delay = baseDelay * Math.pow(2, i);
        console.warn(`Attempt ${i + 1} failed, retrying in ${delay}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
};

export default networkUtils;