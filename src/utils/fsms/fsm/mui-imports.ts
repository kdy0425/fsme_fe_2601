// Material UI 사용을 위한 import문을 모아둔 파일
// 1. export 할 Props, Components 등을 각 자리에 추가한다.
// 2. 맨 밑의 import 문에도 추가한다.
// 3. import 문을 복사하여 필요한 곳에 붙여넣은 후 사용하지 않는 export를 지운다.

// Props
export {
  dropzoneText,
  previewText,
  ContentsExplanationText,
  ContentsExplanationRejectText,
  filesLimit,
  maxFileSize,
  showAlerts,
  getDropRejectMessage,
  getFileLimitExceedMessage,
  getFileAddedMessage,
  getFileRemovedMessage,
  acceptedFileTypes,
  acceptedFileExtensions,
} from '@/utils/fsms/fsm/dropzonearea-props'

// Components
export { DropzoneArea } from 'mui-file-dropzone'
export { default as Breadcrumb } from '@/app/(admin)/layout/shared/breadcrumb/Breadcrumb'
export { default as PageContainer } from '@/components/container/PageContainer'
export { default as BlankCard } from '@/components/shared/BlankCard'
export { default as ContentsExplanation } from '@/components/shared/ContentsExplanation'
export { default as CustomFormLabel } from '@/components/forms/theme-elements/CustomFormLabel'
export { default as CustomTextField } from '@/components/forms/theme-elements/CustomTextField'
export { default as CustomSelect } from '@/components/forms/theme-elements/CustomSelect'
export { default as CustomRadio } from '@/app/components/forms/theme-elements/CustomRadio'
export {
  Box,
  Button,
  CardContent,
  Typography,
  Divider,
  Grid,
  RadioGroup,
  FormGroup,
  FormControlLabel,
  MenuItem,
  Stack,
  FormHelperText,
} from '@mui/material'

// 복사 붙여넣기용 import
import {
  dropzoneText,
  previewText,
  ContentsExplanationText,
  ContentsExplanationRejectText,
  filesLimit,
  maxFileSize,
  showAlerts,
  getDropRejectMessage,
  getFileLimitExceedMessage,
  getFileAddedMessage,
  getFileRemovedMessage,
  acceptedFileTypes,
  acceptedFileExtensions,
  DropzoneArea,
  Breadcrumb,
  PageContainer,
  BlankCard,
  ContentsExplanation,
  CustomFormLabel,
  CustomTextField,
  Box,
  Button,
  CardContent,
  Typography,
  Divider,
  Grid,
  FormHelperText,
  Stack,
  MenuItem,
  CustomSelect,
  CustomRadio,
  RadioGroup,
  FormGroup,
  FormControlLabel,
} from '@/utils/fsms/fsm/mui-imports'
