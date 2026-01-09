'use client'

import React, { useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Image from 'next/image'

interface FilePreviewProps {
  fileURL?: string
  fileName?: string
  fileType?: string
  onDelete: () => void
}

const FilePreview: React.FC<FilePreviewProps> = ({
  fileURL,
  fileName,
  fileType,
  onDelete,
}) => {
  return (
    <div>
      {fileURL ? (
        <>
          {fileType?.startsWith('image/') ? (
            <Image
              src={fileURL}
              alt="사용자가 선택한 이미지"
              width={500}
              height={500}
              sizes="100%"
            />
          ) : (
            <a href={fileURL} download={fileName}>
              {fileName}
            </a>
          )}
          <br />
          <button onClick={onDelete}>파일 삭제</button>
        </>
      ) : (
        <p>선택된 파일 없음</p>
      )}
    </div>
  )
}

interface FilePickerProps {
  label: string
  name: string
}

interface PickedFileData {
  fileURL: string
  fileName: string
  fileType: string
}

const FilePicker: React.FC<FilePickerProps> = ({ label, name }) => {
  const fileInput = useRef<HTMLInputElement>(null)
  const [pickedFileData, setPickedFileData] = useState<PickedFileData | null>(
    null,
  )
  const { pending } = useFormStatus()

  function handlePickClick() {
    fileInput.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]

    if (file) {
      const fileReader = new FileReader()
      fileReader.onload = () => {
        setPickedFileData({
          fileURL: fileReader.result as string,
          fileName: file.name,
          fileType: file.type,
        })
      }
      fileReader.readAsDataURL(file)
    }
  }

  function handleFileDeleteClick() {
    setPickedFileData(null)
    if (fileInput.current) {
      fileInput.current.value = ''
    }
  }

  return (
    <div>
      <label htmlFor={name} hidden>
        {label}
      </label>
      <div>
        <div>
          <FilePreview {...pickedFileData} onDelete={handleFileDeleteClick} />
        </div>
        <input
          type="file"
          id={name}
          accept=".zip, .pdf, .doc, .docx, .xls, .xlsx, .hwp, image/gif, image/jpg, image/jpeg, image/png"
          name={name}
          ref={fileInput}
          onChange={handleFileChange}
          hidden
        />
        <button disabled={pending} type="button" onClick={handlePickClick}>
          {pending ? '제출중...' : '파일 선택'}
        </button>
      </div>
    </div>
  )
}

export default FilePicker
