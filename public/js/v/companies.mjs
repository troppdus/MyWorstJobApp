/***************************************************************
 Import classes, data types and utility procedures
 ***************************************************************/
 import { handleAuthentication } from "./accessControl.mjs";
 import Company from "../m/Company.mjs";
 import Job from "../m/Job.mjs";
 import { createListFromMap, hideProgressBar, showProgressBar, createMultiSelectionWidget }
   from "../lib/util_companies.mjs";
 
 /***************************************************************
  Setup and handle UI Access Control
  ***************************************************************/
 handleAuthentication();
 
 /***************************************************************
  Declare variables for accessing main UI elements
  ***************************************************************/
 const companyMSectionEl = document.getElementById("Company-M"),
   companyRSectionEl = document.getElementById("Company-R"),
   companyCSectionEl = document.getElementById("Company-C"),
   companyUSectionEl = document.getElementById("Company-U"),
   companyDSectionEl = document.getElementById("Company-D");
 
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
  * Use case Retrieve/List All Companies
  **********************************************/
 // initialize pagination mapping references
 let cursor = null,
   previousPageRef = null,
   nextPageRef = null,
   startAtRefs = [];
 let order = "companyID"; // default order value
 const tableBodyEl = companyRSectionEl.querySelector("table > tbody");
 const selectOrderEl = companyRSectionEl.querySelector("div > label > select"),
   previousBtnEl = document.getElementById("previousPage"),
   nextBtnEl = document.getElementById("nextPage");
 /**
  * event handler for main menu button
  */
 document.getElementById("RetrieveAndListAll")
   .addEventListener("click", async function () {
     companyMSectionEl.hidden = true;
     companyRSectionEl.hidden = false;
     await createBlock();
     startAtRefs.push( cursor); // set "first" startAt page reference
     previousBtnEl.disabled = true;
   });
 /**
  * create listing page
  */
 async function createBlock (startAt) {
   tableBodyEl.innerHTML = "";
   showProgressBar( "Company-R");
   const companyRecs = await Company.retrieveBlock({"order": order, "cursor": startAt});
   if (companyRecs.length) {
     // set page references for current (cursor) page
     cursor = companyRecs[0][order];
     // set next startAt page reference, if not next page, assign "null" value
     nextPageRef = (companyRecs.length < 6) ? null : companyRecs[companyRecs.length - 1][order];
     for (const companyRec of companyRecs) {
       const listEl = createListFromMap( companyRec.postedJobs, "jobName");
       const row = tableBodyEl.insertRow(-1);
       row.insertCell(-1).textContent = companyRec.companyID;
       row.insertCell(-1).textContent = companyRec.companyName;
       row.insertCell(-1).textContent = companyRec.description;
       row.insertCell(-1).appendChild( listEl);
     }
   }
   hideProgressBar("Company-R");
 }
 /**
  * "Previous" button
  */
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
 /**
  *  "Next" button
  */
 nextBtnEl.addEventListener("click", async function () {
   await createBlock( nextPageRef);
   // add new page reference if not present in index
   if (!startAtRefs.find( i => i === cursor)) startAtRefs.push( cursor);
   // disable "next" button if cursor is last page
   if (!nextPageRef) nextBtnEl.disabled = true;
   // enable "previous" button if cursor is not first page
   if (cursor !== startAtRefs[0]) previousBtnEl.disabled = false;
 });
 /**
  * handle order selection events: when an order is selected,
  * populate the list according to the selected order
  */
 selectOrderEl.addEventListener("change", async function (e) {
   order = e.target.value;
   startAtRefs = [];
   await createBlock();
   startAtRefs.push( cursor);
   previousBtnEl.disabled = true;
   nextBtnEl.disabled = false;
 });
 
 /**********************************************
  * Use case Create Company
  **********************************************/
 const createFormEl = companyCSectionEl.querySelector("form"),
   createJobWidget = createFormEl.querySelector(".MultiSelectionWidget");
 await createMultiSelectionWidget (createFormEl, [], "jobs",
   "id", "jobId", Job.checkJobIdAsIdRef, Job.retrieve);
 document.getElementById("Create").addEventListener("click", async function () {
   createFormEl.reset();
   companyMSectionEl.hidden = true;
   companyCSectionEl.hidden = false;
 });
 // set up event handlers for responsive constraint validation
 createFormEl["companyID"].addEventListener("input", async function () {
   const responseValidation = await Company.checkCompanyIDAsId( createFormEl["companyID"].value);
   createFormEl["companyID"].setCustomValidity( responseValidation.message);
 });
 // handle Create button click events
 createFormEl["commit"].addEventListener("click", async function () {
   if (!createFormEl["companyID"].value) return;
   const addedJobsListEl = createJobWidget.children[1], // ul
     slots = {
       companyID: createFormEl["companyID"].value,
       companyName: createFormEl["companyName"].value,
       description: createFormEl["description"].value,
       postedJobs: [],
     };
   // check all input fields and show error messages
   createFormEl["companyID"].setCustomValidity(
     (await Company.checkCompanyIDAsId( slots.companyID)).message);

   createFormEl["companyName"].setCustomValidity(
     Company.checkCompanyName( slots.companyName).message);

    createFormEl["description"].setCustomValidity(
      Company.checkDescription( slots.description).message);

   if (addedJobsListEl.children.length) {
     for (const jobItemEl of addedJobsListEl.children) {
       const job = JSON.parse(jobItemEl.getAttribute("data-value"));
       const responseValidation = await Job.checkJobIdAsIdRef(job.id);
       if (responseValidation.message) {
         createFormEl["postedJobs"].setCustomValidity(responseValidation.message);
         break;
       } else {
         slots.postedJobs.push(job);
         createFormEl["postedJobs"].setCustomValidity("");
       }
     }
    }
  //  } else createFormEl["postedJobs"].setCustomValidity(
  //    createFormEl["postedJobs"].value ? "" : "No job selected!");
   // save the input data only if all form fields are valid */
   if (createFormEl.checkValidity()) {
     showProgressBar("Company-C");
     await Company.add( slots);
     createFormEl.reset();
     addedJobsListEl.innerHTML = "";
     hideProgressBar( "Company-C");
   }
 });
 
 /**********************************************
  * Use case Update Company
  **********************************************/
 const updateFormEl = companyUSectionEl.querySelector("form"),
   updateJobWidget = updateFormEl.querySelector(".MultiSelectionWidget");
 document.getElementById("Update").addEventListener("click", async function () {
   companyMSectionEl.hidden = true;
   companyUSectionEl.hidden = false;
   updateFormEl.reset();
   updateJobWidget.innerHTML = "";
 });

 updateFormEl["companyID"].addEventListener("input", async function () {
   const responseValidation = await Company.checkCompanyIDAsIdRef( updateFormEl["companyID"].value);
   if (responseValidation) updateFormEl["companyID"].setCustomValidity( responseValidation.message);
   if (!updateFormEl["companyID"].value) {
     updateFormEl.reset();
     updateJobWidget.innerHTML = "";
   }
 });
 updateFormEl["companyID"].addEventListener("blur", async function () {
   if (updateFormEl["companyID"].checkValidity() && updateFormEl["companyID"].value) {
     const companyRec = await Company.retrieve( updateFormEl["companyID"].value);
     updateFormEl["companyID"].value = companyRec.companyID;
     updateFormEl["companyName"].value = companyRec.companyName;
     if (companyRec.description) updateFormEl["description"].value = companyRec.description;
     updateJobWidget.innerHTML = "";
     await createMultiSelectionWidget (updateFormEl, companyRec.postedJobs,
       "jobs", "id", "jobId",
       Job.checkJobIdAsIdRef, Job.retrieve);
   } else {
     updateFormEl.reset();
   }
 });
 // handle Update button click events
 updateFormEl["commit"].addEventListener("click", async function () {
   if (!updateFormEl["companyID"].value) return;
   const addedJobsListEl = updateJobWidget.children[1], 
     slots = {
       companyID: updateFormEl["companyID"].value,
       companyName: updateFormEl["companyName"].value,
       description: updateFormEl["description"].value,
       postedJobs: updateFormEl["postedJobs"].value,
     };

   updateFormEl["companyName"].setCustomValidity(
     Company.checkCompanyName( slots.companyName).message);
  
   if (addedJobsListEl.children.length) {
     // construct postedJobs-ToAdd/ToRemove lists
     const postedJobsToAdd=[], postedJobsToRemove=[];
     for (const jobItemEl of addedJobsListEl.children) {
       if (jobItemEl.classList.contains("added")) {
         const job = JSON.parse(jobItemEl.getAttribute("data-value"));
         const responseValidation = await Job.checkJobIdAsIdRef( job.id);
         if (responseValidation.message) {
           updateFormEl["jobs"].setCustomValidity( responseValidation.message);
           break;
         } else {
           postedJobsToAdd.push( job);
           updateFormEl["jobs"].setCustomValidity( "");
         }
       }
       if (jobItemEl.classList.contains("removed")) {
         const job = JSON.parse(jobItemEl.getAttribute("data-value"));
         postedJobsToRemove.push( job);
       }
     }
     // if the add/remove list is non-empty, create a corresponding slot
     if (postedJobsToRemove.length > 0) {
       slots.postedJobsToRemove = postedJobsToRemove;
     }
     if (postedJobsToAdd.length > 0) {
       slots.postedJobsToAdd = postedJobsToAdd;
     }
   } else updateFormEl["jobs"].setCustomValidity(
     updateFormEl["jobs"].value ? "" : "No job selected!");
   // commit the update only if all form field values are valid
   if (updateFormEl.checkValidity()) {
     showProgressBar( "Company-U");
     await Company.update( slots);
     // drop widget content
     updateFormEl.reset();
     updateJobWidget.innerHTML = ""; // ul
     hideProgressBar( "Company-U");
   }
 });
 
 /**********************************************
  * Use case Delete Company
  **********************************************/
 const deleteFormEl = companyDSectionEl.querySelector("form");
 document.getElementById("Delete").addEventListener("click", async function () {
   deleteFormEl.reset();
   companyMSectionEl.hidden = true;
   companyDSectionEl.hidden = false;
 });
 deleteFormEl["companyID"].addEventListener("input", async function () {
   const responseValidation = await Company.checkCompanyIDAsIdRef( deleteFormEl["companyID"].value);
   deleteFormEl["companyID"].setCustomValidity( responseValidation.message);
 });
 // commit delete only if all form field values are valid
 if (deleteFormEl.checkValidity()) {
   // handle Delete button click events
   deleteFormEl["commit"].addEventListener("click", async function () {
     const companyIdRef = deleteFormEl["companyID"].value;
     if (!companyIdRef) return;
     if (confirm("Do you really want to delete this company?")) {
       await Company.destroy(companyIdRef);
       deleteFormEl.reset();
     }
   });
 }
 
 /**********************************************
  * Refresh the Manage Companies Data UI
  **********************************************/
 function refreshManageDataUI() {
   // show the manage company UI and hide the other UIs
   companyMSectionEl.hidden = false;
   companyRSectionEl.hidden = true;
   companyCSectionEl.hidden = true;
   companyUSectionEl.hidden = true;
   companyDSectionEl.hidden = true;
 }
 
 /** Retrieve data and set up the company management UI */
 // set up Manage Company UI
 refreshManageDataUI(); 