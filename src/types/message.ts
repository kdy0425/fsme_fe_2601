  export type ResultType = 'success' | 'error' |'fail';

  export interface ApiError {
    field: string;
    value: string;
    reason: string;
  }

  export interface StatusType  {
    resultType: ResultType;
    status: number;
    message: string;
    errors?: ApiError[];
    
  }

  export interface ApiResponse<T = any> extends StatusType  {
    timestamp: string;
    data?: T;
  }

  // export class ApiError extends Error implements StatusType  {
  //   resultType: ResultType;
  //   status: number;
  //   errors?: ApiError[];
  
  //   constructor(response: ApiResponse) {
  //   super(response.message);
  //   this.name = 'ApiError';
  //   this.resultType = response.resultType;
  //   this.status = response.status;
  //   this.errors = response.errors;
  //   }
  // }

  export class ApiError extends Error implements StatusType {
    constructor(
      public resultType: ResultType,
      public status: number,
      message: string,
      public errors?: ApiError[]
    ) {
      super(message);
      this.name = 'ApiError';
    }
  }

  export function getCombinedErrorMessage(error: ApiError): string {
    const errorMessages = error.errors?.map(err => err.reason).filter(Boolean) || [];
    return errorMessages.length > 0
      ? errorMessages.join('\n')
      : error.message;
  }

  export interface MessageTemplate {
    [key: string]: string;
  }

  export enum MessageType {
    SUCCESS = 'success',
    ERROR = 'error',
    INFO = 'info',
    WARNING = 'warning'
  }