import { Church } from '@seedfy/shared';
import { MapPin, Building2 } from 'lucide-react';
import Image from 'next/image';

interface ChurchHeaderProps {
  church: Church;
}

export function ChurchHeader({ church }: ChurchHeaderProps) {
  return (
    <div className="bg-card border-b border-border">
      <div className="relative h-32 bg-primary/10 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative pb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 mb-4 sm:mb-0 gap-4">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-background border-4 border-background shadow-sm overflow-hidden flex-shrink-0">
            {church.logo_url ? (
              <img
                src={church.logo_url}
                alt={church.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                <Building2 className="w-10 h-10" />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center sm:text-left mb-2">
            <h1 className="text-2xl font-bold text-foreground">{church.name}</h1>
            {(church.city || church.state) && (
              <div className="flex items-center justify-center sm:justify-start text-muted-foreground mt-1 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                <span>
                  {[church.city, church.state].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
