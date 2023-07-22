/***************************************************************
 Import classes and data types
 ***************************************************************/
import Job, { typeOfEmploymentEL } from "../m/Job.mjs";
import { handleAuthentication } from "./accessControl.mjs";
import { showProgressBar, hideProgressBar } from "../lib/util.mjs";
import Company from "../m/Company.mjs";

console.log("retrieveAndListAllJobs.mjs");
/***************************************************************
 Setup and handle UI Authentication
 ***************************************************************/
handleAuthentication();

/***************************************************************
 Declare variables for accessing UI elements
***************************************************************/
const selectOrderEl = document.querySelector("main>div>label>select");
const tableBodyEl = document.querySelector("table#jobs>tbody");
const progressEl = document.querySelector("progress");

/***************************************************************
 Create table view
 ***************************************************************/
await retrieveAndListAllJobs();

 /***************************************************************
  Handle order selector
  ***************************************************************/
selectOrderEl.addEventListener("change", async function (e) {
  // invoke list with order parameter selected
  await retrieveAndListAllJobs( e.target.value);
});



async function retrieveAndListAllJobs( order) {
  tableBodyEl.innerHTML = "";
  showProgressBar( progressEl);
  // Load data
  const jobRecords = await Job.retrieveAll( order);
  // const companyRecords = await Company.retrieveBlock( order);
  // Render list of all job records
  // for each job, create a table row with a cell for each attribute
  for (const jobRec of jobRecords) {
    const row = tableBodyEl.insertRow();
    row.insertCell().textContent = jobRec.jobId;
    row.insertCell().textContent = jobRec.jobName;
    row.insertCell().textContent = jobRec.location;
    let checkVar = await Company.retrieve(String(jobRec.company));
    row.insertCell().textContent = checkVar.companyName;
    // console.log(`${jobRec.company} is ${checkVar}}`)
    row.insertCell().textContent = jobRec.salary;
    row.insertCell().textContent = typeOfEmploymentEL.labels[jobRec.typeOfEmployment - 1];
    row.insertCell().textContent = jobRec.jobFieldCategory;
    row.insertCell().textContent = jobRec.description;
  }
  hideProgressBar( progressEl);
}
