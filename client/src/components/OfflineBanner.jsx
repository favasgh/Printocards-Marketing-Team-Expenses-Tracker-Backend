import PropTypes from 'prop-types';

const OfflineBanner = ({ online }) => {
  if (online) {
    return null;
  }

  return (
    <div className="fixed bottom-4 inset-x-4 z-50 rounded-lg bg-warning/90 p-3 text-sm text-white shadow-lg">
      <p className="text-center font-medium">
        You are offline. New expenses will be stored locally and submitted automatically once reconnected.
      </p>
    </div>
  );
};

OfflineBanner.propTypes = {
  online: PropTypes.bool.isRequired,
};

export default OfflineBanner;









