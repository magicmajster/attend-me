export interface CourseSessionListItem {
    courseSessionId: number;      // obowiązkowe
    courseName: string;
    courseGroupName: string;
    dateStart: string | Date;
    dateEnd: string | Date;
    locationName: string;
    courseId?: number;            // opcjonalne pola backendu
    courseGroupId?: number;
}
export interface CourseSessionAttendanceRecord {
    userId: number;
    firstName: string;
    lastName: string;
    studentIndex: string;
    isPresent: boolean;
}

export interface CourseSessionListItemPagedList {
    items: CourseSessionListItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}