export const ethnicity = {
  whiteCaucasian: 'White/Caucasian',
  asian: 'Asian',
  nativeHawaiianOrPacificIslander: 'Native Hawaiian or Pacific Islander',
  hispanicOrLatino: 'Hispanic or Latino',
  africanAmerican: 'African-American',
  nativeAmerican: 'Native American',
} as const;

export const educationLevel = {
  lessThanHighSchool: 'Less than High School',
  highSchoolIncludingGED: 'High school (including GED)',
  someCollegeNoDegree: 'Some college (no degree)',
  technicalCertification: 'Technical certification',
  associateDegree: 'Associate degree (2-year)',
  bachelorsDegree: 'Bachelor’s degree (4-year)',
  mastersDegree: 'Master’s degree',
  professionalDegree: 'Professional degree (JD, MD)',
} as const;

export const maritalStatus = {
  married: 'Married',
  widowed: 'Widowed',
  divorced: 'Divorced',
  separated: 'Separated',
  single: 'Single',
} as const;

export const employmentStatus = {
  fullTime: 'Full-time',
  partTime: 'Part-time',
  contractOrTemporary: 'Contract or temporary',
  retired: 'Retired',
  unemployed: 'Unemployed',
  unableToWork: 'Unable to work',
} as const;

export const householdIncome = {
  zeroTo29999: '$0-$29,999',
  thirtyTo59999: '$30,000-$59,999',
  sixtyTo89999: '$60,000-$89,999',
  ninetyTo119999: '$90,000-$119,999',
  above120000: '$120,000+',
} as const;

export const familyAndDependents = {
  none: 'None',
  one: '1',
  two: '2',
  three: '3',
  fourOrMore: '4+',
} as const;

export const receiveProductBy = {
  weekly: 'Weekly',
  bi_weekly: 'Bi-Weekly',
  montly: 'Monthly',
  quarterly: 'Quarterly',
};
