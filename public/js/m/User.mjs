import { fsDb } from "../initFirebase.mjs";
import { collection as fsColl, deleteDoc, doc as fsDoc, getDoc, getDocs, onSnapshot,
    orderBy, query as fsQuery, setDoc, updateDoc, Timestamp }
    from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";
import { isNonEmptyString, isIntegerOrIntegerString, nextYear, date2IsoDateString }
  from "../lib/util.mjs";
import {
  NoConstraintViolation, MandatoryValueConstraintViolation, RangeConstraintViolation,
  UniquenessConstraintViolation, PatternConstraintViolation, IntervalConstraintViolation
}
  from "../lib/errorTypes.mjs";
import Enumeration from "../lib/Enumeration.mjs";
console.log("User.mjs");
//   «get/set» userID[1] : number(int)
// - «get/set» username[1] : String
// - «get/set» address[1] : String
// - «get/set» dateOfBirth[1] : String
// - «get/set» email[1] : String
// - «get/set» password[1] : String
// - «get/set» phoneNumber[1] : number(int)
// - «get/set» userType[1] : String

const userTypeEL = new Enumeration(["Applicant", "Company"]);

/**
 * Constructor function for the class User
 * @constructor
 * @param {{userID: number, username: string, address: string, dateOfBirth: string, 
 *    email: string, password: string, phoneNumber: number, userType: string}} slots - Object creation slots.
 */
class User {
  // record parameter with the ES6 syntax for function parameter destructuring
  constructor({ userID, username, address, dateOfBirth, email, password, phoneNumber, userType}) {
    this.userID = userID;
    this.username = username;
    this.address = address;
    this.dateOfBirth = dateOfBirth;
    this.email = email;
    this.password = password;
    this.phoneNumber = phoneNumber;
    this.userType = userType;
  };

  get userID() {
    return this._userID;
  };

  static checkUserID(userID) {
    console.log("Type of userID:", typeof userID);
  console.log("Value of userID:", userID);
    console.log("In checkUserID with userID:", userID);
    if (!userID) {
      return new MandatoryValueConstraintViolation("A user ID must be provided!");
    } else if (!isIntegerOrIntegerString(userID) || parseInt(userID) < 1) {
      return new RangeConstraintViolation("The user ID must be a positive integer!");
    } else {
      return new NoConstraintViolation();
    }
  };

  static async checkUserIDAsId(userID) {
    let validationResult = User.checkUserID(userID);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!userID) {
        validationResult = new MandatoryValueConstraintViolation(
          "A value for the user ID must be provided!");
      } else {
        console.log("Before calling fsDoc");
        const userDocReff = fsDoc(fsDb, "users", userID);
        console.log("After calling fsDoc, before getDoc");
        try {
          const userDocSn = await getDoc( userDocReff);
          console.log("After getDoc");
          if (userDocSn.exists()) {
            validationResult = new UniquenessConstraintViolation(
              "There is already a user record with this ID!");
          } else {
            validationResult = new NoConstraintViolation();
          }
        } catch (e) {
          console.error(`Error when checking user ID uniqueness: ${e}`);
          validationResult = new NoConstraintViolation();
        } 
      }
    }
    return validationResult;
  };

  set userID( n) {
    const validationResult = User.checkUserID(  n);
    if (validationResult instanceof NoConstraintViolation) {
      this._userID = n;
    } else {
      throw validationResult;
    }
  };

  get username() {
    return this._username;
  };

  static checkUsername(n) {
    if (!n) {
      return new MandatoryValueConstraintViolation("A username must be provided!");
    } else if (!isNonEmptyString(n)) {
      return new RangeConstraintViolation("The username must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  };

  set username(n) {
    const validationResult = User.checkUsername(n);
    if (validationResult instanceof NoConstraintViolation) {
      this._username = n;
    } else {
      throw validationResult;
    }
  };

  get address() {
    return this._address;
  };

  static checkAddress(addr) {
    if (!addr) {
      return new MandatoryValueConstraintViolation("An address must be provided!");
    } else if (!isNonEmptyString(addr)) {
      return new RangeConstraintViolation("The address must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  };

  set address(addr) {
    const validationResult = User.checkAddress(addr);
    if (validationResult instanceof NoConstraintViolation) {
      this._address = addr;
    } else {
      throw validationResult;
    }
  };

  get dateOfBirth() {
    return this._dateOfBirth;
  };

  static checkDateOfBirth (dateOfBirth) {
    let y = new Date( dateOfBirth).getFullYear();
    var reg = new RegExp ('\\d{1,2}(\\/|-)\\d{1,2}(\\/|-)\\d{2,4}');
                                
    if (!dateOfBirth) {
      return new MandatoryValueConstraintViolation(
        "Date of birth must be provided!");
    } else if (!(typeof dateOfBirth === "string" &&
      reg.test( dateOfBirth) &&
      !isNaN( Date.parse( dateOfBirth)))) {
      return new PatternConstraintViolation(
        "Date of birth is not well formed");
    } else if (y > nextYear()) {
      return new IntervalConstraintViolation(
        `Date of birth value cannot exceed next year!`);
    } else return new NoConstraintViolation();
  };

  set dateOfBirth(dateOfBirth) {
    const validationResult = User.checkDateOfBirth(dateOfBirth);
    if (validationResult instanceof NoConstraintViolation) {
      this._dateOfBirth = dateOfBirth;
    } else {
      throw validationResult;
    }
  };

  get email() {
    return this._email;
  };

  static checkEmail(email) {
    if (!email) {
      return new MandatoryValueConstraintViolation("An email must be provided!");
    } else if (!( /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return new PatternConstraintViolation("The email is not well formed");
    } else {
      return new NoConstraintViolation();
    }
  };

  set email(email) {
    const validationResult = User.checkEmail(email);
    if (validationResult instanceof NoConstraintViolation) {
      this._email = email;
    } else {
      throw validationResult;
    }
  };

  get password() {
    return this._password;
  };

  static checkPassword(pass) {
    if (!pass) {
      return new MandatoryValueConstraintViolation("A password must be provided!");
    } else if (!isNonEmptyString(pass)) {
      return new RangeConstraintViolation("The password must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  };

  set password(pass) {
    const validationResult = User.checkPassword(pass);
    if (validationResult instanceof NoConstraintViolation) {
      this._password = pass;
    } else {
      throw validationResult;
    }
  };

  get phoneNumber() {
    return this._phoneNumber;
  };

  static checkPhoneNumber(number) {
    if (!number) {
      return new MandatoryValueConstraintViolation("A phone number must be provided!");
    } else if (!isIntegerOrIntegerString(number) || parseInt(number) < 1) {
      return new RangeConstraintViolation("The phone number must be a positive integer!");
    } else {
      return new NoConstraintViolation();
    }
  };

  set phoneNumber(number) {
    const validationResult = User.checkPhoneNumber(number);
    if (validationResult instanceof NoConstraintViolation) {
      this._phoneNumber = number;
    } else {
      throw validationResult;
    }
  };

  get userType() {
    return this._userType;
  };

  static checkUserType(type) {
    if (!type) {
      return new MandatoryValueConstraintViolation("A user type must be provided!");
    } else if (!isIntegerOrIntegerString(type) ||
      parseInt(type) < 1 || parseInt(type) > userTypeEL.MAX) {
      return new RangeConstraintViolation(
        "Invalid value for user type: " + type);
    } else {
      return new NoConstraintViolation();
    }
  };

  set userType(type) {
    const validationResult = User.checkUserType(type);
    if (validationResult instanceof NoConstraintViolation) {
      this._userType = type;
    } else {
      throw validationResult;
    }
  };
}



User.instances = {};  // initially an empty associative array
/*********************************************************
 ***  Class-level ("static") storage management methods **
 *********************************************************/
/**
 * Conversion between a User object and a corresponding Firestore document
*/
User.converter = {
  toFirestore: function (user) {
    console.log("Converting user for Firestore:", JSON.stringify(user));
    const data = {
      userID: parseInt(user.userID),
      username: user.username,
      address: user.address,
      dateOfBirth: Timestamp.fromDate( new Date(user.dateOfBirth)),
      email: user.email,
      password: user.password,
      phoneNumber: parseInt(user.phoneNumber),
      userType: parseInt(user.userType)
    };
    console.log("Converted user data:", JSON.stringify(data));
    return data;
  },
  fromFirestore: function (snapshot, options) {
    const user = snapshot.data(options);
    console.log("Converting user from Firestore:", JSON.stringify(user));
    const data = {
        userID: user.userID,
        username: user.username,
        address: user.address,
        dateOfBirth: date2IsoDateString( user.dateOfBirth.toDate()),
        email: user.email,
        password: user.password,
        phoneNumber: user.phoneNumber,
        userType: user.userType
      }
    return new User(data);
  },
};

/**
 * Create a Firestore document in the Firestore collection "users"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
User.add = async function (slots) {
  let user = null;
  try {
    // validate data by creating User instance
    user = new User(slots);
    console.log("Validating user:", JSON.stringify(user));
    // invoke asynchronous ID/uniqueness check
    let validationResult = await User.checkUserIDAsId(user.userID);
    console.log("Validation result:", validationResult);
    if (!validationResult instanceof NoConstraintViolation) throw validationResult;
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
    user = null;
  }
  if (user) {
    try {
      const userDocRef = fsDoc(fsDb, "users", user.userID).withConverter(User.converter);
      console.log("Uploading user to Firestore with ref:", userDocRef);
      await setDoc(userDocRef, user);
      console.log(`User record "${user.userID}" created!`);
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message} + ${e}`);
    }
  }
};
/**
 * Load a user record from Firestore
 * @param userID: {object}
 * @returns {Promise<*>} userRecord: {array}
 */
User.retrieve = async function (userID) {
  try {
    const userRec = (await getDoc(fsDoc(fsDb, "users", userID)
      .withConverter(User.converter))).data();
    console.log(`User record "${userRec.userID}" retrieved.`);
    return userRec;
  } catch (e) {
    console.error(`Error retrieving user record: ${e}`);
  }
};
/**
 * Load all user records from Firestore
 * @param order: {string}
 * @returns {Promise<*>} userRecords: {array}
 */
User.retrieveAll = async function (order) {
  if (!order) order = "userID";
  const usersCollRef = fsColl(fsDb, "users");
  const q = fsQuery(usersCollRef, orderBy(order));
  try {
    const userRecs = (await getDocs(q.withConverter(User.converter))).docs.map(d => d.data());
    console.log(`${userRecs.length} user records retrieved ${order ? "ordered by " + order : ""}`);
    return userRecs;
  } catch (e) {
    console.error(`Error retrieving user records: ${e}`);
  }
};
/**
 * Update a Firestore document in the Firestore collection "users"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
User.update = async function (slots) {
  let noConstraintViolated = true,
    validationResult = null,
    userBeforeUpdate = null;
  const userDocRef = fsDoc(fsDb, "users", slots.userID).withConverter(User.converter),
    updatedSlots = {};

  try {
    // retrieve up-to-date user record
    const userDocSn = await getDoc(userDocRef);
    userBeforeUpdate = userDocSn.data();
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }

  try {
    if (userBeforeUpdate.username !== slots.username) {
      validationResult = User.checkUsername(slots.username);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.username = slots.username;
      else throw validationResult;
    }
    if (userBeforeUpdate.address !== slots.address) {
      validationResult = User.checkAddress(slots.address);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.address = slots.address;
      else throw validationResult;
    }
    if (userBeforeUpdate.dateOfBirth !== slots.dateOfBirth) {
      validationResult = User.checkDateOfBirth(slots.dateOfBirth);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.dateOfBirth = slots.dateOfBirth;
      else throw validationResult;
    }
    if (userBeforeUpdate.email !== slots.email) {
      validationResult = User.checkEmail(slots.email);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.email = parseInt(slots.email);
      else throw validationResult;
    }
    if (userBeforeUpdate.password !== slots.password) {
      validationResult = User.checkPassword(slots.password);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.password = parseInt(slots.password);
      else throw validationResult;
    }
    if (userBeforeUpdate.phoneNumber !== slots.phoneNumber) {
      validationResult = User.checkPhoneNumber(slots.phoneNumber);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.phoneNumber = slots.phoneNumber;
      else throw validationResult;
    }
    if (userBeforeUpdate.userType !== slots.userType) {
      validationResult = User.checkUserType(slots.userType);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.userType = slots.userType;
      else throw validationResult;
    }
  } catch (e) {
    noConstraintViolated = false;
    console.error(`${e.constructor.name}: ${e.message}`);
  }

  if (noConstraintViolated) {
    const updatedProperties = Object.keys(updatedSlots);
    if (updatedProperties.length) {
      await updateDoc(userDocRef, updatedSlots);
      console.log(`Property(ies) "${updatedProperties.toString()}" modified for user record "${slots.userID}"`);
    } else {
      console.log(`No property value changed for user record "${slots.userID}"!`);
    }
  }
};
/**
 * Delete a Firestore document from the Firestore collection "users"
 * @param userID: {string}
 * @returns {Promise<void>}
 */
User.destroy = async function (userID) {
  try {
    const fsDocRefDelete = fsDoc(fsDb, "users", userID);
    await deleteDoc(fsDocRefDelete);
    console.log(`User record ${userID} deleted.`);
  } catch (e) {
    console.error(`Error when deleting user record: ${e}`);
  }
};
/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 * Create test data
 */
User.generateTestData = async function () {
  try {
    console.log("Generating test data...");
    const response = await fetch("../../test-data/users.json");
    const userRecs = await response.json();

    console.log("userRecs type:", typeof userRecs);
    console.log("userRecs value:", JSON.stringify(userRecs));

    // save all user record/documents
    await Promise.all(userRecs.map(d => User.add( d)));
    console.log(`${Object.keys(userRecs).length} user records saved.`);
  }
  catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
};
/**
 * Clear database
 */
User.clearData = async function () {
  if (confirm("Do you really want to delete all user records?")) {
    // retrieve all user documents from Firestore
    const userRecs = await User.retrieveAll();
    // delete all documents
    await Promise.all(userRecs.map(d => User.destroy(d.userID.toString())));
    // ... and then report that they have been deleted
    console.log(`${Object.values(userRecs).length} user records deleted.`);
  }
};

/*******************************************
 *** Non specific use case procedures ******
 ********************************************/
/**
 * Handle DB-UI synchronization
 * @param userID {number}
 * @returns {function}
 */
User.observeChanges = async function (userID) {
  try {
    // listen document changes, returning a snapshot (snapshot) on every change
    const userDocRef = fsDoc( fsDb, "users", userID).withConverter( User.converter);
    const userRec = (await getDoc( userDocRef)).data();
    return onSnapshot( userDocRef, function (snapshot) {
      // create object with original document data
      const originalData = { itemName: "user", description: `${userRec.title} (UserId: ${userRec.userID })`};
      if (!snapshot.data()) { // removed: if snapshot has not data
        originalData.type = "REMOVED";
        createModalFromChange( originalData); // invoke modal window reporting change of original data
      } else if (JSON.stringify( userRec) !== JSON.stringify( snapshot.data())) {
        originalData.type = "MODIFIED";
        createModalFromChange( originalData); // invoke modal window reporting change of original data
      }
    });
  } catch (e) {
    console.error(`${e.constructor.name} : ${e.message}`);
  }
}

export default User;
export { userTypeEL };