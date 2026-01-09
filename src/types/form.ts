export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'password'
  | 'checkbox'
  | 'select'
  | 'email'
  | 'radio'

export type ValidationRule = {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp | string // RegExp 또는 패턴 이름(string)을 허용
}

export type FieldConfig = {
  type: FieldType
  label: string
  name: string
  validation?: ValidationRule
  options?: string[] // for select and radio fields
}

export type FormErrors = {
  [key: string]: string
}

export interface FormSubmitButtonProps {
  action: 'create' | 'update' | 'delete'
}
