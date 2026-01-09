import { FieldConfig, FormErrors, ValidationRule } from '@/types/form';

const PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
};

const getValidationMessage = (field: FieldConfig, rule: keyof ValidationRule, params?: any): string => {
  const messages: { [key: string]: (field: FieldConfig, params?: any) => string } = {
    required: (field) => `${field.label}은(는) 필수 입력값입니다.`,
    minLength: (field, min) => `${field.label}은(는) ${min}자 이상 입력해주세요.`,
    maxLength: (field, max) => `${field.label}은(는) ${max}이하로 입력해주세요.`,
    min: (field, min) => `${field.label}은(는) ${min}이어야 합니다.`,
    max: (field, max) => `${field.label}은(는) ${max}자 이하로 입력해주세요.`,
    pattern: (field) => {
      const patternMessages = {
        email: '유효한 이메일 주소를 입력해주세요.',
        password: '비밀번호는 최소 8자 이상이며, 대문자, 소문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.',
        default: `${field.label}의 형식이 올바르지 않습니다.`,
      };
      return patternMessages[field.name as keyof typeof patternMessages] || patternMessages.default;
    },
  };
  return messages[rule] ? messages[rule](field, params) : '유효하지 않은 입력입니다.';
};

export const validateField = (value: FormDataEntryValue | FormDataEntryValue[] | null, rules: ValidationRule, fieldConfig: FieldConfig): string | null => {
  const validations = [
    { condition: () => rules.required &&
      ((Array.isArray(value) && value.length === 0) || (!Array.isArray(value) && !value)), rule: 'required' },
    { condition: () => rules.minLength && typeof value === 'string' && value.length < rules.minLength, rule: 'minLength', param: rules.minLength },
    { condition: () => rules.maxLength && typeof value === 'string' && value.length > rules.maxLength, rule: 'maxLength', param: rules.maxLength },
    { condition: () => rules.min && typeof value === 'string' && Number(value) < rules.min, rule: 'min', param: rules.min },
    { condition: () => rules.max && typeof value === 'string' && Number(value) > rules.max, rule: 'max', param: rules.max },
    { condition: () => {
      if (rules.pattern) {
        const pattern = typeof rules.pattern === 'string' ? PATTERNS[rules.pattern as keyof typeof PATTERNS] : rules.pattern;
        return pattern && typeof value === 'string' && !pattern.test(value);
      }
      return false;
    }, rule: 'pattern' },
    { condition: () => rules.required && (fieldConfig.type === 'select' || fieldConfig.type === 'radio') && !value, rule: 'required' },
    { condition: () => fieldConfig.type === 'checkbox' &&
      ((Array.isArray(value) && value.length === 0) || (!Array.isArray(value) && value !== 'checked')), rule: 'required' },
  ];

  for (const validation of validations) {
    if (validation.condition()) {
      return getValidationMessage(fieldConfig, validation.rule as keyof ValidationRule, validation.param);
    }
  }

  return null;
};

export const validateForm = (data: FormData, fields: FieldConfig[],): FormErrors => {
  return fields.reduce((errors, field) => {
    if (field.validation) {
      let value;
       if (field.type === 'checkbox' && field.validation.required) {
        value = data.getAll(field.name) as string[];
      } else {
        value = data.get(field.name);
      }

      const error = validateField(value, field.validation, field);
      if (error) {
        return {...errors, [field.name]: error};
      }
    }
    return errors;
  }, {} as FormErrors);
};