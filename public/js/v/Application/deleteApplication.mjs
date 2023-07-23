import Application from "../../m/Application.mjs";

import { handleAuthentication } from "../accessControl.mjs";

handleAuthentication();

const deleteFormEl = document.forms["Application"],
  deleteButton = deleteFormEl["commit"],
  selectAppEl = deleteFormEl["applicationID"];
deleteFormEl.reset();

selectAppEl.addEventListener("input", async function () {
  const responseValidation = await Application.checkApplicationIDAsIdRef(selectAppEl.value);
  selectAppEl.setCustomValidity(responseValidation.message);
});

// Commit delete only if all form field values are valid
if (deleteFormEl.checkValidity()) {
  // Handle Delete button click events
  deleteButton.addEventListener("click", async function () {
    const applicationIDRef = selectAppEl.value;
    if (!applicationIDRef) return;
    if (confirm("Do you really want to delete this application?")) {
      await Application.destroy(applicationIDRef);
      deleteFormEl.reset();
    }
  });
}






