import PropTypes from 'prop-types';

const range = (start, end) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, index) => start + index);
};

const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) {
    return null;
  }

  const visiblePages = range(Math.max(1, page - 2), Math.min(pages, page + 2));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-4 md:px-4 md:py-3 lg:px-3 lg:py-2">
      <p className="text-sm sm:text-base md:text-base lg:text-sm text-slate-500">
        Page {page} of {pages}
      </p>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          className="btn-secondary px-3 py-1.5 sm:px-4 sm:py-2 md:px-4 md:py-2 lg:px-3 lg:py-1 text-xs sm:text-sm md:text-base lg:text-sm whitespace-nowrap"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        {visiblePages.map((value) => (
          <button
            key={value}
            type="button"
            className={`rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 md:px-4 md:py-2 lg:px-3 lg:py-1 text-xs sm:text-sm md:text-base lg:text-sm font-medium ${
              value === page ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            onClick={() => onPageChange(value)}
          >
            {value}
          </button>
        ))}
        <button
          type="button"
          className="btn-secondary px-3 py-1.5 sm:px-4 sm:py-2 md:px-4 md:py-2 lg:px-3 lg:py-1 text-xs sm:text-sm md:text-base lg:text-sm whitespace-nowrap"
          disabled={page === pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  pages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;



