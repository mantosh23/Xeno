import { useAudience } from './useAudience';
import { AudienceSidebar } from '../components/AudienceSidebar';
import { AudienceList } from '../components/AudienceList';
import { CustomerModal } from '../components/CustomerModal';

/**
 * Audience Component
 * 
 * Refactored to use the `useAudience` custom hook for state management
 * and Domain-Driven Design component segregation.
 * 
 * @returns {JSX.Element}
 */
export function Audience() {
  const audience = useAudience();

  return (
    <div className="p-6 max-w-[1458px] mx-auto w-full flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AudienceSidebar {...audience} />
      <AudienceList {...audience} />
      <CustomerModal {...audience} />
    </div>
  );
}
