import React from "react";
import Button from "../button/button";

interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  disableNext?: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  disableNext,
  onPageChange,
  className = "",
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!totalPages) return onPageChange(currentPage + 1);
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={`flex items-center justify-end gap-2 ${className}`}>
      <Button
        border=""
        shadow=""
        className="h-8 text-xs"
        color="white"
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        กลับ
      </Button>

      <div className="flex items-center px-3 py-1 border rounded-md shadow-sm">
        <span className="text-sm">{currentPage}</span>
        {totalPages && (
          <>
            <span className="mx-2 text-gray-300 font-light">/</span>
            <span className="text-sm">{totalPages}</span>
          </>
        )}
      </div>

      <Button
        border=""
        shadow=""
        className="h-8 text-xs"
        color="white"
        onClick={handleNext}
        disabled={currentPage === totalPages || disableNext}
      >
        ถัดไป
      </Button>
    </div>
  );
};

export default Pagination;
