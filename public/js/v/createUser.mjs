/***************************************************************
 Import classes and data types
 ***************************************************************/
 import User, { userTypeEL } from "../m/User.mjs";
 import { handleAuthentication } from "./accessControl.mjs";
 import { fillSelectWithOptions, showProgressBar, hideProgressBar } from "../lib/util.mjs";
 
 
 /***************************************************************
  Setup and handle UI Authentication
  ***************************************************************/
 handleAuthentication();
 /***************************************************************
  Declare variables for accessing UI elements
  ***************************************************************/
 const formEl = document.forms["User"],
   createButton = formEl["commit"],
   progressEl = document.querySelector("progress"),
   userTypeEl = formEl["userType"];
 /***************************************************************
  Set up (choice) widgets
  ***************************************************************/
 // set up the originalLanguage selection list
 fillSelectWithOptions(userTypeEl, userTypeEL.labels);
 
 
 formEl.userID.addEventListener("input", async function () {
  const validationResult = await User.checkUserIDAsId(formEl.userID.value);
  formEl.userID.setCustomValidity(validationResult.message);
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
 userTypeEl.addEventListener("click", function () {
  formEl["userType"].setCustomValidity(User.checkUserType(userTypeEl.value).message);
 });
 
 
 
 /******************************************************************
  Add event listeners for the create/submit button
  ******************************************************************/
 createButton.addEventListener("click", async function () {
   const formEl = document.forms["User"],
     slots = {
     userID: formEl["userID"].value,
     username: formEl["username"].value,
     address: formEl["address"].value,
     dateOfBirth: formEl["dateOfBirth"].value,
     email: formEl["email"].value,
     password: formEl["password"].value,
     phoneNumber: formEl["phoneNumber"].value,
     userType: formEl["userType"].value
   };
   showProgressBar( progressEl);
   formEl["userID"].setCustomValidity(( await User.checkUserIDAsId( slots.userID)).message);
   formEl["username"].setCustomValidity( User.checkUsername( slots.username).message);
   formEl["address"].setCustomValidity( User.checkAddress( slots.address).message);
   formEl["dateOfBirth"].setCustomValidity( User.checkDateOfBirth( slots.dateOfBirth).message);
   formEl["email"].setCustomValidity( User.checkEmail( slots.email).message);
   formEl["password"].setCustomValidity( User.checkPassword( slots.password).message);
   formEl["phoneNumber"].setCustomValidity( User.checkPhoneNumber( slots.phoneNumber).message);
   formEl["userType"].setCustomValidity( User.checkUserType( slots.userType).message);
 
   if (formEl.checkValidity()) {
    await User.add(slots);
    formEl.reset();
  } else {
   console.log("Form is not valid!");
 }
 hideProgressBar( progressEl);
});
formEl.addEventListener("submit", function (e) {
 e.preventDefault();
 formEl.reset();
});