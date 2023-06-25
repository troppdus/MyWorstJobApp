/***************************************************************
 Import classes and data types
 ***************************************************************/
import Job from "../m/Job.mjs";

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
 Set up select element
 ***************************************************************/
 for (const jobRec of jobRecords) {
  const optionEl = document.createElement("option");
  optionEl.text = `${jobRec.jobName} at ${jobRec.company} (${jobRec.location}) - ${jobRec.jobFieldCategory}`;
  optionEl.value = jobRec.jobId;
  selectJobEl.add(optionEl, null);
}

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
    await Job.destroy(jobId);
    // remove deleted job from select options
    selectJobEl.remove(selectJobEl.selectedIndex);
  }
});