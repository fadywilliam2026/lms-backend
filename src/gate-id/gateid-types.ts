type SignaturePosition = {
  page: number;
  bottom: number;
  left: number;
  top: number;
  right: number;
  fontsize: number;
};

type NationalId = {
  nationalId: string;
  signaturePositions: SignaturePosition;
};

type ContractTerm = {
  page: number;
  msg: {
    ar: string;
    en: string;
  };
};

export type CreateContractBody = {
  nationalIds: NationalId[];
  signaturePositions: SignaturePosition;
  title: string;
  terms: ContractTerm[];
};
