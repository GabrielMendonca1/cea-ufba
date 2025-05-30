"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResearchOpportunity, CreateResearchOpportunityData } from "@/lib/queries";
import { Plus, Edit2, Loader2, Calendar, Users, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

interface ResearchOpportunityManagerProps {
  researchOpportunities: ResearchOpportunity[] | null;
  userId: string;
}

// Common values for dropdowns
const FACULTIES = [
  "Engineering",
  "Sciences",
  "Medicine",
  "Business",
  "Education",
  "Arts and Humanities",
  "Social Sciences",
  "Law",
  "Other"
];

const SCHOLARSHIP_TYPES = [
  "PIBIC",
  "PIBITI",
  "FAPESB",
  "CNPq",
  "CAPES",
  "Institutional",
  "Voluntary",
  "Other"
];

const DURATIONS = [
  "6 months",
  "12 months",
  "18 months",
  "24 months",
  "Other"
];

const WORKLOADS = [
  "20 hours/week",
  "30 hours/week",
  "40 hours/week",
  "Other"
];

export function ResearchOpportunityManager({ researchOpportunities, userId }: ResearchOpportunityManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<ResearchOpportunity | null>(null);
  const [formData, setFormData] = useState<CreateResearchOpportunityData>({
    title: "",
    description: "",
    department: "",
    faculty: "",
    research_area: "",
    scholarship_type: "",
    duration: "",
    monthly_value: "",
    requirements: "",
    start_date: "",
    deadline: "",
    vacancies: 1,
    workload: "",
    objectives: "",
    methodology: "",
    expected_results: "",
    contact_email: "",
  });

  const router = useRouter();

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      department: "",
      faculty: "",
      research_area: "",
      scholarship_type: "",
      duration: "",
      monthly_value: "",
      requirements: "",
      start_date: "",
      deadline: "",
      vacancies: 1,
      workload: "",
      objectives: "",
      methodology: "",
      expected_results: "",
      contact_email: "",
    });
  };

  const handleCreate = () => {
    resetForm();
    setEditingOpportunity(null);
    setIsCreateOpen(true);
  };

  const handleEdit = (opportunity: ResearchOpportunity) => {
    setFormData({
      title: opportunity.title,
      description: opportunity.description,
      department: opportunity.department,
      faculty: opportunity.faculty,
      research_area: opportunity.research_area,
      scholarship_type: opportunity.scholarship_type,
      duration: opportunity.duration,
      monthly_value: opportunity.monthly_value,
      requirements: opportunity.requirements || "",
      start_date: opportunity.start_date.split('T')[0], // Format for date input
      deadline: opportunity.deadline.split('T')[0], // Format for date input
      vacancies: opportunity.vacancies,
      workload: opportunity.workload,
      objectives: opportunity.objectives || "",
      methodology: opportunity.methodology || "",
      expected_results: opportunity.expected_results || "",
      contact_email: opportunity.contact_email,
    });
    setEditingOpportunity(opportunity);
    setIsEditOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingOpportunity 
        ? "/api/research/update" 
        : "/api/research/create";
      
      const body = editingOpportunity 
        ? { opportunityId: editingOpportunity.id, updates: formData }
        : { userId, data: formData };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setIsCreateOpen(false);
        setIsEditOpen(false);
        setEditingOpportunity(null);
        resetForm();
        router.refresh(); // Refresh the page to show updated data
      } else {
        console.error("Failed to save research opportunity");
      }
    } catch (error) {
      console.error("Error saving research opportunity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateResearchOpportunityData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Manage Research Opportunities</h3>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Create New Opportunity
        </Button>
      </div>

      {/* Research Opportunities List */}
      <div className="grid gap-4">
        {researchOpportunities && researchOpportunities.length > 0 ? (
          researchOpportunities.map((opportunity) => (
            <Card key={opportunity.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                    <CardDescription>
                      {opportunity.department} • {opportunity.faculty}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(opportunity)}
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{opportunity.description.substring(0, 200)}...</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>Vacancies: {opportunity.vacancies}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>Value: {opportunity.monthly_value}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No research opportunities created yet.</p>
              <Button onClick={handleCreate} className="mt-4 gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Opportunity
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setIsEditOpen(false);
          setEditingOpportunity(null);
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold">
              {editingOpportunity ? "Edit Research Opportunity" : "Create New Research Opportunity"}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Fill in the details for your research opportunity. Required fields are marked with *.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">1</span>
                </div>
                <h4 className="font-semibold text-lg text-foreground">Basic Information</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Research opportunity title"
                    required
                    className="h-11"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="department" className="text-sm font-medium">Department *</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                      placeholder="Department name"
                      required
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="faculty" className="text-sm font-medium">Faculty *</Label>
                    <Select
                      value={formData.faculty}
                      onChange={(e) => handleInputChange("faculty", e.target.value)}
                      required
                      className="h-11"
                    >
                      <option value="">Select faculty</option>
                      {FACULTIES.map((faculty) => (
                        <option key={faculty} value={faculty}>
                          {faculty}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="research_area" className="text-sm font-medium">Research Area *</Label>
                    <Input
                      id="research_area"
                      value={formData.research_area}
                      onChange={(e) => handleInputChange("research_area", e.target.value)}
                      placeholder="e.g., Artificial Intelligence"
                      required
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="contact_email" className="text-sm font-medium">Contact Email *</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => handleInputChange("contact_email", e.target.value)}
                      placeholder="supervisor@university.edu"
                      required
                      className="h-11"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Detailed description of the research opportunity..."
                    rows={4}
                    required
                    className="resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Scholarship Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">2</span>
                </div>
                <h4 className="font-semibold text-lg text-foreground">Scholarship Details</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="scholarship_type" className="text-sm font-medium">Scholarship Type *</Label>
                  <Select
                    value={formData.scholarship_type}
                    onChange={(e) => handleInputChange("scholarship_type", e.target.value)}
                    required
                    className="h-11"
                  >
                    <option value="">Select type</option>
                    {SCHOLARSHIP_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="duration" className="text-sm font-medium">Duration *</Label>
                  <Select
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    required
                    className="h-11"
                  >
                    <option value="">Select duration</option>
                    {DURATIONS.map((duration) => (
                      <option key={duration} value={duration}>
                        {duration}
                      </option>
                    ))}
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="monthly_value" className="text-sm font-medium">Monthly Value *</Label>
                  <Input
                    id="monthly_value"
                    value={formData.monthly_value}
                    onChange={(e) => handleInputChange("monthly_value", e.target.value)}
                    placeholder="R$ 1.200,00"
                    required
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="workload" className="text-sm font-medium">Workload *</Label>
                  <Select
                    value={formData.workload}
                    onChange={(e) => handleInputChange("workload", e.target.value)}
                    required
                    className="h-11"
                  >
                    <option value="">Select workload</option>
                    {WORKLOADS.map((workload) => (
                      <option key={workload} value={workload}>
                        {workload}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* Timeline and Vacancies */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">3</span>
                </div>
                <h4 className="font-semibold text-lg text-foreground">Timeline & Vacancies</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="start_date" className="text-sm font-medium">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange("start_date", e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="deadline" className="text-sm font-medium">Application Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange("deadline", e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="vacancies" className="text-sm font-medium">Number of Vacancies *</Label>
                  <Input
                    id="vacancies"
                    type="number"
                    min="1"
                    value={formData.vacancies}
                    onChange={(e) => handleInputChange("vacancies", parseInt(e.target.value) || 1)}
                    required
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">4</span>
                </div>
                <h4 className="font-semibold text-lg text-foreground">Additional Details</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="requirements" className="text-sm font-medium">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements || ""}
                    onChange={(e) => handleInputChange("requirements", e.target.value)}
                    placeholder="List the requirements for applicants..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="objectives" className="text-sm font-medium">Objectives</Label>
                  <Textarea
                    id="objectives"
                    value={formData.objectives || ""}
                    onChange={(e) => handleInputChange("objectives", e.target.value)}
                    placeholder="Research objectives and goals..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="methodology" className="text-sm font-medium">Methodology</Label>
                  <Textarea
                    id="methodology"
                    value={formData.methodology || ""}
                    onChange={(e) => handleInputChange("methodology", e.target.value)}
                    placeholder="Research methodology to be used..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="expected_results" className="text-sm font-medium">Expected Results</Label>
                  <Textarea
                    id="expected_results"
                    value={formData.expected_results || ""}
                    onChange={(e) => handleInputChange("expected_results", e.target.value)}
                    placeholder="Expected outcomes and deliverables..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 border-t border-border gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setIsEditOpen(false);
                  setEditingOpportunity(null);
                }}
                disabled={isLoading}
                className="h-11 px-6"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="h-11 px-6">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editingOpportunity ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  editingOpportunity ? "Update Opportunity" : "Create Opportunity"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 