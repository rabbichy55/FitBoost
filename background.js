// Request notification permission when extension loads
chrome.runtime.onInstalled.addListener(() => {
  console.log("FitBoost extension installed");
  initializeNotifications();
});

function initializeNotifications() {
  chrome.permissions.contains(
    {
      permissions: ["notifications"],
    },
    (result) => {
      if (!result) {
        console.log("Requesting notification permissions...");
        chrome.permissions.request(
          {
            permissions: ["notifications"],
          },
          (granted) => {
            if (granted) {
              console.log("Notification permission granted");
            } else {
              console.log("Notification permission denied");
            }
          }
        );
      } else {
        console.log("Notification permission already granted");
      }
    }
  );
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "fitboost_reminder") {
    console.log("Alarm triggered, creating notification...");
    createBreakNotification();
  }
});

function createBreakNotification() {
  // Create a notification with sound
  const notificationOptions = {
    type: "basic",
    iconUrl: "alarm.png",
    title: "FitBoost - Time for a Break! 🏃‍♂️",
    message: "Take a short break! Stand up, stretch, and look away from your screen.",
    priority: 2,
    requireInteraction: true,
    silent: false, // This ensures sound plays if system allows
    buttons: [
      { title: "Snooze 5 min" },
      { title: "Dismiss" }
    ]
  };

  chrome.notifications.create('fitboost_notification_' + Date.now(), notificationOptions, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.error("Notification error:", chrome.runtime.lastError);
      // Fallback: try creating a simpler notification
      createFallbackNotification();
    } else {
      console.log("Notification created successfully:", notificationId);
      // Play sound programmatically
      playNotificationSound();
    }
  });
}

function createFallbackNotification() {
  // Simpler notification without buttons
  const fallbackOptions = {
    type: "basic",
    iconUrl: "alarm.png",
    title: "FitBoost - Break Time!",
    message: "Time to take a break and stretch!",
    priority: 2,
    requireInteraction: false,
    silent: false
  };

  chrome.notifications.create(fallbackOptions, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.error("Fallback notification also failed:", chrome.runtime.lastError);
    } else {
      console.log("Fallback notification created:", notificationId);
      playNotificationSound();
    }
  });
}

function playNotificationSound() {
  // Create and play notification sound
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    console.log("Notification sound played");
  } catch (error) {
    console.log("Could not play sound:", error);
    // Fallback: Use browser's speech synthesis
    speakNotification();
  }
}

function speakNotification() {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance("Time for a break!");
    utterance.volume = 0.7;
    utterance.rate = 1.0;
    utterance.pitch = 1.2;
    speechSynthesis.speak(utterance);
  }
}

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (notificationId.startsWith('fitboost_notification')) {
    if (buttonIndex === 0) {
      // Snooze button clicked - create alarm for 5 minutes
      chrome.alarms.create("fitboost_reminder", {
        delayInMinutes: 5
      });
      console.log("Snoozed for 5 minutes");
      // Show snooze confirmation
      chrome.notifications.create({
        type: "basic",
        iconUrl: "alarm.png",
        title: "FitBoost",
        message: "Break snoozed for 5 minutes",
        priority: 1
      });
    }
    // Close the original notification
    chrome.notifications.clear(notificationId);
  }
});

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId.startsWith('fitboost_notification')) {
    chrome.notifications.clear(notificationId);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === "reset") {
      chrome.alarms.clear("fitboost_reminder", (wasCleared) => {
        chrome.storage.local.remove(["alarmEndTime"]);
        if (wasCleared) {
          console.log("Alarm cleared successfully");
          sendResponse({ success: true });
        } else {
          sendResponse({ success: true, message: "No active alarm" });
        }
      });
      return true;
    }

    if (request.action === "test_notification") {
      createBreakNotification();
      sendResponse({ success: true });
      return true;
    }

    if (request.time) {
      const minutes = parseInt(request.time);
      if (isNaN(minutes) || minutes <= 0 || minutes > 999) {
        sendResponse({ success: false, error: "Invalid time value" });
        return true;
      }

      createAlarm(minutes);
      sendResponse({ success: true });
    }
  } catch (error) {
    console.error("Error in message handler:", error);
    sendResponse({ success: false, error: error.message });
  }
  return true;
});

function createAlarm(minutes) {
  console.log("Creating alarm for", minutes, "minutes");
  
  // Clear any existing alarm first
  chrome.alarms.clear("fitboost_reminder", () => {
    // Create new alarm
    chrome.alarms.create("fitboost_reminder", {
      delayInMinutes: minutes,
      periodInMinutes: minutes
    });
    
    console.log("FitBoost alarm created successfully");
    
    // Store alarm end time for popup countdown
    const endTime = Date.now() + minutes * 60 * 1000;
    chrome.storage.local.set({ alarmEndTime: endTime });

    // Verify alarm was created
    chrome.alarms.get("fitboost_reminder", (alarm) => {
      if (alarm) {
        console.log("Alarm verified:", alarm);
      } else {
        console.error("Failed to verify alarm creation");
      }
    });
  });
}

// Test function for development
function testAllFeatures() {
  console.log("Testing FitBoost features...");
  createBreakNotification();
}

