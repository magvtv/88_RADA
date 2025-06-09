import type { NLPResponse } from "@/types/nlpResponse";

// Environment variables for RunPod endpoints
const RUNPOD_BASE = process.env.NEXT_PUBLIC_RUNPOD_ENDPOINT?.replace('/run', '') || "https://api.runpod.ai/v2/u7biq8pnm54yuf";
const RUNPOD_RUN_ENDPOINT = `${RUNPOD_BASE}/run`;  // Async endpoint
const RUNPOD_SYNC_ENDPOINT = `${RUNPOD_BASE}/runsync`; // Sync endpoint
const RUNPOD_API_KEY = process.env.NEXT_PUBLIC_RUNPOD_API_KEY || "";

// Default to runsync if available
const PREFER_SYNC = process.env.NEXT_PUBLIC_RUNPOD_PREFER_SYNC !== "false";

// Track recent job IDs
let lastJobId: string | null = null;

/**
 * Send a query to the RunPod serverless endpoint
 */
export async function queryRunpod(prompt: string): Promise<NLPResponse> {
  // For any request, we need a timeout
  const controller = new AbortController();
  // Set a generous timeout (3 minutes) for the request
  const timeoutId = setTimeout(() => controller.abort(), 180000);
  
  const requestBody = JSON.stringify({
    "input": {
      "prompt": prompt
    }
  });
  
  const requestConfig = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RUNPOD_API_KEY}`
    },
    signal: controller.signal
  };

  try {
    // Try runsync first if preferred
    if (PREFER_SYNC) {
      try {
        console.log(`Trying RunPod synchronous endpoint: ${RUNPOD_SYNC_ENDPOINT}`);
        
        const syncResponse = await fetch(RUNPOD_SYNC_ENDPOINT, {
          ...requestConfig,
          body: requestBody
        });
        
        // If successful, clear timeout and return the result
        if (syncResponse.ok) {
          clearTimeout(timeoutId);
          const data = await syncResponse.json();
          console.log("RunPod sync response:", JSON.stringify(data, null, 2));
          return processRunpodOutput(data);
        }
        
        console.log(`Sync endpoint failed with status: ${syncResponse.status}, falling back to async...`);
      } catch (syncError) {
        console.warn("Sync endpoint unavailable, falling back to async:", syncError);
      }
    }
    
    // If we get here, either sync was not preferred or it failed
    console.log(`Sending request to RunPod async endpoint: ${RUNPOD_RUN_ENDPOINT}`);
    
    const response = await fetch(RUNPOD_RUN_ENDPOINT, {
      ...requestConfig,
      body: requestBody
    });
    
    // Clear the timeout since we got a response
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`RunPod API error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    // Log the raw structure to understand the format
    console.log("RunPod raw response:", JSON.stringify(data, null, 2));
    
    // Async endpoint response with job ID
    if (data.id && data.status === 'IN_QUEUE') {
      lastJobId = data.id;
      console.log(`Job ${data.id} queued, polling for completion...`);
      
      // Poll for completion
      const result = await pollForCompletion(data.id);
      return processRunpodOutput(result);
    }
    
    // Direct response (either from sync or already completed)
    return processRunpodOutput(data);
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error?.name === 'AbortError') {
      console.error('RunPod request timed out after 3 minutes');
      throw new Error('RunPod request timed out after 3 minutes. The model is likely overloaded.');
    }
    console.error('RunPod API error:', error);
    throw error;
  }
}

/**
 * Process RunPod output into NLPResponse format
 */
function processRunpodOutput(data: any): NLPResponse {
  console.log("Processing RunPod output:", data);
  
  // Check if this is an async job result
  if (data.status === 'COMPLETED' && data.output) {
    data = data.output;
  }
  
  // Try various possible response structures
  if (data && typeof data === 'object') {
    // If output is directly in the response
    if (data.output) {
      if (typeof data.output === 'string') {
        return {
          answer: data.output,
          confidence: 0.9
        };
      } else if (typeof data.output === 'object') {
        return {
          answer: data.output.text || data.output.answer || data.output.response || data.output.message || JSON.stringify(data.output),
          confidence: data.output.confidence || 0.9,
          sources: data.output.sources || [],
          relatedQuestions: data.output.relatedQuestions || []
        };
      }
    }
    
    // Check if the response is direct without 'output' wrapper
    if (data.text || data.answer || data.response || data.message) {
      return {
        answer: data.text || data.answer || data.response || data.message,
        confidence: data.confidence || 0.9,
        sources: data.sources || [],
        relatedQuestions: data.relatedQuestions || []
      };
    }
  }
  
  // Last resort - stringify the whole response
  console.log("Could not parse RunPod response structure:", data);
  return {
    answer: typeof data === 'string' ? data : 
            typeof data === 'object' ? JSON.stringify(data) : 
            "Received a response but couldn't parse it properly.",
    confidence: 0.5
  };
}

/**
 * Poll for completion of an async job
 */
async function pollForCompletion(jobId: string, maxAttempts = 30, interval = 3000): Promise<any> {
  console.log(`Polling for job ${jobId} completion...`);
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    const status = await checkRunpodStatus(jobId);
    
    console.log(`Job ${jobId} status (attempt ${attempts}/${maxAttempts}):`, status.status);
    
    if (status.status === 'COMPLETED') {
      return status;
    } else if (status.status === 'FAILED') {
      throw new Error(`RunPod job failed: ${status.error || 'Unknown error'}`);
    }
    
    // Wait before checking again
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Timeout waiting for RunPod job ${jobId} to complete after ${maxAttempts} attempts`);
}

/**
 * Check status of an async job
 */
export async function checkRunpodStatus(jobId: string): Promise<any> {
  const statusUrl = `https://api.runpod.ai/v2/u7biq8pnm54yuf/status/${jobId}`;
  
  const requestConfig = {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${RUNPOD_API_KEY}`
    }
  };
  
  try {
    const response = await fetch(statusUrl, requestConfig);
    
    if (!response.ok) {
      throw new Error(`Status check error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking RunPod status:', error);
    throw error;
  }
}

/**
 * Get the most recent job ID
 */
export function getLastJobId(): string | null {
  return lastJobId;
}

/**
 * Check the status of the last submitted job
 */
export async function checkLastJobStatus(): Promise<NLPResponse | null> {
  if (!lastJobId) {
    return null;
  }
  
  try {
    const status = await checkRunpodStatus(lastJobId);
    console.log(`Last job ${lastJobId} status:`, status.status);
    
    if (status.status === 'COMPLETED') {
      return processRunpodOutput(status);
    }
    
    return {
      answer: `Your request is still processing (status: ${status.status}). Please check back in a moment.`,
      confidence: 0.5
    };
  } catch (error) {
    console.error('Error checking last job status:', error);
    return {
      answer: "Unable to check the status of your last request. Please try submitting a new query.",
      confidence: 0.5
    };
  }
} 