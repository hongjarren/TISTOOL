import axios, { AxiosError } from 'axios';
import { IFormData, IFormSubmission } from '../models/FormSubmission';

// API response interfaces
interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Create an API service for handling form submissions
const apiService = {
  // Submit form data to MongoDB with retry logic
  submitForm: async (formData: IFormData, retries = 3): Promise<IApiResponse<IFormSubmission>> => {
    try {
      console.log('Submitting form data:', formData);
      
      const response = await apiClient.post('/api/submissions', {
        ...formData,
        submittedAt: new Date()
      });
      
      console.log('API response:', response.data);
      
      return {
        success: true,
        message: 'Form submitted successfully',
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      // Retry logic for network errors
      if (retries > 0 && error.code === 'NETWORK_ERROR') {
        console.log(`Retrying... ${retries} attempts left`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return apiService.submitForm(formData, retries - 1);
      }
      
      // Provide more detailed error information
      let errorMessage = 'Failed to submit form. Please try again later.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  },
  
  // Get all submissions with pagination support
  getSubmissions: async (page = 1, limit = 10): Promise<IApiResponse<IFormSubmission[]>> => {
    try {
      const response = await apiClient.get(`/api/submissions?page=${page}&limit=${limit}`);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Submissions fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return {
        success: false,
        message: 'Failed to fetch submissions. Please try again later.'
      };
    }
  },

  // Get single submission by ID
  getSubmissionById: async (id: string): Promise<IApiResponse<IFormSubmission>> => {
    try {
      const response = await apiClient.get(`/api/submissions/${id}`);
      
      return {
        success: true,
        data: response.data.data,
        message: 'Submission fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching submission:', error);
      return {
        success: false,
        message: 'Failed to fetch submission. Please try again later.'
      };
    }
  },

  // Delete submission by ID
  deleteSubmission: async (id: string): Promise<IApiResponse> => {
    try {
      const response = await apiClient.delete(`/api/submissions/${id}`);
      
      return {
        success: true,
        message: response.data.message || 'Submission deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting submission:', error);
      return {
        success: false,
        message: 'Failed to delete submission. Please try again later.'
      };
    }
  }
};

export default apiService;
