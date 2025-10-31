const start = document.getElementById("start");
const timer = document.getElementById("timer");
const reset = document.getElementById("reset");
const test = document.getElementById("test");
const countdownDisplay = document.getElementById("countdown");
const statusDisplay = document.getElementById("status");

let countdownInterval;

// Load saved timer value when popup opens
chrome.storage.local.get(["timerValue"], (result) => {
  if (result.timerValue) {
    timer.value = result.timerValue;
  }
});

function updateCountdown() {
  chrome.storage.local.get(["alarmEndTime"], (result) => {
    if (!result.alarmEndTime) {
      clearInterval(countdownInterval);
      countdownDisplay.textContent = "";
      countdownDisplay.classList.remove("countdown-active", "countdown-ended");
      timer.disabled = false;
      return;
    }

    const endTime = result.alarmEndTime;
    
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      const now = Date.now();
      const timeLeft = endTime - now;

      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        countdownDisplay.textContent = "Time for a break!";
        countdownDisplay.classList.add("countdown-ended");
        countdownDisplay.classList.remove("countdown-active");
        timer.disabled = false;
        return;
      }

      const minutesLeft = Math.floor(timeLeft / 60000);
      const secondsLeft = Math.floor((timeLeft % 60000) / 1000);

      countdownDisplay.textContent = `Next break in: ${minutesLeft}m ${secondsLeft}s`;
      countdownDisplay.classList.add("countdown-active");
      countdownDisplay.classList.remove("countdown-ended");
      timer.disabled = true;
    }, 1000);
  });
}

function showStatus(message, isError = false) {
  statusDisplay.textContent = message;
  statusDisplay.className = isError ? 'status-error' : 'status-message';
  setTimeout(() => {
    statusDisplay.textContent = '';
    statusDisplay.className = 'status-message';
  }, 3000);
}

reset.addEventListener("click", () => {
  timer.value = "25";
  chrome.storage.local.remove(["timerValue", "alarmEndTime"]);
  timer.disabled = false;
  clearInterval(countdownInterval);
  countdownDisplay.textContent = "";
  countdownDisplay.classList.remove("countdown-active", "countdown-ended");

  chrome.runtime.sendMessage({ action: "reset" }, (response) => {
    if (response && response.success) {
      showStatus("Timer reset successfully");
    }
  });
});

start.addEventListener("click", () => {
  const minutes = parseInt(timer.value);

  if (isNaN(minutes) || minutes <= 0) {
    showStatus("Please enter a valid time (1-999 minutes)", true);
    return;
  }

  if (minutes > 999) {
    showStatus("Maximum time allowed is 999 minutes", true);
    return;
  }

  // Save timer value when starting
  chrome.storage.local.set({ timerValue: minutes });

  start.disabled = true;
  start.textContent = "Starting...";

  chrome.runtime.sendMessage({ time: minutes }, (response) => {
    if (response && response.success) {
      timer.disabled = true;
      updateCountdown();
      start.textContent = "Timer Started";
      showStatus(`Timer set for ${minutes} minutes`);
      setTimeout(() => {
        start.disabled = false;
        start.textContent = "Start Timer";
      }, 2000);
    } else {
      start.disabled = false;
      start.textContent = "Start Timer";
      showStatus(response?.error || "Failed to start timer", true);
    }
  });
});

test.addEventListener("click", () => {
  test.disabled = true;
  test.textContent = "Testing...";
  
  chrome.runtime.sendMessage({ action: "test_notification" }, (response) => {
    if (response && response.success) {
      showStatus("Test notification sent!");
    } else {
      showStatus("Failed to send test notification", true);
    }
    
    setTimeout(() => {
      test.disabled = false;
      test.textContent = "Test Notification";
    }, 2000);
  });
});

// Check for existing alarm when popup opens
chrome.alarms.get("fitboost_reminder", (alarm) => {
  if (alarm) {
    timer.disabled = true;
    updateCountdown();
  } else {
    timer.disabled = false;
  }
});

// Update countdown immediately when popup opens
updateCountdown();
