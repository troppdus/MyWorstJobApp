/**
 * @fileOverview  The model class Application with attribute definitions and storage management methods
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 * @copyright Copyright � 2020-2022 Gerd Wagner (Chair of Internet Technology) and Juan-Francisco Reyes,
 * Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is",
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
import { fsDb } from "../initFirebase.mjs";
import {
  collection as fsColl, doc as fsDoc, setDoc, getDoc, getDocs, orderBy, query as fsQuery,
  Timestamp, startAt, limit, deleteField, writeBatch, arrayUnion, arrayRemove
}
  from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";

import Applicant from "./Applicant.mjs";
import Job from "./Job.mjs";
import {
  IntervalConstraintViolation, MandatoryValueConstraintViolation,
  NoConstraintViolation, PatternConstraintViolation, RangeConstraintViolation,
  UniquenessConstraintViolation
} from "../lib/errorTypes.mjs";
import { isIntegerOrIntegerString, isNonEmptyString } from "../lib/util.mjs";
import Enumeration from "../lib/Enumeration.mjs";

const ApplicationStatusEL = new Enumeration(["pending", "accepted", "rejected"]);

/**
 * Constructor function for the class Applicationion (constructor function).
 * 
 * @constructor
 * @param {applicationID: number,  applicationName: string, applicationEmail: string,
 *  applicationPhoneNumber: number, jobId: string, description: string,
 *  status: string, applicants: string, applicantIDRefs: string}
 */
class Application {
  // using a single record parameter with ES6 function parameter destructuring
  // constructor({ applicationID, applicationName, address, email, phone, resumeIdRefs }) {
  constructor({ applicationID, applicationName, applicationEmail, 
    applicationPhoneNumber, jobId, description, status, applicantIDRefs }) {
    // assign properties by invoking implicit setters
    this.applicationID = applicationID;
    this.applicationName = applicationName;
    this.applicationEmail = applicationEmail;
    this.applicationPhoneNumber = applicationPhoneNumber;
    this.jobId = jobId;
    this.description = description;
    this.status = status;
    this.applicantIDRefs = applicantIDRefs;
  };

  // «get/set» applicationID[1] : number(int)

  get applicationID() {
    return this._applicationID;
  };
  static checkApplicationID(applicationID) {
    if (!applicationID) {
      return new MandatoryValueConstraintViolation();
    } else {
      applicationID = parseInt(applicationID);  // convert to integer
      if (isNaN(applicationID) || !Number.isInteger(applicationID) || applicationID < 1) {
        return new RangeConstraintViolation(
          "The application ID must be a positive integer!");
      } else return new NoConstraintViolation();
    }
  };

  static async checkApplicationIDAsId(applicationID) {
    let validationResult = Application.checkApplicationID(applicationID);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!applicationID) {
        validationResult = new MandatoryValueConstraintViolation(
          "A value for the application ID must be provided!");
      } else {
        const applicationDocSn = await getDoc(fsDoc(fsDb, "applications", String(applicationID)));
        if (applicationDocSn.exists()) {
          validationResult = new UniquenessConstraintViolation(
            `There is already an application record with application ID ${applicationID}`);
        } else validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  };

  static async checkApplicationIDAsIdRef(applicationID) {
    let validationResult = Application.checkApplicationID(applicationID);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!applicationID) {
        validationResult = new MandatoryValueConstraintViolation(
          "A value for the Application ID must be provided!");
      } else {
        const applicationDocSn = await getDoc(fsDoc(fsDb, "applications", applicationID));
        if (!applicationDocSn.exists()) {
          validationResult = new UniquenessConstraintViolation(
            `There is no application record with this Application ID ${applicationID}!`);
        } else validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  };

  set applicationID(n) {
    const validationResult = Application.checkApplicationID(n);
    if (validationResult instanceof NoConstraintViolation) this._applicationID = n;
    else throw validationResult;
  };

  // «get/set» applicationName[1] : String

  get applicationName() {
    return this._applicationName;
  };
  static checkApplicationName(n) {
    if (!n) {
      return new NoConstraintViolation();  // not mandatory
    } else {
      if (typeof n !== "string" || n.trim() === "") {
        return new RangeConstraintViolation(
          "The application name must be a non-empty string!");
      } else return new NoConstraintViolation();
    }
  };
  set applicationName(a) {
    const constraintViolation = Application.checkApplicationName(a);
    if (constraintViolation instanceof NoConstraintViolation) {
      this._applicationName = a;
    } else throw constraintViolation;
  };


  // «get/set» applicationEmail[1] : String
  get applicationEmail() {
    return this._applicationEmail;
  }

  static checkApplicationEmail(applicationEmail) {
    // Define your validation logic for applicationEmail here
    // For example, you can check if it's a valid email or has specific patterns.
    // Modify this logic based on your requirements.
    if (!applicationEmail) {
      return new MandatoryValueConstraintViolation("An application email must be provided!");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicationEmail)) {
      return new PatternConstraintViolation("The application email is not well formed");
    } else {
      return new NoConstraintViolation();
    }
  }

  set applicationEmail(applicationEmail) {
    const validationResult = Application.checkApplicationEmail(applicationEmail);
    if (validationResult instanceof NoConstraintViolation) {
      this._applicationEmail = applicationEmail;
    } else {
      throw validationResult;
    }
  }

  // - «get/set» applicationPhoneNumber[1] : number(int)
  get applicationPhoneNumber() {
    return this._applicationPhoneNumber;
  }

  static checkApplicationPhoneNumber(number) {
    if (!number) {
      return new MandatoryValueConstraintViolation("An application phone number must be provided!");
    } else if (!isIntegerOrIntegerString(number) || parseInt(number) < 1) {
      return new RangeConstraintViolation("The application phone number must be a positive integer!");
    } else {
      return new NoConstraintViolation();
    }
  }

  set applicationPhoneNumber(number) {
    const validationResult = Application.checkApplicationPhoneNumber(number);
    if (validationResult instanceof NoConstraintViolation) {
      this._applicationPhoneNumber = number;
    } else {
      throw validationResult;
    }
  }

  // «get/set» jobId[1] : Job (string)

  get jobId() {
    return this._jobId;
  };

  set jobId( j) {
    this._jobId = j;
  };

  // «get/set» description[0..1] : String

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
    const validationResult = Application.checkDescription(description);
    if (validationResult instanceof NoConstraintViolation) {
      this._description = description;
    } else {
      throw validationResult;
    }
  };

  // «get/set» status[1] : String

  get status() {
    return this._status;
  }

  static checkStatus(status) {
    if (!status) {
      return new MandatoryValueConstraintViolation("A status must be provided!");
    } else if (!isIntegerOrIntegerString(status) ||
    parseInt(status) < 1 || parseInt(status) > ApplicationStatusEL.MAX) {
    return new RangeConstraintViolation(
      "Invalid value for status : " + status);
    } else {
      return new NoConstraintViolation();
    }
  }

  set status(status) {
    const validationResult = Application.checkStatus(status);
    if (validationResult instanceof NoConstraintViolation) {
      this._status = status;
    } else {
      throw validationResult;
    }
  }


  // «get» applicant[1] : Applicant (string)

  // get applicant() {
  //   return this._applicant;
  // }

  // set applicant(a) {
  //   this._applicant = a;
  // }
  get applicantIDRefs() {
    return this._applicantIDRefs;
  }

  addApplicant( a) {
    this._applicantIDRefs.push(a);
  }

  removeApplicant( a) {
    this._applicantIDRefs = this._applicantIDRefs.filter( d => d.id !== a.id);
  }
  set applicantIDRefs(a) {
    this._applicantIDRefs = a;
  }

}


Application.instances = {}; // initially an empty collection
/*********************************************************
 ***  Class-level ("static") storage management methods ***
 **********************************************************/
/**
 * Conversion between a Application object and a corresponding Firestore document
 * @type {{toFirestore: (function(*): {applicationID: (Document.applicationID|*), resumeIdRefs: (Document.resumeIdRefs|*),
 * applicationName, address, email, phone}), fromFirestore: (function(*, *=): Application)}}
 */
Application.converter = {
  toFirestore: function (application) {
    const data = {
      applicationID: parseInt(application.applicationID),
      applicationName: application.applicationName,
      applicationEmail: application.applicationEmail,
      applicationPhoneNumber: parseInt(application.applicationPhoneNumber),
      jobId: parseInt(application.jobId),
      description: application.description,      
      status: parseInt(application.status),
      applicantIDRefs: application.applicantIDRefs
    };
    if (application.description) data.description = application.description;
    return data;
  },
  fromFirestore: function (snapshot, options) {
    const application = snapshot.data(options),
      data = {
        applicationID: application.applicationID,
        applicationName: application.applicationName,
        applicationEmail: application.applicationEmail,
        applicationPhoneNumber: application.applicationPhoneNumber,
        jobId: application.jobId,
        description: application.description,
        status: application.status,
        applicantIDRefs: application.applicantIDRefs
      };
    return new Application(data);
  },
};
/**
 * Create a Firestore document in the Firestore collection "applications"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Application.add = async function (slots) {
  let application = null, validationResult = null;
  try {
    // validate data by creating Application instance
    application = await new Application(slots);
    // invoke asynchronous ID/uniqueness check
    console.log("application", application.applicationID);
    validationResult = await Application.checkApplicationIDAsId(application.applicationID);
    if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
    validationResult = await Job.checkJobIdAsIdRef(application.jobId);
    if (!validationResult instanceof NoConstraintViolation) throw validationResult;
    for (const a of application.applicantIDRefs) {
      validationResult = await Applicant.checkApplicantIDAsIdRef(String(a.id));
      if (!validationResult instanceof NoConstraintViolation) throw validationResult;
    }
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
    application = null;
  }
  if (application) {
    console.log("application", application);
    const applicationDocRef = fsDoc(fsDb, "applications", String(application.applicationID))
        .withConverter(Application.converter);
    const applicantsCollRef = fsColl(fsDb, "applicants")
        .withConverter(Applicant.converter);
    const jobsCollRef = fsColl(fsDb, "jobs")
        .withConverter(Job.converter);

    const applicationInverseRef = { applicationID: application.applicationID, applicationName: application.applicationName };

    try {
      const batch = writeBatch(fsDb); // initiate batch write object
      await batch.set(applicationDocRef, application); // create application record (master)
      // // iterate ID references (foreign keys) of slave class objects (applicants) and
      // // create derived inverse reference properties to master class object (application)
      // // Applicants::applicantOwner
      // console.log("batch application",application);
      await Promise.all(application.applicantIDRefs.map(a => {
        // console.log("a.id",a.id);
        const applicantDocRef = fsDoc(applicantsCollRef, String(a.applicantID));
        batch.update(applicantDocRef, { applications: arrayUnion(applicationInverseRef) });
      }));
      if (application.jobId) {
        const jobDocRef = fsDoc(jobsCollRef, String(application.jobId));
        batch.update(jobDocRef, { customApps: arrayUnion(applicationInverseRef) });
      }
      batch.commit(); // commit batch write
      console.log(`Application record "${application.applicationID}" created!`);
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message}`);
    }
  }
};
/**
 * Load a application record from Firestore
 * @param applicationID: {string}
 * @returns {Promise<*>} applicationRec: {object}
 */
Application.retrieve = async function (applicationID) {
  try {
    const applicationRec = (await getDoc(fsDoc(fsDb, "applications", String(applicationID))
      .withConverter(Application.converter))).data();
    if (applicationRec) console.log(`Application record "${applicationID}" retrieved.`);
    return applicationRec;
  } catch (e) {
    console.error(`Error retrieving application record: ${e}`);
  }
};

Application.retrieveAll = async function (order) { 
  if (!order) order = "applicationID";
  const applicationsCollRef = fsColl(fsDb, "applications");
  const q = fsQuery(applicationsCollRef, orderBy(order));
  try {
    const applicationRecs = (await getDocs(q.withConverter(Application.converter))).docs.map(d => d.data());
    console.log(`${applicationRecs.length} application records retrieved ${order ? "ordered by " + order : ""}`);
    return applicationRecs;
  } catch (e) {
    console.error(`Error retrieving application records: ${e}`);
  }
};

/**
 * Load all application records from Firestore
 * @param params: {object}
 * @returns {Promise<*>} applicationRecs: {array}
 */
Application.retrieveBlock = async function (params) {
  try {
    if (!params) params = {order};
    let applicationsCollRef = fsColl(fsDb, "applications");
    // set limit and order in query
    applicationsCollRef = fsQuery(applicationsCollRef, limit(10));
    if (params.order) applicationsCollRef = fsQuery(applicationsCollRef, orderBy(params.order));
    // set pagination "startAt" cursor
    if (params.cursor) {
      applicationsCollRef = fsQuery(applicationsCollRef, startAt(params.cursor));
    }
    const applicationRecs = (await getDocs(applicationsCollRef
      .withConverter(Application.converter))).docs.map(d => d.data());
    if (applicationRecs.length) {
      console.log(`Block of application records retrieved! (cursor: ${applicationRecs[0][params.order]})`);
    }
    return applicationRecs;
  } catch (e) {
    console.error(`Error retrieving all application records: ${e}`);
  }
};
/**
 * Update a Firestore document in the Firestore collection "applications"
 * @param applicationID: {string}
 * @param applicationName: {string}
 * @param applicationEmail: {string}
 * @param applicationPhoneNumber: {string}
 * @param description: {string}
 * @param status: {string}
 * "
 * @returns {Promise<void>}
 */
// slots applicationID, applicationName, applicationEmail,
//   applicationPhoneNumber, description, status, applicantIDRefsToAdd, applicantIDRefsToRemove
Application.update = async function ( slots) {
  
  let validationResult = null,
    applicationBeforeUpdate = null;
  const applicationDocRef = fsDoc(fsDb, "applications", String(slots.applicationID)).withConverter(Application.converter),
    updatedSlots = {};
  try {
    // retrieve up-to-date application record
    applicationBeforeUpdate = (await getDoc(applicationDocRef)).data();
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
  // evaluate if slots contains updates, while building "updatedSlots" object
  if (applicationBeforeUpdate) {
    if (applicationBeforeUpdate.applicationName !== slots.applicationName) updatedSlots.applicationName = slots.applicationName;
    if (applicationBeforeUpdate.applicationEmail !== slots.applicationEmail) updatedSlots.applicationEmail = slots.applicationEmail;
    if (applicationBeforeUpdate.applicationPhoneNumber !== slots.applicationPhoneNumber) updatedSlots.applicationPhoneNumber = slots.applicationPhoneNumber;
    if (applicationBeforeUpdate.description !== slots.description) updatedSlots.description = slots.description;
    if (applicationBeforeUpdate.status !== slots.status) updatedSlots.status = slots.status;
    if (slots.applicantIDRefsToAdd) for (const applicationIDRef of slots.applicantIDRefsToAdd) {
      applicationBeforeUpdate.addApplicant(applicationIDRef);}
    if (slots.applicantIDRefsToRemove) for (const applicationIDRef of slots.applicantIDRefsToRemove) {
      applicationBeforeUpdate.removeApplicant(applicationIDRef);}
    if (slots.applicantIDRefsToAdd || slots.applicantIDRefsToRemove) 
        updatedSlots.applicantIDRefs = applicationBeforeUpdate.applicantIDRefs;
  }
  // if there are updates, run checkers while updating master object (application)
  // in a batch write transaction
  const updatedProperties = Object.keys(updatedSlots);
  if (updatedProperties.length) {
    try {
      const applicantsCollRef = fsColl(fsDb, "applicants")
        .withConverter(Applicant.converter),
        jobsCollRef = fsColl(fsDb, "jobs")
          .withConverter(Job.converter);
          
      // initialize (before and after update) inverse ID references
      const inverseRefBefore = { applicationID: slots.applicationID, applicationName: applicationBeforeUpdate.applicationName };
      const inverseRefAfter = { applicationID: slots.applicationID, applicationName: slots.applicationName };
      const batch = writeBatch(fsDb); // initiate batch write

      // remove old derived inverse references properties from slave
      // objects (applicants) Applicant::applicantOwner
      if (slots.applicantIDRefsToRemove) {
        await Promise.all(slots.applicantIDRefsToRemove.map(a => {
          const applicantCollRef = fsDoc(applicantsCollRef, String(a.applicantID));
          batch.update(applicantCollRef, { applications: arrayRemove(inverseRefBefore) });
        }));
      }
      // add new derived inverse references properties from slave objects
      // (applicants) Applicant::applicantOwner, while checking constraint violations

      if (slots.applicantIDRefsToAdd) {
        await Promise.all(slots.applicantIDRefsToAdd.map(async a => {
          const applicantCollRef = fsDoc(applicantsCollRef, String(a.applicantID));
          validationResult = await Applicant.checkApplicantIDAsIdRef(String(a.applicantID));
          if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
          batch.update(applicantCollRef, { applications: arrayUnion(inverseRefAfter) });
        }));
      }
      // if applicationName changes, update applicationName in ID references (array of maps) in
      // unchanged author objects
      if (updatedSlots.applicationName) {
        const NoChangedApplicantIdRefs = slots.applicantIDRefsToAdd ?
          applicationBeforeUpdate.applicantIDRefs.filter(a => !slots.applicantIDRefsToAdd.includes(a))
          : applicationBeforeUpdate.applicantIDRefs;
        await Promise.all(NoChangedApplicantIdRefs.map(a => {
          const applicantDocRef = fsDoc(applicantsCollRef, String(a.applicantID));
          batch.update(applicantDocRef, { applications: arrayRemove(inverseRefBefore) });
        }));
        await Promise.all(NoChangedApplicantIdRefs.map(a => {
          const applicantDocRef = fsDoc(applicantsCollRef, String(a.applicantID));
          batch.update(applicantDocRef, { applications: arrayUnion(inverseRefAfter) });
        }));
      }
      
      // update application object (master)
      batch.update(applicationDocRef, updatedSlots);
      batch.commit(); // commit batch write
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message}`);
    }
    console.log(`Property(ies) "${updatedProperties.toString()}" modified for application record "${slots.applicationID}"`);
  } else {
    console.log(`No property value changed for application record "${applicationID}"!`);
  }
};
/**
 * Delete a Firestore document from the Firestore collection "applications"
 * @param applicationID: {string}
 * @returns {Promise<void>}
 */
Application.destroy = async function (applicationID) {
  const applicationDocRef = fsDoc(fsDb, "applications", String(applicationID))
    .withConverter(Application.converter),
    jobsCollRef = fsColl(fsDb, "jobs")
      .withConverter(Job.converter),
    applicantsCollRef = fsColl(fsDb, "applicants")
      .withConverter(Applicant.converter);
  try {
    // delete master class object (application) while updating derived inverse
    // properties in objects from slave classes (authors and publishers)

    
    const batch = writeBatch(fsDb); // initiate batch write object
    // // delete derived inverse reference properties, Authors::/authoredApplications
    const applicationRec = (await getDoc(applicationDocRef
      .withConverter(Application.converter))).data();
    const inverseRef = {applicationID: applicationRec.applicationID, applicationName: applicationRec.applicationName };
    console.log("check");
    await Promise.all(applicationRec.applicantIDRefs.map(aId => {
      const applicantCollRef = fsDoc(applicantsCollRef, String(aId.applicantID));
      batch.update(applicantCollRef, { applications: arrayRemove(inverseRef) });
    }));
    console.log("check 3 ");
    // delete derived inverse reference properties, Jobs
    batch.delete(applicationDocRef); // create application record (master)
    batch.commit(); // commit batch write
    console.log(`Application record "${applicationID}" deleted!`);
  } catch (e) {
    console.error(`Error deleting application record: ${e}`);
  }
};

Application.generateTestData = async function () {
  try {
    console.log("Generating test data...");
    const response = await fetch("../../test-data/applications_test.json");
    const appRecs = await response.json();
    // save all job record/documents
    await Promise.all(appRecs.map(d => Application.add( d)));
    console.log(`${Object.keys(appRecs).length} job records saved.`);
  }
  catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
};

Application.clearData = async function () {
  if (confirm("Do you really want to delete all Application records?")) {
    // retrieve all app documents from Firestore
    const appRecs = await Application.retrieveAll();
    // delete all documents
    await Promise.all(appRecs.map(d => Application.destroy(d.applicationID.toString())));
    // ... and then report that they have been deleted
    console.log(`${Object.values(appRecs).length} job records deleted.`);
  }
};

export default Application;
export { ApplicationStatusEL };