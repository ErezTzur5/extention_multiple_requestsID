chrome.runtime.onInstalled.addListener(() => {
  // Extension installed
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === "execute") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: executeTestRigorCommands,
        args: [request.commands]
      });
    });
    sendResponse({ status: "Commands executed" });
  }
});

async function executeTestRigorCommands(commands) {
  const lines = commands.split("\n");

  for (const line of lines) {
    if (line.startsWith("click")) {
      const selector = line.match(/"([^"]+)"/)[1];

      // Locate the element by text content, aria-label, title, or class/label for dropdown
      let xpath;
      if (selector === "Request ID") {
        // Precise XPath for the Request ID element in dropdown
        xpath = `//div[@label="Request ID" and contains(@class, "ant-select-item-option-content")]`;
      } else {
        // General XPath for other elements
        xpath = `//*[text()="${selector}" or @aria-label="${selector}" or @title="${selector}"]`;
      }

      const element = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;

      if (element) {
        // Simulate a full user interaction
        element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
        element.dispatchEvent(new FocusEvent("focus", { bubbles: true, cancelable: true }));
        element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
        element.click();  // Perform the click action
      }
    } else if (line.startsWith("enter")) {
      const match = line.match(/enter\s+"([^"]+)"\s+into\s+"([^"]+)"/);
      if (match) {
        const [_, text, inputName] = match;

        // XPath to find all matching inputs
        const xpath = `//input[contains(@class, "ant-select-selection-search-input") and @role="combobox" and starts-with(@aria-owns, "rc_select_")]`;

        // Wait for elements to appear
        const elements = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        let targetElement = null;

        for (let i = 0; i < elements.snapshotLength; i++) {
          const element = elements.snapshotItem(i);

          // Example: Check for active state (aria-expanded="true")
          if (element.getAttribute("aria-expanded") === "true") {
            targetElement = element;
            break;
          }
        }

        if (targetElement) {
          targetElement.focus();
          targetElement.value = text;
          targetElement.dispatchEvent(new Event("input", { bubbles: true }));
          targetElement.dispatchEvent(new Event("change", { bubbles: true }));

          // Simulate pressing the Enter key more effectively by blurring the field afterward
          targetElement.dispatchEvent(new KeyboardEvent("keydown", {
            key: "Enter",
            keyCode: 13,
            code: "Enter",
            which: 13,
            bubbles: true,
            cancelable: true
          }));

          targetElement.dispatchEvent(new KeyboardEvent("keyup", {
            key: "Enter",
            keyCode: 13,
            code: "Enter",
            which: 13,
            bubbles: true,
            cancelable: true
          }));


          targetElement.blur();
        }
      }
    }

    // Add a delay between each action to observe
    await new Promise(resolve => setTimeout(resolve, 500));  // Delay of half a second
  }
}
