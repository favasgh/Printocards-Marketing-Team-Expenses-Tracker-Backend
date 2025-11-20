import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Paid', value: 'Paid' },
];

const AdminFilters = ({ filters, salesmen, onChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [singleDate, setSingleDate] = useState('');

  useEffect(() => {
    setLocalFilters(filters);
    if (filters.startDate && filters.endDate && filters.startDate === filters.endDate) {
      setSingleDate(filters.startDate);
    } else {
      setSingleDate('');
    }
  }, [filters]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    onChange(localFilters);
  };

  const resetFilters = () => {
    const reset = { status: '', salesman: '', category: '', startDate: '', endDate: '', search: '' };
    setLocalFilters(reset);
    setSingleDate('');
    onChange(reset);
  };

  const handleSingleDateChange = (event) => {
    const { value } = event.target;
    setSingleDate(value);
    if (value) {
      const next = { ...localFilters, startDate: value, endDate: value };
      setLocalFilters(next);
    } else {
      const next = { ...localFilters, startDate: '', endDate: '' };
      setLocalFilters(next);
    }
  };

  return (
    <div className="glass-card grid gap-3 sm:gap-4 md:gap-4 lg:gap-3 p-4 sm:p-4 md:p-4 lg:p-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
      <div className="grid gap-1 lg:col-span-1">
        <label className="text-sm sm:text-base md:text-base lg:text-xs font-medium text-slate-600" htmlFor="status">
          Status
        </label>
        <select id="status" name="status" className="input-field" value={localFilters.status} onChange={handleChange}>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1 lg:col-span-1">
        <label className="text-sm sm:text-base md:text-base lg:text-xs font-medium text-slate-600" htmlFor="salesman">
          Salesman
        </label>
        <select id="salesman" name="salesman" className="input-field" value={localFilters.salesman} onChange={handleChange}>
          <option value="">All</option>
          {salesmen.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1 lg:col-span-1">
        <label className="text-sm sm:text-base md:text-base lg:text-xs font-medium text-slate-600" htmlFor="category">
          Category
        </label>
        <input
          id="category"
          name="category"
          className="input-field"
          placeholder="Category"
          value={localFilters.category}
          onChange={handleChange}
        />
      </div>
      <div className="grid gap-1 lg:col-span-1">
        <label className="text-sm sm:text-base md:text-base lg:text-xs font-medium text-slate-600" htmlFor="startDate">
          Start Date
        </label>
        <input
          id="startDate"
          name="startDate"
          type="date"
          className="input-field"
          value={localFilters.startDate}
          onChange={handleChange}
        />
      </div>
      <div className="grid gap-1 lg:col-span-1">
        <label className="text-sm sm:text-base md:text-base lg:text-xs font-medium text-slate-600" htmlFor="endDate">
          End Date
        </label>
        <input
          id="endDate"
          name="endDate"
          type="date"
          className="input-field"
          value={localFilters.endDate}
          onChange={handleChange}
        />
      </div>
      <div className="grid gap-1 lg:col-span-1">
        <label className="text-sm sm:text-base md:text-base lg:text-xs font-medium text-slate-600" htmlFor="search">
          Search
        </label>
        <input
          id="search"
          name="search"
          className="input-field"
          placeholder="Note/location"
          value={localFilters.search}
          onChange={handleChange}
        />
      </div>
      <div className="grid gap-1 lg:col-span-1">
        <label className="text-sm sm:text-base md:text-base lg:text-xs font-medium text-slate-600" htmlFor="singleDate">
          Specific Date
        </label>
        <input
          id="singleDate"
          name="singleDate"
          type="date"
          className="input-field"
          value={singleDate}
          onChange={handleSingleDateChange}
        />
        <p className="text-xs text-slate-400">Quickly set both start & end date</p>
      </div>
      <div className="flex items-end gap-3 lg:col-span-2">
        <button type="button" className="btn-primary flex-1" onClick={applyFilters}>
          Apply Filters
        </button>
        <button type="button" className="btn-secondary" onClick={resetFilters}>
          Reset
        </button>
      </div>
    </div>
  );
};

AdminFilters.propTypes = {
  filters: PropTypes.shape({
    status: PropTypes.string,
    salesman: PropTypes.string,
    category: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    search: PropTypes.string,
  }).isRequired,
  salesmen: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  onChange: PropTypes.func.isRequired,
};

AdminFilters.defaultProps = {
  salesmen: [],
};

export default AdminFilters;

