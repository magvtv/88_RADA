import { apiPost } from "./api";

const ENDPOINTS = {
  synthesize: "/tts/synthesize",
};

// Service functions
export async function synthesizeSpeech(
  text: string,
  voice = "default"
): Promise<ArrayBuffer> {
  try {
    // In a real implementation, this would call the API
    // return await apiPost<ArrayBuffer>(
    //   ENDPOINTS.synthesize,
    //   { text, voice },
    //   { responseType: "arraybuffer" }
    // );

    // For development, we'll use the browser's built-in TTS API if available
    // This is just a placeholder and won't return actual audio data
    return new Promise((resolve, reject) => {
      if ("speechSynthesis" in window) {
        // Browser TTS is available, but we can't return audio data from it
        // We just play it directly
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
          // Resolve with an empty ArrayBuffer as a placeholder
          resolve(new ArrayBuffer(0));
        };
        utterance.onerror = (error) => {
          reject(new Error(`Speech synthesis error: ${error.error}`));
        };
        window.speechSynthesis.speak(utterance);
      } else {
        // Browser TTS is not available
        console.warn("Browser TTS is not available. Using mock TTS placeholder.");
        setTimeout(() => {
          // Resolve with an empty ArrayBuffer as a placeholder
          resolve(new ArrayBuffer(0));
        }, 500);
      }
    });
  } catch (error) {
    console.error("Failed to synthesize speech:", error);
    throw error;
  }
}

// Play a text-to-speech message directly
export function speakText(text: string, voice = "default"): void {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);

    // Set voice if specified and available
    if (voice !== "default") {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find((v) => v.name === voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
  } else {
    console.warn("Browser TTS is not available.");
  }
}

// Get available voices
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if ("speechSynthesis" in window) {
      // Chrome requires waiting for the voiceschanged event
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          resolve(window.speechSynthesis.getVoices());
        };
      }
    } else {
      resolve([]);
    }
  });
}
