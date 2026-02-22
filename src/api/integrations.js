import { supabase } from '@/lib/supabase';

const createIntegration = (name) => async (params) => {
  const { data, error } = await supabase.functions.invoke('integrations', {
    body: { integration: name, ...params }
  });
  if (error) throw error;
  return data;
};

export const Core = {
  InvokeLLM: createIntegration('InvokeLLM'),
  SendEmail: createIntegration('SendEmail'),
  UploadFile: createIntegration('UploadFile'),
  GenerateImage: createIntegration('GenerateImage'),
  ExtractDataFromUploadedFile: createIntegration('ExtractDataFromUploadedFile'),
  CreateFileSignedUrl: createIntegration('CreateFileSignedUrl'),
  UploadPrivateFile: createIntegration('UploadPrivateFile')
};

export const InvokeLLM = Core.InvokeLLM;
export const SendEmail = Core.SendEmail;
export const UploadFile = Core.UploadFile;
export const GenerateImage = Core.GenerateImage;
export const ExtractDataFromUploadedFile = Core.ExtractDataFromUploadedFile;
export const CreateFileSignedUrl = Core.CreateFileSignedUrl;
export const UploadPrivateFile = Core.UploadPrivateFile;
