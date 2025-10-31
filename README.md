# FitBoost

([Video demo](https://youtu.be/9pcToFSSlQ8?si=Puibx7Qw1aSG7SHR))

## Description

Spending long hours in front of your computer can take a toll on your eyes, posture, and overall health. This Chrome Extension helps you maintain a healthier work routine by reminding you to take short breaks, stand up, stretch, hydrate, and rest your eyes at regular intervals.

You can easily customize the reminder interval — for example, every 25 or 30 minutes — to fit your workflow and comfort level.

By using this extension, you can:

👀 Reduce eye strain and fatigue

💧 Stay properly hydrated throughout the day

🪑 Avoid sitting for too long

💪 Maintain better posture and productivity

Stay healthy, stay focused — one mindful break at a time.


FitBoost is a comprehensive Chrome extension designed to promote healthier work habits by reminding users to take regular breaks from prolonged computer usage. In today's digital age, where many professionals and students spend extensive hours in front of screens, this extension addresses critical health concerns including eye strain, poor posture, and sedentary lifestyle effects.

The extension operates on a simple yet effective principle: customizable timed reminders that encourage users to stand up, stretch, hydrate, and rest their eyes at regular intervals. What sets FitBoost apart is its intelligent approach to break management, offering different types of breaks tailored to specific needs rather than generic reminders.

##File Structure and Implementation

manifest.json
The foundation of any Chrome extension, this configuration file defines the extension's properties, permissions, and structure. I chose Manifest V3 for its enhanced security and performance benefits over V2. The file specifies necessary permissions including alarms for scheduling break reminders, notifications for displaying break alerts, and storage for saving user preferences. The icons are configured for multiple sizes to ensure crisp display across different Chrome UI elements.

background.js
This service worker serves as the extension's brain, handling all background processes. The implementation includes:

Alarm Management: Using Chrome's alarm API to schedule and trigger break reminders at user-defined intervals. The alarm system is designed to be persistent, surviving browser restarts and computer sleep cycles.

Notification System: Creates rich notifications with interactive buttons for snoozing or acknowledging breaks. I implemented a fallback system that attempts multiple notification strategies if the primary method fails.

Break Type Rotation: Instead of repetitive reminders, the extension cycles through different break types (stretch, eye rest, walking, hydration) to keep the experience engaging and comprehensive.

State Management: Tracks break counts and maintains session persistence, allowing users to see their progress throughout the day.

popup.html
The user interface presented when clicking the extension icon. I designed this with user experience as the priority:

Clean Layout: Organized in a single-column layout that's intuitive and easy to navigate on first use.

Responsive Design: Uses CSS flexbox for proper element alignment across different screen sizes.

Accessibility Considerations: Proper label associations, sufficient color contrast, and clear visual feedback for all interactive elements.

The interface includes interval configuration, break type selection, and real-time status display, providing all essential controls without overwhelming the user.

popup.js
Handles all user interactions and popup functionality:

Settings Management: Loads and saves user preferences using Chrome's storage API, ensuring settings persist between browser sessions.

Real-time Updates: Continuously monitors and displays the time remaining until the next break, providing clear feedback that the timer is active.

Error Handling: Comprehensive validation and user-friendly error messages for invalid inputs.

State Synchronization: Maintains consistency between the popup interface and background processes, ensuring the UI accurately reflects the current timer state.

style.css
The styling layer that brings the extension to life visually:

Modern Aesthetic: Uses a gradient background and clean typography to create a professional appearance.

Interactive Elements: Hover effects and transitions that make the interface feel responsive and polished.

Color Psychology: Green for start actions (positive), orange for stop (caution), and blue for test actions (informational).

Accessibility Focus: High contrast ratios and clear visual states for all interactive elements.

Design Decisions and Considerations
Architecture Choices
I opted for a service worker-based background script instead of a persistent background page. This decision significantly reduces memory usage and improves overall browser performance while maintaining all necessary functionality. The event-driven architecture ensures the extension only consumes resources when actively needed.

Notification Strategy
After testing various approaches, I implemented a multi-layered notification system:

Rich Notifications: Primary method using Chrome's notification API with interactive buttons

Visual Distinction: Different icons and messages for various break types

Snooze Functionality: 5-minute snooze option for when breaks are inconvenient

This approach balances effectiveness with user convenience, acknowledging that sometimes users genuinely cannot take breaks immediately.

Break Type System
Rather than generic reminders, I implemented categorized breaks:

Stretch Breaks: Focus on relieving muscle tension and improving circulation

Eye Rest Breaks: Specifically target digital eye strain

Walking Breaks: Combat sedentary behavior

Hydration Reminders: Address often-neglected hydration needs

This system ensures comprehensive health coverage rather than just addressing one aspect of prolonged sitting.

User Experience Considerations
Minimum 5-Minute Interval: Enforced to prevent overly frequent interruptions that could frustrate users and undermine the extension's purpose.

One-Click Testing: Immediate notification testing helps users verify their system settings work correctly before relying on the extension.

Persistent State: The extension remembers settings and running state, providing a seamless experience across browser sessions.

Technical Implementation Details
Error Resilience: The code includes extensive error handling for common failure points like permission denials and storage limitations.

Performance Optimization: Efficient alarm management prevents multiple simultaneous timers and ensures accurate timing.

Cross-Browser Compatibility: While optimized for Chrome, the extension follows web standards that make it potentially compatible with other Chromium-based browsers.

Installation and Usage
The installation process is streamlined for users unfamiliar with developer tools. The step-by-step guide in the README walks users through the process of loading an unpacked extension, with particular attention to common pain points like enabling developer mode and locating the load unpacked button.

Future Enhancement Possibilities
While the current implementation is fully functional, several enhancements could further improve the extension:

Break statistics and progress tracking

Customizable break duration suggestions

Integration with productivity techniques like Pomodoro

Sync capabilities across multiple devices

Advanced scheduling for different times of day

FitBoost represents a thoughtful approach to addressing modern workplace health concerns through technology. By combining reliable technical implementation with user-centered design, it provides a valuable tool for anyone looking to maintain better health while working on computers.

## Getting Started

### Dependencies

* Any Chromium-based browser. For example: Google Chrome, Microsoft Edge, Arc

### Installing the extension

* **Step 1:** Click on Code
* **Step 2:** Click on "Download ZIP"
* **Step 3:** Unzip the downloaded folder
* **Step 4:** Go to [chrome://extensions/](chrome://extensions/)
* **Step 5:** Turn on Developer Mode from the right top corner
* **Step 6:** Click on "Load Unpacked" from the left-top corner
* **Step 7:** Select the extension's folder that you just unzipped
* **Step 8:** Pin the "FitBoost" extension by clicking on the extension icon on the right-top of your browser
* **Step 9:** Click on "FitBoost" extension
* **Step 10:** Click on the "Start" button

That's it. You will be reminded to take a break, stand, and look away every 20 or 25 minutes whatever you prefer.

