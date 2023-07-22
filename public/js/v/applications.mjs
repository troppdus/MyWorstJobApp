/**
 * @fileOverview  Contains various view functions for managing applications
 * @application Gerd Wagner
 * @application Juan-Francisco Reyes
 */
/***************************************************************
 Import classes, data types and utility procedures
 ***************************************************************/
 import { handleAuthentication } from "./accessControl_Phong.mjs";
//  import { showProgressBar, hideProgressBar, createListFromMap } from "../lib/util_Phong.mjs";
 import Application, {ApplicationStatusEL} from "../m/Application.mjs";
 import Job from "../m/Job.mjs";
 import Applicant from "../m/Applicant.mjs";
//  import { handleAuthentication } from "./accessControl.mjs";
 import { fillSelectWithOptions, showProgressBar, hideProgressBar,  } from "../lib/util.mjs";
 import { createListFromMap, createMultiSelectionWidget } from "../lib/util_2.mjs";
 
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
 
 /**********************************************
  * Use case Retrieve and List All Applications
  **********************************************/
 const tableBodyEl = applicationRSectionEl.querySelector("table > tbody");
 document.getElementById("RetrieveAndListAll").addEventListener("click", async function () {
   tableBodyEl.innerHTML = "";
   applicationMSectionEl.hidden = true;
   applicationRSectionEl.hidden = false;
   showProgressBar( "Application-R");
   const applicationRecs = await Application.retrieveAll();
   for (const application of applicationRecs) {
     const row = tableBodyEl.insertRow();
     row.insertCell().textContent = application.applicationID;
     row.insertCell().textContent = application.fileTitle;
      row.insertCell().textContent = application.filePath;
     // create list of applicant (owner) of the application
     if (application.applicationOwner && application.applicationOwner.length) {
       const listEl = createListFromMap( application.applicationOwner, "applicantName", "applicantID");
       row.insertCell().appendChild(listEl);
     }
   }
   hideProgressBar( "Application-R");
 });
 
 /**********************************************
  * Use case Create Application
  **********************************************/
 const createFormEl = applicationCSectionEl.querySelector("form");
 document.getElementById("Create").addEventListener("click", function () {
   createFormEl.reset();
   applicationMSectionEl.hidden = true;
   applicationCSectionEl.hidden = false;
 });
 // set up event handlers for responsive constraint validation
 createFormEl["applicationID"].addEventListener("input", async function () {
   const responseValidation = await Application.checkApplicationIDAsId( createFormEl["applicationID"].value);
   createFormEl["applicationID"].setCustomValidity( responseValidation.message);
 });
 /* SIMPLIFIED CODE: no responsive validation of name */
 
 // handle Create button click events
 createFormEl["commit"].addEventListener("click", async function () {
   if (!createFormEl["applicationID"].value) return;
   const slots = {
     applicationID: createFormEl["applicationID"].value,
     fileTitle: createFormEl["fileTitle"].value,
      filePath: createFormEl["filePath"].value
   };
   // check all input fields and show error messages
   createFormEl["applicationID"].setCustomValidity((
     await Application.checkApplicationIDAsId( slots.applicationID)).message);
    createFormEl["fileTitle"].setCustomValidity((
      await Application.checkFileTitle( slots.fileTitle)).message);
    createFormEl["filePath"].setCustomValidity((
      await Application.checkFilePath( slots.filePath)).message);
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
 const updateFormEl = applicationUSectionEl.querySelector("form");
 document.getElementById("Update").addEventListener("click", async function () {
   updateFormEl.reset();
   applicationMSectionEl.hidden = true;
   applicationUSectionEl.hidden = false;
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
   if (updateFormEl["applicationID"].checkValidity() && updateFormEl["applicationID"].value) {
     const applicationRec = await Application.retrieve( updateFormEl["applicationID"].value);
     updateFormEl["fileTitle"].value = applicationRec.fileTitle;
     updateFormEl["filePath"].value = applicationRec.filePath;
   } else updateFormEl.reset();
 });
 
 // handle Save button click events
 updateFormEl["commit"].addEventListener("click", async function () {
   if (!updateFormEl["applicationID"].value) return;
   const slots = {
    applicationID: updateFormEl["applicationID"].value,
    fileTitle: updateFormEl["fileTitle"].value,
     filePath: updateFormEl["filePath"].value
   }
   // check all property constraints and show error messages
   updateFormEl["fileTitle"].setCustomValidity((
     await Application.checkFileTitle( slots.fileTitle)).message);
   updateFormEl["filePath"].setCustomValidity((
     await Application.checkFilePath( slots.filePath)).message);
   // save the input data only if all the form fields are valid
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
       await Application.destroy( slots);
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