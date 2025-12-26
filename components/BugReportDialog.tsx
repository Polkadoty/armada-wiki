"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Bug } from 'lucide-react';

export function BugReportDialog() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    pageUrl: typeof window !== 'undefined' ? window.location.href : '',
    contactEmail: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/bug-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          steps_to_reproduce: formData.stepsToReproduce,
          expected_behavior: formData.expectedBehavior,
          actual_behavior: formData.actualBehavior,
          page_url: formData.pageUrl,
          contact_email: formData.contactEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit bug report');
      }

      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setFormData({
          title: '',
          description: '',
          stepsToReproduce: '',
          expectedBehavior: '',
          actualBehavior: '',
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
          contactEmail: '',
        });
      }, 2000);
    } catch (error) {
      console.error('Error submitting bug report:', error);
      alert('Failed to submit bug report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Bug className="h-4 w-4 mr-2" />
          Report Bug
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report a Bug</DialogTitle>
          <DialogDescription>
            Help us improve the Armada Wiki by reporting any issues you encounter.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center">
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              Thank you for your report!
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              We'll look into this issue as soon as possible.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Bug Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="description"
                placeholder="Detailed description of the bug"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div>
              <label htmlFor="stepsToReproduce" className="block text-sm font-medium mb-1">
                Steps to Reproduce
              </label>
              <Textarea
                id="stepsToReproduce"
                placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
                value={formData.stepsToReproduce}
                onChange={(e) => setFormData({ ...formData, stepsToReproduce: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="expectedBehavior" className="block text-sm font-medium mb-1">
                  Expected Behavior
                </label>
                <Textarea
                  id="expectedBehavior"
                  placeholder="What should happen?"
                  value={formData.expectedBehavior}
                  onChange={(e) => setFormData({ ...formData, expectedBehavior: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="actualBehavior" className="block text-sm font-medium mb-1">
                  Actual Behavior
                </label>
                <Textarea
                  id="actualBehavior"
                  placeholder="What actually happens?"
                  value={formData.actualBehavior}
                  onChange={(e) => setFormData({ ...formData, actualBehavior: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div>
              <label htmlFor="pageUrl" className="block text-sm font-medium mb-1">
                Page URL
              </label>
              <Input
                id="pageUrl"
                type="url"
                placeholder="URL where the bug occurred"
                value={formData.pageUrl}
                onChange={(e) => setFormData({ ...formData, pageUrl: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium mb-1">
                Contact Email (Optional)
              </label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="your@email.com"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                In case we need to follow up about this issue
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
