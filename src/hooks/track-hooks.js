/**
 * Hook debugging utilities
 */

// Global hook tracking
let hookCalls = [];
let isRecording = false;

// Start recording hook calls
export function startRecordingHooks() {
  hookCalls = [];
  isRecording = true;
  console.log('🔴 Hook recording started');
}

// Stop recording and print results
export function stopRecordingHooks() {
  isRecording = false;
  console.log('⚫ Hook recording stopped');
  console.log('📊 Hook call trace:', hookCalls);
  return hookCalls;
}

// Clear all recorded hooks
export function clearHookRecording() {
  hookCalls = [];
  console.log('🧹 Hook recording cleared');
}

// Track React hook usage
export function trackHook(hookName, args = []) {
  if (!isRecording) return;
  
  hookCalls.push({
    hook: hookName,
    timestamp: Date.now(),
    args: args.map(arg => 
      typeof arg === 'function' ? '[Function]' : 
      typeof arg === 'object' ? '[Object]' : arg
    )
  });
  
  console.log(`📌 Hook called: ${hookName}`);
}

// Custom hook wrappers
export function useStateTracked(initialValue) {
  trackHook('useState', [initialValue]);
  // This would actually call useState in a real app
  // but we don't need to for this diagnostic utility
  return [initialValue, () => {}];
}

export function useEffectTracked(callback, deps) {
  trackHook('useEffect', deps);
  // This would actually call useEffect in a real app
}

export function useRefTracked(initialValue) {
  trackHook('useRef', [initialValue]);
  // This would actually call useRef in a real app
  return { current: initialValue };
}

// Add more tracked hooks as needed 