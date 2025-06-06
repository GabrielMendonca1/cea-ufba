"use client"

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CreateResearchOpportunityData } from "@/lib/queries";

interface ResearchOpportunityFormProps {
  formData: CreateResearchOpportunityData;
  onInputChange: (field: keyof CreateResearchOpportunityData, value: string | number | string[]) => void;
  isLoading: boolean;
}

const SCHOLARSHIP_TYPES = ["PIBIC", "PIBITI", "FAPESB", "CNPq", "CAPES", "Institutional", "Voluntary", "Other"];
const DURATIONS = ["6 months", "12 months", "18 months", "24 months", "Other"];
const WORKLOADS = ["20 hours/week", "30 hours/week", "40 hours/week", "Other"];

export function ResearchOpportunityForm({ formData, onInputChange, isLoading }: ResearchOpportunityFormProps) {
  
  const handleArrayChange = (field: 'requirements' | 'objectives' | 'expected_results', value: string) => {
    onInputChange(field, value.split(',').map(item => item.trim()));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
      {/* Column 1 */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input id="title" value={formData.title} onChange={(e) => onInputChange('title', e.target.value)} disabled={isLoading} required />
        </div>
        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea id="description" value={formData.description} onChange={(e) => onInputChange('description', e.target.value)} disabled={isLoading} required />
        </div>
        <div>
          <Label htmlFor="research_area">Research Area *</Label>
          <Input id="research_area" value={formData.research_area} onChange={(e) => onInputChange('research_area', e.target.value)} disabled={isLoading} required />
        </div>
        <div>
          <Label htmlFor="scholarship_type">Scholarship Type *</Label>
          <select id="scholarship_type" value={formData.scholarship_type} onChange={(e) => onInputChange('scholarship_type', e.target.value)} disabled={isLoading} required className="w-full p-2 border rounded-md">
            <option value="" disabled>Select a type</option>
            {SCHOLARSHIP_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="duration">Duration *</Label>
          <select id="duration" value={formData.duration} onChange={(e) => onInputChange('duration', e.target.value)} disabled={isLoading} required className="w-full p-2 border rounded-md">
            <option value="" disabled>Select a duration</option>
            {DURATIONS.map(duration => <option key={duration} value={duration}>{duration}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="monthly_value">Monthly Value (BRL) *</Label>
          <Input id="monthly_value" type="number" value={formData.monthly_value} onChange={(e) => onInputChange('monthly_value', e.target.value)} disabled={isLoading} required />
        </div>
         <div>
          <Label htmlFor="contact_email">Contact Email *</Label>
          <Input id="contact_email" type="email" value={formData.contact_email} onChange={(e) => onInputChange('contact_email', e.target.value)} disabled={isLoading} required />
        </div>
      </div>

      {/* Column 2 */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="start_date">Start Date *</Label>
          <Input id="start_date" type="date" value={formData.start_date} onChange={(e) => onInputChange('start_date', e.target.value)} disabled={isLoading} required />
        </div>
        <div>
          <Label htmlFor="deadline">Deadline *</Label>
          <Input id="deadline" type="date" value={formData.deadline} onChange={(e) => onInputChange('deadline', e.target.value)} disabled={isLoading} required />
        </div>
        <div>
          <Label htmlFor="vacancies">Vacancies *</Label>
          <Input id="vacancies" type="number" value={formData.vacancies} onChange={(e) => onInputChange('vacancies', Number(e.target.value))} min={1} disabled={isLoading} required />
        </div>
        <div>
          <Label htmlFor="workload">Workload *</Label>
           <select id="workload" value={formData.workload} onChange={(e) => onInputChange('workload', e.target.value)} disabled={isLoading} required className="w-full p-2 border rounded-md">
            <option value="" disabled>Select a workload</option>
            {WORKLOADS.map(load => <option key={load} value={load}>{load}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="requirements">Requirements (comma-separated) *</Label>
          <Textarea id="requirements" value={Array.isArray(formData.requirements) ? formData.requirements.join(', ') : ''} onChange={(e) => handleArrayChange('requirements', e.target.value)} disabled={isLoading} required />
        </div>
        <div>
          <Label htmlFor="objectives">Objectives (comma-separated) *</Label>
          <Textarea id="objectives" value={Array.isArray(formData.objectives) ? formData.objectives.join(', ') : ''} onChange={(e) => handleArrayChange('objectives', e.target.value)} disabled={isLoading} required />
        </div>
        <div>
          <Label htmlFor="methodology">Methodology *</Label>
          <Textarea id="methodology" value={formData.methodology} onChange={(e) => onInputChange('methodology', e.target.value)} disabled={isLoading} required />
        </div>
        <div>
          <Label htmlFor="expected_results">Expected Results (comma-separated) *</Label>
          <Textarea id="expected_results" value={Array.isArray(formData.expected_results) ? formData.expected_results.join(', ') : ''} onChange={(e) => handleArrayChange('expected_results', e.target.value)} disabled={isLoading} required />
        </div>
      </div>
    </div>
  );
} 