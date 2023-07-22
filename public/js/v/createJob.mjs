/***************************************************************
 Import classes and data types
 ***************************************************************/
 import Job, { typeOfEmploymentEL } from "../m/Job.mjs";
 import { handleAuthentication } from "./accessControl.mjs";
 import { fillSelectWithOptions, showProgressBar, hideProgressBar } from "../lib/util.mjs";
 
 
 /***************************************************************
  Setup and handle UI Authentication
  ***************************************************************/
 handleAuthentication();
 /***************************************************************
  Declare variables for accessing UI elements
  ***************************************************************/
 const formEl = document.forms["Job"],
   createButton = formEl["commit"],
   progressEl = document.querySelector("progress"),
   typeOfEmploymentEl = formEl["typeOfEmployment"];

Job.retrieveAll();
 /***************************************************************
  Set up (choice) widgets
  ***************************************************************/
 // set up the originalLanguage selection list
 fillSelectWithOptions(typeOfEmploymentEl, typeOfEmploymentEL.labels);
 
 
 formEl.jobId.addEventListener("input", async function () {
  const validationResult = await Job.checkJobIdAsId(formEl.jobId.value);
  formEl.jobId.setCustomValidity(validationResult.message);
});
 formEl["jobName"].addEventListener("input", function () {
   formEl["jobName"].setCustomValidity(Job.checkJobName(formEl["jobName"].value).message);
 });
 formEl["location"].addEventListener("input", function () {
   formEl["location"].setCustomValidity(Job.checkLocation(formEl["location"].value).message);
 });
 formEl["company"].addEventListener("input", async function () {
  formEl["company"].setCustomValidity(Job.checkCompany(formEl["company"].value).message);
 });
 formEl["salary"].addEventListener("input", function () {
   formEl["salary"].setCustomValidity(Job.checkSalary(formEl["salary"].value).message);
 });
 typeOfEmploymentEl.addEventListener("click", function () {
   formEl["typeOfEmployment"].setCustomValidity(Job.checkTypeOfEmployment(typeOfEmploymentEl.value).message);
 });
 
//  formEl["jobFieldCategory"].addEventListener("input", function () {
//    formEl["jobFieldCategory"].setCustomValidity(Job.checkJobFieldCategory(formEl["jobFieldCategory"].value).message);
//  });
//  formEl["description"].addEventListener("input", function () {
//    formEl["description"].setCustomValidity(Job.checkDescription(formEl["description"].value).message);
//  });
 
 
 
 /******************************************************************
  Add event listeners for the create/submit button
  ******************************************************************/
createButton.addEventListener("click", async function () {
    const formEl = document.forms["Job"],
     slots = {
     jobId: formEl.jobId.value,
     jobName: formEl["jobName"].value,
     location: formEl["location"].value,
     company: formEl["company"].value,
     salary: formEl["salary"].value,
     typeOfEmployment: formEl["typeOfEmployment"].value,
     jobFieldCategory: formEl["jobFieldCategory"].value,
     description: formEl["description"].value
   };

   showProgressBar( progressEl);
   formEl.jobId.setCustomValidity(( await Job.checkJobIdAsId( slots.jobId)).message);
   formEl["jobName"].setCustomValidity( Job.checkJobName( slots.jobName).message);
   formEl["location"].setCustomValidity( Job.checkLocation( slots.location).message);
   formEl["company"].setCustomValidity( Job.checkCompany( slots.company).message);
   formEl["salary"].setCustomValidity( Job.checkSalary( slots.salary).message);
   formEl["typeOfEmployment"].setCustomValidity( Job.checkTypeOfEmployment( slots.typeOfEmployment).message);
   formEl["jobFieldCategory"].setCustomValidity( Job.checkJobFieldCategory( slots.jobFieldCategory).message);
   formEl["description"].setCustomValidity( Job.checkDescription( slots.description).message);
 
   if (formEl.checkValidity()) {
     await Job.add(slots);
     formEl.reset();
   } else {
    console.log("Form is not valid!");
  }
  hideProgressBar( progressEl);
 });
formEl.addEventListener("submit", function (e) {
  e.preventDefault();
  formEl.reset();
});