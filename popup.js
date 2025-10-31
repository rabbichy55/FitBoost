const start = document.getElementById("start");
const timer = document.getElementById("timer");
const reset = document.getElementById("reset");
const test = document.getElementById("test");
const countdownDisplay = document.getElementById("countdown");

// Load saved timer value
chrome.storage.local.get(["timerValue"], (result) => {
  if (result.timerValue) {
    timer.value = result.timerValue;
  }
});

// Start timer
start.addEventListener("click", () => {
  const minutes = parseInt(timer.value);
  
  if (isNaN(minutes) || minutes < 1 || minutes > 999) {
    showMessage("Please enter a number between 1-999", true);
    return;
  }

  start.disabled = true;
  start.textContent = "Starting...";

  chrome.runtime.sendMessage({ time: minutes }, (response) => {
    if (response && response.success) {
      // Save the timer value
      chrome.storage.local.set({ timerValue: minutes });
      showMessage(`Timer set for ${minutes} minutes!`);
      start.textContent = "Started!";
      timer.disabled = true;
      updateCountdown();
    } else {
      showMessage(response?.error || "Failed to start timer", true);
      start.disabled = false;
      start.textContent = "Start Timer";
    }
  });
});

// Reset timer
reset.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "reset" }, () => {
    timer.value = "25";
    timer.disabled = false;
    chrome.storage.local.set({ timerValue: 25 });
    start.disabled = false;
    start.textContent = "Start Timer";
    countdownDisplay.textContent = "";
    showMessage("Timer reset");
  });
});

// Test notification
test.addEventListener("click", () => {
  test.disabled = true;
  test.textContent = "Testing...";
  
  chrome.runtime.sendMessage({ action: "test_notification" }, () => {
    showMessage("Test notification sent!");
    setTimeout(() => {
      test.disabled = false;
      test.textContent = "Test Notification";
    }, 2000);
  });
});

// Update countdown display
function updateCountdown() {
  chrome.storage.local.get(["alarmEndTime"], (result) => {
    if (!result.alarmEndTime) {
      countdownDisplay.textContent = "";
      return;
    }

    const update = () => {
      const now = Date.now();
      const timeLeft = result.alarmEndTime - now;

      if (timeLeft <= 0) {
        countdownDisplay.textContent = "Time for a break!";
        countdownDisplay.className = "countdown-ended";
        timer.disabled = false;
        start.disabled = false;
        start.textContent = "Start Timer";
        return;
      }

      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      
      countdownDisplay.textContent = `Next break: ${minutes}m ${seconds}s`;
      countdownDisplay.className = "countdown-active";
      setTimeout(update, 1000);
    };

    update();
  });
}

// Show message
function showMessage(message, isError = false) {
  countdownDisplay.textContent = message;
  countdownDisplay.className = isError ? "countdown-error" : "countdown-message";
  
  setTimeout(() => {
    if (!countdownDisplay.textContent.includes("Next break") && 
        !countdownDisplay.textContent.includes("Time for a break")) {
      countdownDisplay.textContent = "";
    }
  }, 3000);
}

// Check for existing timer when popup opens
chrome.alarms.get("fitboost_reminder", (alarm) => {
  if (alarm) {
    timer.disabled = true;
    start.disabled = true;
    start.textContent = "Running...";
    updateCountdown();
  }
});

// Initial countdown update
updateCountdown();
