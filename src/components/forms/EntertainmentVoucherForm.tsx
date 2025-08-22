import React from "react";
import DynamicVoucherForm from "./DynamicVoucherForm";

interface EntertainmentVoucherFormProps {
  voucherTypeId: string;
  onFormSubmit?: () => void;
}

const EntertainmentVoucherForm = ({ voucherTypeId, onFormSubmit }: EntertainmentVoucherFormProps) => {
  return (
    <DynamicVoucherForm voucherTypeId={voucherTypeId} onFormSubmit={onFormSubmit} />
  );
};

export default EntertainmentVoucherForm;