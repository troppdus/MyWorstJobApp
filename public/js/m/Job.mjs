import { fsDb } from "../initFirebase.mjs";
import { collection as fsColl, deleteDoc, doc as fsDoc, getDoc, getDocs, onSnapshot,
    orderBy, query as fsQuery, setDoc, updateDoc }
    from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";
import { isNonEmptyString, isIntegerOrIntegerString }
  from "../lib/util.mjs";
import {
  NoConstraintViolation, MandatoryValueConstraintViolation, RangeConstraintViolation,
  UniquenessConstraintViolation
}
  from "../lib/errorTypes.mjs";
import Enumeration from "../lib/Enumeration.mjs";

console.log("Job.mjs");
//   «get/set» jobID[1] : number(int)
// - «get/set» jobName[1] : String
// - «get/set» location[1] : String
// - «get/set» company[1] : Company -- string for now
// - «get/set» salary[1] : number(int)
// - «get/set» typeOfEmployment[1] : String
// - «get/set» jobFieldCategory[1] : String
// - «get/set» description[0..1] : String

/**
 * Define three Enumerations
 * @type {Enumeration}
 */
const typeOfEmploymentEL = new Enumeration(["Full Time", "Part Time"]);

/**
 * Constructor function for the class Job
 * @constructor
 * @param {{jobId: number, jobName: string, location: string, company: string, 
 *    salary: number, typeOfEmployment: string,
 *    jobFieldCategory: string, description: string}} slots - Object creation slots.
 */
class Job {
  // record parameter with the ES6 syntax for function parameter destructuring
  constructor({ jobId, jobName, location, company, salary, typeOfEmployment, jobFieldCategory, description }) {
    this.jobId = jobId;
    this.jobName = jobName;
    this.location = location;
    this.company = company;
    this.salary = salary;
    this.typeOfEmployment = typeOfEmployment;
    this.jobFieldCategory = jobFieldCategory;
    this.description = description;
  };

  get jobId() {
    return this._jobId;
  };

  static checkJobId(jobId) {
    if (!jobId) {
      return new MandatoryValueConstraintViolation("A job ID must be provided!");
    } else if (!isIntegerOrIntegerString(jobId) || parseInt(jobId) < 1) {
      return new RangeConstraintViolation("The job ID must be a positive integer!");
    } else {
      return new NoConstraintViolation();
    }
  };

  static async checkJobIdAsId(jobId) {
    let validationResult = Job.checkJobId(jobId);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!jobId) {
        validationResult = new MandatoryValueConstraintViolation(
          "A value for the job ID must be provided!");
      } else {
        const jobDocReff = fsDoc(fsDb, "jobs", jobId);
        try {
          const jobDocSn = await getDoc( jobDocReff);
          if (jobDocSn.exists()) {
            validationResult = new UniquenessConstraintViolation(
              "There is already a job record with this ID!");
          } else {
            validationResult = new NoConstraintViolation();
          }
        } catch (e) {
          console.error(`Error when checking job ID uniqueness: ${e}`);
          validationResult = new NoConstraintViolation();
        } 
      }
    }
    return validationResult;
  };

  static async checkJobIdAsIdRef(jobId) {
    let validationResult = Job.checkJobId(jobId);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!jobId) {
        validationResult = new MandatoryValueConstraintViolation(
          "A value for the job ID must be provided!");
      } else {
        const jobDocReff = await getDoc(fsDoc(fsDb, "jobs", jobId));
        if (!jobDocReff.exists()) {
          validationResult = new UniquenessConstraintViolation(
            `There is no job record with this ID ${jobId} !`);
        } else {
          validationResult = new NoConstraintViolation();
        }
      }
    }
    return validationResult;
  };



  set jobId( n) {
    const validationResult = Job.checkJobId(  n);
    if (validationResult instanceof NoConstraintViolation) {
      this._jobId = n;
    } else {
      throw validationResult;
    }
  };

  get jobName() {
    return this._jobName;
  };

  static checkJobName(n) {
    if (!n) {
      return new MandatoryValueConstraintViolation("A job name must be provided!");
    } else if (!isNonEmptyString(n)) {
      return new RangeConstraintViolation("The job name must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  };

  set jobName(n) {
    const validationResult = Job.checkJobName(n);
    if (validationResult instanceof NoConstraintViolation) {
      this._jobName = n;
    } else {
      throw validationResult;
    }
  };

  get location() {
    return this._location;
  };

  static checkLocation(loc) {
    if (!loc) {
      return new MandatoryValueConstraintViolation("A location must be provided!");
    } else if (!isNonEmptyString(loc)) {
      return new RangeConstraintViolation("The location must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  };

  set location(loc) {
    const validationResult = Job.checkLocation(loc);
    if (validationResult instanceof NoConstraintViolation) {
      this._location = loc;
    } else {
      throw validationResult;
    }
  };

  get company() {
    return this._company;
  };

  static checkCompany(company) {
    if (!company) {
      return new MandatoryValueConstraintViolation("A company name must be provided!");
    } else if (!isNonEmptyString(company)) {
      return new RangeConstraintViolation("The company name must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  };

  set company(company) {
    const validationResult = Job.checkCompany(company);
    if (validationResult instanceof NoConstraintViolation) {
      this._company = company;
    } else {
      throw validationResult;
    }
  };

  get salary() {
    return this._salary;
  };

  static checkSalary(salary) {
    if (!salary) {
      return new MandatoryValueConstraintViolation("A salary must be provided!");
    } else if (!isIntegerOrIntegerString(salary) || parseInt(salary) < 1) {
      console.log(salary);
      return new RangeConstraintViolation("The salary must be a positive integer!");
    } else {
      return new NoConstraintViolation();
    }
  };

  set salary(salary) {
    const validationResult = Job.checkSalary(salary);
    if (validationResult instanceof NoConstraintViolation) {
      this._salary = salary;
    } else {
      throw validationResult;
    }
  };

  get typeOfEmployment() {
    return this._typeOfEmployment;
  };

  static checkTypeOfEmployment(type) {
    if (!type) {
      return new MandatoryValueConstraintViolation("A type of employment must be provided!");
    } else if (!isIntegerOrIntegerString(type) ||
      parseInt(type) < 1 || parseInt(type) > typeOfEmploymentEL.MAX) {
      return new RangeConstraintViolation(
        "Invalid value for type of employment: " + type);
    } else {
      return new NoConstraintViolation();
    }
  };

  set typeOfEmployment(type) {
    const validationResult = Job.checkTypeOfEmployment(type);
    if (validationResult instanceof NoConstraintViolation) {
      this._typeOfEmployment = type;
    } else {
      throw validationResult;
    }
  };

  get jobFieldCategory() {
    return this._jobFieldCategory;
  };

  static checkJobFieldCategory(category) {
    if (!category) {
      return new MandatoryValueConstraintViolation("A job field category must be provided!");
    } else if (!isNonEmptyString(category)) {
      return new RangeConstraintViolation("The job field category must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  };

  set jobFieldCategory(category) {
    const validationResult = Job.checkJobFieldCategory(category);
    if (validationResult instanceof NoConstraintViolation) {
      this._jobFieldCategory = category;
    } else {
      throw validationResult;
    }
  };

  get description() {
    return this._description;
  };

  static checkDescription(description) {
    if (description && !isNonEmptyString(description)) {
      return new RangeConstraintViolation("The description must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  };

  set description(description) {
    const validationResult = Job.checkDescription(description);
    if (validationResult instanceof NoConstraintViolation) {
      this._description = description;
    } else {
      throw validationResult;
    }
  };
}



Job.instances = {};  // initially an empty associative array
/*********************************************************
 ***  Class-level ("static") storage management methods **
 *********************************************************/
/**
 * Conversion between a Job object and a corresponding Firestore document
 * @type {{toFirestore: (function(*): {year: number,
* jobId: (Document.jobId|*), jobName}), fromFirestore: (function(*, *=): Job)}}
*/
Job.converter = {
  toFirestore: function (job) {
    const data = {
      jobId: parseInt(job.jobId),
      jobName: job.jobName,
      location: job.location,
      company: job.company,
      salary: parseInt(job.salary),
      typeOfEmployment: parseInt(job.typeOfEmployment),
      jobFieldCategory: job.jobFieldCategory
    };
    if (job.description) data.description = job.description;
    return data;
  },
  fromFirestore: function (snapshot, options) {
    const data = snapshot.data(options);
    const job = new Job(data);
    
    return job;
  },
};

/**
 * Create a Firestore document in the Firestore collection "jobs"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Job.add = async function (slots) {
  let job = null;
  try {
    // validate data by creating Job instance
    job = new Job(slots);
    // invoke asynchronous ID/uniqueness check
    let validationResult = await Job.checkJobIdAsId(job.jobId);
    if (!validationResult instanceof NoConstraintViolation) throw validationResult;
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
    job = null;
  }
  if (job) {
    try {
      const jobDocRef = fsDoc(fsDb, "jobs", job.jobId).withConverter(Job.converter);
      await setDoc(jobDocRef, job);
      console.log(`Job record "${job.jobId}" created!`);
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message} + ${e}`);
    }
  }
};
/**
 * Load a job record from Firestore
 * @param jobId: {object}
 * @returns {Promise<*>} jobRecord: {array}
 */
Job.retrieve = async function (jobId) {
  try {
    const jobRec = (await getDoc(fsDoc(fsDb, "jobs", jobId)
      .withConverter(Job.converter))).data();
    console.log(`Job record "${jobRec.jobId}" retrieved.`);
    return jobRec;
  } catch (e) {
    console.error(`Error retrieving job record: ${e}`);
  }
};
/**
 * Load all job records from Firestore
 * @param order: {string}
 * @returns {Promise<*>} jobRecords: {array}
 */
Job.retrieveAll = async function (order) {
  if (!order) order = "jobId";
  const jobsCollRef = fsColl(fsDb, "jobs");
  const q = fsQuery(jobsCollRef, orderBy(order));
  try {
    const jobRecs = (await getDocs(q.withConverter(Job.converter))).docs.map(d => d.data());
    console.log(`${jobRecs.length} job records retrieved ${order ? "ordered by " + order : ""}`);
    return jobRecs;
  } catch (e) {
    console.error(`Error retrieving job records: ${e}`);
  }
};
/**
 * Update a Firestore document in the Firestore collection "jobs"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Job.update = async function (slots) {
  let noConstraintViolated = true,
    validationResult = null,
    jobBeforeUpdate = null;
  const jobDocRef = fsDoc(fsDb, "jobs", slots.jobId).withConverter(Job.converter),
    updatedSlots = {};

  try {
    // retrieve up-to-date job record
    const jobDocSn = await getDoc(jobDocRef);
    jobBeforeUpdate = jobDocSn.data();
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }

  try {
    if (jobBeforeUpdate.jobName !== slots.jobName) {
      validationResult = Job.checkJobName(slots.jobName);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.jobName = slots.jobName;
      else throw validationResult;
    }
    if (jobBeforeUpdate.location !== slots.location) {
      validationResult = Job.checkLocation(slots.location);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.location = slots.location;
      else throw validationResult;
    }
    if (jobBeforeUpdate.company !== slots.company) {
      validationResult = Job.checkCompany(slots.company);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.company = slots.company;
      else throw validationResult;
    }
    if (jobBeforeUpdate.salary !== slots.salary) {
      validationResult = Job.checkSalary(slots.salary);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.salary = parseInt(slots.salary);
      else throw validationResult;
    }
    if (jobBeforeUpdate.typeOfEmployment !== slots.typeOfEmployment) {
      validationResult = Job.checkTypeOfEmployment(slots.typeOfEmployment);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.typeOfEmployment = parseInt(slots.typeOfEmployment);
      else throw validationResult;
    }
    if (jobBeforeUpdate.jobFieldCategory !== slots.jobFieldCategory) {
      validationResult = Job.checkJobFieldCategory(slots.jobFieldCategory);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.jobFieldCategory = slots.jobFieldCategory;
      else throw validationResult;
    }
    if (slots.description && jobBeforeUpdate.description !== slots.description) {
      validationResult = Job.checkDescription(slots.description);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.description = slots.description;
      else throw validationResult;
    }
  } catch (e) {
    noConstraintViolated = false;
    console.error(`${e.constructor.name}: ${e.message}`);
  }

  if (noConstraintViolated) {
    const updatedProperties = Object.keys(updatedSlots);
    if (updatedProperties.length) {
      await updateDoc(jobDocRef, updatedSlots);
      console.log(`Property(ies) "${updatedProperties.toString()}" modified for job record "${slots.jobId}"`);
    } else {
      console.log(`No property value changed for job record "${slots.jobId}"!`);
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
    const fsDocRefDelete = fsDoc(fsDb, "jobs", jobId);
    await deleteDoc(fsDocRefDelete);
    console.log(`Job record ${jobId} deleted.`);
  } catch (e) {
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
  try {
    console.log("Generating test data...");
    const response = await fetch("../../test-data/jobs.json");
    const jobRecs = await response.json();
    // save all job record/documents
    await Promise.all(jobRecs.map(d => Job.add( d)));
    console.log(`${Object.keys(jobRecs).length} job records saved.`);
  }
  catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
};
/**
 * Clear database
 */
Job.clearData = async function () {
  if (confirm("Do you really want to delete all job records?")) {
    // retrieve all job documents from Firestore
    const jobRecs = await Job.retrieveAll();
    // delete all documents
    await Promise.all(jobRecs.map(d => Job.destroy(d.jobId.toString())));
    // ... and then report that they have been deleted
    console.log(`${Object.values(jobRecs).length} job records deleted.`);
  }
};

/*******************************************
 *** Non specific use case procedures ******
 ********************************************/
/**
 * Handle DB-UI synchronization
 * @param jobId {number}
 * @returns {function}
 */
Job.observeChanges = async function (jobId) {
  try {
    // listen document changes, returning a snapshot (snapshot) on every change
    const jobDocRef = fsDoc( fsDb, "jobs", jobId).withConverter( Job.converter);
    const jobRec = (await getDoc( jobDocRef)).data();
    return onSnapshot( jobDocRef, function (snapshot) {
      // create object with original document data
      const originalData = { itemName: "job", description: `${jobRec.title} (JobId: ${jobRec.jobId })`};
      if (!snapshot.data()) { // removed: if snapshot has not data
        originalData.type = "REMOVED";
        createModalFromChange( originalData); // invoke modal window reporting change of original data
      } else if (JSON.stringify( jobRec) !== JSON.stringify( snapshot.data())) {
        originalData.type = "MODIFIED";
        createModalFromChange( originalData); // invoke modal window reporting change of original data
      }
    });
  } catch (e) {
    console.error(`${e.constructor.name} : ${e.message}`);
  }
}

export default Job;
export { typeOfEmploymentEL };