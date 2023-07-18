/***************************************************************
 Import classes and data types
 ***************************************************************/
import User from "../m/User.mjs";
import { handleAuthentication } from "./accessControl.mjs";

handleAuthentication();

/***************************************************************
 Load data
 ***************************************************************/
const userRecords = await User.retrieveAll();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["User"],
  deleteButton = formEl["commit"],
  selectUserEl = formEl["selectUser"];

/***************************************************************
 Set up select element
 ***************************************************************/
 for (const userRec of userRecords) {
  const optionEl = document.createElement("option");
  optionEl.text = `${userRec.username}`;
  optionEl.value = userRec.userID;
  selectUserEl.add(optionEl, null);
}

/******************************************************************
 Add event listeners for the delete/submit button
 ******************************************************************/
// set an event handler for the delete button
deleteButton.addEventListener("click", async function () {
  const userID = selectUserEl.value;
  if (!userID) return;
  // get the selected option text
  const selectedText = selectUserEl.options[selectUserEl.selectedIndex].text;
  if (confirm(`Do you really want to delete this user record: ${selectedText}?`)) {
    await User.destroy(userID);
    // remove deleted user from select options
    selectUserEl.remove(selectUserEl.selectedIndex);
  }
});