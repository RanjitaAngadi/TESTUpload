import momentJava from "moment-jdateformatparser"; // internally used as plugin for moment
import momentTZ from "moment-timezone"; // internally used as plugin for moment
import moment from "moment";

const isValidDate = d => d instanceof Date && !isNaN(d);

const ISO_DATE_FORMAT = "YYYY-MM-DDTHH:mm:ss";

/* const JAVA_FORMAT = [
  "HH:mm z",
  "dd/MM/yyyy",
  "MM/dd/yyyy",
  "d MMMM yyyy",
  "HH:mm",
  "hh:mm aa z",
  "MM.dd.yyyy",
  "dd.MM.yyyy",
  "dd MMM yyyy",
  "MMM dd yyyy",
];

JAVA_FORMAT.forEach(df => {
  let momentDF = moment().toMomentFormatString(df);
  momentDF = momentDF.replace("aa", "A");
  momentDF = momentDF.replaceAll("Z", "z");
  momentDF = momentDF.replaceAll("zz", "z");
  console.log(
    `Java:${df} = ${momentDF}, Eg.:${moment()
      .tz("Asia/Calcutta")
      .format(momentDF)}`
  );
}); */

export { moment, momentJava, momentTZ, isValidDate, ISO_DATE_FORMAT };
