document.getElementById("execute").addEventListener("click", () => {
  // Get the request IDs entered by the user
  const requestIdsText = document.getElementById("requestIds").value;

  if (!requestIdsText.trim()) {
    alert("Please enter valid Request IDs.");
    return;
  }

  // Split the IDs using newline, space, or comma as a separator
  const requestIds = requestIdsText.split(/[\n, ]+/).filter(id => id.trim().length > 0);

  // Construct commands
  let commands = `click "Request ID"\nclick "Enter Request ID"\n`;

  requestIds.forEach((id) => {
    commands += `enter "${id}" into "Enter Request ID"\n`;
  });

  commands += `click "Show Results"\n`;

  // Send the commands to the background script
  chrome.runtime.sendMessage(
    {
      command: "execute",
      commands: commands
    }
  );
});
