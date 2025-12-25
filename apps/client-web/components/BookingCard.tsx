import { Calendar, MapPin, Phone, CheckCircle } from 'lucide-react';
import { Button } from '@vision-match/ui-web';

interface BookingCardProps {
  booking: {
    id: string;
    project_type: string;
    client_name: string;
    location: string;
    event_date: string;
    amount: number;
    status: string;
  };
  onGetContact?: (id: string) => void;
  onMarkComplete?: (id: string) => void;
}

export default function BookingCard({ booking, onGetContact, onMarkComplete }: BookingCardProps) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">
            {booking.project_type} - {booking.client_name}
          </h3>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {booking.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {booking.event_date}
            </span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${
          booking.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
          booking.status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
          'bg-gray-500/20 text-gray-500'
        }`}>
          {booking.status}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-2xl font-bold text-creator">₹{booking.amount?.toLocaleString()}</p>
        <p className="text-sm text-gray-400">Payment secured in escrow</p>
      </div>

      {booking.status === 'confirmed' && (
        <div className="flex gap-3">
          {onGetContact && (
            <Button onClick={() => onGetContact(booking.id)} variant="outline">
              <Phone className="w-4 h-4 mr-2" />
              Get Contact
            </Button>
          )}
          {onMarkComplete && (
            <Button
              onClick={() => onMarkComplete(booking.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Complete
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
