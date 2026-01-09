import React from 'react';
import { FieldConfig } from '@/types/form';

type FormFieldProps = FieldConfig & {
  value: string | number | boolean;
  onChange: (name: string, value: string | number | boolean) => void;
  error?: string;
};

export const FormField: React.FC<FormFieldProps> = ({ type, label, name, validation, options, value, onChange, error }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = type === 'checkbox' || type === 'radio' ? (e.target as HTMLInputElement).checked : e.target.value;
    onChange(name, newValue);
  };

  const inputProps = {
    id: name,
    name,
    onChange: handleChange,
    required: validation?.required,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${name}-error` : undefined,
  };

  return (
    <div>
      <label htmlFor={name}>{label}</label>
      {type === 'textarea' ? (
        <textarea {...inputProps} value={value as string} />
      ) : type === 'select' ? (
        <select {...inputProps} value={value as string}>
          <option value="">선택</option>
          {options?.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : type === 'radio' ? (
        options?.map(option => (
          <label key={option}>
            <input
              type="radio"
              {...inputProps}
              value={option}
              checked={value === option}
            />
            {option}
          </label>
        ))
      ) : (
        <input
          type={type}
          {...inputProps}
          value={type !== 'checkbox' ? value as string : undefined}
          checked={type === 'checkbox' ? value as boolean : undefined}
          min={validation?.min}
          max={validation?.max}
        />
      )}
      {error && <p id={`${name}-error`} className="error" role="alert">{error}</p>}
    </div>
  );
};