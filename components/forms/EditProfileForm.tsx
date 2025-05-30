"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { UserProfile, UpdateUserProfileData } from "@/lib/queries";
import { Edit2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditProfileFormProps {
  userProfile: UserProfile | null;
  userEmail: string;
}

// Common departments and research areas for dropdowns
const DEPARTMENTS = [
  "Computer Science",
  "Engineering",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Medicine",
  "Psychology",
  "Economics",
  "Business Administration",
  "Education",
  "Literature",
  "History",
  "Philosophy",
  "Other"
];

const RESEARCH_AREAS = [
  "Artificial Intelligence",
  "Machine Learning",
  "Data Science",
  "Software Engineering",
  "Cybersecurity",
  "Biotechnology",
  "Environmental Science",
  "Materials Science",
  "Renewable Energy",
  "Medical Research",
  "Social Sciences",
  "Economics Research",
  "Educational Technology",
  "Other"
];

export function EditProfileForm({ userProfile, userEmail }: EditProfileFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateUserProfileData>({
    full_name: userProfile?.full_name || "",
    department: userProfile?.department || "",
    research_area: userProfile?.research_area || "",
    bio: userProfile?.bio || "",
    lattes_url: userProfile?.lattes_url || "",
    student_id: userProfile?.student_id || "",
  });

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Remove empty strings and convert to undefined
      const cleanedData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          value === "" ? undefined : value,
        ])
      ) as UpdateUserProfileData;

      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          updates: cleanedData,
        }),
      });

      if (response.ok) {
        setIsOpen(false);
        router.refresh(); // Refresh the page to show updated data
      } else {
        console.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateUserProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit2 className="w-4 h-4" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold">Edit Profile</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Update your profile information. All fields are optional.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-border">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">1</span>
              </div>
              <h4 className="font-semibold text-lg text-foreground">Personal Information</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-3">
                <Label htmlFor="full_name" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={formData.full_name || ""}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  placeholder="Enter your full name"
                  className="h-11"
                />
              </div>

              {/* Student ID (for students) */}
              {userProfile?.user_type === 'student' && (
                <div className="space-y-3">
                  <Label htmlFor="student_id" className="text-sm font-medium">Student ID</Label>
                  <Input
                    id="student_id"
                    type="text"
                    value={formData.student_id || ""}
                    onChange={(e) => handleInputChange("student_id", e.target.value)}
                    placeholder="Enter your student ID"
                    className="h-11"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-border">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">2</span>
              </div>
              <h4 className="font-semibold text-lg text-foreground">Academic Information</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department */}
              <div className="space-y-3">
                <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                <Select
                  value={formData.department || ""}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  className="h-11"
                >
                  <option value="">Select your department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Research Area */}
              <div className="space-y-3">
                <Label htmlFor="research_area" className="text-sm font-medium">Research Area</Label>
                <Select
                  value={formData.research_area || ""}
                  onChange={(e) => handleInputChange("research_area", e.target.value)}
                  className="h-11"
                >
                  <option value="">Select your research area</option>
                  {RESEARCH_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Lattes URL (for professors/researchers) */}
            <div className="space-y-3">
              <Label htmlFor="lattes_url" className="text-sm font-medium">Lattes CV URL</Label>
              <Input
                id="lattes_url"
                type="url"
                value={formData.lattes_url || ""}
                onChange={(e) => handleInputChange("lattes_url", e.target.value)}
                placeholder="http://lattes.cnpq.br/your-cv-url"
                className="h-11"
              />
            </div>
          </div>

          {/* About */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-border">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">3</span>
              </div>
              <h4 className="font-semibold text-lg text-foreground">About</h4>
            </div>
            
            {/* Bio */}
            <div className="space-y-3">
              <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio || ""}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about yourself, your research interests, experience..."
                rows={5}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-border gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="h-11 px-6">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 