/***************************************************************
 Import classes and data types
 ***************************************************************/
 import { handleAuthentication } from "./accessControl.mjs";
 import Job, { typeOfEmploymentEL } from "../m/Job.mjs";
 import { fillSelectWithOptions } from "../lib/util.mjs";
 handleAuthentication();
 // Load data
/***************************************************************
 Load data
 ***************************************************************/
const jobRecords = await Job.retrieveAll();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Job"],
  deleteButton = formEl["commit"],
  selectJobEl = formEl["selectJob"];

  /***************************************************************
 Declare variable to cancel observer, DB-UI sync
 ***************************************************************/
let cancelListener = null;
/***************************************************************
 Set up select element
 ***************************************************************/
 for (const jobRec of jobRecords) {
  const optionEl = document.createElement("option");
  optionEl.text = `${jobRec.jobName} at ${jobRec.company} (${jobRec.location}) - ${jobRec.jobFieldCategory}`;
  optionEl.value = jobRec.jobId;
  selectJobEl.add(optionEl, null);
}
/*******************************************************************
 Setup listener on the selected job record synchronising DB with UI
 ******************************************************************/
// set up listener to document changes on selected job record
selectJobEl.addEventListener("change", async function () {
  const jobId = selectJobEl.value;
  if (jobId) {
    // cancel record listener if a previous listener exists
    if (cancelListener) cancelListener();
    // add listener to selected job, returning the function to cancel listener
    cancelListener = await Job.observeChanges( jobId);
  }
});
/******************************************************************
 Add event listeners for the delete/submit button
 ******************************************************************/
// set an event handler for the delete button
deleteButton.addEventListener("click", async function () {
  const jobId = selectJobEl.value;
  if (!jobId) return;
  // get the selected option text
  const selectedText = selectJobEl.options[selectJobEl.selectedIndex].text;
  if (confirm(`Do you really want to delete this job record: ${selectedText}?`)) {
    // cancel DB-UI sync listener
    if (cancelListener) cancelListener();
    await Job.destroy(jobId);
    // remove deleted job from select options
    selectJobEl.remove(selectJobEl.selectedIndex);
  }
});
// set event to cancel DB listener when the browser window/tab is closed
window.addEventListener("beforeunload", function () {
  if (cancelListener) cancelListener();
});