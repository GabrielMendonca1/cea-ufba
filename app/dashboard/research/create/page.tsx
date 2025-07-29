"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ResearchOpportunityForm } from "@/components/research/ResearchOpportunityForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { CreateResearchOpportunityData } from "@/lib/queries";

export default function CreateResearchOpportunityPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateResearchOpportunityData>({
    title: "",
    description: "",
    research_area: "",
    scholarship_type: "",
    duration: "",
    monthly_value: "",
    requirements: [],
    start_date: "",
    deadline: "",
    vacancies: 1,
    workload: "",
    objectives: [],
    methodology: "",
    expected_results: [],
    contact_email: "",
  });

  const router = useRouter();
  const supabase = createClient();

  const handleInputChange = (field: keyof CreateResearchOpportunityData, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert("You must be logged in to create a research opportunity.");
        setIsLoading(false);
        router.push("/sign-in");
        return;
    }

    try {
      const response = await fetch("/api/research/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: formData }),
      });

      if (response.ok) {
        router.push("/dashboard");
        router.refresh(); // To ensure the dashboard shows the new opportunity
      } else {
        const errorData = await response.json();
        console.error("Failed to create research opportunity:", errorData);
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error creating research opportunity:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 flex-1">
      <Card>
        <CardHeader>
          <CardTitle>Create Research Opportunity</CardTitle>
          <CardDescription>Fill out the form to create a new research opportunity.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <ResearchOpportunityForm
              formData={formData}
              onInputChange={handleInputChange}
              isLoading={isLoading}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : "Save Opportunity"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 