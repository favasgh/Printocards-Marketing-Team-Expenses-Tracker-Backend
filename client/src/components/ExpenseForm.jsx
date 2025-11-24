import { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { createExpense } from '../store/slices/expensesSlice.js';
import { fileToBase64 } from '../utils/image.js';
import { toast } from 'react-toastify';

const categories = ['Travel', 'Food', 'Office Vehicle Fuel', 'Own Vehicle Fuel', 'Room', 'EV Charging', 'Other'];

const initialForm = {
  category: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  location: '',
  note: '',
};

const ExpenseForm = ({ onSuccess = null }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const { status } = useSelector((state) => state.expenses);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (event) => {
    const selected = event.target.files?.[0];
    if (!selected) {
      setFile(null);
      setPreview('');
      return;
    }
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(selected.type)) {
      toast.error('Only JPG, PNG, or PDF files are allowed');
      return;
    }
    setFile(selected);
    if (selected.type.startsWith('image/')) {
      const base64 = await fileToBase64(selected);
      setPreview(base64);
    } else {
      setPreview('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.category || !form.amount || !form.date) {
      toast.error('Category, amount, and date are required');
      return;
    }

    setLoading(true);
    
    // Calculate amount for "Own Vehicle Fuel" category (kilometers * 3.5)
    let calculatedAmount = Number(form.amount);
    if (form.category === 'Own Vehicle Fuel') {
      calculatedAmount = Number(form.amount) * 3.5;
    }
    
    const expensePayload = {
      ...form,
      amount: calculatedAmount,
    };

    const imageBase64 = file && file.type.startsWith('image/') ? await fileToBase64(file) : null;

    const resultAction = await dispatch(createExpense({ expense: expensePayload, imageFile: file, imageBase64 }));
    setLoading(false);

    if (createExpense.fulfilled.match(resultAction)) {
      setForm(initialForm);
      setFile(null);
      setPreview('');
      if (onSuccess) {
        onSuccess(resultAction.payload.expense);
      }
    }
  };

  const captureLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast.error('Geolocation not supported on this device');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm((prev) => ({
          ...prev,
          location: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        }));
        setLocating(false);
      },
      (error) => {
        console.error('Location error', error);
        toast.error('Unable to fetch location');
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card grid gap-4 sm:gap-4 md:gap-4 lg:gap-3 p-4 sm:p-4 md:p-5 lg:p-4">
      <div className="grid gap-1">
        <label className="text-sm sm:text-base md:text-base lg:text-sm font-medium text-slate-600" htmlFor="category">
          Category
        </label>
        <select
          id="category"
          name="category"
          className="input-field"
          value={form.category}
          onChange={handleChange}
          required
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1 md:grid-cols-2 md:gap-4">
        <div className="grid gap-1">
          <label className="text-sm sm:text-base md:text-base lg:text-sm font-medium text-slate-600" htmlFor="amount">
            {form.category === 'Own Vehicle Fuel' ? 'Kilometer Driven' : 'Amount'}
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step={form.category === 'Own Vehicle Fuel' ? '1' : '0.01'}
            className="input-field"
            value={form.amount}
            onChange={handleChange}
            required
            placeholder={form.category === 'Own Vehicle Fuel' ? 'Enter kilometers' : ''}
          />
          {form.category === 'Own Vehicle Fuel' && form.amount && (
            <p className="text-sm sm:text-base font-bold text-slate-700">
              Amount: {Number(form.amount) * 3.5} ₹ (3.5 ₹ per kilometer)
            </p>
          )}
        </div>
        <div className="grid gap-1">
          <label className="text-sm sm:text-base md:text-base lg:text-sm font-medium text-slate-600" htmlFor="date">
            Date
          </label>
          <input id="date" name="date" type="date" className="input-field" value={form.date} onChange={handleChange} required />
        </div>
      </div>
      <div className="grid gap-1">
        <label className="text-sm sm:text-base md:text-base lg:text-sm font-medium text-slate-600" htmlFor="location">
          Location (optional)
        </label>
        <input
          id="location"
          name="location"
          className="input-field"
          placeholder="City or area"
          value={form.location}
          onChange={handleChange}
        />
        <button type="button" className="btn-secondary w-max px-4 py-2 sm:px-5 sm:py-2.5 md:px-4 md:py-2 text-sm sm:text-base md:text-sm whitespace-nowrap" onClick={captureLocation} disabled={locating}>
          {locating ? 'Capturing...' : 'Use current location'}
        </button>
      </div>
      <div className="grid gap-1">
        <label className="text-sm sm:text-base md:text-base lg:text-sm font-medium text-slate-600" htmlFor="note">
          Note
        </label>
        <textarea
          id="note"
          name="note"
          rows="3"
          className="input-field"
          placeholder="Add extra context..."
          value={form.note}
          onChange={handleChange}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm sm:text-base md:text-base lg:text-sm font-medium text-slate-600" htmlFor="receipt">
          Receipt (JPG/PNG/PDF)
        </label>
        <input id="receipt" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="text-sm sm:text-base md:text-sm" />
        {preview && (
          <img src={preview} alt="Preview" className="h-36 w-36 rounded-lg border border-slate-200 object-cover shadow-sm" />
        )}
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={loading || status === 'loading'}>
          {loading ? 'Saving...' : 'Submit Expense'}
        </button>
      </div>
    </form>
  );
};

ExpenseForm.propTypes = {
  onSuccess: PropTypes.func,
};

export default ExpenseForm;

