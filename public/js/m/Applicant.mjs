/**
 * @fileOverview  The model class Applicant with attribute definitions and storage management methods
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
import Dokument from "./Dokument.mjs";
import {
  IntervalConstraintViolation, MandatoryValueConstraintViolation,
  NoConstraintViolation, PatternConstraintViolation, RangeConstraintViolation,
  UniquenessConstraintViolation
} from "../lib/errorTypes.mjs";
import { isIntegerOrIntegerString } from "../lib/util.mjs";

/**
 * Constructor function for the class Applicant
 * @constructor
 * @param {applicantID: number, applicantName: string, address: string, address: string, email: string, phone: string, resumeIdRefs: array} slots - Object creation slots.
 */
class Applicant {
  // using a single record parameter with ES6 function parameter destructuring
  constructor({ applicantID, applicantName, address, email, phone, resumeIdRefs }) {
    // assign properties by invoking implicit setters
    this.applicantID = applicantID;
    this.applicantName = applicantName;
    this.address = address;
    this.email = email;
    this.phone = phone;
    this.resumeIdRefs = resumeIdRefs;
  };
  get applicantID() {
    return this._applicantID;
  };
  static checkApplicantID(applicantID) {
    if (!applicantID) {
      return new NoConstraintViolation();  // may be optional as an IdRef
    } else {
      applicantID = parseInt(applicantID);  // convert to integer
      if (isNaN(applicantID) || !Number.isInteger(applicantID) || applicantID < 1) {
        return new RangeConstraintViolation(
          "The applicant ID must be a positive integer!");
      } else return new NoConstraintViolation();
    }
  };
  static async checkApplicantIDAsId(applicantID) {
    let validationResult = Applicant.checkApplicantID(applicantID);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!applicantID) {
        validationResult = new MandatoryValueConstraintViolation(
          "A value for the applicant ID must be provided!");
      } else {
        const applicantDocSn = await getDoc(fsDoc(fsDb, "applicants", applicantID));
        if (applicantDocSn.exists()) {
          validationResult = new UniquenessConstraintViolation(
            `There is already an applicant record with applicant ID ${applicantID}`);
        } else validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  };
  static async checkApplicantIDAsIdRef(applicantID) {
    let validationResult = Applicant.checkApplicantID(applicantID);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!applicantID) {
        validationResult = new MandatoryValueConstraintViolation(
          "A value for the Applicant ID must be provided!");
      } else {
        const applicantDocSn = await getDoc(fsDoc(fsDb, "applicants", applicantID));
        if (!applicantDocSn.exists()) {
          validationResult = new UniquenessConstraintViolation(
            `There is no applicant record with this Applicant ID ${applicantID}!`);
        } else validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  };
  set applicantID(n) {
    const validationResult = Applicant.checkApplicantID(n);
    if (validationResult instanceof NoConstraintViolation) this._applicantID = n;
    else throw validationResult;
  };
  get applicantName() {
    return this._applicantName;
  };
  static checkApplicantName(n) {
    if (!n) {
      return new NoConstraintViolation();  // not mandatory
    } else {
      if (typeof n !== "string" || n.trim() === "") {
        return new RangeConstraintViolation(
          "The applicant name must be a non-empty string!");
      } else return new NoConstraintViolation();
    }
  };
  set applicantName(a) {
    const constraintViolation = Applicant.checkApplicantName(a);
    if (constraintViolation instanceof NoConstraintViolation) {
      this._applicantName = a;
    } else throw constraintViolation;
  };
  get address() {
    return this._address;
  };
  static checkAddress(n) {
    if (!n) {
      return new NoConstraintViolation();  // not mandatory
    } else {
      if (typeof n !== "string" || n.trim() === "") {
        return new RangeConstraintViolation(
          "The address must be a non-empty string!");
      } else return new NoConstraintViolation();
    }
  };
  set address(d) {
    let validationResult = Applicant.checkAddress(d);
    if (validationResult instanceof NoConstraintViolation) this._address = d;
    else throw validationResult;
  };
  get email() {
    return this._email;
  };
  static checkEmail(email) {
    console.log("email",email);
    if (!email) {
      return new MandatoryValueConstraintViolation("An email must be provided!");
    } else if (!(/\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/.test(email))) {
      return new PatternConstraintViolation("The email is not well formed");
    } else {
      return new NoConstraintViolation();
    }
  };
  set email(d) {
    let validationResult = Applicant.checkEmail(d);
    if (validationResult instanceof NoConstraintViolation) this._email = d;
    else throw validationResult;
  };
  get phone() {
    return this._phone;
  };
  static checkPhone(number) {
    if (!number) {
      return new MandatoryValueConstraintViolation("A phone number must be provided!");
    } else if (!isIntegerOrIntegerString(number) || parseInt(number) < 1) {
      return new RangeConstraintViolation("The phone number must be a positive integer!");
    } else {
      return new NoConstraintViolation();
    }
  };
  set phone(d) {
    let validationResult = Applicant.checkPhone(d);
    if (validationResult instanceof NoConstraintViolation) this._phone = d;
    else throw validationResult;
  };
  get resumeIdRefs() {
    return this._resumeIdRefs;
  };
  addResume(a) {
    this._resumeIdRefs.push(a);
  };
  removeResume(a) {
    this._resumeIdRefs = this._resumeIdRefs.filter(d => d.id !== a.id);
  };
  set resumeIdRefs(a) {
    this._resumeIdRefs = a;
  };
}
/*********************************************************
 ***  Class-level ("static") storage management methods ***
 **********************************************************/
/**
 * Conversion between a Applicant object and a corresponding Firestore document
 * @type {{toFirestore: (function(*): {applicantID: (Document.applicantID|*), resumeIdRefs: (Document.resumeIdRefs|*),
 * applicantName, address, email, phone}), fromFirestore: (function(*, *=): Applicant)}}
 */
Applicant.converter = {
  toFirestore: function (applicant) {
    const data = {
      applicantID: parseInt(applicant.applicantID),
      applicantName: applicant.applicantName,
      address: applicant.address,
      email: applicant.email,
      phone: applicant.phone,
      resumeIdRefs: applicant.resumeIdRefs
    };
    return data;
  },
  fromFirestore: function (snapshot, options) {
    const applicant = snapshot.data(options),
      data = {
        applicantID: applicant.applicantID,
        applicantName: applicant.applicantName,
        address: applicant.address,
        email: applicant.email,
        phone: applicant.phone,
        resumeIdRefs: applicant.resumeIdRefs
      };
    return new Applicant(data);
  },
};
/**
 * Create a Firestore document in the Firestore collection "applicants"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Applicant.add = async function (slots) {
  let applicant = null, validationResult = null;
  try {
    // validate data by creating Applicant instance
    applicant = await new Applicant(slots);
    // invoke asynchronous ID/uniqueness check
    validationResult = await Applicant.checkApplicantIDAsId(applicant.applicantID);
    if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
    for (const a of applicant.resumeIdRefs) {
      const validationResult = await Dokument.checkDokumentIDAsIdRef(String(a.id));
      if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
    }
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
    applicant = null;
  }
  if (applicant) {
    console.log("applicant",applicant);
    const applicantDocRef = fsDoc(fsDb, "applicants", String(applicant.applicantID)).withConverter(Applicant.converter);
    const dokumentsCollRef = fsColl(fsDb, "dokuments").withConverter(Dokument.converter);
    const applicantInverseRef = { applicantID: String(applicant.applicantID), applicantName: applicant.applicantName };
    try {
      const batch = writeBatch(fsDb); // initiate batch write object
      await batch.set(applicantDocRef, applicant); // create applicant record (master)
      // iterate ID references (foreign keys) of slave class objects (dokuments) and
      // create derived inverse reference properties to master class object (applicant)
      // Dokuments::dokumentOwner
      console.log("batch applicant",applicant);
      await Promise.all(applicant.resumeIdRefs.map(a => {
        console.log("a.id",a.id);
        const dokumentDocRef = fsDoc(dokumentsCollRef, String(a.id));
        batch.update(dokumentDocRef, { dokumentOwner: arrayUnion(applicantInverseRef) });
      }));
      batch.commit(); // commit batch write
      console.log(`Applicant record "${applicant.applicantID}" created!`);
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message}`);
    }
  }
};
/**
 * Load a applicant record from Firestore
 * @param applicantID: {string}
 * @returns {Promise<*>} applicantRec: {object}
 */
Applicant.retrieve = async function (applicantID) {
  try {
    const applicantRec = (await getDoc(fsDoc(fsDb, "applicants", applicantID)
      .withConverter(Applicant.converter))).data();
    if (applicantRec) console.log(`Applicant record "${applicantID}" retrieved.`);
    return applicantRec;
  } catch (e) {
    console.error(`Error retrieving applicant record: ${e}`);
  }
};
/**
 * Load all applicant records from Firestore
 * @param params: {object}
 * @returns {Promise<*>} applicantRecs: {array}
 */
Applicant.retrieveBlock = async function (params) {
  try {
    let applicantsCollRef = fsColl(fsDb, "applicants");
    // set limit and order in query
    applicantsCollRef = fsQuery(applicantsCollRef, limit(6));
    if (params.order) applicantsCollRef = fsQuery(applicantsCollRef, orderBy(params.order));
    // set pagination "startAt" cursor
    if (params.cursor) {
      applicantsCollRef = fsQuery(applicantsCollRef, startAt(params.cursor));
    }
    const applicantRecs = (await getDocs(applicantsCollRef
      .withConverter(Applicant.converter))).docs.map(d => d.data());
    if (applicantRecs.length) {
      console.log(`Block of applicant records retrieved! (cursor: ${applicantRecs[0][params.order]})`);
    }
    for (const applicantRec of applicantRecs)
    {
      console.log("applicantRec",applicantRec);
    }
    return applicantRecs;
  } catch (e) {
    console.error(`Error retrieving all applicant records: ${e}`);
  }
};
/**
 * Update a Firestore document in the Firestore collection "applicants"
 * @param applicantID: {string}
 * @param applicantName: {string}
 * @param address: {string}
 * @param email: {string}
 * @param phone: {string}
 * @param resumeIdRefsToAdd {array?}
 * @param resumeIdRefsToRemove {array?}
 * @returns {Promise<void>}
 */
Applicant.update = async function ({ applicantID, applicantName, address,
  email, phone, resumeIdRefsToAdd, resumeIdRefsToRemove }) {
  let validationResult = null,
    applicantBeforeUpdate = null;
  const applicantDocRef = fsDoc(fsDb, "applicants", applicantID).withConverter(Applicant.converter),
    updatedSlots = {};
  try {
    // retrieve up-to-date applicant record
    applicantBeforeUpdate = (await getDoc(applicantDocRef)).data();
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
  // evaluate if slots contains updates, while building "updatedSlots" object
  if (applicantBeforeUpdate) {
    if (applicantBeforeUpdate.applicantName !== applicantName) updatedSlots.applicantName = applicantName;
    if (applicantBeforeUpdate.address !== address) updatedSlots.address = address;
    if (applicantBeforeUpdate.email !== email) updatedSlots.email = email;
    if (applicantBeforeUpdate.phone !== phone) updatedSlots.phone = phone;
    if (resumeIdRefsToAdd) for (const resumeIdRef of resumeIdRefsToAdd)
      applicantBeforeUpdate.addResume(resumeIdRef);
    if (resumeIdRefsToRemove) for (const resumeIdRef of resumeIdRefsToRemove)
      applicantBeforeUpdate.removeResume(resumeIdRef);
    if (resumeIdRefsToAdd || resumeIdRefsToRemove)
      updatedSlots.resumeIdRefs = applicantBeforeUpdate.resumeIdRefs;
  }
  // if there are updates, run checkers while updating master object (applicant)
  // in a batch write transaction
  const updatedProperties = Object.keys(updatedSlots);
  if (updatedProperties.length) {
    try {
      const dokumentsCollRef = fsColl(fsDb, "dokuments")
        .withConverter(Dokument.converter)
      // initialize (before and after update) inverse ID references
      const inverseRefBefore = { applicantID: applicantID, applicantName: applicantBeforeUpdate.applicantName };
      const inverseRefAfter = { applicantID: applicantID, applicantName: applicantName };
      const batch = writeBatch(fsDb); // initiate batch write

      // remove old derived inverse references properties from slave
      // objects (dokuments) Dokument::dokumentOwner
      if (resumeIdRefsToRemove) {
        await Promise.all(resumeIdRefsToRemove.map(a => {
          const dokumentCollRef = fsDoc(dokumentsCollRef, String(a.id));
          batch.update(dokumentCollRef, { dokumentOwner: arrayRemove(inverseRefBefore) });
        }));
      }
      // add new derived inverse references properties from slave objects
      // (dokuments) Dokument::dokumentOwner, while checking constraint violations
      if (resumeIdRefsToAdd) {
        await Promise.all(resumeIdRefsToAdd.map(async a => {
          const dokumentCollRef = fsDoc(dokumentsCollRef, String(a.id));
          validationResult = await Dokument.checkDokumentIDAsIdRef(a.id);
          if (!validationResult instanceof NoConstraintViolation) throw validationResult;
          batch.update(dokumentCollRef, { dokumentOwner: arrayUnion(inverseRefAfter) });
        }));
      }
      // if applicantName changes, update applicantName in ID references (array of maps) in
      // unchanged author objects
      if (updatedSlots.applicantName) {
        const NoChangedResumeIdRefs = resumeIdRefsToAdd ?
          applicantBeforeUpdate.resumeIdRefs.filter(d => !resumeIdRefsToAdd.includes(d))
          : applicantBeforeUpdate.resumeIdRefs;
        await Promise.all(NoChangedResumeIdRefs.map(a => {
          const dokumentCollRef = fsDoc(dokumentsCollRef, String(a.id));
          batch.update(dokumentCollRef, { dokumentOwner: arrayRemove(inverseRefBefore) });
        }));
        await Promise.all(NoChangedResumeIdRefs.map(a => {
          const dokumentCollRef = fsDoc(dokumentsCollRef, String(a.id));
          batch.update(dokumentCollRef, { dokumentOwner: arrayUnion(inverseRefAfter) });
        }));
      }
      // update applicant object (master)
      batch.update(applicantDocRef, updatedSlots);
      batch.commit(); // commit batch write
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message}`);
    }
    console.log(`Property(ies) "${updatedProperties.toString()}" modified for applicant record "${applicantID}"`);
  } else {
    console.log(`No property value changed for applicant record "${applicantID}"!`);
  }
};
/**
 * Delete a Firestore document from the Firestore collection "applicants"
 * @param applicantID: {string}
 * @returns {Promise<void>}
 */
Applicant.destroy = async function (applicantID) {
  const applicantDocRef = fsDoc(fsDb, "applicants", applicantID)
    .withConverter(Applicant.converter),
    dokumentsCollRef = fsColl(fsDb, "dokuments")
      .withConverter(Dokument.converter);
  try {
    // delete master class object (applicant) while updating derived inverse
    // properties in objects from slave classes (authors and publishers)
    const applicantRec = (await getDoc(applicantDocRef
      .withConverter(Applicant.converter))).data();
    const inverseRef = { applicantID: applicantRec.applicantID, applicantName: applicantRec.applicantName };
    const batch = writeBatch(fsDb); // initiate batch write object
    // delete derived inverse reference properties, Authors::/authoredApplicants
    await Promise.all(applicantRec.resumeIdRefs.map(aId => {
      const dokumentCollRef = fsDoc(dokumentsCollRef, String(aId.id));
      batch.update(dokumentCollRef, { dokumentOwner: arrayRemove(inverseRef) });
    }));
    batch.delete(applicantDocRef); // create applicant record (master)
    batch.commit(); // commit batch write
    console.log(`Applicant record "${applicantID}" deleted!`);
  } catch (e) {
    console.error(`Error deleting applicant record: ${e}`);
  }
};

export default Applicant;