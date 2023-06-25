import { fsDb } from "../initFirebase.mjs";
import { collection as fsColl, deleteDoc, doc as fsDoc, getDoc, getDocs, setDoc, updateDoc, query as fsQuery }
  from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore-lite.js";


//   «get/set» jobID[1] : number(int)
// - «get/set» jobName[1] : String
// - «get/set» location[1] : String
// - «get/set» company[1] : Company -- string for now
// - «get/set» salary[1] : Double -- changed to int
// - «get/set» typeOfEmployment[1] : String
// - «get/set» jobFieldCategory[1] : String
// - «get/set» description[0..1] : String
/**
 * Constructor function for the class Job
 * @constructor
 * @param {{jobId: number, jobName: string, location: string, company: string, 
 *    salary: number, typeOfEmployment: string,
 *    jobFieldCategory: string, description: string}} slots - Object creation slots.
 */
class Job {
  // record parameter with the ES6 syntax for function parameter destructuring
  constructor({jobId, jobName, location, company, salary, typeOfEmployment, jobFieldCategory, description}) {
    this.jobId = jobId;
    this.jobName = jobName;
    this.location = location;
    this.company = company;
    this.salary = salary;
    this.typeOfEmployment = typeOfEmployment;
    this.jobFieldCategory = jobFieldCategory;
    this.description = description;
  }
}


Job.instances = {};  // initially an empty associative array
/*********************************************************
 ***  Class-level ("static") storage management methods **
 *********************************************************/
/**
 * Create a Firestore document in the Firestore collection "jobs"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Job.add = async function (slots) {
  const jobsCollRef = fsColl( fsDb, "jobs"),
    jobDocRef = fsDoc (jobsCollRef, slots.jobId.toString());
  slots.salary = parseInt( slots.salary);  // convert from string to integer
  try {
    await setDoc( jobDocRef, slots);
    console.log(`Job record ${slots.jobId} created.`);
  } catch( e) {
    console.error(`Error when adding job record: ${e}`);
  }
};
/**
 * Load a job record from Firestore
 * @param jobId: {object}
 * @returns {Promise<*>} jobRecord: {array}
 */
Job.retrieve = async function (jobId) {
  let jobDocSn = null;
  try {
    const jobDocRef = fsDoc( fsDb, "jobs", jobId);
    jobDocSn = await getDoc( jobDocRef);
  } catch( e) {
    console.error(`Error when retrieving job record: ${e}`);
    return null;
  }
  const jobRec = jobDocSn.data();
  return jobRec;
};
/**
 * Load all job records from Firestore
 * @returns {Promise<*>} jobRecords: {array}
 */
Job.retrieveAll = async function () {
  let jobsQrySn = null;
  try {
    const jobsCollRef = fsColl( fsDb, "jobs");
    jobsQrySn = await getDocs( jobsCollRef);
  } catch( e) {
    console.error(`Error when retrieving job records: ${e}`);
    return null;
  }
  const jobDocs = jobsQrySn.docs,
    jobRecs = jobDocs.map( d => d.data());
  console.log(`${jobRecs.length} job records retrieved.`);
  return jobRecs;
};
/**
 * Update a Firestore document in the Firestore collection "jobs"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Job.update = async function (slots) {
  const updSlots = {};
  // retrieve up-to-date job record
  const jobRec = await Job.retrieve( slots.jobId);
  // convert from string to integer
  if (slots.salary) slots.salary = parseInt( slots.salary);
  // update only those slots that have changed
  if (jobRec.jobName !== slots.jobName) updSlots.jobName = slots.jobName;
  if (jobRec.salary !== slots.salary) updSlots.salary = slots.salary;
  if (jobRec.location !== slots.location) updSlots.location = slots.location;
  if (jobRec.company !== slots.company) updSlots.company = slots.company;
  if (jobRec.typeOfEmployment !== slots.typeOfEmployment) updSlots.typeOfEmployment = slots.typeOfEmployment;
  if (jobRec.jobFieldCategory !== slots.jobFieldCategory) updSlots.jobFieldCategory = slots.jobFieldCategory;
  if (slots.description) {
    if (jobRec.description !== slots.description) updSlots.description = slots.description;
  }

  if (Object.keys( updSlots).length > 0) {
    try {
      const jobDocRef = fsDoc( fsDb, "jobs", slots.jobId);
      await updateDoc( jobDocRef, updSlots);
      console.log(`Job record ${slots.jobId} modified.`);
    } catch( e) {
      console.error(`Error when updating job record: ${e}`);
    }
  }
};
/**
 * Delete a Firestore document from the Firestore collection "jobs"
 * @param jobId: {string}
 * @returns {Promise<void>}
 */
Job.destroy = async function (jobId) {
  try {
    await deleteDoc( fsDoc( fsDb, "jobs", jobId.toString()));
    console.log(`Job record ${jobId} deleted.`);
  } catch( e) {
    console.error(`Error when deleting job record: ${e}`);
  }
};
/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 * Create test data
 */
Job.generateTestData = async function () {
  let jobRecs = [
    {
      jobId: 1, 
      jobName: 'Software Engineer', 
      location: 'San Francisco', 
      company: 'Google', 
      salary: 120000, 
      typeOfEmployment: 'Full Time', 
      jobFieldCategory: 'Engineering', 
      description: 'Design, develop, test, deploy, maintain and improve software.'
    }, 
    {
      jobId: 2, 
      jobName: 'Data Analyst', 
      location: 'New York', 
      company: 'Facebook', 
      salary: 95000, 
      typeOfEmployment: 'Part Time', 
      jobFieldCategory: 'Data Science', 
      description: 'Interpret data, analyze results using statistical techniques.'
    },
    {
      jobId: 3, 
      jobName: 'Product Manager', 
      location: 'Seattle', 
      company: 'Amazon', 
      salary: 130000, 
      typeOfEmployment: 'Full Time', 
      jobFieldCategory: 'Product'
    }, 
    {
      jobId: 4, 
      jobName: 'UX Designer', 
      location: 'Austin', 
      company: 'Apple', 
      salary: 90000, 
      typeOfEmployment: 'Full Time', 
      jobFieldCategory: 'Design', 
      description: 'Designing user interactions on websites.'
    }, 
    {
      jobId: 5, 
      jobName: 'Marketing Manager', 
      location: 'Chicago', 
      company: 'Microsoft', 
      salary: 105000, 
      typeOfEmployment: 'Full Time', 
      jobFieldCategory: 'Marketing'
    }
  ];
  // save all job record/documents
  await Promise.all( jobRecs.map( d => Job.add( d)));
  console.log(`${Object.keys( jobRecs).length} job records saved.`);
};
/**
 * Clear database
 */
Job.clearData = async function () {
  if (confirm("Do you really want to delete all job records?")) {
    // retrieve all job documents from Firestore
    const jobRecs = await Job.retrieveAll();
    // delete all documents
    await Promise.all( jobRecs.map( d => Job.destroy( d.jobId.toString())));
    // ... and then report that they have been deleted
    console.log(`${Object.values( jobRecs).length} job records deleted.`);
  }
};

export default Job;
