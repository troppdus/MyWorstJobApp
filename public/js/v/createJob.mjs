/***************************************************************
 Import classes and data types
 ***************************************************************/
import Job, { typeOfEmploymentEL } from "../m/Job.mjs";
import { handleAuthentication } from "./accessControl.mjs";
import {fillSelectWithOptions} from "../lib/util.mjs"

/***************************************************************
 Setup and handle UI Authentication
 ***************************************************************/
handleAuthentication();
/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Job"],
  createButton = formEl["commit"],
  typeOfEmploymentEl = formEl["typeOfEmployment"];
/***************************************************************
 Set up (choice) widgets
 ***************************************************************/
// set up the originalLanguage selection list
fillSelectWithOptions(typeOfEmploymentEl, typeOfEmploymentEL.labels);

/******************************************************************
 Add event listeners for the create/submit button
 ******************************************************************/
createButton.addEventListener("click", async function () {
  const slots = {
    jobId: formEl["jobId"].value,
    jobName: formEl["jobName"].value,
    location: formEl["location"].value,
    company: formEl["company"].value,
    salary: formEl["salary"].value,
    typeOfEmployment: formEl["typeOfEmployment"].value,
    jobFieldCategory: formEl["jobFieldCategory"].value,
    description: formEl["description"].value
  };
  await Job.add(slots);
  formEl.reset();
});
