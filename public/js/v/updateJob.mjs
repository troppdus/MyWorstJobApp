// Import classes and data types
import Job from "../m/Job.mjs";

// Load data
const jobRecords = await Job.retrieveAll();

// Declare variables for accessing UI elements
const formEl = document.forms["Job"],
  updateButton = formEl["commit"],
  selectJobEl = formEl["selectJob"];

formEl["jobId"].addEventListener("input", function () {
  // do not yet check the ID constraint, only before commit
  formEl["jobId"].setCustomValidity(Job.checkJobId(formEl["jobId"].value).message);
});
formEl["jobName"].addEventListener("input", function () {
  formEl["jobName"].setCustomValidity(Job.checkJobName(formEl["jobName"].value).message);
});
formEl["location"].addEventListener("input", function () {
  formEl["location"].setCustomValidity(Job.checkLocation(formEl["location"].value).message);
});
formEl["company"].addEventListener("input", function () {
  formEl["company"].setCustomValidity(Job.checkCompany(formEl["company"].value).message);
});
formEl["salary"].addEventListener("input", function () {
  formEl["salary"].setCustomValidity(Job.checkSalary(formEl["salary"].value).message);
});
formEl["typeOfEmployment"].addEventListener("input", function () {
  formEl["typeOfEmployment"].setCustomValidity(Job.checkTypeOfEmployment(formEl["typeOfEmployment"].value).message);
});
formEl["jobFieldCategory"].addEventListener("input", function () {
  formEl["jobFieldCategory"].setCustomValidity(Job.checkJobFieldCategory(formEl["jobFieldCategory"].value).message);
});
formEl["description"].addEventListener("input", function () {
  formEl["description"].setCustomValidity(Job.checkDescription(formEl["description"].value).message);
});

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
    for (const field of ["jobId", "jobName", "location", "company", 
    "salary", "typeOfEmployment", "jobFieldCategory", "description"]) {
      formEl[field].value = jobRec[field] !== undefined ? jobRec[field] : "";
      // delete custom validation error message which may have been set before
      formEl[field].setCustomValidity("");
    }
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
   // set error messages in case of constraint violations
   formEl["jobName"].addEventListener("input", function () {
    formEl["jobName"].setCustomValidity(
      Job.checkJobName(slots.jobName).message);
  });
  formEl["location"].addEventListener("input", function () {
    formEl["location"].setCustomValidity(
      Job.checkLocation(slots.location).message);
  });
  formEl["company"].addEventListener("input", function () {
    formEl["company"].setCustomValidity(
      Job.checkCompany(slots.company).message);
  });
  formEl["salary"].addEventListener("input", function () {
    formEl["salary"].setCustomValidity(
      Job.checkSalary(slots.salary).message);
  });
  formEl["typeOfEmployment"].addEventListener("input", function () {
    formEl["typeOfEmployment"].setCustomValidity(
      Job.checkTypeOfEmployment(slots.typeOfEmployment).message);
  });
  formEl["jobFieldCategory"].addEventListener("input", function () {
    formEl["jobFieldCategory"].setCustomValidity(
      Job.checkJobFieldCategory(slots.jobFieldCategory).message);
  });
  formEl["description"].addEventListener("input", function () {
    formEl["description"].setCustomValidity(
      Job.checkDescription(slots.description).message);
  });

  if (formEl.checkValidity()) {
    Job.update(slots);
    // update the selection list option
    selectJobEl.options[selectJobEl.selectedIndex].text = slots.jobName;
    formEl.reset();
  }
});

// neutralize the submit event
formEl.addEventListener("submit", function (e) {
  e.preventDefault();
});
