/**
 * @fileOverview  Contains various view functions for managing dokuments
 * @dokument Gerd Wagner
 * @dokument Juan-Francisco Reyes
 */
/***************************************************************
 Import classes, data types and utility procedures
 ***************************************************************/
 import { handleAuthentication } from "./accessControl_Phong.mjs";
 import Dokument from "../m/Dokument.mjs";
 import { showProgressBar, hideProgressBar, createListFromMap } from "../lib/util_Phong.mjs";
 
 /***************************************************************
  Setup and handle UI Access Control
  ***************************************************************/
 handleAuthentication();
 
 /***************************************************************
  Declare variables for accessing UI elements
  ***************************************************************/
 // use-case-independent UI elements
 const dokumentMSectionEl = document.getElementById("Dokument-M"),
   dokumentRSectionEl = document.getElementById("Dokument-R"),
   dokumentCSectionEl = document.getElementById("Dokument-C"),
   dokumentUSectionEl = document.getElementById("Dokument-U"),
   dokumentDSectionEl = document.getElementById("Dokument-D");
 
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
  * Use case Retrieve and List All Dokuments
  **********************************************/
 const tableBodyEl = dokumentRSectionEl.querySelector("table > tbody");
 document.getElementById("RetrieveAndListAll").addEventListener("click", async function () {
   tableBodyEl.innerHTML = "";
   dokumentMSectionEl.hidden = true;
   dokumentRSectionEl.hidden = false;
   showProgressBar( "Dokument-R");
   const dokumentRecs = await Dokument.retrieveAll();
   for (const dokument of dokumentRecs) {
     const row = tableBodyEl.insertRow();
     row.insertCell().textContent = dokument.dokumentID;
     row.insertCell().textContent = dokument.fileTitle;
      row.insertCell().textContent = dokument.filePath;
     // create list of applicants dokumented by this dokument
     if (dokument.dokumentOwner && dokument.dokumentOwner.length) {
       const listEl = createListFromMap( dokument.dokumentOwner, "fileTitle", "applicantID");
       row.insertCell().appendChild(listEl);
     }
   }
   hideProgressBar( "Dokument-R");
 });
 
 /**********************************************
  * Use case Create Dokument
  **********************************************/
 const createFormEl = dokumentCSectionEl.querySelector("form");
 document.getElementById("Create").addEventListener("click", function () {
   createFormEl.reset();
   dokumentMSectionEl.hidden = true;
   dokumentCSectionEl.hidden = false;
 });
 // set up event handlers for responsive constraint validation
 createFormEl["dokumentId"].addEventListener("input", async function () {
   const responseValidation = await Dokument.checkDokumentIdAsId( createFormEl["dokumentId"].value);
   createFormEl["dokumentId"].setCustomValidity( responseValidation.message);
 });
 /* SIMPLIFIED CODE: no responsive validation of name */
 
 // handle Create button click events
 createFormEl["commit"].addEventListener("click", async function () {
   if (!createFormEl["dokumentId"].value) return;
   const slots = {
     dokumentId: createFormEl["dokumentId"].value,
     name: createFormEl["name"].value
   };
   // check all input fields and show error messages
   createFormEl["dokumentId"].setCustomValidity((
     await Dokument.checkDokumentIdAsId( slots.dokumentId)).message);
   /* SIMPLIFIED CODE: no before-submit validation of name */
   // save the input data only if all form fields are valid
   if (createFormEl.checkValidity()) {
     showProgressBar( "Dokument-C");
     await Dokument.add( slots);
     createFormEl.reset();
     hideProgressBar( "Dokument-C");
   }
 });
 
 /**********************************************
  * Use case Update Dokument
  **********************************************/
 const updateFormEl = dokumentUSectionEl.querySelector("form");
 document.getElementById("Update").addEventListener("click", async function () {
   updateFormEl.reset();
   dokumentMSectionEl.hidden = true;
   dokumentUSectionEl.hidden = false;
 });
 /**
  * handle dokument ID input: when an dokument ID is entered
  * and the user changes focus the dokument data is populated
  */
 updateFormEl["dokumentId"].addEventListener("input", async function () {
   const responseValidation = await Dokument.checkDokumentIdAsIdRef( updateFormEl["dokumentId"].value);
   updateFormEl["dokumentId"].setCustomValidity( responseValidation.message);
   updateFormEl["commit"].disabled = responseValidation.message;
   if (!updateFormEl["dokumentId"].value) updateFormEl.reset();
 });
 updateFormEl["dokumentId"].addEventListener("blur", async function () {
   if (updateFormEl["dokumentId"].checkValidity() && updateFormEl["dokumentId"].value) {
     const dokumentRec = await Dokument.retrieve( updateFormEl["dokumentId"].value);
     updateFormEl["name"].value = dokumentRec.name;
   } else updateFormEl.reset();
 });
 
 // handle Save button click events
 updateFormEl["commit"].addEventListener("click", async function () {
   if (!updateFormEl["dokumentId"].value) return;
   const slots = {
     dokumentId: updateFormEl["dokumentId"].value,
     name: updateFormEl["name"].value
   }
   // check all property constraints
   /* SIMPLIFIED CODE: no before-save validation of name */
   // save the input data only if all the form fields are valid
   if (updateFormEl.checkValidity()) {
     showProgressBar( "Dokument-U");
     await Dokument.update( slots);
     updateFormEl.reset();
     hideProgressBar( "Dokument-U");
   }
 });
 
 /**********************************************
  * Use case Delete Dokument
  **********************************************/
 const deleteFormEl = dokumentDSectionEl.querySelector("form")
 document.getElementById("Delete").addEventListener("click", async function () {
   deleteFormEl.reset();
   dokumentMSectionEl.hidden = true;
   dokumentDSectionEl.hidden = false;
 });
 /**
  * handle dokument ID input: when an dokument ID is entered
  * and the user changes focus the dokument data is populated
  */
 deleteFormEl["dokumentId"].addEventListener("input", async function () {
   const responseValidation = await Dokument.checkDokumentIdAsIdRef( deleteFormEl["dokumentId"].value);
   deleteFormEl["dokumentId"].setCustomValidity( responseValidation.message);
 });
 // commit delete only if all form field values are valid
 if (deleteFormEl.checkValidity()) {
   // handle Delete button click events
   deleteFormEl["commit"].addEventListener("click", async function () {
     const dokumentIdRef = deleteFormEl["dokumentId"].value;
     if (!dokumentIdRef) return;
     const slots = await Dokument.retrieve( dokumentIdRef);
     if (confirm( "Do you really want to delete this dokument record?")) {
       await Dokument.destroy( slots);
       deleteFormEl.reset();
     }
   });
 }
 
 /**********************************************
  * Refresh the Manage Dokuments Data UI
  **********************************************/
 function refreshManageDataUI() {
   // show the manage dokument UI and hide the other UIs
   dokumentMSectionEl.hidden = false;
   dokumentRSectionEl.hidden = true;
   dokumentCSectionEl.hidden = true;
   dokumentUSectionEl.hidden = true;
   dokumentDSectionEl.hidden = true;
 }
 
 /** Retrieve data and set up the dokument management UI */
 // Set up Manage Dokuments UI
 refreshManageDataUI(); 