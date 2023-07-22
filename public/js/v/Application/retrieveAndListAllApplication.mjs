/***************************************************************
 Import classes and data types
 ***************************************************************/
 import Application, { ApplicationStatusEL } from "../../m/Application.mjs";
 import { handleAuthentication } from "../accessControl.mjs";
 import { showProgressBar, hideProgressBar, createListFromMap } from "../../lib/util_2.mjs";
 
 console.log("retrieveAndListAllApplications.mjs");
 /***************************************************************
  Setup and handle UI Authentication
  ***************************************************************/
 handleAuthentication();
 
 /***************************************************************
  Declare variables for accessing UI elements
 ***************************************************************/
 let cursor = null, nextPageRef = null,
     previousPageRef = null, startAtRefs = [];
 let order = "applicationID";
 const selectOrderEl = document.querySelector("main>div>label>select");
 const tableBodyEl = document.querySelector("table#applications>tbody");
 const progressEl = document.querySelector("progress"),
  previousBtnEl = document.getElementById("previousPage"),
  nextBtnEl = document.getElementById("nextPage");
 
 /***************************************************************
  Create table view
  ***************************************************************/
 await retrieveAndListAllApplications();
 startAtRefs.push( cursor);
 previousBtnEl.disabled = true;
  /***************************************************************
   Handle order selector
   ***************************************************************/
 selectOrderEl.addEventListener("change", async function (e) {
   // invoke list with order parameter selected
   await retrieveAndListAllApplications( e.target.value);
 });
 
 
 
 async function retrieveAndListAllApplications( startAt) {
   tableBodyEl.innerHTML = "";
   showProgressBar( "progress");
   // Load data
   const applicationRecords = await Application.retrieveBlock( {"order": order, "cursor": startAt});
   // Render list of all application records
   // for each application, create a table row with a cell for each attribute
   if (applicationRecords.length) {

  //  for (const applicationRec of applicationRecords) {
    cursor = applicationRecords[0][order];
    nextPageRef = (applicationRecords.length < 10) ? null : applicationRecords[applicationRecords.length - 1][order];
    const row = tableBodyEl.insertRow();
    //  applicationID: application.applicationID,
    //  applicationName: application.applicationName,
    //  applicationEmail: application.applicationEmail,
    //  applicationPhoneNumber: application.applicationPhoneNumber,
    //  jobID: application.jobID,
    //  description: application.description,
    //  status: application.status,
    //  applicantID: application.applicantID
    for ( const applicationRec of applicationRecords) {
      const row = tableBodyEl.insertRow();
      row.insertCell().textContent = applicationRec.applicationID;
      row.insertCell().textContent = applicationRec.applicationName;
      row.insertCell().textContent = applicationRec.applicationEmail;
      row.insertCell().textContent = applicationRec.applicationPhoneNumber;
      row.insertCell().textContent = applicationRec.jobID;
      row.insertCell().textContent = applicationRec.description;
      row.insertCell().textContent = ApplicationStatusEL.labels[applicationRec.status - 1];
      if (applicationRec.applicantIDRefs && applicationRec.applicantIDRefs.length) {
        const listEl = createListFromMap( applicationRec.applicantIDRefs, "applicantName", "applicantID");
        row.insertCell().appendChild(listEl);
      }
    }

   }
   hideProgressBar( "progress");
 }
 
 previousBtnEl.addEventListener("click", async function () {
  // locate current page reference in index of page references
  previousPageRef = startAtRefs[startAtRefs.indexOf( cursor) - 1];
  // create new page
  await retrieveAndListAllApplications( previousPageRef);
  // disable "previous" button if cursor is first page
  if (cursor === startAtRefs[0]) previousBtnEl.disabled = true;
  // enable "next" button if cursor is not last page
  if (cursor !== startAtRefs[startAtRefs.length -1]) nextBtnEl.disabled = false;
});

nextBtnEl.addEventListener("click", async function () {
  await retrieveAndListAllApplications( nextPageRef);
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
  await retrieveAndListAllApplications();
  startAtRefs.push( cursor);
  previousBtnEl.disabled = true;
  nextBtnEl.disabled = false;
});