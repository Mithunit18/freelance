import { Briefcase, MapPin, Clock, DollarSign } from 'lucide-react';
import { Button } from '@vision-match/ui-web';

interface ProjectCardProps {
  project: {
    id: string;
    project_type: string;
    location: string;
    date: string;
    budget_range: string;
    status: string;
    client_notes?: string;
    style_preferences?: string[];
  };
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onNegotiate?: (id: string) => void;
}

export default function ProjectCard({ project, onAccept, onDecline, onNegotiate }: ProjectCardProps) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">{project.project_type}</h3>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {project.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {project.date}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {project.budget_range}
            </span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${
          project.status === 'new' ? 'bg-green-500/20 text-green-500' :
          project.status === 'in_negotiation' ? 'bg-yellow-500/20 text-yellow-500' :
          'bg-gray-500/20 text-gray-500'
        }`}>
          {project.status?.replace('_', ' ')}
        </span>
      </div>

      {project.client_notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-400">Client Notes:</p>
          <p className="text-gray-300">{project.client_notes}</p>
        </div>
      )}

      {project.style_preferences && project.style_preferences.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Preferred Styles:</p>
          <div className="flex flex-wrap gap-2">
            {project.style_preferences.map((style) => (
              <span key={style} className="px-3 py-1 bg-primary/20 rounded-full text-sm">
                {style}
              </span>
            ))}
          </div>
        </div>
      )}

      {project.status === 'new' && (
        <div className="flex gap-3 mt-4">
          {onAccept && (
            <Button
              onClick={() => onAccept(project.id)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Accept
            </Button>
          )}
          {onDecline && (
            <Button
              onClick={() => onDecline(project.id)}
              variant="outline"
              className="flex-1"
            >
              Decline
            </Button>
          )}
          {onNegotiate && (
            <Button
              onClick={() => onNegotiate(project.id)}
              variant="outline"
            >
              Negotiate
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
