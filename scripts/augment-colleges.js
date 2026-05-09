const fs = require('fs');

const content = fs.readFileSync('lib/data.ts', 'utf8');

// Use regex to extract the colleges array string
const match = content.match(/export const colleges = (\[[\s\S]*?\]);\nexport const mentors =/);

if (!match) {
  console.log("Could not find colleges array in lib/data.ts");
  process.exit(1);
}

const collegesArrayStr = match[1];
const colleges = eval(collegesArrayStr);

// Enhance the data
const enhancedColleges = colleges.map(college => {
  let highestPackage = "15 LPA";
  let averagePackage = "6 LPA";
  let placementRate = "85%";
  let openFees = "₹1,20,000 / year";
  let obcFees = "₹65,000 / year";
  let scStFees = "₹5,000 / year";
  let hostel = true;
  let hostelFees = "₹60,000 / year";
  let campusSize = "10 Acres";
  let topRecruiters = ["TCS", "Infosys", "Wipro", "Cognizant", "Accenture"];

  // VJTI & COEP & Top tier
  if (college.name.includes("VJTI") || college.name.includes("COEP") || college.name.includes("ICT") || college.name.includes("SPIT") || college.name.includes("PICT") || college.name.includes("VIT Pune")) {
    highestPackage = "50+ LPA";
    averagePackage = "12 - 16 LPA";
    placementRate = "95%+";
    topRecruiters = ["Microsoft", "Google", "Amazon", "Morgan Stanley", "JPMorgan", "Deutsche Bank"];
    
    if (college.type === "Government" || college.type === "Aided") {
      openFees = "₹85,000 / year";
      obcFees = "₹45,000 / year";
      hostelFees = "₹35,000 / year";
    } else {
      openFees = "₹1,80,000 / year";
      obcFees = "₹95,000 / year";
      hostelFees = "₹80,000 / year";
    }

    if (college.name.includes("VJTI")) campusSize = "16 Acres";
    else if (college.name.includes("COEP")) campusSize = "36 Acres";
    else if (college.name.includes("ICT")) campusSize = "16 Acres";
    else campusSize = "20 Acres";
  } 
  // Mid-high tier
  else if (college.name.includes("DJSCE") || college.name.includes("KJ Somaiya") || college.name.includes("PCCOE") || college.name.includes("Cummins") || college.name.includes("WCE") || college.name.includes("RCOEM")) {
    highestPackage = "30 - 45 LPA";
    averagePackage = "7 - 10 LPA";
    placementRate = "90%+";
    topRecruiters = ["Barclays", "TCS Digital", "Infosys Power", "BNY Mellon", "Siemens"];
    
    if (college.type === "Government" || college.type === "Aided") {
      openFees = "₹85,000 / year";
      obcFees = "₹45,000 / year";
    } else {
      openFees = "₹1,50,000 - ₹2,00,000 / year";
      obcFees = "₹80,000 - ₹1,00,000 / year";
    }
    hostelFees = "₹70,000 / year";
    campusSize = "25 Acres";
  }
  // Government Colleges
  else if (college.type === "Government") {
    highestPackage = "15 - 20 LPA";
    averagePackage = "5 - 7 LPA";
    placementRate = "80%";
    openFees = "₹75,000 / year";
    obcFees = "₹40,000 / year";
    scStFees = "₹4,000 / year";
    hostelFees = "₹20,000 / year";
    campusSize = "50+ Acres";
    topRecruiters = ["TCS", "L&T", "Tata Motors", "Mahindra", "Infosys"];
  }

  return {
    ...college,
    placements: {
      highestPackage,
      averagePackage,
      placementRate,
      topRecruiters
    },
    fees: {
      open: openFees,
      obc: obcFees,
      scSt: scStFees
    },
    facilities: {
      hostel,
      hostelFees,
      campusSize
    }
  };
});

const newContent = content.replace(
  match[0], 
  \`export const colleges = \${JSON.stringify(enhancedColleges, null, 2)};\\nexport const mentors =\`
);

fs.writeFileSync('lib/data.ts', newContent);
console.log("Successfully updated lib/data.ts with deep dive info!");
