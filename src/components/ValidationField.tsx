import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { IValidationResult } from '../models/FormSubmission';

interface ValidationFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  validation: IValidationResult;
  placeholder?: string;
  type?: 'input' | 'textarea';
}

const ValidationField: React.FC<ValidationFieldProps> = ({
  label,
  name,
  value,
  onChange,
  validation,
  placeholder,
  type = 'input'
}) => {
  const getValidationIcon = () => {
    if (!value) return <AlertCircle className="w-5 h-5 text-gray-400" />;
    return validation.isValid 
      ? <Check className="w-5 h-5 text-green-500" />
      : <X className="w-5 h-5 text-red-500" />;
  };

  const getInputClass = () => {
    let baseClass = "w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
    
    if (!value) {
      return `${baseClass} border-gray-200 focus:border-blue-500`;
    }
    
    return validation.isValid 
      ? `${baseClass} border-green-500 bg-green-50/50 focus:border-green-500`
      : `${baseClass} border-red-500 bg-red-50/50 focus:border-red-500`;
  };

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={4}
            className={getInputClass()}
          />
        ) : (
          <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={getInputClass()}
          />
        )}
        <div className="absolute right-3 top-3">
          {getValidationIcon()}
        </div>
      </div>
      {value && (
        <div className={`text-sm font-medium ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
          {validation.message}
        </div>
      )}
    </div>
  );
};

export default ValidationField;