// Import classes and data types
import { handleAuthentication } from "./accessControl.mjs";
import User, { userTypeEL } from "../m/User.mjs";
import { fillSelectWithOptions } from "../lib/util.mjs";
handleAuthentication();
// Load data
const userRecords = await User.retrieveAll();

// Declare variables for accessing UI elements
const formEl = document.forms["User"],
  updateButton = formEl["commit"],
  selectUserEl = formEl["selectUser"],
  userTypeEl = formEl["userType"];

/***************************************************************
 Declare variable to cancel record changes listener, DB-UI sync
 ***************************************************************/
let cancelListener = null;
 
/***************************************************************
 Set up (choice) widgets
 ***************************************************************/
fillSelectWithOptions(selectUserEl, userRecords, {valueProp:"userID", displayProp:"username"});

formEl["userID"].addEventListener("input", function () {
  // do not yet check the ID constraint, only before commit
  formEl["userID"].setCustomValidity(User.checkUserID(formEl["userID"].value).message);
});
formEl["username"].addEventListener("input", function () {
  formEl["username"].setCustomValidity(User.checkUsername(formEl["username"].value).message);
});
formEl["address"].addEventListener("input", function () {
  formEl["address"].setCustomValidity(User.checkAddress(formEl["address"].value).message);
});
formEl["dateOfBirth"].addEventListener("input", function () {
  formEl["dateOfBirth"].setCustomValidity(User.checkDateOfBirth(formEl["dateOfBirth"].value).message);
});
formEl["email"].addEventListener("input", function () {
  formEl["email"].setCustomValidity(User.checkEmail(formEl["email"].value).message);
});
formEl["password"].addEventListener("input", function () {
  formEl["password"].setCustomValidity(User.checkPassword(formEl["password"].value).message);
});
formEl["phoneNumber"].addEventListener("input", function () {
  formEl["phoneNumber"].setCustomValidity(User.checkPhoneNumber(formEl["phoneNumber"].value).message);
});
formEl["userType"].addEventListener("click", function () {
  formEl["userType"].setCustomValidity(User.checkUserType(formEl["userType"].value).message);
});
// fillSelectWithOptionsUpd(userRecords, selectUserEl, "userID", "username");

// when a user is selected, fill the form with its data
selectUserEl.addEventListener("change", async function () {
  const userID = selectUserEl.value;
  fillSelectWithOptions(userTypeEl, userTypeEL.labels);
  if (userID) {
    // retrieve up-to-date user record
    const userRec = await User.retrieve(userID);
    for (const field of ["userID", "username", "address", "dateOfBirth", 
    "email", "password", "phoneNumber", "userType"]) {
      if (field in ["salary", "userType"]) {
        formEl[field].value = userRec[field] !== undefined ? parseInt(userRec[field]) : "";
      } else {
        formEl[field].value = userRec[field] !== undefined ? userRec[field] : "";
        // delete custom validation error message which may have been set before
        formEl[field].setCustomValidity("");
      }
          /** Setup listener on the selected book record synchronising DB with UI **/
    // cancel record listener if a previous listener exists
    if (cancelListener) cancelListener();
    // add listener to selected user, returning the function to cancel listener
    cancelListener = await User.observeChanges( userID);
    }
  } else {
    formEl.reset();
  }
});

// Add event listeners for the update/submit button
// set an event handler for the update button
updateButton.addEventListener("click", async function () {
  const formEl = document.forms["User"],
  selectUserEl = formEl["selectUser"],
  userIDRef = selectUserEl.value;
  if (!userIDRef) return;
  const slots = {
    userID: formEl["userID"].value,
    username: formEl["username"].value,
    address: formEl["address"].value,
    dateOfBirth: formEl["dateOfBirth"].value,
    email: formEl["email"].value,
    password: formEl["password"].value,
    phoneNumber: formEl["phoneNumber"].value,
    userType: formEl["userType"].value
  };
   // set error messages in case of constraint violations
  formEl["username"].addEventListener("input", function () {
    formEl["username"].setCustomValidity(
      User.checkUsername(slots.username).message);
  });
  formEl["address"].addEventListener("input", function () {
    formEl["address"].setCustomValidity(
      User.checkAddress(slots.address).message);
  });
  formEl["dateOfBirth"].addEventListener("input", function () {
    formEl["dateOfBirth"].setCustomValidity(
      User.checkDateOfBirth(slots.dateOfBirth).message);
  });
  formEl["email"].addEventListener("input", function () {
    formEl["email"].setCustomValidity(
      User.checkEmail(slots.email).message);
  });
  formEl["password"].addEventListener("input", function () {
    formEl["password"].setCustomValidity(
      User.checkPassword(slots.password).message);
  });
  formEl["phoneNumber"].addEventListener("input", function () {
    formEl["phoneNumber"].setCustomValidity(
      User.checkPhoneNumber(slots.phoneNumber).message);
  });
  formEl["userType"].addEventListener("input", function () {
    formEl["userType"].setCustomValidity(
      User.checkUserType(slots.userType).message);
  });
  if (formEl.checkValidity()) {
        // cancel DB-UI sync listener
        if (cancelListener) cancelListener();
    User.update(slots);
    // update the selection list option
    selectUserEl.options[selectUserEl.selectedIndex].text = slots.username;
    formEl.reset();
  }
});

// neutralize the submit event
formEl.addEventListener("submit", function (e) {
  e.preventDefault();
});
// set event to cancel DB listener when the browser window/tab is closed
window.addEventListener("beforeunload", function () {
  if (cancelListener) cancelListener();
});
