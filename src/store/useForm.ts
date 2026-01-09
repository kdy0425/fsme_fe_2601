'use client'

import { useState, useCallback } from 'react'
import { FormErrors, FieldConfig } from '@/types/form'
import { validateForm } from '@/utils/fsms/common/validation'

export const useForm = (
  fields: FieldConfig[],
  formRef: React.RefObject<HTMLFormElement>,
  initialValues: Record<string, string> = {},
) => {
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getFormValues = useCallback(() => {
    if (!formRef.current) return initialValues
    const formData = new FormData(formRef.current)
    return fields.reduce(
      (values, field) => {
        if (field.type === 'checkbox') {
          values[field.name] = formData.getAll(field.name) as string[]
        } else {
          values[field.name] = formData.get(field.name) as string
        }
        return values
      },
      {} as Record<string, string | string[]>,
    )
  }, [fields, initialValues])

  const handleChange = useCallback(
    (name: string, value: string | number | boolean) => {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    },
    [],
  )

  const handleSubmit = useCallback(
    (onSubmit: (data: FormData) => void | Promise<void>) =>
      async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        const newErrors = validateForm(formData, fields)
        setErrors(newErrors)

        if (Object.keys(newErrors).length === 0) {
          try {
            await onSubmit(formData)
          } catch (error) {
            console.error('Form submission error:', error)
          } finally {
            setIsSubmitting(false)
          }
        } else {
          setIsSubmitting(false)
        }
      },
    [fields],
  )

  const getInputProps = useCallback(
    (
      field: FieldConfig,
      onChangeExtra?: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => void,
    ) => ({
      name: field.name,
      ...(initialValues[field.name] !== undefined ? { defaultValue: initialValues[field.name] } : {}),
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => {
        handleChange(field.name, e.target.value)
        onChangeExtra?.(e)
      },
      disabled: isSubmitting,
    }),
    [handleChange, isSubmitting, initialValues],
  )

  return {
    getFormValues,
    errors,
    isSubmitting,
    handleSubmit,
    getInputProps,
    formRef,
    handleChange,
  }
}
