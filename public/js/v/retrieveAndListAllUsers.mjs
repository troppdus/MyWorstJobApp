/***************************************************************
 Import classes and data types
 ***************************************************************/
import User, { userTypeEL } from "../m/User.mjs";
import { handleAuthentication } from "./accessControl.mjs";
import { showProgressBar, hideProgressBar } from "../lib/util.mjs";

console.log("retrieveAndListAllUsers.mjs");
/***************************************************************
 Setup and handle UI Authentication
 ***************************************************************/
handleAuthentication();

/***************************************************************
 Declare variables for accessing UI elements
***************************************************************/
const selectOrderEl = document.querySelector("main>div>label>select");
const tableBodyEl = document.querySelector("table#users>tbody");
const progressEl = document.querySelector("progress");

/***************************************************************
 Create table view
 ***************************************************************/
await retrieveAndListAllUsers();

 /***************************************************************
  Handle order selector
  ***************************************************************/
selectOrderEl.addEventListener("change", async function (e) {
  // invoke list with order parameter selected
  await retrieveAndListAllUsers( e.target.value);
});



async function retrieveAndListAllUsers( order) {
  tableBodyEl.innerHTML = "";
  showProgressBar( progressEl);
  // Load data
  const userRecords = await User.retrieveAll( order);
  // Render list of all user records
  // for each user, create a table row with a cell for each attribute
  for (const userRec of userRecords) {
    const row = tableBodyEl.insertRow();
    row.insertCell().textContent = userRec.userID;
    row.insertCell().textContent = userTypeEL.labels[userRec.userType - 1];
    row.insertCell().textContent = userRec.username;
    row.insertCell().textContent = userRec.address;
    row.insertCell().textContent = userRec.dateOfBirth;
    row.insertCell().textContent = userRec.email;
    row.insertCell().textContent = userRec.password;
    row.insertCell().textContent = userRec.phoneNumber;
  }
  hideProgressBar( progressEl);
}
