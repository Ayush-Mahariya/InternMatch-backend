/**
 * Calculate profile completion percentage for a student profile
 * @param {Object} student - Student profile object
 * @returns {number} - Profile completion percentage (0-100)
 */
const calculateProfileCompletion = (student) => {
  const totalSections = 11;
  let completedSections = 0;

  // 1. Basic Information (name, university, major, graduationYear, gpa)
  const basicFields = ['university', 'major', 'graduationYear', 'gpa'];
  const hasBasicInfo = basicFields.every(field => {
    const value = student[field];
    return value !== null && value !== undefined && value !== '';
  });
  if (hasBasicInfo) completedSections++;

  // 2. Skills (at least one skill)
  if (student.skills && student.skills.length > 0) {
    completedSections++;
  }

  // 3. Projects (at least one project)
  if (student.projects && student.projects.length > 0) {
    completedSections++;
  }

  // 4. Certifications (at least one certification)
  if (student.certifications && student.certifications.length > 0) {
    completedSections++;
  }

  // 5. Experience (at least one experience)
  if (student.experience && student.experience.length > 0) {
    completedSections++;
  }

  // 6. Resume uploaded
  if (student.resume && student.resume.trim() !== '') {
    completedSections++;
  }

  // 7. Portfolio link
  if (student.portfolio && student.portfolio.trim() !== '') {
    completedSections++;
  }

  // 8. LinkedIn profile
  if (student.linkedIn && student.linkedIn.trim() !== '') {
    completedSections++;
  }

  // 9. GitHub profile
  if (student.github && student.github.trim() !== '') {
    completedSections++;
  }

  // 10. Skill Assessments (at least one completed)
  if (student.skillAssessments && student.skillAssessments.length > 0) {
    completedSections++;
  }

  // 11. Preferences (at least one preference field filled)
  if (student.preferences) {
    const preferenceFields = ['jobTypes', 'locations', 'industries', 'salaryExpectation'];
    const hasPreferences = preferenceFields.some(field => {
      const value = student.preferences[field];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== null && value !== undefined && value !== '';
    });
    if (hasPreferences) completedSections++;
  }

  // Calculate percentage
  return Math.round((completedSections / totalSections) * 100);
};

module.exports = { calculateProfileCompletion };
