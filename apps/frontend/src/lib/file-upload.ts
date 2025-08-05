import axiosInstance from './axios';

export interface FileUploadResponse {
  id: string;
  filename: string;
  url: string;
  relatedId: string;
  relatedType: string;
}

export const uploadFiles = async (
  files: File[],
  relatedId: string,
  relatedType: 'package' | 'itinerary' | 'customer' | 'employee' | 'department' | 'organization' | 'user' | 'lead' | 'lead-updates' | 'payment'
): Promise<FileUploadResponse[]> => {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append('files', file);
  });
  
  formData.append('relatedId', relatedId);
  formData.append('relatedType', relatedType);

  try {
    const response = await axiosInstance.post<FileUploadResponse[]>('/file-manager/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('File upload failed:', error);
    throw new Error('Failed to upload files');
  }
};

export const uploadSingleFile = async (
  file: File,
  relatedId: string,
  relatedType: 'package' | 'itinerary' | 'customer' | 'employee' | 'department' | 'organization' | 'user' | 'lead' | 'lead-updates' | 'payment'
): Promise<FileUploadResponse> => {
  const result = await uploadFiles([file], relatedId, relatedType);
  return result[0];
};

export const deleteFile = async (fileId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/file-manager/${fileId}`);
  } catch (error) {
    console.error('File deletion failed:', error);
    throw new Error('Failed to delete file');
  }
};

export const getFilesByEntity = async (
  relatedId: string,
  relatedType: string
): Promise<FileUploadResponse[]> => {
  try {
    console.log(relatedId, relatedType);
    const response = await axiosInstance.get<FileUploadResponse[]>(`/file-manager/related-id/${relatedId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch files:', error);
    throw new Error('Failed to fetch files');
  }
};

export const getFileUrl = (fileId: string): string => {
  return `/file-manager/serve/${fileId}`;
}; 