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
const tableBodyEl = document.querySelector("table#jobs>tbody");

/***************************************************************
 Render list of all job records
 ***************************************************************/
// for each job, create a table row with a cell for each attribute
for (const jobRec of jobRecords) {
  const row = tableBodyEl.insertRow();
  row.insertCell().textContent = jobRec.jobId;
  row.insertCell().textContent = jobRec.jobName;
  row.insertCell().textContent = jobRec.location;
  row.insertCell().textContent = jobRec.company;
  row.insertCell().textContent = jobRec.salary;
  row.insertCell().textContent = jobRec.typeOfEmployment;
  row.insertCell().textContent = jobRec.jobFieldCategory;
  row.insertCell().textContent = jobRec.description;
}
