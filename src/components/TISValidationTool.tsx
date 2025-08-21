import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertTriangle, Save, RotateCcw } from 'lucide-react';
import ValidationField from './ValidationField';
import LoadingSpinner from './LoadingSpinner';
import { ToastContainer } from './Toast';
import apiService from '../services/apiService';
import { IFormData, IValidationResult } from '../models/FormSubmission';
import { useToast } from '../hooks/useToast';

const TISValidationTool: React.FC = () => {
  const DRAFT_KEY = 'tis-validation-draft';
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const [formData, setFormData] = useState<IFormData>({
    name: '',
    productLine: '',
    erCode: '',
    description: '',
    modelNumber: ''
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions - you can modify these with your specific rules
  const validateName = (value: string): IValidationResult => {
    if (!value) return { isValid: false, message: 'Name is required' };
    if (value.length < 2) return { isValid: false, message: 'Name must be at least 2 characters' };
    if (!/^[a-zA-Z\s]+$/.test(value)) return { isValid: false, message: 'Name can only contain letters and spaces' };
    return { isValid: true, message: 'Valid name format' };
  };

  const validateProductLine = (value: string): IValidationResult => {
    if (!value) return { isValid: false, message: 'Product Line is required' };
    if (value.length < 3) return { isValid: false, message: 'Product Line must be at least 3 characters' };
    if (!/^[A-Z]{2,4}-[0-9]{2,4}$/.test(value)) return { isValid: false, message: 'Format: XX-99 (2-4 letters, dash, 2-4 numbers)' };
    return { isValid: true, message: 'Valid product line format' };
  };

  const validateERCode = (value: string): IValidationResult => {
    if (!value) return { isValid: false, message: 'ER Code is required' };
    if (!/^ER[0-9]{6}$/.test(value)) return { isValid: false, message: 'Format: ER followed by 6 digits (e.g., ER123456)' };
    return { isValid: true, message: 'Valid ER code format' };
  };

  const validateDescription = (value: string): IValidationResult => {
    if (!value) return { isValid: false, message: 'Description is required' };
    if (value.length < 10) return { isValid: false, message: 'Description must be at least 10 characters' };
    if (value.length > 500) return { isValid: false, message: 'Description must be less than 500 characters' };
    return { isValid: true, message: 'Valid description length' };
  };

  const validateModelNumber = (value: string): IValidationResult => {
    if (!value) return { isValid: false, message: 'Model Number is required' };
    if (!/^[A-Z]{2}[0-9]{4}[A-Z]?$/.test(value)) return { isValid: false, message: 'Format: 2 letters + 4 digits + optional letter (e.g., AB1234C)' };
    return { isValid: true, message: 'Valid model number format' };
  };

  const validations = {
    name: validateName(formData.name),
    productLine: validateProductLine(formData.productLine),
    erCode: validateERCode(formData.erCode),
    description: validateDescription(formData.description),
    modelNumber: validateModelNumber(formData.modelNumber)
  };

  // Load draft from localStorage on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setFormData(parsedDraft);
        setHasDraft(true);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  useEffect(() => {
    const allValid = Object.values(validations).every(v => v.isValid) && 
                    Object.values(formData).every(v => v.trim() !== '');
    setIsFormValid(allValid);
    
    // Reset draft saved status when form changes
    if (isDraftSaved) {
      setIsDraftSaved(false);
    }
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setIsSubmitted(false);
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      setIsDraftSaved(true);
      setHasDraft(true);
      showSuccess('Draft Saved!', 'Your progress has been preserved.');
      
      // Show saved status for 3 seconds
      setTimeout(() => {
        setIsDraftSaved(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving draft:', error);
      showError('Save Failed', 'Unable to save draft. Please try again.');
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setFormData({
      name: '',
      productLine: '',
      erCode: '',
      description: '',
      modelNumber: ''
    });
    setHasDraft(false);
    setIsDraftSaved(false);
    setIsSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      setIsSubmitting(true);
      
      try {
        console.log('Submitting form data:', formData);
        
        // Submit to MongoDB through API
        const result = await apiService.submitForm(formData);
        
        console.log('Submission result:', result);
        
        if (result.success) {
          setIsSubmitted(true);
          // Clear draft after successful submission
          localStorage.removeItem(DRAFT_KEY);
          setHasDraft(false);
          showSuccess('Form Submitted Successfully!', 'Your data has been saved to the database.');
          console.log('Form submitted to MongoDB:', result.data);
        } else {
          showError('Submission Failed', result.message);
          console.error('Submission failed:', result.message);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        showError('Submission Error', 'An unexpected error occurred. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getValidFieldsCount = () => {
    return Object.values(validations).filter(v => v.isValid).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">TIS Validation Tool</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ensure all product information meets validation requirements before submission.
            All fields must pass validation to proceed.
          </p>
        </div>

        {/* Validation Progress */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Validation Progress</h2>
            <span className="text-sm font-medium text-gray-600">
              {getValidFieldsCount()} / 5 fields validated
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(getValidFieldsCount() / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Draft Status */}
        {hasDraft && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Save className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">
                  Draft available - your previous work has been restored
                </span>
              </div>
              <button
                onClick={handleClearDraft}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Clear Draft
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ValidationField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              validation={validations.name}
              placeholder="Enter full name"
            />

            <ValidationField
              label="Product Line"
              name="productLine"
              value={formData.productLine}
              onChange={handleInputChange}
              validation={validations.productLine}
              placeholder="e.g., AB-1234"
            />

            <ValidationField
              label="ER Code"
              name="erCode"
              value={formData.erCode}
              onChange={handleInputChange}
              validation={validations.erCode}
              placeholder="e.g., ER123456"
            />

            <ValidationField
              label="Model Number"
              name="modelNumber"
              value={formData.modelNumber}
              onChange={handleInputChange}
              validation={validations.modelNumber}
              placeholder="e.g., AB1234C"
            />
          </div>

          <div className="mb-8">
            <ValidationField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              validation={validations.description}
              placeholder="Provide detailed product description (10-500 characters)"
              type="textarea"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-6 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isDraftSaved ? 'Draft Saved!' : 'Save Draft'}
            </button>
            
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`px-8 py-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center gap-2 ${
                isFormValid && !isSubmitting
                  ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Submitting...
                </>
              ) : isFormValid ? (
                'Submit Validation'
              ) : (
                'Complete All Fields to Submit'
              )}
            </button>
          </div>

          {/* Success Message */}
          {isSubmitted && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-green-800 font-medium">
                Form submitted successfully! All validations passed. Data has been saved to MongoDB.
              </span>
            </div>
          )}

          {/* Validation Summary */}
          {Object.values(formData).some(v => v) && !isFormValid && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-yellow-800 font-medium block mb-2">
                  Please fix the following validation errors:
                </span>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {Object.entries(validations)
                    .filter(([, validation]) => !validation.isValid)
                    .map(([field, validation]) => (
                      <li key={field}>• {field.charAt(0).toUpperCase() + field.slice(1)}: {validation.message}</li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </form>
      </div>
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default TISValidationTool;