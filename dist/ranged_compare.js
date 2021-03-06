"use strict";
/**
 * Ranged Index and Comparator types and interfaces
 */
/**
 * Helper function for determining abstract equality which is a little more abstract than ==
 *     aeqHelper(5, '5') === true
 *     aeqHelper(5.0, '5') === true
 *     aeqHelper(new Date("1/1/2011"), new Date("1/1/2011")) === true
 *     aeqHelper({a:1}, {z:4}) === true (all objects sorted equally)
 *     aeqHelper([1, 2, 3], [1, 3]) === false
 *     aeqHelper([1, 2, 3], [1, 2, 3]) === true
 *     aeqHelper(undefined, null) === true
 * @param {any} prop1
 * @param {any} prop2
 * @returns {boolean}
 * @hidden
 */
function aeqHelper(prop1, prop2) {
    if (prop1 === prop2)
        return true;
    // 'falsy' and Boolean handling
    if (!prop1 || !prop2 || prop1 === true || prop2 === true || prop1 !== prop1 || prop2 !== prop2) {
        let t1;
        let t2;
        // dates and NaN conditions (typed dates before serialization)
        switch (prop1) {
            case undefined:
                t1 = 1;
                break;
            case null:
                t1 = 1;
                break;
            case false:
                t1 = 3;
                break;
            case true:
                t1 = 4;
                break;
            case "":
                t1 = 5;
                break;
            default:
                t1 = (prop1 === prop1) ? 9 : 0;
                break;
        }
        switch (prop2) {
            case undefined:
                t2 = 1;
                break;
            case null:
                t2 = 1;
                break;
            case false:
                t2 = 3;
                break;
            case true:
                t2 = 4;
                break;
            case "":
                t2 = 5;
                break;
            default:
                t2 = (prop2 === prop2) ? 9 : 0;
                break;
        }
        // one or both is edge case
        if (t1 !== 9 || t2 !== 9) {
            return (t1 === t2);
        }
    }
    // Handle 'Number-like' comparisons
    let cv1 = Number(prop1);
    let cv2 = Number(prop2);
    // if one or both are 'number-like'...
    if (cv1 === cv1 || cv2 === cv2) {
        return (cv1 === cv2);
    }
    // not strict equal nor less than nor gt so must be mixed types, convert to string and use that to compare
    cv1 = prop1.toString();
    cv2 = prop2.toString();
    return (cv1 == cv2);
}
/**
 * Helper function for determining 'less-than' conditions for ops, sorting, and binary indices.
 * @hidden
 */
function ltHelper(prop1, prop2, equal) {
    // if one of the params is falsy or strictly true or not equal to itself
    // 0, 0.0, "", NaN, null, undefined, not defined, false, true
    if (!prop1 || !prop2 || prop1 === true || prop2 === true || prop1 !== prop1 || prop2 !== prop2) {
        let t1;
        let t2;
        switch (prop1) {
            case undefined:
                t1 = 1;
                break;
            case null:
                t1 = 1;
                break;
            case false:
                t1 = 3;
                break;
            case true:
                t1 = 4;
                break;
            case "":
                t1 = 5;
                break;
            // if strict equal probably 0 so sort higher, otherwise probably NaN so sort lower than even null
            default:
                t1 = (prop1 === prop1) ? 9 : 0;
                break;
        }
        switch (prop2) {
            case undefined:
                t2 = 1;
                break;
            case null:
                t2 = 1;
                break;
            case false:
                t2 = 3;
                break;
            case true:
                t2 = 4;
                break;
            case "":
                t2 = 5;
                break;
            default:
                t2 = (prop2 === prop2) ? 9 : 0;
                break;
        }
        // one or both is edge case
        if (t1 !== 9 || t2 !== 9) {
            return (t1 === t2) ? equal : (t1 < t2);
        }
    }
    // if both are numbers (string encoded or not), compare as numbers
    let cv1 = Number(prop1);
    let cv2 = Number(prop2);
    if (cv1 === cv1 && cv2 === cv2) {
        if (cv1 < cv2)
            return true;
        if (cv1 > cv2)
            return false;
        return equal;
    }
    if (cv1 === cv1 && cv2 !== cv2) {
        return true;
    }
    if (cv2 === cv2 && cv1 !== cv1) {
        return false;
    }
    if (prop1 < prop2)
        return true;
    if (prop1 > prop2)
        return false;
    if (prop1 == prop2)
        return equal;
    // not strict equal nor less than nor gt so must be mixed types, convert to string and use that to compare
    cv1 = prop1.toString();
    cv2 = prop2.toString();
    if (cv1 < cv2) {
        return true;
    }
    if (cv1 == cv2) {
        return equal;
    }
    return false;
}
/**
 * @hidden
 * @param {any} prop1
 * @param {any} prop2
 * @param {boolean} equal
 * @returns {boolean}
 */
function gtHelper(prop1, prop2, equal) {
    // 'falsy' and Boolean handling
    if (!prop1 || !prop2 || prop1 === true || prop2 === true || prop1 !== prop1 || prop2 !== prop2) {
        let t1;
        let t2;
        switch (prop1) {
            case undefined:
                t1 = 1;
                break;
            case null:
                t1 = 1;
                break;
            case false:
                t1 = 3;
                break;
            case true:
                t1 = 4;
                break;
            case "":
                t1 = 5;
                break;
            // NaN 0
            default:
                t1 = (prop1 === prop1) ? 9 : 0;
                break;
        }
        switch (prop2) {
            case undefined:
                t2 = 1;
                break;
            case null:
                t2 = 1;
                break;
            case false:
                t2 = 3;
                break;
            case true:
                t2 = 4;
                break;
            case "":
                t2 = 5;
                break;
            default:
                t2 = (prop2 === prop2) ? 9 : 0;
                break;
        }
        // one or both is edge case
        if (t1 !== 9 || t2 !== 9) {
            return (t1 === t2) ? equal : (t1 > t2);
        }
    }
    // if both are numbers (string encoded or not), compare as numbers
    let cv1 = Number(prop1);
    let cv2 = Number(prop2);
    if (cv1 === cv1 && cv2 === cv2) {
        if (cv1 > cv2)
            return true;
        if (cv1 < cv2)
            return false;
        return equal;
    }
    if (cv1 === cv1 && cv2 !== cv2) {
        return false;
    }
    if (cv2 === cv2 && cv1 !== cv1) {
        return true;
    }
    if (prop1 > prop2)
        return true;
    if (prop1 < prop2)
        return false;
    if (prop1 == prop2)
        return equal;
    // not strict equal nor less than nor gt so must be dates or mixed types
    // convert to string and use that to compare
    cv1 = prop1.toString();
    cv2 = prop2.toString();
    if (cv1 > cv2) {
        return true;
    }
    if (cv1 == cv2) {
        return equal;
    }
    return false;
}
//# sourceMappingURL=ranged_compare.js.map