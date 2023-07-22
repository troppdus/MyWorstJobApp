// Import classes and data types
import { handleAuthentication } from "../accessControl.mjs";
import Application, {ApplicationStatusEL} from "../../m/Application.mjs";
import Applicant from "../../m/Applicant.mjs";
import { fillSelectWithOptions, showProgressBar, hideProgressBar} from "../../lib/util.mjs";
import { createMultiSelectionWidget } from "../../lib/util_2.mjs";

handleAuthentication();

// Load data
// const applicationRecords = await Application.retrieveBlock();

// Declare variables for accessing UI elements
const updateFormEl = document.forms["Application"],
  updateButton = updateFormEl["commit"],
  selectApplicationEl = updateFormEl["applicationID"],
  progressEl = document.querySelector("progress"),
  selectStatusEl = updateFormEl["status"],
  updateApplicantWidgetEl = updateFormEl.querySelector(".MultiSelectionWidget");
/***************************************************************
 Declare variable to cancel record changes listener, DB-UI sync
 ***************************************************************/
updateFormEl.reset();
// fillSelectWithOptions(selectUserEl, userRecords, {valueProp:"userID", displayProp:"username"});
updateApplicantWidgetEl.innerHTML = "";
fillSelectWithOptions(selectStatusEl, ApplicationStatusEL.labels);


/***************************************************************
  Add event listeners for input validation
  ***************************************************************/
  updateFormEl["applicationID"].addEventListener("input", function () {
    updateFormEl["applicationID"].setCustomValidity(Application.checkApplicationID(updateFormEl["applicationID"].value).message);
  });

  updateFormEl["applicationName"].addEventListener("input", function () {
    updateFormEl["applicationName"].setCustomValidity(Application.checkApplicationName(updateFormEl["applicationName"].value).message);
  });

  updateFormEl["applicationEmail"].addEventListener("input", function () {
    updateFormEl["applicationEmail"].setCustomValidity(Application.checkApplicationEmail(updateFormEl["applicationEmail"].value).message);
  });

  updateFormEl["applicationPhoneNumber"].addEventListener("input", function () {
    updateFormEl["applicationPhoneNumber"].setCustomValidity(Application.checkApplicationPhoneNumber(updateFormEl["applicationPhoneNumber"].value).message);
  });

  updateFormEl["description"].addEventListener("input", function () {
    updateFormEl["description"].setCustomValidity(Application.checkDescription(updateFormEl["description"].value).message);
  });

  updateFormEl["status"].addEventListener("click", function () {
    updateFormEl["status"].setCustomValidity(Application.checkStatus(updateFormEl["status"].value).message);
  });


 // Set up event handlers for responsive constraint validation
 selectApplicationEl.addEventListener("input", async function () {
   const responseValidation = await Application.checkApplicationIDAsIdRef(updateFormEl["applicationID"].value);
   if (responseValidation) updateFormEl["applicationID"].setCustomValidity(responseValidation.message);
   if (!updateFormEl["applicationID"].value) {
     updateFormEl.reset();
     updateApplicantWidgetEl.innerHTML = "";
   }
 });

 
 
 updateFormEl["applicationID"].addEventListener("blur", async function () {
   if (updateFormEl["applicationID"].checkValidity() && updateFormEl["applicationID"].value) {
    const applicationRec = await Application.retrieve(updateFormEl["applicationID"].value);
    updateFormEl["applicationID"].value = applicationRec.applicationID;
    updateFormEl["applicationName"].value = applicationRec.applicationName;
    updateFormEl["applicationEmail"].value = applicationRec.applicationEmail;
    updateFormEl["applicationPhoneNumber"].value = applicationRec.applicationPhoneNumber;
    updateFormEl["description"].value = applicationRec.description;
    updateFormEl["status"].value = applicationRec.status;
    // updateFormEl["applicantID"].value = applicationRec.applicantID;
    updateApplicantWidgetEl.innerHTML = "";
    await createMultiSelectionWidget(updateFormEl, applicationRec.applicantIDRefs, 
      "applicants", "id", "applicantID", Applicant.checkApplicationIDAsIdRef, Applicant.retrieve);
    updateFormEl["jobID"].value = applicationRec.jobID;
   } else {
     updateFormEl.reset();
   }
 });
 
 // Handle Update button click events
 updateButton.addEventListener("click", async function () {
   if (!updateFormEl["applicationID"].value) return;
 
  //  applicationID, applicationName, applicationEmail,
  // applicationPhoneNumber, description, status
   const addedApplicantsListEl = updateApplicantWidgetEl.children[1], // ul
    slots = {
      applicationID: updateFormEl["applicationID"].value,
      applicationName: updateFormEl["applicationName"].value,
      applicationEmail: updateFormEl["applicationEmail"].value,
      applicationPhoneNumber: updateFormEl["applicationPhoneNumber"].value,
      description: updateFormEl["description"].value,
      status: updateFormEl["status"].value,
      // applicantID: updateFormEl["applicantID"].value,
      jobID: updateFormEl["jobID"].value
   };
 
   // Check all input fields and show error messages
   updateFormEl["applicationName"].setCustomValidity(Application.checkApplicationName(slots.applicationName).message);
   updateFormEl["applicationEmail"].setCustomValidity(Application.checkApplicationEmail(slots.applicationEmail).message);
   updateFormEl["applicationPhoneNumber"].setCustomValidity(Application.checkApplicationPhoneNumber(slots.applicationPhoneNumber).message);

   if (addedApplicantsListEl.children.length) {
    const applicantIDRefsToAdd = [], applicantIDRefsToRemove = [];
    for (const applicantItemEl of addedApplicantsListEl.children) {
      if (applicantItemEl.classList.contains("added")) {
        const applicant = JSON.parse(applicantItemEl.getAttribute("data-value"));
        const responseValidation = await Applicant.checkApplicantIDAsIdRef(applicant.applicantID);
        if (responseValidation.message) {
          updateFormEl["applicants"].setCustomValidity(responseValidation.message);
          break;
        } else {
          applicantIDRefsToAdd.push(applicant);
          updateFormEl["applicants"].setCustomValidity("");
        }
      }
      if (applicantItemEl.classList.contains("removed")) {
        const applicant = JSON.parse(applicantItemEl.getAttribute("data-value"));
        applicantIDRefsToRemove.push(applicant);
      }
    }
    // if the add/remove list is non-empty, create a corresponding slot
    if (applicantIDRefsToRemove.length > 0) {
      slots.applicantIDRefsToRemove = applicantIDRefsToRemove;
    }
    if (applicantIDRefsToAdd.length > 0) {
      slots.applicantIDRefsToAdd = applicantIDRefsToAdd;
    }
  } else {
    updateFormEl["applicants"].setCustomValidity(
      updateFormEl["applicants"].value ? "" : "Please add at least one applicant");
    }
   // Commit the update only if all form field values are valid
   if (updateFormEl.checkValidity()) {
     showProgressBar(progressEl);
     await Application.update(slots);
     updateFormEl.reset();
     hideProgressBar(progressEl);
   }
 });
 