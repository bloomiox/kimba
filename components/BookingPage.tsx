import React from 'react';
import BookingForm from './BookingForm';

const BookingPage: React.FC = () => {
  return (
    // This wrapper ensures the form is centered on the page view within MainApp.
    <div className="w-full flex justify-center">
      <BookingForm />
    </div>
  );
};

export default BookingPage;
