// Import classes and data types
import Job from "../m/Job.mjs";

// Load data
const jobRecords = await Job.retrieveAll();

// Declare variables for accessing UI elements
const formEl = document.forms["Job"],
  updateButton = formEl["commit"],
  selectJobEl = formEl["selectJob"];

// Set up select element
// fill select with options
for (const jobRec of jobRecords) {
  const optionEl = document.createElement("option");
  optionEl.text = `${jobRec.jobName} at ${jobRec.company} (${jobRec.location}) - ${jobRec.jobFieldCategory}`;
  optionEl.value = jobRec.jobId;
  selectJobEl.add(optionEl, null);
}

// when a job is selected, fill the form with its data
selectJobEl.addEventListener("change", async function () {
  const jobId = selectJobEl.value;
  if (jobId) {
    // retrieve up-to-date job record
    const jobRec = await Job.retrieve(jobId);
    formEl["jobId"].value = jobRec.jobId;
    formEl["jobName"].value = jobRec.jobName;
    formEl["location"].value = jobRec.location;
    formEl["company"].value = jobRec.company;
    formEl["salary"].value = jobRec.salary;
    formEl["typeOfEmployment"].value = jobRec.typeOfEmployment;
    formEl["jobFieldCategory"].value = jobRec.jobFieldCategory;
    formEl["description"].value = jobRec.description;
  } else {
    formEl.reset();
  }
});

// Add event listeners for the update/submit button
// set an event handler for the update button
updateButton.addEventListener("click", async function () {
  const slots = {
    jobId: formEl["jobId"].value,
    jobName: formEl["jobName"].value,
    location: formEl["location"].value,
    company: formEl["company"].value,
    salary: formEl["salary"].value,
    typeOfEmployment: formEl["typeOfEmployment"].value,
    jobFieldCategory: formEl["jobFieldCategory"].value,
    description: formEl["description"].value
  },
  jobIdRef = selectJobEl.value;
  if (!jobIdRef) return;
  await Job.update(slots);
  // update the selection list option element
  selectJobEl.options[selectJobEl.selectedIndex].text = `${slots.jobName} at ${slots.company} (${slots.location}) - ${slots.jobFieldCategory}`;
  formEl.reset();
});