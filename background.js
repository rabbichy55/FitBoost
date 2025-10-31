// Background script for FitBoost - Simple and reliable
chrome.runtime.onInstalled.addListener(() => {
  console.log("FitBoost extension installed");
});

// Handle alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "fitboost_reminder") {
    console.log("Break reminder triggered");
    showNotification();
  }
});

// Show notification function
function showNotification() {
  const notificationId = "fitboost_" + Date.now();
  
  chrome.notifications.create(notificationId, {
    type: "basic",
    iconUrl: "alarm.png",
    title: "FitBoost - Break Time! 🏃‍♂️",
    message: "Time to take a break! Stand up, stretch, and look away from your screen.",
    priority: 2,
    requireInteraction: true
  }, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.error("Notification error:", chrome.runtime.lastError);
    } else {
      console.log("Notification shown successfully");
    }
  });
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received:", request);
  
  if (request.action === "reset") {
    chrome.alarms.clear("fitboost_reminder", (wasCleared) => {
      chrome.storage.local.remove(["alarmEndTime"]);
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === "test_notification") {
    showNotification();
    sendResponse({ success: true });
    return true;
  }

  if (request.time) {
    const minutes = parseInt(request.time);
    if (isNaN(minutes) || minutes <= 0 || minutes > 999) {
      sendResponse({ success: false, error: "Please enter a valid number between 1-999" });
      return true;
    }

    // Clear existing alarm and create new one
    chrome.alarms.clear("fitboost_reminder", () => {
      chrome.alarms.create("fitboost_reminder", {
        delayInMinutes: minutes,
        periodInMinutes: minutes
      });
      
      // Store the end time for popup countdown
      const endTime = Date.now() + minutes * 60 * 1000;
      chrome.storage.local.set({ alarmEndTime: endTime });
      
      console.log(`Alarm set for ${minutes} minutes`);
      sendResponse({ success: true });
    });
    return true;
  }
});
