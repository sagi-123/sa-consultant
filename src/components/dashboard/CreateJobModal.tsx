import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, MapPin, DollarSign, Briefcase } from "lucide-react";
import { toast } from "sonner";

interface CreateJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobCreated?: (newJob: any) => void;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  open,
  onOpenChange,
  onJobCreated,
}) => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("Full-Time");
  const [salary, setSalary] = useState("$45,000 - $65,000 / year");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) {
      toast.error("Please fill in required fields (Job Title & Location).");
      return;
    }

    const createdJob = {
      id: Date.now().toString(),
      title,
      location,
      type: jobType,
      salary,
      description,
      applicantsCount: 0,
      status: "Active",
      postedDate: "Just now",
    };

    if (onJobCreated) {
      onJobCreated(createdJob);
    }

    toast.success(`Job vacancy "${title}" posted successfully!`);
    onOpenChange(false);

    // Reset form
    setTitle("");
    setLocation("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-primary" /> Post a New Job Vacancy
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Reach top local candidates instantly on SA Elevate.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          <div>
            <Label htmlFor="jobTitle" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Job Title *
            </Label>
            <div className="relative mt-1">
              <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="jobTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Store Manager, Chef, Software Engineer"
                className="pl-9 h-11 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobLocation" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Location *
              </Label>
              <div className="relative mt-1">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="jobLocation"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State or Remote"
                  className="pl-9 h-11 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="jobType" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Employment Type
              </Label>
              <select
                id="jobType"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full h-11 mt-1 px-3 rounded-xl border border-input bg-background text-foreground text-sm font-medium focus:ring-2 focus:ring-primary"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="salary" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Salary / Compensation Range
            </Label>
            <div className="relative mt-1">
              <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. $50,000 - $70,000 / year or $25 / hr"
                className="pl-9 h-11 rounded-xl"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Job Description & Key Responsibilities
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role requirements, team environment, and benefits..."
              rows={4}
              className="mt-1 rounded-xl"
            />
          </div>

          <DialogFooter className="pt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground font-bold rounded-xl h-11 px-6 shadow-md"
            >
              Publish Job Now
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
