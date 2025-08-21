// Define the interface for form submissions (client-side only)
export interface IFormSubmission {
  _id?: string;
  name: string;
  productLine: string;
  erCode: string;
  description: string;
  modelNumber: string;
  submittedAt: Date;
}

// Define the form data interface for client-side use
export interface IFormData {
  name: string;
  productLine: string;
  erCode: string;
  description: string;
  modelNumber: string;
}

// Validation result interface
export interface IValidationResult {
  isValid: boolean;
  message: string;
}
