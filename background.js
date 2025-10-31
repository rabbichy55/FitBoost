
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
  const notificationOptions = {
    type: "basic",
    iconUrl: "alarm.png",
    title: "FitBoost - Time for a Break! 🏃‍♂️",
    message: "Take a short break! Stand up, stretch, and look away from your screen.",
    priority: 2,
    requireInteraction: true,
    buttons: [
      { title: "Snooze 5 min" },
      { title: "Dismiss" }
    ]
  };

  chrome.notifications.create('fitboost_notification', notificationOptions, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.error("Notification error:", chrome.runtime.lastError);
    } else {
      console.log("Notification created successfully:", notificationId);
    }
  });
}

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (notificationId === 'fitboost_notification') {
    if (buttonIndex === 0) {
      // Snooze button clicked - create alarm for 5 minutes
      chrome.alarms.create("fitboost_reminder", {
        delayInMinutes: 5
      });
      console.log("Snoozed for 5 minutes");
    }
    // Dismiss button - notification will close automatically
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

// Test notification function (optional - for debugging)
function testNotification() {
  createBreakNotification();
}

// Uncomment the line below to test notifications during development
// testNotification();
