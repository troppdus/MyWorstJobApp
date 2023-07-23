/**
 * @fileOverview  Contains various view functions for managing applications
 * @application Gerd Wagner
 * @application Juan-Francisco Reyes
 */
/***************************************************************
 Import classes, data types and utility procedures
 ***************************************************************/
 import { handleAuthentication } from "./accessControl.mjs";
//  import { showProgressBar, hideProgressBar, createListFromMap } from "../lib/util_Phong.mjs";
 import Application, {ApplicationStatusEL} from "../m/Application.mjs";
 import Job from "../m/Job.mjs";
 import Applicant from "../m/Applicant.mjs";
//  import { handleAuthentication } from "./accessControl.mjs";
 import { createListFromMap, createMultiSelectionWidget, showProgressBar, hideProgressBar } from "../lib/util_2.mjs";
 import { fillSelectWithOptions } from "../lib/util.mjs";
 
 /***************************************************************
  Setup and handle UI Access Control
  ***************************************************************/
 handleAuthentication();
 
 /***************************************************************
  Declare variables for accessing UI elements
  ***************************************************************/
 // use-case-independent UI elements
 
 const applicationMSectionEl = document.getElementById("Application-M"),
   applicationRSectionEl = document.getElementById("Application-R"),
   applicationCSectionEl = document.getElementById("Application-C"),
   applicationUSectionEl = document.getElementById("Application-U"),
   applicationDSectionEl = document.getElementById("Application-D");
 
 /***************************************************************
  Set up general use-case-independent event listeners
  ***************************************************************/
 // set up back-to-menu buttons for all use cases
 for (const btn of document.querySelectorAll("button.back-to-menu")) {
   btn.addEventListener("click", refreshManageDataUI);
 }
 // neutralize the submit event for all use cases
 for (const frm of document.querySelectorAll("section > form")) {
   frm.addEventListener("submit", function (e) {
     e.preventDefault();
   });
 }

// const generateTestDataButtons = document.querySelectorAll("button.generateTestData");
// for (let btn of generateTestDataButtons) {
//   btn.addEventListener("click", generateData);
// }
 
 /**********************************************
  * Use case Retrieve and List All Applications
  **********************************************/
// Initialise pagination variables
let cursor = null,
  previousPageRef = null,
  nextPageRef = null,
  startAtRefs = [];
let order = "applicationID"; // default order value
const tableBodyEl = applicationRSectionEl.querySelector("table > tbody");
const selectOrderEl = applicationRSectionEl.querySelector("div > label > select"),
  previousBtnEl = document.getElementById("previousPage"),
  nextBtnEl = document.getElementById("nextPage");

document.getElementById("RetrieveAndListAll")
  .addEventListener("click", async function () {
    applicationMSectionEl.hidden = true;
    applicationRSectionEl.hidden = false;
    await createBlock( );
    startAtRefs.push( cursor);
    previousBtnEl.disabled = true;
  });


// Create retrieve page each block at a time. 

async function createBlock( startAt) {
    //  for (const applicationRec of applicationRecords) {
  tableBodyEl.innerHTML = "";
  showProgressBar( "Application-R");
  const applicationRecords = await Application.retrieveBlock( {"order": order, "cursor": startAt});
    if (applicationRecords.length) {
      cursor = applicationRecords[0][order];
      nextPageRef = (applicationRecords.length < 10) ? null : applicationRecords[applicationRecords.length - 1][order];
      const row = tableBodyEl.insertRow();
      for ( const applicationRec of applicationRecords) {
        const row = tableBodyEl.insertRow();
        row.insertCell().textContent = applicationRec.applicationID;
        row.insertCell().textContent = applicationRec.applicationName;
        row.insertCell().textContent = applicationRec.applicationEmail;
        row.insertCell().textContent = applicationRec.applicationPhoneNumber;
        row.insertCell().textContent = applicationRec.jobId;
        row.insertCell().textContent = applicationRec.description;
        row.insertCell().textContent = ApplicationStatusEL.labels[applicationRec.status - 1];
        if (applicationRec.applicantIDRefs && applicationRec.applicantIDRefs.length) {
          const listEl = createListFromMap( applicationRec.applicantIDRefs, "applicantName", "applicantID");
          row.insertCell().appendChild(listEl);
        }
      }

      }
    hideProgressBar( "Application-R");
 }

previousBtnEl.addEventListener("click", async function () {
  // locate current page reference in index of page references
  previousPageRef = startAtRefs[startAtRefs.indexOf( cursor) - 1];
  // create new page
  await createBlock( previousPageRef);
  // disable "previous" button if cursor is first page
  if (cursor === startAtRefs[0]) previousBtnEl.disabled = true;
  // enable "next" button if cursor is not last page
  if (cursor !== startAtRefs[startAtRefs.length -1]) nextBtnEl.disabled = false;
});

nextBtnEl.addEventListener("click", async function () {
  await createBlock( nextPageRef);
  // add new page reference if not present in index
  if (!startAtRefs.find( i => i === cursor)) startAtRefs.push( cursor);
  // disable "next" button if cursor is last page
  if (!nextPageRef) nextBtnEl.disabled = true;
  // enable "previous" button if cursor is not first page
  if (cursor !== startAtRefs[0]) previousBtnEl.disabled = false;
});


selectOrderEl.addEventListener("change", async function (e) {
  order = e.target.value;
  startAtRefs = [];
  await createBlock();
  startAtRefs.push( cursor);
  previousBtnEl.disabled = true;
  nextBtnEl.disabled = false;
});

 /**********************************************
  * Use case Create Application
  **********************************************/
const createFormEl = applicationCSectionEl.querySelector("form"),
  createApplicationWidget = createFormEl.querySelector(".MultiSelectionWidget"),
  statusEl = createFormEl["status"];
await createMultiSelectionWidget (createFormEl, [], "applicants",
  "id", "applicantID", Applicant.checkApplicantIDAsIdRef, Applicant.retrieve);
fillSelectWithOptions(statusEl, ApplicationStatusEL.labels);
document.getElementById("Create").addEventListener("click", function () {
  createFormEl.reset();
  applicationMSectionEl.hidden = true;
  applicationCSectionEl.hidden = false;
});


/***************************************************************
  Add event listeners for input validation
  ***************************************************************/
  // set up event handlers for responsive constraint validation
createFormEl["applicationID"].addEventListener("input", async function () {
  const responseValidation = await Application.checkApplicationIDAsId( createFormEl["applicationID"].value);
  createFormEl["applicationID"].setCustomValidity( responseValidation.message);
});

createFormEl["applicationName"].addEventListener("input", function () {
  createFormEl["applicationName"].setCustomValidity(Application.checkApplicationName(createFormEl["applicationName"].value).message);
});

createFormEl["applicationEmail"].addEventListener("input", function () {
  createFormEl["applicationEmail"].setCustomValidity(Application.checkApplicationEmail(createFormEl["applicationEmail"].value).message);
});

createFormEl["applicationPhoneNumber"].addEventListener("input", function () {
  createFormEl["applicationPhoneNumber"].setCustomValidity(Application.checkApplicationPhoneNumber(createFormEl["applicationPhoneNumber"].value).message);
});

createFormEl["description"].addEventListener("input", function () {
  createFormEl["description"].setCustomValidity(Application.checkDescription(createFormEl["description"].value).message);
});

statusEl.addEventListener("click", function () {
  createFormEl["status"].setCustomValidity(Application.checkStatus(statusEl.value).message);
});

createFormEl["jobId"].addEventListener("input", async function () {
  let msg = await Job.checkJobIdAsIdRef(createFormEl["jobId"].value);
  let validityMsg = (msg.message === "") ? "" : `Job ID ${msg.message}`;

  createFormEl["jobId"].setCustomValidity( validityMsg);
});
 /* SIMPLIFIED CODE: no responsive validation of name */
 
 // handle Create button click events
createFormEl["commit"].addEventListener("click", async function () {
  if (!createFormEl["applicationID"].value) return;
  
  const addedApplicantListEl = createApplicationWidget.children[1],
      slots = {
        applicationID: createFormEl["applicationID"].value,
        applicationName: createFormEl["applicationName"].value,
        applicationEmail: createFormEl["applicationEmail"].value,
        applicationPhoneNumber: createFormEl["applicationPhoneNumber"].value,
        description: createFormEl["description"].value,
        status: createFormEl["status"].value,
        jobId: createFormEl["jobId"].value,
        applicantIDRefs: [],
      };
  // showProgressBar("Application-C");
   // check all input fields and show error messages
  createFormEl["applicationID"].setCustomValidity((await Application.checkApplicationIDAsId(slots.applicationID)).message);
  createFormEl["applicationName"].setCustomValidity(Application.checkApplicationName(slots.applicationName).message);
  createFormEl["applicationEmail"].setCustomValidity(Application.checkApplicationEmail(slots.applicationEmail).message);
  createFormEl["applicationPhoneNumber"].setCustomValidity(Application.checkApplicationPhoneNumber(slots.applicationPhoneNumber).message);
  createFormEl["description"].setCustomValidity(Application.checkDescription(slots.description).message);
  createFormEl["status"].setCustomValidity(Application.checkStatus(slots.status).message);
  
  if (addedApplicantListEl.children.length) {
    for (const applicantItemEl of addedApplicantListEl.children) {
      const applicant = JSON.parse(applicantItemEl.getAttribute("data-value"));
      const responseValidation = Applicant.checkApplicantIDAsIdRef(applicant.id);
      if (responseValidation.message) {
        createFormEl["applicants"].setCustomValidity(responseValidation.message);
        break;
      } else {
        slots.applicantIDRefs.push(applicant);
        createFormEl["applicants"].setCustomValidity("");
      }
    }
  }
  // } else createFormEl["applicants"].setCustomValidity
  //       (createFormEl["applicants"].value ? "" : "No Applicant Selected!");
    
   
 
  //  if (createFormEl.checkValidity()) {
  //    await Application.add(slots);
  //    createFormEl.reset();
  //    addedApplicantListEl.innerHTML = "";
  //  }
 
  //  hideProgressBar(progressEl);
  
  // save the input data only if all form fields are valid
   if (createFormEl.checkValidity()) {
     showProgressBar( "Application-C");
     await Application.add( slots);
     createFormEl.reset();
     hideProgressBar( "Application-C");
   }
 });
 
 /**********************************************
  * Use case Update Application
  **********************************************/
const updateFormEl = applicationUSectionEl.querySelector("form"), 
  updateApplicantWidgetEl = updateFormEl.querySelector(".MultiSelectionWidget"),
  updateStatusEl = updateFormEl["status"];

document.getElementById("Update").addEventListener("click", async function () {
  applicationMSectionEl.hidden = true;
  applicationUSectionEl.hidden = false;
  fillSelectWithOptions(updateStatusEl, ApplicationStatusEL.labels);
  updateFormEl.reset();
  updateApplicantWidgetEl.innerHTML = "";
});
 /**
  * handle application ID input: when an application ID is entered
  * and the user changes focus the application data is populated
  */

updateFormEl["applicationID"].addEventListener("input", async function () {
  const responseValidation = await Application.checkApplicationIDAsIdRef( updateFormEl["applicationID"].value);
  updateFormEl["applicationID"].setCustomValidity( responseValidation.message);
  updateFormEl["commit"].disabled = responseValidation.message;
  if (!updateFormEl["applicationID"].value) updateFormEl.reset();
});

updateFormEl["applicationID"].addEventListener("blur", async function () {
  if (updateFormEl["applicationID"].checkValidity() && updateFormEl["applicationID"].value) 
  {
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
      "applicants", "id", "applicantID", Applicant.checkApplicantIDAsIdRef, Applicant.retrieve);
    updateFormEl["jobId"].value = applicationRec.jobId;
  } else {
    updateFormEl.reset();
  }
});
 
 // handle Save button click events
updateFormEl["commit"].addEventListener("click", async function () {
  if (!updateFormEl["applicationID"].value) return;
  const addedApplicantsListEl = updateApplicantWidgetEl.children[1], // ul
    slots = {
      applicationID: updateFormEl["applicationID"].value,
      applicationName: updateFormEl["applicationName"].value,
      applicationEmail: updateFormEl["applicationEmail"].value,
      applicationPhoneNumber: updateFormEl["applicationPhoneNumber"].value,
      description: updateFormEl["description"].value,
      status: updateFormEl["status"].value,
      // applicantID: updateFormEl["applicantID"].value,
      jobId: updateFormEl["jobId"].value
   };
  // check all property constraints and show error messages
  updateFormEl["applicationName"].setCustomValidity(Application.checkApplicationName(slots.applicationName).message);
  updateFormEl["applicationEmail"].setCustomValidity(Application.checkApplicationEmail(slots.applicationEmail).message);
  updateFormEl["applicationPhoneNumber"].setCustomValidity(Application.checkApplicationPhoneNumber(slots.applicationPhoneNumber).message);
  // save the input data only if all the form fields are valid

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
  if (updateFormEl.checkValidity()) {
    showProgressBar( "Application-U");
    await Application.update( slots);
    updateFormEl.reset();
    hideProgressBar( "Application-U");
  }
});
 
 /**********************************************
  * Use case Delete Application
  **********************************************/
const deleteFormEl = applicationDSectionEl.querySelector("form")
document.getElementById("Delete").addEventListener("click", async function () {
  deleteFormEl.reset();
  applicationMSectionEl.hidden = true;
  applicationDSectionEl.hidden = false;
});
 /**
  * handle application ID input: when an application ID is entered
  * and the user changes focus the application data is populated
  */
deleteFormEl["applicationID"].addEventListener("input", async function () {
  const responseValidation = await Application.checkApplicationIDAsIdRef( deleteFormEl["applicationID"].value);
  deleteFormEl["applicationID"].setCustomValidity( responseValidation.message);
});
 // commit delete only if all form field values are valid
if (deleteFormEl.checkValidity()) {
  // handle Delete button click events
  deleteFormEl["commit"].addEventListener("click", async function () {
    const applicationIDRef = deleteFormEl["applicationID"].value;
    if (!applicationIDRef) return;
    const slots = await Application.retrieve( applicationIDRef);
    if (confirm( "Do you really want to delete this application record?")) {
      await Application.destroy( slots.applicationID);
      deleteFormEl.reset();
    }
  });
}
 
 /**********************************************
  * Refresh the Manage Applications Data UI
  **********************************************/
 function refreshManageDataUI() {
   // show the manage application UI and hide the other UIs
   applicationMSectionEl.hidden = false;
   applicationRSectionEl.hidden = true;
   applicationCSectionEl.hidden = true;
   applicationUSectionEl.hidden = true;
   applicationDSectionEl.hidden = true;
 }
 
 /** Retrieve data and set up the application management UI */
 // Set up Manage Applications UI
 refreshManageDataUI(); 