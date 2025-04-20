  // Registration Courses methods for MemStorage
  async getRegistrationCourses(studentId: number): Promise<RegistrationCourse[]> {
    return Array.from(this.registrationCoursesMap.values())
      .filter(course => course.studentId === studentId);
  }
  
  async getRegistrationCourse(id: number): Promise<RegistrationCourse | undefined> {
    return this.registrationCoursesMap.get(id);
  }
  
  async createRegistrationCourse(course: InsertRegistrationCourse): Promise<RegistrationCourse> {
    const id = this.registrationCourseId++;
    const newCourse: RegistrationCourse = { ...course, id, createdAt: new Date() };
    this.registrationCoursesMap.set(id, newCourse);
    return newCourse;
  }
  
  async deleteRegistrationCourse(id: number): Promise<boolean> {
    return this.registrationCoursesMap.delete(id);
  }