import { useState } from "react";
import { useFeesStore } from "./useFeesStore";

export const useSequentialPaymentValidation = () => {
  const [studentsWithPendingFees, setStudentsWithPendingFees] = useState(
    new Set()
  );
  const { checkStudentUnpaidFees } = useFeesStore();

  const checkStudentPendingFees = async (studentId, currentFeeId) => {
    try {
      const unpaidFeesData = await checkStudentUnpaidFees(studentId);

      if (unpaidFeesData && unpaidFeesData.unpaidFeesCount > 0) {
        // Verificar si hay cuotas anteriores a la actual
        const hasEarlierUnpaidFees = unpaidFeesData.unpaidFees.some(
          (fee) =>
            fee.id !== currentFeeId && new Date(fee.startDate) < new Date()
        );

        if (hasEarlierUnpaidFees) {
          setStudentsWithPendingFees((prev) => new Set([...prev, studentId]));
          return true;
        }
      }

      setStudentsWithPendingFees((prev) => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
      return false;
    } catch (error) {
      console.error("Error checking pending fees:", error);
      return false;
    }
  };

  const hasStudentPendingFees = (studentId) => {
    return studentsWithPendingFees.has(studentId);
  };

  const clearValidationCache = () => {
    setStudentsWithPendingFees(new Set());
  };

  return {
    checkStudentPendingFees,
    hasStudentPendingFees,
    clearValidationCache,
  };
};
