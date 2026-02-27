export const en = {
  // Common
  common: {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update',
    search: 'Search',
    loading: 'Loading...',
    noData: 'No data',
    operations: {
      success: 'Operation successful',
      failed: 'Operation failed',
      created: 'Created successfully',
      updated: 'Updated successfully',
      deleted: 'Deleted successfully',
    },
  },

  // Auth
  auth: {
    loginSuccess: 'Login successful',
    loginFailed: 'Invalid username or password',
    logoutSuccess: 'Logout successful',
    registerSuccess: 'Registration successful',
    registerFailed: 'Registration failed',
    tokenExpired: 'Session expired, please login again',
    unauthorized: 'Unauthorized',
    forbidden: 'Access forbidden',
  },

  // User
  user: {
    username: 'Username',
    password: 'Password',
    role: 'Role',
    admin: 'Admin',
    user: 'User',
    notFound: 'User not found',
    alreadyExists: 'User already exists',
    usernameRequired: 'Username is required',
    passwordRequired: 'Password is required',
    passwordMinLength: 'Password must be at least 6 characters',
  },

  // Survey
  survey: {
    title: 'Survey Title',
    description: 'Description',
    status: 'Status',
    statusDraft: 'Draft',
    statusPublished: 'Published',
    statusClosed: 'Closed',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    createdBy: 'Created By',
    questionsCount: 'Questions',
    responsesCount: 'Responses',
    notFound: 'Survey not found',
    createSuccess: 'Survey created successfully',
    updateSuccess: 'Survey updated successfully',
    deleteSuccess: 'Survey deleted successfully',
    titleRequired: 'Survey title is required',
  },

  // Question
  question: {
    title: 'Question',
    type: 'Question Type',
    typeSingle: 'Single Choice',
    typeMultiple: 'Multiple Choice',
    typeText: 'Text Input',
    typeRating: 'Rating',
    options: 'Options',
    required: 'Required',
    order: 'Order',
    minRating: 'Min Rating',
    maxRating: 'Max Rating',
    description: 'Description',
    addSuccess: 'Question added successfully',
    updateSuccess: 'Question updated successfully',
    deleteSuccess: 'Question deleted successfully',
    titleRequired: 'Question content is required',
    addOption: 'Add Option',
    minOptions: 'Please add at least two options',
  },

  // Response
  response: {
    submittedAt: 'Submitted At',
    answers: 'Answers',
    submitSuccess: 'Submitted successfully',
    submitFailed: 'Submission failed',
    allRequired: 'Please fill in all required fields',
    notFound: 'Response not found',
    exportSuccess: 'Exported successfully',
    exportFailed: 'Export failed',
  },

  // Stats
  stats: {
    totalResponses: 'Total Responses',
    questionStats: 'Question Statistics',
    optionCount: 'Option Count',
  },

  // Validation
  validation: {
    required: 'This field is required',
    invalidFormat: 'Invalid format',
    minLength: 'Minimum length is {min} characters',
    maxLength: 'Maximum length is {max} characters',
    between: 'Value must be between {min} and {max}',
  },

  // HTTP Status
  http: {
    badRequest: 'Bad request',
    unauthorized: 'Unauthorized, please login',
    forbidden: 'Access forbidden',
    notFound: 'Resource not found',
    internalError: 'Internal server error',
    serviceUnavailable: 'Service unavailable',
  },
};
