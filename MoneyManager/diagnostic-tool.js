/**
 * Diagnostic script to identify source of persistent reports data
 * Run this in browser console to check various storage locations
 */

const DiagnosticTool = {
  checkAllStorageLocations() {
    console.log('🔍 Checking all possible data storage locations...');
    console.log('==========================================');
    
    // Check localStorage
    console.log('\n📦 LocalStorage:');
    if (localStorage.length === 0) {
      console.log('  ✅ Empty');
    } else {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`  ${key}:`, value.substring(0, 100) + (value.length > 100 ? '...' : ''));
      }
    }
    
    // Check sessionStorage
    console.log('\n🔄 SessionStorage:');
    if (sessionStorage.length === 0) {
      console.log('  ✅ Empty');
    } else {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
        console.log(`  ${key}:`, value.substring(0, 100) + (value.length > 100 ? '...' : ''));
      }
    }
    
    // Check cookies
    console.log('\n🍪 Cookies:');
    if (document.cookie === '') {
      console.log('  ✅ No cookies');
    } else {
      const cookies = document.cookie.split(';');
      cookies.forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        console.log(`  ${name}:`, value?.substring(0, 50) + (value?.length > 50 ? '...' : ''));
      });
    }
    
    // Check IndexedDB
    console.log('\n💾 IndexedDB:');
    if (typeof indexedDB !== 'undefined') {
      indexedDB.databases().then(databases => {
        if (databases.length === 0) {
          console.log('  ✅ No IndexedDB databases');
        } else {
          console.log('  Databases found:', databases.map(db => db.name));
        }
      }).catch(err => {
        console.log('  ❌ Could not check IndexedDB:', err.message);
      });
    } else {
      console.log('  ❌ IndexedDB not available');
    }
    
    // Check if there are any global variables that might contain report data
    console.log('\n🌐 Global Variables Check:');
    const globalKeys = Object.keys(window).filter(key => 
      key.toLowerCase().includes('report') || 
      key.toLowerCase().includes('data') ||
      key.toLowerCase().includes('cache')
    );
    if (globalKeys.length === 0) {
      console.log('  ✅ No suspicious global variables');
    } else {
      console.log('  Found:', globalKeys);
      globalKeys.forEach(key => {
        console.log(`  ${key}:`, typeof window[key]);
      });
    }
  },
  
  checkNetworkRequests() {
    console.log('\n🌐 Monitoring Network Requests...');
    console.log('==========================================');
    
    // Override fetch to monitor requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      console.log('📡 Fetch Request:', args[0]);
      return originalFetch.apply(this, args)
        .then(response => {
          console.log('📡 Fetch Response:', response.status, response.statusText, args[0]);
          return response;
        })
        .catch(error => {
          console.log('📡 Fetch Error:', error.message, args[0]);
          throw error;
        });
    };
    
    console.log('✅ Network monitoring enabled. Refresh the page or trigger actions to see requests.');
  },
  
  clearAllCache() {
    console.log('\n🧹 Clearing all possible cache locations...');
    console.log('==========================================');
    
    // Clear localStorage
    const localStorageCount = localStorage.length;
    localStorage.clear();
    console.log(`✅ LocalStorage cleared (${localStorageCount} items removed)`);
    
    // Clear sessionStorage
    const sessionStorageCount = sessionStorage.length;
    sessionStorage.clear();
    console.log(`✅ SessionStorage cleared (${sessionStorageCount} items removed)`);
    
    // Clear cookies (only those we can access)
    const cookies = document.cookie.split(';');
    let cookiesCleared = 0;
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      cookiesCleared++;
    });
    console.log(`✅ Cookies cleared (${cookiesCleared} items)`);
    
    // Try to clear caches
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        console.log('✅ Service Worker caches cleared');
      }).catch(err => {
        console.log('❌ Could not clear caches:', err.message);
      });
    }
    
    console.log('\n🔄 Please refresh the page to see if the persistent data is gone.');
  },
  
  runFullDiagnostic() {
    console.log('🚀 Running Full Diagnostic...');
    this.checkAllStorageLocations();
    this.checkNetworkRequests();
    
    console.log('\n📋 Next Steps:');
    console.log('1. Check the console output above for any stored data');
    console.log('2. Look for any network requests when the page loads');
    console.log('3. Try DiagnosticTool.clearAllCache() if you find cached data');
    console.log('4. Check if the backend API /api/reports/list is returning the persistent data');
  }
};

// Make available globally
window.DiagnosticTool = DiagnosticTool;

console.log(`
🔧 Diagnostic Tool Ready!

Available commands:
- DiagnosticTool.runFullDiagnostic()     - Run complete check
- DiagnosticTool.checkAllStorageLocations() - Check storage only
- DiagnosticTool.checkNetworkRequests()  - Monitor network traffic
- DiagnosticTool.clearAllCache()         - Clear all cache/storage

Start with: DiagnosticTool.runFullDiagnostic()
`);
