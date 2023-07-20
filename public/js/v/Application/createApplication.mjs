/***************************************************************
 Import classes and data types
 ***************************************************************/
 import Application, {ApplicationStatusEL} from "../../m/Application.mjs";
 import { handleAuthentication } from "../accessControl.mjs";
 import { fillSelectWithOptions, showProgressBar, hideProgressBar } from "../../lib/util.mjs";
 
 
 /***************************************************************
  Setup and handle UI Authentication
  ***************************************************************/
 handleAuthentication();
 
 /***************************************************************
  Declare variables for accessing UI elements
  ***************************************************************/
 const formEl = document.forms["Application"],
   createButton = formEl["commit"],
   progressEl = document.querySelector("progress"),
   statusEl = formEl["status"];
 
 
 /***************************************************************
  Set up (choice) widgets
  ***************************************************************/
 // Set up the status selection list
//  const statusOptions = ["Pending", "Approved", "Rejected"];
 fillSelectWithOptions(statusEl, ApplicationStatusEL.labels);
 
 
 /***************************************************************
  Add event listeners for input validation
  ***************************************************************/
  formEl["applicationID"].addEventListener("input", function () {
    formEl["applicationID"].setCustomValidity(Application.checkApplicationID(formEl["applicationID"].value).message);
  });

  formEl["applicationName"].addEventListener("input", function () {
    formEl["applicationName"].setCustomValidity(Application.checkApplicationName(formEl["applicationName"].value).message);
  });

  formEl["applicationEmail"].addEventListener("input", function () {
    formEl["applicationEmail"].setCustomValidity(Application.checkApplicationEmail(formEl["applicationEmail"].value).message);
  });

  formEl["applicationPhoneNumber"].addEventListener("input", function () {
    formEl["applicationPhoneNumber"].setCustomValidity(Application.checkApplicationPhoneNumber(formEl["applicationPhoneNumber"].value).message);
  });

  formEl["description"].addEventListener("input", function () {
    formEl["description"].setCustomValidity(Application.checkDescription(formEl["description"].value).message);
  });

  statusEl.addEventListener("click", function () {
    formEl["status"].setCustomValidity(Application.checkStatus(statusEl.value).message);
  });


 
 
 /***************************************************************
  Add event listeners for the create/submit button
  ***************************************************************/
 createButton.addEventListener("click", async function () {
   const formEl = document.forms["Application"],
     slots = {
       applicationID: formEl["applicationID"].value,
       applicationName: formEl["applicationName"].value,
       applicationEmail: formEl["applicationEmail"].value,
       applicationPhoneNumber: formEl["applicationPhoneNumber"].value,
       description: formEl["description"].value,
       status: formEl["status"].value,
       jobID: formEl["jobID"].value,
       applicantID: formEl["applicantID"].value
     };
 
   showProgressBar(progressEl);
 
   formEl["applicationID"].setCustomValidity((await Application.checkApplicationIDAsId(slots.applicationID)).message);
   formEl["applicationName"].setCustomValidity(Application.checkApplicationName(slots.applicationName).message);
   formEl["applicationEmail"].setCustomValidity(Application.checkApplicationEmail(slots.applicationEmail).message);
   formEl["applicationPhoneNumber"].setCustomValidity(Application.checkApplicationPhoneNumber(slots.applicationPhoneNumber).message);
   formEl["description"].setCustomValidity(Application.checkDescription(slots.description).message);
   formEl["status"].setCustomValidity(Application.checkStatus(slots.status).message);
   
 
   if (formEl.checkValidity()) {
     await Application.add(slots);
     formEl.reset();
   }
 
   hideProgressBar(progressEl);
 });