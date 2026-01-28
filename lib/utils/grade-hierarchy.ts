export interface GradeSection {
    label: string;
    grades: string[];
}

export const GRADE_SECTIONS: GradeSection[] = [
    {
        label: "Primary School",
        grades: ["4", "5", "6"]
    },
    {
        label: "Junior School",
        grades: ["7", "8", "9"]
    },
    {
        label: "Senior School",
        grades: ["10", "11", "12"]
    }
];

export const getGroupedGrades = (availableGrades: string[]) => {
    // Map through each section and filter for grades that are actually available
    return GRADE_SECTIONS.map(section => ({
        ...section,
        grades: section.grades.filter(g => availableGrades.includes(g))
    })).filter(section => section.grades.length > 0);
};
