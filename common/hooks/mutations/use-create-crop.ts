import { useMutation } from "@apollo/client/react";
import { CreateCropDocument, CropsDocument } from "@/common/graphql/generated/graphql";

export const useCreateCrop = () =>
  useMutation(CreateCropDocument, {
    refetchQueries: [CropsDocument],
  });
